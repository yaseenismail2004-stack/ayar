// طبقة البيانات: تحفظ على الخادم (data/db.json) بجلسة مصادقة، وإن لم يتوفر خادم تحفظ محلياً في المتصفح
const DB = (() => {
  const LS_KEY = 'ayar-db-v1', TOKEN_KEY = 'ayar-token';
  let state = null, useServer = false, saveTimer = null, saving = Promise.resolve();
  let onAuthLost = () => {}, onSaveError = () => {};

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const token = () => sessionStorage.getItem(TOKEN_KEY) || '';

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
    const d = n => { const t = new Date(); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); };
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

  // طلب للخادم مع رمز الجلسة
  async function api(path, { method = 'GET', body } = {}) {
    const headers = {};
    if (token()) headers.Authorization = 'Bearer ' + token();
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const r = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
    let data = {};
    try { data = await r.json(); } catch {}
    if (r.status === 401 && path !== '/api/login') { sessionStorage.removeItem(TOKEN_KEY); onAuthLost(); }
    if (!r.ok) { const e = new Error(data.error || 'خطأ في الاتصال'); e.status = r.status; throw e; }
    return data;
  }

  // هل الخادم متاح؟
  async function detect() {
    try { const r = await fetch('/api/ping', { cache: 'no-store' }); useServer = r.ok; return r.ok ? await r.json() : null; }
    catch { useServer = false; return null; }
  }

  async function login(username, password) {
    const r = await api('/api/login', { method: 'POST', body: { username, password } });
    sessionStorage.setItem(TOKEN_KEY, r.token);
    return r.user;
  }
  async function logout() {
    if (useServer && token()) { try { await api('/api/logout', { method: 'POST', body: {} }); } catch {} }
    sessionStorage.removeItem(TOKEN_KEY);
    if (useServer) state = null; // لا تُبقِ بيانات الصيدلية في الذاكرة بعد الخروج
  }
  async function me() {
    if (!useServer || !token()) return null;
    try { return (await api('/api/me')).user; } catch { return null; }
  }

  async function load() {
    state = null;
    if (useServer) {
      const data = await api('/api/state');
      const users = data.users || [];
      state = data && data.settings ? data : null;
      if (!state) { state = demo(defaults()); state.users = users; persist(true); }
    } else {
      try { state = JSON.parse(localStorage.getItem(LS_KEY)); } catch { state = null; }
      if (!state || !state.settings) { state = demo(defaults()); persist(true); }
    }
    // ترقية آمنة لأي حقول ناقصة
    const def = defaults();
    state.settings = { ...def.settings, ...state.settings };
    for (const k of ['categories', 'products', 'sales', 'stocktakes', 'users', 'suppliers', 'purchases', 'supplierPayments', 'customers', 'customerPayments']) state[k] = state[k] || def[k];
    state.seq = { ...def.seq, ...(state.seq || {}) };
    return state;
  }

  function persist(now = false) {
    clearTimeout(saveTimer);
    const run = () => {
      if (!state) return;
      if (!useServer) { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { onSaveError('مساحة التخزين في المتصفح ممتلئة'); } return; }
      const snapshot = JSON.stringify(state);
      saving = saving.then(() => fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() }, body: snapshot })
        .then(r => { if (r.status === 401) { sessionStorage.removeItem(TOKEN_KEY); onAuthLost(); } else if (!r.ok) onSaveError('تعذر الحفظ على الخادم'); })
        .catch(() => onSaveError('انقطع الاتصال بالخادم — لم تُحفظ آخر التغييرات')));
    };
    now ? run() : (saveTimer = setTimeout(run, 400));
  }
  // حفظ فوري قبل إغلاق الصفحة
  window.addEventListener('pagehide', () => { if (saveTimer) persist(true); });

  return {
    load, uid, detect, login, logout, me, api,
    get s() { return state; },
    save: () => persist(),
    flush: () => { persist(true); return saving; },
    replace(newState) { const users = state?.users || []; state = { ...newState, users }; persist(true); },
    reset() { const users = state?.users || []; state = defaults(); state.users = users; persist(true); },
    get online() { return useServer; },
    set onAuthLost(fn) { onAuthLost = fn; },
    set onSaveError(fn) { onSaveError = fn; }
  };
})();
