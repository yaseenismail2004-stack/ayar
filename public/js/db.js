// طبقة البيانات — مزامنة على مستوى السجل مع الخادم (Cloudflare D1 / SQLite)
// • تُرسل فقط السجلات التي تغيّرت، مع رقم الإصدار لمنع الكتابة فوق تعديلات جهاز آخر
// • تسحب تغييرات الأجهزة الأخرى تلقائياً كل 15 ثانية
// • إن لم يتوفر خادم (فتح الملف مباشرة) تعمل محلياً في المتصفح
// • يعمل بدون إنترنت: نسخة من البيانات محفوظة على الجهاز (IndexedDB) + صندوق صادر لمبيعات وقت الانقطاع
const DB = (() => {
  // ---- تخزين بسيط في IndexedDB ----
  const idb = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('ayar', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const run = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction('kv', mode), req = fn(t.objectStore('kv')); t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); };
    return { get: k => run('readonly', st => st.get(k)).catch(() => null), set: (k, v) => run('readwrite', st => st.put(v, k)).catch(() => {}), del: k => run('readwrite', st => st.delete(k)).catch(() => {}) };
  })();
  const SNAP_KEY = 'snap', OUTBOX_KEY = 'ayar-outbox';
  const LS_KEY = 'ayar-db-v1', TOKEN_KEY = 'ayar-token';
  const COLLS = ['products', 'sales', 'stocktakes', 'suppliers', 'purchases', 'supplierPayments', 'customers', 'customerPayments'];
  const META = ['settings', 'categories'];
  let state = null, useServer = false, saveTimer = null, pollTimer = null;
  let synced = new Map();           // "coll|id" → { v, json }  آخر نسخة مؤكدة من الخادم
  let lastPull = 0, pushing = null, again = false, offline = false;
  let hooks = { authLost: () => {}, saveError: () => {}, remote: () => {}, status: () => {}, synced: () => {} };

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  // الجلسة تبقى محفوظة على الجهاز (مثل التطبيقات) — تنتهي من الخادم بعد 12 ساعة بدون استخدام
  try { const old = sessionStorage.getItem(TOKEN_KEY); if (old && !localStorage.getItem(TOKEN_KEY)) localStorage.setItem(TOKEN_KEY, old); sessionStorage.removeItem(TOKEN_KEY); } catch {}
  const token = () => localStorage.getItem(TOKEN_KEY) || '';
  const setToken = t => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

  // ---- صندوق الصادر: مبيعات تمت بدون إنترنت وتنتظر الرفع ----
  let outbox = []; try { outbox = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); } catch { outbox = []; }
  let offsets = new Map();          // productId → Map(batchId → كمية مخصومة محلياً ولم تُرفع بعد)
  const saveOutbox = () => { try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox)); } catch {} };
  function computeOffsets() {
    offsets = new Map();
    for (const o of outbox) for (const t of o.take) {
      if (!offsets.has(t.productId)) offsets.set(t.productId, new Map());
      const m = offsets.get(t.productId); m.set(t.batchId, (m.get(t.batchId) || 0) + t.qty);
    }
  }
  computeOffsets();
  // المنتج كما يجب أن يكون على الخادم (قبل خصم مبيعات الانقطاع)
  function serialize(coll, item) {
    if (coll === 'products' && offsets.has(String(item.id))) {
      const m = offsets.get(String(item.id));
      return { ...item, batches: (item.batches || []).map(b => m.has(b.id) ? { ...b, qty: b.qty + m.get(b.id) } : b) };
    }
    return item;
  }
  function subtractOffsets(item) {
    const m = offsets.get(String(item.id)); if (!m) return;
    for (const b of item.batches || []) if (m.has(b.id)) b.qty -= m.get(b.id);
  }

  // ---- نسخة البيانات على الجهاز (للفتح بدون إنترنت) ----
  let snapTimer = null, snapCache;
  async function saveSnap() {
    clearTimeout(snapTimer);
    if (!useServer || !state || !currentUserId) return;
    await idb.set(SNAP_KEY, { state, synced: [...synced], lastPull, userId: currentUserId, savedAt: Date.now() });
  }
  const scheduleSnap = () => { clearTimeout(snapTimer); snapTimer = setTimeout(saveSnap, 800); };
  async function readSnap() { if (snapCache === undefined) snapCache = await idb.get(SNAP_KEY); return snapCache; }
  const key = (c, i) => c + '|' + i;

  function defaults() {
    return {
      settings: {
        name: 'صيدلية أيار', currency: 'د.ع', theme: 'violet', phone: '', address: '', whatsapp: '',
        expiryWarnDays: 90, lowStock: 5, storeNote: 'صحتك أولويتنا 💜', receiptFooter: 'شكراً لزيارتكم — نتمنى لكم الشفاء العاجل'
      },
      categories: ['أدوية', 'مضادات حيوية', 'مسكنات', 'فيتامينات', 'عناية بالبشرة', 'أطفال', 'مستلزمات طبية'],
      products: [], sales: [], stocktakes: [],
      users: [], suppliers: [], purchases: [], supplierPayments: [], customers: [], customerPayments: [],
      seq: { sale: 1, purchase: 1 }
    };
  }
  function demo(s) {
    const d = n => { const t = new Date(); t.setDate(t.getDate() + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
    const mk = (name, sci, category, price, cost, barcode, batches) => ({
      id: uid(), name, sci, category, price, cost, barcode, unit: 'علبة', minStock: 5, description: '', image: '',
      showInStore: true, createdAt: new Date().toISOString(),
      batches: batches.map(([expiry, qty, batchNo]) => ({ id: uid(), expiry, qty, batchNo: batchNo || '', cost }))
    });
    s.products = [
      mk('بنادول أدفانس 500mg', 'Paracetamol', 'مسكنات', 3000, 2000, '6285074000017', [[d(400), 40, 'PN-221'], [d(60), 12, 'PN-198']]),
      mk('أوغمنتين 1g', 'Amoxicillin + Clavulanate', 'مضادات حيوية', 12000, 9000, '5000123456781', [[d(300), 15, 'AG-77']]),
      mk('فيتامين سي 1000', 'Vitamin C', 'فيتامينات', 8000, 5000, '2001234567893', [[d(700), 30], [d(25), 4]]),
      mk('بروفين 400mg', 'Ibuprofen', 'مسكنات', 2500, 1500, '6291100000123', [[d(500), 3]]),
      mk('سيرافي كريم مرطب', 'CeraVe', 'عناية بالبشرة', 25000, 18000, '3337875597197', [[d(900), 8]]),
      mk('شراب سعال أطفال', 'Dextromethorphan', 'أطفال', 6000, 4000, '2009876543213', [[d(-5), 2], [d(200), 10]])
    ];
    return s;
  }
  function normalize() {
    const def = defaults();
    state.settings = { ...def.settings, ...(state.settings || {}) };
    for (const k of ['categories', 'products', 'sales', 'stocktakes', 'users', 'suppliers', 'purchases', 'supplierPayments', 'customers', 'customerPayments']) state[k] = state[k] || def[k];
    state.seq = { ...def.seq, ...(state.seq || {}) };
  }

  // ---------------- طلبات الخادم ----------------
  async function api(path, { method = 'GET', body, keepalive = false } = {}) {
    const headers = {};
    if (token()) headers.Authorization = 'Bearer ' + token();
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let r;
    try { r = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', keepalive }); }
    catch { const e = new Error('لا يوجد اتصال بالخادم'); e.network = true; throw e; }
    let data = {};
    try { data = await r.json(); } catch {}
    if (r.status === 401 && path !== '/api/login') { setToken(''); stopPolling(); hooks.authLost(); }
    if (!r.ok) { const e = new Error(data.error || 'خطأ في الاتصال'); e.status = r.status; throw e; }
    return data;
  }
  async function detect() {
    try {
      const r = await fetch('/api/ping', { cache: 'no-store' });
      const ct = r.headers.get('content-type') || '';
      if (r.ok && ct.includes('json')) { useServer = true; return await r.json(); }
      throw new Error('no api');
    } catch {
      // لا يوجد اتصال: إن كانت هناك نسخة محفوظة على الجهاز نفتح منها
      const snap = await readSnap();
      if (snap && snap.state && token()) { useServer = true; offline = true; return { name: snap.state.settings?.name, cached: true }; }
      useServer = false; return null;
    }
  }
  async function login(username, password) {
    const r = await api('/api/login', { method: 'POST', body: { username, password } });
    setToken(r.token);
    return r.user;
  }
  async function logout() {
    stopPolling();
    if (useServer && token()) { try { await api('/api/logout', { method: 'POST', body: {} }); } catch {} }
    setToken('');
    if (useServer) { state = null; synced = new Map(); lastPull = 0; snapCache = null; await idb.del(SNAP_KEY); }
  }
  async function me() {
    if (!useServer || !token()) return null;
    try { return (await api('/api/me')).user; }
    catch (e) {
      if (!e.network) return null;
      const snap = await readSnap();
      return snap && snap.state ? (snap.state.users || []).find(u => u.id === snap.userId && u.active !== false) || null : null;
    }
  }

  // ---------------- تحويل الحالة ↔ سجلات ----------------
  function records() {
    const out = [];
    for (const c of COLLS) for (const item of state[c]) if (item && item.id && !item.pending) out.push({ coll: c, id: String(item.id), data: serialize(c, item) });
    for (const m of META) out.push({ coll: 'meta', id: m, data: { id: m, value: state[m] } });
    return out;
  }
  function replaceIn(target, src) { for (const k of Object.keys(target)) if (!(k in src)) delete target[k]; Object.assign(target, src); }
  function localItem(coll, id) { return coll === 'meta' ? null : state[coll].find(x => String(x.id) === id); }
  function localJSON(coll, id) {
    if (coll === 'meta') return JSON.stringify({ id, value: state[id] });
    const it = localItem(coll, id); return it ? JSON.stringify(serialize(coll, it)) : null;
  }
  // تطبيق سجل قادم من الخادم على الحالة المحلية
  function applyRecord(rec) {
    const { coll, id } = rec;
    if (coll === 'meta') {
      if (!META.includes(id) || rec.deleted || !rec.data) return;
      const val = rec.data.value;
      if (id === 'settings' && val && typeof val === 'object') replaceIn(state.settings, { ...defaults().settings, ...val });
      else if (id === 'categories' && Array.isArray(val)) state.categories.splice(0, state.categories.length, ...val);
    } else if (COLLS.includes(coll)) {
      const arr = state[coll], idx = arr.findIndex(x => String(x.id) === id);
      if (rec.deleted || !rec.data) { if (idx >= 0) arr.splice(idx, 1); }
      else {
        const data = coll === 'products' ? JSON.parse(JSON.stringify(rec.data)) : rec.data;
        if (coll === 'products') subtractOffsets(data);
        if (idx >= 0) replaceIn(arr[idx], data); else arr.push(data);
      }
    }
    synced.set(key(coll, id), { v: rec.v, json: rec.deleted ? null : localJSON(coll, id), deleted: !!rec.deleted });
  }
  function diff() {
    const changes = [], seen = new Set();
    for (const r of records()) {
      const k = key(r.coll, r.id), s = synced.get(k), json = JSON.stringify(r.data);
      seen.add(k);
      if (!s || s.deleted || s.json !== json) changes.push({ coll: r.coll, id: r.id, data: r.data, baseV: s ? s.v : 0, json });
    }
    for (const [k, s] of synced) if (!seen.has(k) && !s.deleted) {
      const [coll, ...rest] = k.split('|');
      changes.push({ coll, id: rest.join('|'), deleted: true, baseV: s.v });
    }
    return changes;
  }
  const pendingCount = () => useServer && state ? diff().length : 0;

  // ---------------- التحميل ----------------
  async function load() {
    state = null;
    if (!useServer) {
      try { state = JSON.parse(localStorage.getItem(LS_KEY)); } catch { state = null; }
      if (!state || !state.settings) { state = demo(defaults()); saveLocal(); }
      normalize();
      return state;
    }
    let r;
    try { r = await api('/api/sync?since=0'); }
    catch (e) {
      const snap = e.network ? await readSnap() : null;
      if (!snap || !snap.state || snap.userId !== currentUserId) throw e;
      // فتح بدون إنترنت من النسخة المحفوظة
      state = snap.state; synced = new Map(snap.synced || []); lastPull = snap.lastPull || 0; offline = true;
      normalize(); restorePending(true);
      startPolling(); status();
      return state;
    }
    synced = new Map();
    const hasSettings = r.records.some(x => x.coll === 'meta' && x.id === 'settings');
    state = defaults();
    state.users = r.users;
    for (const rec of r.records) applyRecord(rec);
    for (const c of COLLS) state[c].sort((a, b) => String(a.date || a.createdAt || '').localeCompare(String(b.date || b.createdAt || '')));
    lastPull = r.now;
    restorePending(false);
    // أول تشغيل: قاعدة بيانات فارغة → إعدادات افتراضية + منتجات تجريبية (للمدير فقط)
    if (!hasSettings && r.users.find(u => u.id === currentUserId)?.role === 'admin') { demo(state); persist(true); }
    startPolling();
    saveSnap();
    if (outbox.length || pendingCount()) setTimeout(() => persist(true), 500);
    return state;
  }
  let currentUserId = null;
  // إعادة مبيعات الانقطاع إلى الحالة المحلية (بعد التحميل من الخادم أو من النسخة المحفوظة)
  function restorePending(fromSnap) {
    for (const o of outbox) {
      if (state.sales.some(x => x.id === o.id)) continue;
      state.sales.push({ ...o.sale, pending: true });
      // النسخة المحفوظة أقدم من البيع: نطبّق الخصم يدوياً
      if (fromSnap) for (const t of o.take) { const p = state.products.find(x => x.id === t.productId); const b = p?.batches?.find(x => x.id === t.batchId); if (b) b.qty -= t.qty; }
    }
  }

  // ---------------- السحب (تغييرات الأجهزة الأخرى) ----------------
  async function pull() {
    if (!useServer || !state || !token()) return;
    try {
      const r = await api('/api/sync?since=' + Math.max(0, lastPull - 5000));
      let changed = false;
      for (const rec of r.records) {
        const k = key(rec.coll, rec.id), s = synced.get(k);
        if (s && rec.v <= s.v) continue;
        const cur = localJSON(rec.coll, rec.id);
        if (s && cur !== null && cur !== s.json) continue; // تعديل محلي غير محفوظ — يُحسم عند الإرسال
        applyRecord(rec); changed = true;
      }
      if (JSON.stringify(r.users) !== JSON.stringify(state.users)) { state.users = r.users; changed = true; }
      lastPull = r.now;
      if (offline) { offline = false; status(); if (outbox.length) persist(true); }
      if (changed) { hooks.remote(); scheduleSnap(); }
    } catch (e) { if (e.network) { offline = true; status(); } }
  }
  function startPolling() { stopPolling(); pollTimer = setInterval(() => { if (document.visibilityState === 'visible') { pull(); if (pendingCount()) persist(true); } }, 15000); }
  function stopPolling() { clearInterval(pollTimer); pollTimer = null; }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && useServer && state) { pull(); persist(true); } });
  window.addEventListener('online', () => { if (useServer && state) { pull(); persist(true); } });

  // ---------------- الإرسال ----------------
  function status() { hooks.status({ online: useServer, offline, saving: !!pushing || replaying, pending: pendingCount(), outbox: outbox.length }); if (useServer) scheduleSnap(); }
  function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { hooks.saveError('مساحة التخزين في المتصفح ممتلئة'); } }

  async function pushNow() {
    if (!state) return;
    if (!useServer) return saveLocal();
    if (pushing) { again = true; return pushing; }
    const changes = diff();
    if (!changes.length) { status(); return outbox.length && !offline ? replay() : undefined; }
    pushing = (async () => {
      status();
      // تقسيم إلى دفعات صغيرة (حدود Cloudflare D1)
      const chunks = []; let cur = [], size = 0;
      for (const c of changes) {
        const sz = (c.json || '').length + 100;
        if (cur.length && (cur.length >= 150 || size + sz > 1200000)) { chunks.push(cur); cur = []; size = 0; }
        cur.push(c); size += sz;
      }
      if (cur.length) chunks.push(cur);
      let conflicts = 0;
      for (const chunk of chunks) {
        try {
          const r = await api('/api/sync', { method: 'POST', body: { changes: chunk.map(({ json, ...c }) => c) } });
          const sent = new Map(chunk.map(c => [key(c.coll, c.id), c.json ?? null]));
          for (const rec of r.applied) {
            const k = key(rec.coll, rec.id), now = rec.deleted ? null : localJSON(rec.coll, rec.id);
            if (now !== null && now !== sent.get(k)) {
              // تغيّر محلياً أثناء الإرسال: نحتفظ بالتعديل الأحدث ونسجّل الإصدار فقط
              synced.set(k, { v: rec.v, json: JSON.stringify(rec.data), deleted: false });
            } else applyRecord(rec);
          }
          for (const rec of r.conflicts) { applyRecord(rec); conflicts++; }
          offline = false;
        } catch (e) {
          if (e.network) { offline = true; setTimeout(() => persist(true), 10000); break; }
          if (e.status === 401) break;
          // رفض من الخادم (صلاحيات أو بيانات): أعد السجلات لآخر نسخة محفوظة
          hooks.saveError(e.message);
          for (const c of chunk) {
            const s = synced.get(key(c.coll, c.id));
            if (s && s.json) applyRecord({ coll: c.coll, id: c.id, v: s.v, data: JSON.parse(s.json) });
            else if (!s) applyRecord({ coll: c.coll, id: c.id, v: 0, deleted: true });
          }
          hooks.remote();
        }
      }
      if (conflicts) { hooks.saveError(`تم تعديل ${conflicts} سجل من جهاز آخر في نفس الوقت — عُرضت النسخة الأحدث، راجع آخر تعديل لك`); hooks.remote(); }
    })().finally(() => {
      pushing = null; status();
      if (again) { again = false; pushNow(); }
      else if (outbox.length && !offline) replay();
    });
    return pushing;
  }

  // ---- رفع مبيعات الانقطاع إلى الخادم (بالترتيب، وبدون تكرار) ----
  let replaying = false;
  async function replay() {
    if (replaying || !useServer || !token() || !outbox.length) return;
    replaying = true; status();
    let done = 0;
    try {
      for (const o of [...outbox]) {
        try {
          const r = await api('/api/checkout', { method: 'POST', body: { ...o.payload, id: o.id, date: o.sale.date, offline: true } });
          outbox = outbox.filter(x => x.id !== o.id); saveOutbox(); computeOffsets();
          for (const rec of r.records) applyRecord(rec);
          done++; offline = false;
        } catch (e) {
          if (e.network) { offline = true; break; }
          if (e.status === 401) break;
          o.error = e.message; o.tries = (o.tries || 0) + 1; saveOutbox();
          if (o.tries === 1) hooks.saveError(`تعذر رفع فاتورة الانقطاع ${o.sale.no}: ${e.message}`);
        }
      }
    } finally {
      replaying = false; status();
      if (done) { hooks.remote(); hooks.synced(done); saveSnap(); }
    }
  }
  // بيع بدون إنترنت: المنتجات خُصمت محلياً، نحفظ الفاتورة في صندوق الصادر
  async function queueSale(sale, payload) {
    const take = [];
    for (const it of sale.items) for (const b of it.batches) take.push({ productId: it.productId, batchId: b.batchId, qty: b.qty });
    outbox.push({ id: sale.id, payload, take, sale: { ...sale } });
    saveOutbox(); computeOffsets();
    state.sales.push({ ...sale, pending: true });
    await saveSnap(); status();
    return state.sales[state.sales.length - 1];
  }
  function persist(now = false) {
    clearTimeout(saveTimer);
    if (now) return pushNow();
    saveTimer = setTimeout(pushNow, 350);
    if (useServer) status();
  }
  window.addEventListener('pagehide', () => {
    if (!useServer || !state) return;
    const changes = diff();
    if (changes.length && JSON.stringify(changes).length < 60000) api('/api/sync', { method: 'POST', body: { changes: changes.map(({ json, ...c }) => c) }, keepalive: true }).catch(() => {});
  });

  // البيع عبر الخادم (يمنع بيع نفس الكمية من جهازين)
  async function checkout(payload) {
    await pushNow();
    if (diff().length) await pushNow();
    const r = await api('/api/checkout', { method: 'POST', body: payload });
    for (const rec of r.records) applyRecord(rec);
    hooks.remote();
    return state.sales.find(s => s.id === r.sale.id);
  }

  return {
    load, uid, detect, login, logout, me, api, pull, checkout, queueSale,
    get outbox() { return outbox.length; },
    get isOffline() { return offline; },
    set onSynced(fn) { hooks.synced = fn; },
    sync: async () => { await pull(); await persist(true); },
    get s() { return state; },
    save: () => persist(),
    flush: () => persist(true) || Promise.resolve(),
    replace(newState) {
      const users = state?.users || [];
      const seq = state?.seq;
      const fresh = defaults();
      for (const k of Object.keys(fresh)) if (Array.isArray(fresh[k])) state[k] = Array.isArray(newState[k]) ? newState[k] : [];
      state.settings = { ...fresh.settings, ...(newState.settings || {}) };
      state.categories = Array.isArray(newState.categories) ? newState.categories : fresh.categories;
      state.users = users; state.seq = { ...fresh.seq, ...(newState.seq || seq || {}) };
      return persist(true);
    },
    reset() { const users = state?.users || []; const d = defaults(); for (const k of Object.keys(d)) state[k] = d[k]; state.users = users; return persist(true); },
    set user(id) { currentUserId = id; },
    get online() { return useServer; },
    set onAuthLost(fn) { hooks.authLost = fn; },
    set onSaveError(fn) { hooks.saveError = fn; },
    set onRemoteChange(fn) { hooks.remote = fn; },
    set onStatus(fn) { hooks.status = fn; }
  };
})();
