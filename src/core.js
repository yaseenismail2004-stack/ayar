// أيار — منطق الخادم المشترك (يعمل على Cloudflare Workers + D1 وعلى Node.js + SQLite محلياً)
// قاعدة البيانات: واجهة متوافقة مع D1  → db.prepare(sql).bind(...).first() / .all() / .run()  و db.batch([...])

const SESSION_TTL = 12 * 60 * 60 * 1000;      // 12 ساعة
const LOCK_MS = 15 * 60 * 1000;               // قفل 15 دقيقة بعد 5 محاولات خاطئة
const PBKDF2_ITER = 60000;                    // مناسب لحد 10ms في خطة Workers المجانية (كل كلمة مرور تحفظ عدد دوراتها، فيمكن رفعه لاحقاً حتى 100000)
const MAX_BODY = 8 * 1024 * 1024;
const COLLS = ['products', 'sales', 'stocktakes', 'suppliers', 'purchases', 'supplierPayments', 'customers', 'customerPayments', 'meta'];
const ROLES = ['admin', 'pharmacist', 'cashier'];

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
};

// ---------------- أدوات ----------------
const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const unhex = h => new Uint8Array(h.match(/.{2}/g).map(x => parseInt(x, 16)));
const randHex = n => hex(crypto.getRandomValues(new Uint8Array(n)));
const uid = () => Date.now().toString(36) + randHex(4);
const sha256 = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
function safeEqual(a, b) {
  a = String(a); b = String(b);
  let r = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return r === 0;
}
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const fail = (status, msg) => { throw new HttpError(status, msg); };

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...extra } });
}
async function body(request) {
  if (!/application\/json/.test(request.headers.get('content-type') || '')) fail(415, 'Content-Type must be application/json');
  const text = await request.text();
  if (text.length > MAX_BODY) fail(413, 'الحجم كبير جداً');
  try { return JSON.parse(text || '{}'); } catch { fail(400, 'JSON غير صالح'); }
}

// ---------------- كلمات المرور (PBKDF2-SHA256) ----------------
async function pbkdf2(pw, saltHex, iter) {
  const key = await crypto.subtle.importKey('raw', enc.encode(String(pw)), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations: iter }, key, 256));
}
export async function hashPassword(pw) {
  const salt = randHex(16);
  return `pbkdf2$${PBKDF2_ITER}$${salt}$${await pbkdf2(pw, salt, PBKDF2_ITER)}`;
}
async function verifyPassword(stored, pw) {
  const [alg, iter, salt, h] = String(stored || '').split('$');
  if (alg !== 'pbkdf2' || !salt || !h) return false;
  return safeEqual(await pbkdf2(pw, salt, +iter), h);
}

// ---------------- المخطط (ينشأ تلقائياً) ----------------
let schemaReady = null;
export function ensureSchema(db) {
  if (!schemaReady) schemaReady = (async () => {
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT NOT NULL UNIQUE, pass TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, must_change INTEGER NOT NULL DEFAULT 0, created_at INTEGER)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT PRIMARY KEY, fails INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS records (coll TEXT NOT NULL, id TEXT NOT NULL, data TEXT, v INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, w TEXT, PRIMARY KEY (coll, id))`),
      db.prepare(`CREATE INDEX IF NOT EXISTS records_updated ON records (updated_at)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, value INTEGER NOT NULL)`),
      db.prepare(`INSERT OR IGNORE INTO counters (name, value) VALUES ('sale', 0), ('purchase', 0)`)
    ]);
    const c = await db.prepare('SELECT count(*) AS n FROM users').first();
    if (!c || !c.n) {
      await db.prepare('INSERT OR IGNORE INTO users (id, name, username, pass, role, active, must_change, created_at) VALUES (?, ?, ?, ?, ?, 1, 1, ?)')
        .bind(uid(), 'المدير', 'admin', await hashPassword('1234'), 'admin', Date.now()).run();
    }
  })().catch(e => { schemaReady = null; throw e; });
  return schemaReady;
}

// ---------------- الجلسات ----------------
const publicUser = u => ({ id: u.id, name: u.name, username: u.username, role: u.role, active: !!u.active, mustChange: !!u.must_change });
async function listUsers(db) { return (await db.prepare('SELECT * FROM users ORDER BY created_at').all()).results.map(publicUser); }
async function createSession(db, userId) {
  const token = randHex(32);
  await db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(await sha256(token), userId, Date.now() + SESSION_TTL).run();
  return token;
}
async function authUser(db, request) {
  const h = request.headers.get('authorization') || '';
  if (!h.startsWith('Bearer ')) return null;
  const th = await sha256(h.slice(7));
  const row = await db.prepare('SELECT s.expires_at, u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1').bind(th, Date.now()).first();
  if (!row) return null;
  // تمديد الجلسة فقط عند اقتراب انتهائها لتقليل الكتابة
  if (row.expires_at - Date.now() < SESSION_TTL / 2) await db.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(Date.now() + SESSION_TTL, th).run();
  return { user: row, tokenHash: th };
}

// ---------------- الصلاحيات على مستوى البيانات ----------------
function canWrite(role, coll, change) {
  if (role === 'admin') return true;
  if (role === 'pharmacist') return coll !== 'meta';
  if (role === 'cashier') {
    if (change.deleted) return false;
    if (coll === 'customers') return true;
    if (coll === 'customerPayments') return !change.baseV; // إضافة فقط
  }
  return false;
}

// ---------------- الصور: تُفصل عن المنتج وتُخدم برابط ----------------
const DATA_URL = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/;
const IMG_URL = /^\/api\/img\/[a-z0-9]+$/;
function extractImage(data, images) {
  if (!data || typeof data.image !== 'string' || !data.image) return;
  const m = data.image.match(DATA_URL);
  if (m && m[2].length < 1500000) { const id = uid(); images.push({ id, mime: m[1], data: m[2] }); data.image = '/api/img/' + id; }
  else if (!IMG_URL.test(data.image)) data.image = '';
}

// ---------------- المزامنة ----------------
async function pull(db, since) {
  const rows = since > 0
    ? (await db.prepare('SELECT coll, id, data, v, deleted FROM records WHERE updated_at > ? ORDER BY updated_at').bind(since).all()).results
    : (await db.prepare('SELECT coll, id, data, v, deleted FROM records WHERE deleted = 0').all()).results;
  return rows.map(r => ({ coll: r.coll, id: r.id, v: r.v, deleted: !!r.deleted, data: r.data ? JSON.parse(r.data) : null }));
}

async function push(db, me, changes) {
  if (!Array.isArray(changes) || changes.length > 500) fail(400, 'تغييرات غير صالحة');
  const now = Date.now(), w = randHex(8), images = [], rows = [];
  let maxSaleNo = 0, newPurchases = [];
  for (const c of changes) {
    const coll = str(c.coll, 30), id = str(c.id, 80), deleted = !!c.deleted, baseV = Math.max(0, parseInt(c.baseV) || 0);
    if (!COLLS.includes(coll) || !id) fail(400, 'سجل غير صالح');
    if (!canWrite(me.role, coll, { deleted, baseV })) fail(403, 'ليس لديك صلاحية لهذا التعديل');
    let data = null;
    if (!deleted) {
      if (!c.data || typeof c.data !== 'object' || Array.isArray(c.data)) fail(400, 'بيانات غير صالحة');
      data = { ...c.data, id };
      if (coll === 'products') extractImage(data, images);
      if (coll === 'sales' && +data.no > maxSaleNo) maxSaleNo = +data.no;
      if (coll === 'purchases' && !baseV) newPurchases.push(data);
    }
    rows.push({ coll, id, deleted: deleted ? 1 : 0, v: baseV + 1, data });
  }
  // ترقيم فواتير الشراء الجديدة من الخادم (لا تكرار بين الأجهزة)
  if (newPurchases.length) {
    const r = await db.prepare("UPDATE counters SET value = value + ? WHERE name = 'purchase' RETURNING value").bind(newPurchases.length).first();
    let n = r.value - newPurchases.length;
    for (const p of newPurchases) p.no = ++n;
  }
  const payload = JSON.stringify(rows.map(r => ({ ...r, data: r.data ? JSON.stringify(r.data) : null })));
  if (payload.length > 1900000) fail(413, 'دفعة التغييرات كبيرة جداً');
  const stmts = [];
  if (images.length) stmts.push(db.prepare(`INSERT INTO images (id, mime, data, created_at) SELECT json_extract(value, '$.id'), json_extract(value, '$.mime'), json_extract(value, '$.data'), ? FROM json_each(?)`).bind(now, JSON.stringify(images)));
  // كتابة مشروطة بالإصدار: لا يُكتب السجل إن غيّره جهاز آخر في الأثناء
  stmts.push(db.prepare(`INSERT INTO records (coll, id, data, v, updated_at, deleted, w)
      SELECT json_extract(value, '$.coll'), json_extract(value, '$.id'), json_extract(value, '$.data'), json_extract(value, '$.v'), ?, json_extract(value, '$.deleted'), ? FROM json_each(?) WHERE 1
      ON CONFLICT (coll, id) DO UPDATE SET data = excluded.data, v = excluded.v, updated_at = excluded.updated_at, deleted = excluded.deleted, w = excluded.w
      WHERE records.v = excluded.v - 1`).bind(now, w, payload));
  if (maxSaleNo) stmts.push(db.prepare("UPDATE counters SET value = max(value, ?) WHERE name = 'sale'").bind(maxSaleNo));
  await db.batch(stmts);
  const keys = JSON.stringify(rows.map(r => ({ coll: r.coll, id: r.id })));
  const res = (await db.prepare(`SELECT r.coll, r.id, r.data, r.v, r.deleted, r.w FROM records r JOIN json_each(?) j ON r.coll = json_extract(j.value, '$.coll') AND r.id = json_extract(j.value, '$.id')`).bind(keys).all()).results;
  const applied = [], conflicts = [];
  for (const r of res) {
    const rec = { coll: r.coll, id: r.id, v: r.v, deleted: !!r.deleted, data: r.data ? JSON.parse(r.data) : null };
    (r.w === w ? applied : conflicts).push(rec);
  }
  return { now, applied, conflicts };
}

// ---------------- البيع (على الخادم لضمان صحة المخزون بين الأجهزة) ----------------
const today = () => new Date().toISOString().slice(0, 10);
async function checkout(db, me, b) {
  const lines = Array.isArray(b.items) ? b.items.slice(0, 200) : [];
  if (!lines.length) fail(400, 'السلة فارغة');
  const discount = Math.max(0, +b.discount || 0), method = ['نقد', 'بطاقة', 'آجل'].includes(b.method) ? b.method : 'نقد';
  for (let attempt = 0; attempt < 4; attempt++) {
    const ids = [...new Set(lines.map(l => str(l.productId, 80)))];
    const prows = (await db.prepare(`SELECT id, data, v FROM records WHERE coll = 'products' AND deleted = 0 AND id IN (SELECT value FROM json_each(?))`).bind(JSON.stringify(ids)).all()).results;
    const products = new Map(prows.map(r => [r.id, { data: JSON.parse(r.data), v: r.v }]));
    let customer = null;
    if (b.customerId) {
      const c = await db.prepare(`SELECT data FROM records WHERE coll = 'customers' AND id = ? AND deleted = 0`).bind(str(b.customerId, 80)).first();
      if (!c) fail(400, 'الزبون غير موجود');
      customer = JSON.parse(c.data);
    }
    if (method === 'آجل' && !customer) fail(400, 'اختر الزبون للبيع بالآجل');
    const items = [];
    for (const l of lines) {
      const p = products.get(str(l.productId, 80)), qty = Math.floor(+l.qty || 0);
      if (!p) fail(400, 'منتج غير موجود — حدّث الصفحة');
      if (qty <= 0) fail(400, 'كمية غير صالحة');
      const t = today();
      const batches = (p.data.batches || []).filter(x => x.qty > 0 && (!x.expiry || x.expiry >= t)).sort((a, c) => (a.expiry || '9999').localeCompare(c.expiry || '9999'));
      const avail = batches.reduce((s, x) => s + x.qty, 0);
      if (qty > avail) fail(409, `${p.data.name}: المتوفر فقط ${avail}`);
      let need = qty; const used = [];
      for (const x of batches) { if (!need) break; const take = Math.min(x.qty, need); x.qty -= take; need -= take; used.push({ batchId: x.id, qty: take, expiry: x.expiry }); }
      items.push({ productId: p.data.id, name: p.data.name, qty, price: +p.data.price || 0, cost: +p.data.cost || 0, batches: used });
    }
    const subtotal = items.reduce((t, i) => t + i.qty * i.price, 0), total = Math.max(0, subtotal - discount);
    let paid = method === 'آجل' ? Math.min(Math.max(0, +b.paid || 0), total) : (b.paid === '' || b.paid == null ? total : +b.paid);
    if (method !== 'آجل' && !(paid >= total)) fail(400, 'المبلغ المستلم أقل من الإجمالي — اختر "آجل"');
    const sale = { id: uid(), date: new Date().toISOString(), items, subtotal, discount, total, paid, due: method === 'آجل' ? total - paid : 0, method,
      userId: me.id, userName: me.name, customerId: customer?.id || null, customerName: customer?.name || '' };
    const now = Date.now(), w = randHex(8);
    const upd = JSON.stringify([...products.values()].map(p => ({ id: p.data.id, v: p.v, data: JSON.stringify(p.data) })));
    try {
      await db.batch([
        db.prepare(`UPDATE records SET data = json_extract(j.value, '$.data'), v = v + 1, updated_at = ?, w = ? FROM json_each(?) AS j
          WHERE records.coll = 'products' AND records.id = json_extract(j.value, '$.id') AND records.v = json_extract(j.value, '$.v')`).bind(now, w, upd),
        // حارس: إن غيّر جهاز آخر أحد المنتجات تفشل العملية كاملة وتُعاد
        db.prepare(`SELECT json(CASE WHEN (SELECT count(*) FROM records WHERE coll = 'products' AND w = ?) = ? THEN '1' ELSE 'conflict' END)`).bind(w, products.size),
        db.prepare(`UPDATE counters SET value = value + 1 WHERE name = 'sale'`),
        db.prepare(`INSERT INTO records (coll, id, data, v, updated_at, deleted, w) VALUES ('sales', ?, json_set(?, '$.no', (SELECT value FROM counters WHERE name = 'sale')), 1, ?, 0, ?)`).bind(sale.id, JSON.stringify(sale), now, w)
      ]);
    } catch (e) {
      if (/malformed JSON|conflict/i.test(String(e.message))) continue; // تعارض — أعد المحاولة ببيانات جديدة
      throw e;
    }
    const out = (await db.prepare(`SELECT coll, id, data, v FROM records WHERE w = ?`).bind(w).all()).results
      .map(r => ({ coll: r.coll, id: r.id, v: r.v, deleted: false, data: JSON.parse(r.data) }));
    return { now, sale: out.find(r => r.coll === 'sales').data, records: out };
  }
  fail(409, 'المخزون يتغير من جهاز آخر الآن — أعد المحاولة');
}

// ---------------- المتجر العام ----------------
async function store(db) {
  const rows = (await db.prepare(`SELECT coll, id, data FROM records WHERE deleted = 0 AND (coll = 'products' OR (coll = 'meta' AND id IN ('settings', 'categories')))`).all()).results;
  const meta = Object.fromEntries(rows.filter(r => r.coll === 'meta').map(r => [r.id, JSON.parse(r.data).value]));
  const s = meta.settings || {}, t = today();
  return {
    settings: { name: s.name, phone: s.phone, address: s.address, whatsapp: s.whatsapp, currency: s.currency, theme: s.theme, storeNote: s.storeNote },
    categories: meta.categories || [],
    products: rows.filter(r => r.coll === 'products').map(r => JSON.parse(r.data)).filter(p => p.showInStore !== false).map(p => ({
      id: p.id, name: p.name, sci: p.sci, category: p.category, price: p.price, description: p.description, unit: p.unit,
      image: IMG_URL.test(p.image || '') ? p.image : '',
      inStock: (p.batches || []).some(b => b.qty > 0 && (!b.expiry || b.expiry >= t))
    }))
  };
}

// ---------------- الموجّه ----------------
export async function handleApi(request, { db, ip }) {
  try {
    await ensureSchema(db);
    const url = new URL(request.url), p = url.pathname, m = request.method;

    // ---- عام ----
    if (p === '/api/store' && m === 'GET') return json(await store(db), 200, { 'Cache-Control': 'public, max-age=30' });
    if (p.startsWith('/api/img/') && m === 'GET') {
      const img = await db.prepare('SELECT mime, data FROM images WHERE id = ?').bind(p.slice(9)).first();
      if (!img) return json({ error: 'غير موجود' }, 404);
      const bin = Uint8Array.from(atob(img.data), ch => ch.charCodeAt(0));
      return new Response(bin, { headers: { 'Content-Type': img.mime, 'Cache-Control': 'public, max-age=31536000, immutable', ...SECURITY_HEADERS } });
    }
    if (p === '/api/ping' && m === 'GET') {
      const [s, a] = await db.batch([
        db.prepare(`SELECT data FROM records WHERE coll = 'meta' AND id = 'settings' AND deleted = 0`),
        db.prepare(`SELECT 1 AS x FROM users WHERE username = 'admin' AND must_change = 1`)
      ]);
      const settings = s.results[0] ? JSON.parse(s.results[0].data).value : {};
      return json({ ok: true, name: settings?.name || 'صيدلية أيار', firstRun: !!a.results.length });
    }
    if (p === '/api/login' && m === 'POST') {
      const att = await db.prepare('SELECT * FROM login_attempts WHERE ip = ?').bind(ip).first();
      if (att && att.locked_until > Date.now()) fail(429, `محاولات كثيرة. حاول بعد ${Math.ceil((att.locked_until - Date.now()) / 60000)} دقيقة`);
      const b = await body(request);
      const u = await db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').bind(str(b.username, 50).toLowerCase()).first();
      if (!u || !(await verifyPassword(u.pass, String(b.password || '')))) {
        const fails = (att?.fails || 0) + 1, lock = fails >= 5;
        await db.prepare('INSERT INTO login_attempts (ip, fails, locked_until) VALUES (?, ?, ?) ON CONFLICT (ip) DO UPDATE SET fails = excluded.fails, locked_until = excluded.locked_until')
          .bind(ip, lock ? 0 : fails, lock ? Date.now() + LOCK_MS : 0).run();
        fail(401, 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
      await db.batch([
        db.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip),
        db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now())
      ]);
      return json({ token: await createSession(db, u.id), user: publicUser(u) });
    }

    // ---- يتطلب تسجيل الدخول ----
    const auth = await authUser(db, request);
    if (!auth) fail(401, 'انتهت الجلسة، سجّل الدخول مجدداً');
    const me = auth.user, isAdmin = me.role === 'admin';

    if (p === '/api/me' && m === 'GET') return json({ user: publicUser(me) });
    if (p === '/api/logout' && m === 'POST') { await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(auth.tokenHash).run(); return json({ ok: true }); }
    if (p === '/api/password' && m === 'POST') {
      const b = await body(request);
      if (!me.must_change && !(await verifyPassword(me.pass, String(b.current || '')))) fail(400, 'كلمة المرور الحالية غير صحيحة');
      const np = String(b.password || '');
      if (np.length < 6) fail(400, 'كلمة المرور 6 أحرف على الأقل');
      await db.batch([
        db.prepare('UPDATE users SET pass = ?, must_change = 0 WHERE id = ?').bind(await hashPassword(np), me.id),
        db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').bind(me.id, auth.tokenHash)
      ]);
      return json({ ok: true });
    }

    if (p === '/api/sync' && m === 'GET') {
      const since = Math.max(0, parseInt(url.searchParams.get('since')) || 0);
      const now = Date.now();
      return json({ now, records: await pull(db, since), users: await listUsers(db) });
    }
    if (p === '/api/sync' && m === 'POST') return json(await push(db, me, (await body(request)).changes));
    if (p === '/api/checkout' && m === 'POST') return json(await checkout(db, me, await body(request)));

    // ---- المستخدمون (للمدير فقط) ----
    if (p === '/api/users' || p.startsWith('/api/users/')) {
      if (!isAdmin) fail(403, 'غير مسموح');
      if (p === '/api/users' && m === 'POST') {
        const b = await body(request);
        const name = str(b.name, 60), username = str(b.username, 40).toLowerCase(), role = ROLES.includes(b.role) ? b.role : 'cashier', pw = String(b.password || '');
        if (!name || !/^[a-z0-9._-]{2,40}$/.test(username)) fail(400, 'الاسم واسم المستخدم (أحرف إنجليزية وأرقام) مطلوبان');
        const existing = b.id ? await db.prepare('SELECT * FROM users WHERE id = ?').bind(str(b.id, 80)).first() : null;
        if (b.id && !existing) fail(404, 'المستخدم غير موجود');
        const dup = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
        if (dup && dup.id !== existing?.id) fail(400, 'اسم المستخدم مستخدم مسبقاً');
        if ((!existing || pw) && pw.length < 6) fail(400, 'كلمة المرور 6 أحرف على الأقل');
        const self = existing?.id === me.id, active = self ? 1 : (b.active === false ? 0 : 1);
        if (!existing) {
          await db.prepare('INSERT INTO users (id, name, username, pass, role, active, must_change, created_at) VALUES (?, ?, ?, ?, ?, 1, 0, ?)')
            .bind(uid(), name, username, await hashPassword(pw), role, Date.now()).run();
        } else {
          const stmts = [db.prepare('UPDATE users SET name = ?, username = ?, role = ?, active = ? WHERE id = ?').bind(name, username, self ? existing.role : role, active, existing.id)];
          if (pw) stmts.push(db.prepare('UPDATE users SET pass = ?, must_change = 0 WHERE id = ?').bind(await hashPassword(pw), existing.id));
          if (pw || !active) stmts.push(db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').bind(existing.id, auth.tokenHash));
          await db.batch(stmts);
        }
        return json({ users: await listUsers(db) });
      }
      const id = p.split('/')[3];
      if (id && m === 'DELETE') {
        if (id === me.id) fail(400, 'لا يمكنك حذف حسابك');
        await db.batch([db.prepare('DELETE FROM users WHERE id = ?').bind(id), db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id)]);
        return json({ users: await listUsers(db) });
      }
    }
    fail(404, 'غير موجود');
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'خطأ في الخادم' }, 500);
  }
}
