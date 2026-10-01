// أيار — خادم بسيط بدون أي مكتبات خارجية
// يقدّم الملفات من public/ ويحفظ البيانات في data/db.json
// الأمان: تسجيل دخول على الخادم (scrypt + جلسات)، حماية من تخمين كلمات المرور، ورؤوس أمان HTTP
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''; // اختياري: كلمة مرور إضافية قبل فتح صفحة الإدارة (البيانات محمية بالجلسات دائماً)
const PUBLIC = path.join(__dirname, 'public');
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'db.json');
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12 ساعة
const MAX_BODY = 25 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};

// ---------------- قاعدة البيانات ----------------
let db = null;
function loadDB() {
  try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { db = {}; }
  if (!db || typeof db !== 'object' || Array.isArray(db)) db = {};
  if (!Array.isArray(db.users)) db.users = [];
  if (!db.users.length) {
    db.users.push({ id: uid(), name: 'المدير', username: 'admin', pass: hashPassword('1234'), role: 'admin', active: true, mustChange: true });
    saveDB();
  }
}
function saveDB() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, DB_FILE);
}
const uid = () => Date.now().toString(36) + crypto.randomBytes(4).toString('hex');

// ---------------- كلمات المرور ----------------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `scrypt$${salt}$${crypto.scryptSync(String(pw), salt, 64).toString('hex')}`;
}
function verifyPassword(user, pw) {
  const stored = String(user.pass || '');
  if (stored.startsWith('scrypt$')) {
    const [, salt, hash] = stored.split('$');
    const test = crypto.scryptSync(String(pw), salt, 64);
    const ref = Buffer.from(hash, 'hex');
    return ref.length === test.length && crypto.timingSafeEqual(ref, test);
  }
  // توافق مع النسخة القديمة (SHA-256 من المتصفح) ثم ترقيتها تلقائياً إلى scrypt
  const legacy = crypto.createHash('sha256').update('ayar:' + String(user.username).toLowerCase() + ':' + pw).digest('hex');
  if (stored.length === legacy.length && crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(legacy))) {
    user.pass = hashPassword(pw); saveDB();
    return true;
  }
  return false;
}
const publicUser = u => ({ id: u.id, name: u.name, username: u.username, role: u.role, active: u.active !== false, mustChange: !!u.mustChange });

// ---------------- الجلسات والحماية من التخمين ----------------
const sessions = new Map(); // token -> { userId, exp }
const attempts = new Map(); // ip -> { fails, until }
function clientIP(req) { return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress; }
function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId, exp: Date.now() + SESSION_TTL });
  return token;
}
function getUser(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const s = token && sessions.get(token);
  if (!s) return null;
  if (s.exp < Date.now()) { sessions.delete(token); return null; }
  const u = db.users.find(x => x.id === s.userId && x.active !== false);
  if (!u) { sessions.delete(token); return null; }
  s.exp = Date.now() + SESSION_TTL; // تمديد تلقائي مع الاستخدام
  return { user: u, token };
}
function endUserSessions(userId, except) {
  for (const [t, s] of sessions) if (s.userId === userId && t !== except) sessions.delete(t);
}
setInterval(() => {
  const now = Date.now();
  for (const [t, s] of sessions) if (s.exp < now) sessions.delete(t);
  for (const [ip, a] of attempts) if (a.until < now && a.fails === 0) attempts.delete(ip);
}, 10 * 60 * 1000).unref();

// ---------------- أدوات HTTP ----------------
function send(res, code, body, type = 'application/json; charset=utf-8', extra = {}) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...extra });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readJSON(req) {
  return new Promise((resolve, reject) => {
    if (!/application\/json/.test(req.headers['content-type'] || '')) return reject(new Error('Content-Type must be application/json'));
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new Error('الحجم كبير جداً')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(new Error('JSON غير صالح')); } });
    req.on('error', reject);
  });
}
function basicOK(req) {
  if (!ADMIN_PASSWORD) return true;
  const h = req.headers.authorization || '';
  const b = h.startsWith('Basic ') ? h.slice(6) : '';
  if (!b) return false;
  const pass = Buffer.from(b, 'base64').toString().split(':').slice(1).join(':');
  const a = crypto.createHash('sha256').update(pass).digest(), e = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, e);
}
const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const safeImage = v => (typeof v === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v)) ? v : '';

// بيانات عامة للمتجر فقط (بدون أسعار الشراء أو المبيعات أو المستخدمين)
function publicStore() {
  const today = new Date().toISOString().slice(0, 10);
  const s = db.settings || {};
  return {
    settings: { name: s.name, phone: s.phone, address: s.address, whatsapp: s.whatsapp, currency: s.currency, theme: s.theme, storeNote: s.storeNote },
    categories: db.categories || [],
    products: (db.products || []).filter(p => p.showInStore !== false).map(p => ({
      id: p.id, name: p.name, sci: p.sci, category: p.category, price: p.price,
      description: p.description, image: safeImage(p.image), unit: p.unit,
      inStock: (p.batches || []).some(b => b.qty > 0 && (!b.expiry || b.expiry >= today))
    }))
  };
}
const ARRAY_KEYS = ['categories', 'products', 'sales', 'stocktakes', 'suppliers', 'purchases', 'supplierPayments', 'customers', 'customerPayments'];
const stateForClient = () => ({ ...db, users: db.users.map(publicUser) });

// ---------------- API ----------------
async function api(req, res, p) {
  const m = req.method;

  if (p === '/api/store' && m === 'GET') return send(res, 200, publicStore());
  if (p === '/api/ping' && m === 'GET') return send(res, 200, { ok: true, name: db.settings?.name || 'صيدلية أيار', firstRun: db.users.some(u => u.mustChange && u.username === 'admin') });

  if (p === '/api/login' && m === 'POST') {
    const ip = clientIP(req), a = attempts.get(ip) || { fails: 0, until: 0 };
    if (a.until > Date.now()) return send(res, 429, { error: `محاولات كثيرة. حاول بعد ${Math.ceil((a.until - Date.now()) / 60000)} دقيقة` });
    const body = await readJSON(req);
    const u = db.users.find(x => x.username === str(body.username, 50).toLowerCase() && x.active !== false);
    if (!u || !verifyPassword(u, String(body.password || ''))) {
      a.fails++;
      if (a.fails >= 5) { a.until = Date.now() + 15 * 60 * 1000; a.fails = 0; }
      attempts.set(ip, a);
      await new Promise(r => setTimeout(r, 400)); // إبطاء التخمين
      return send(res, 401, { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    attempts.delete(ip);
    return send(res, 200, { token: createSession(u.id), user: publicUser(u) });
  }

  const auth = getUser(req);
  if (!auth) return send(res, 401, { error: 'انتهت الجلسة، سجّل الدخول مجدداً' });
  const me = auth.user, isAdmin = me.role === 'admin';

  if (p === '/api/me' && m === 'GET') return send(res, 200, { user: publicUser(me) });
  if (p === '/api/logout' && m === 'POST') { sessions.delete(auth.token); return send(res, 200, { ok: true }); }

  if (p === '/api/password' && m === 'POST') {
    const body = await readJSON(req);
    if (!me.mustChange && !verifyPassword(me, String(body.current || ''))) return send(res, 400, { error: 'كلمة المرور الحالية غير صحيحة' });
    const np = String(body.password || '');
    if (np.length < 6) return send(res, 400, { error: 'كلمة المرور 6 أحرف على الأقل' });
    me.pass = hashPassword(np); delete me.mustChange; saveDB();
    endUserSessions(me.id, auth.token);
    return send(res, 200, { ok: true, user: publicUser(me) });
  }

  if (p === '/api/state') {
    if (m === 'GET') return send(res, 200, stateForClient());
    if (m === 'PUT') {
      const body = await readJSON(req);
      if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.settings !== 'object') return send(res, 400, { error: 'بيانات غير صالحة' });
      for (const k of ARRAY_KEYS) if (body[k] !== undefined && !Array.isArray(body[k])) return send(res, 400, { error: `الحقل ${k} غير صالح` });
      const next = { ...body, users: db.users }; // المستخدمون لا يتغيرون إلا عبر واجهة المستخدمين
      if (!isAdmin) { next.settings = db.settings || body.settings; next.categories = db.categories || body.categories; } // الإعدادات للمدير فقط
      for (const pr of next.products || []) if (pr && pr.image) pr.image = safeImage(pr.image);
      db = next; saveDB();
      return send(res, 200, { ok: true });
    }
  }

  // ---- إدارة المستخدمين (للمدير فقط) ----
  if (p === '/api/users' || p.startsWith('/api/users/')) {
    if (!isAdmin) return send(res, 403, { error: 'غير مسموح' });
    const ROLES = ['admin', 'pharmacist', 'cashier'];
    if (p === '/api/users' && m === 'POST') {
      const b = await readJSON(req);
      const name = str(b.name, 60), username = str(b.username, 40).toLowerCase(), role = ROLES.includes(b.role) ? b.role : 'cashier';
      if (!name || !/^[a-z0-9._-]{2,40}$/.test(username)) return send(res, 400, { error: 'الاسم واسم المستخدم (أحرف إنجليزية وأرقام) مطلوبان' });
      let u = b.id ? db.users.find(x => x.id === b.id) : null;
      if (b.id && !u) return send(res, 404, { error: 'المستخدم غير موجود' });
      if (db.users.some(x => x.username === username && x !== u)) return send(res, 400, { error: 'اسم المستخدم مستخدم مسبقاً' });
      const pw = String(b.password || '');
      if ((!u || pw) && pw.length < 6) return send(res, 400, { error: 'كلمة المرور 6 أحرف على الأقل' });
      if (!u) { u = { id: uid(), active: true }; db.users.push(u); }
      const self = u.id === me.id;
      Object.assign(u, { name, username, role: self ? u.role : role, active: self ? true : b.active !== false });
      if (pw) { u.pass = hashPassword(pw); delete u.mustChange; endUserSessions(u.id, self ? auth.token : null); }
      if (!u.active) endUserSessions(u.id);
      saveDB();
      return send(res, 200, { users: db.users.map(publicUser) });
    }
    const id = p.split('/')[3];
    if (id && m === 'DELETE') {
      if (id === me.id) return send(res, 400, { error: 'لا يمكنك حذف حسابك' });
      db.users = db.users.filter(x => x.id !== id); endUserSessions(id); saveDB();
      return send(res, 200, { users: db.users.map(publicUser) });
    }
  }
  return send(res, 404, { error: 'غير موجود' });
}

// ---------------- الخادم ----------------
const server = http.createServer(async (req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { return send(res, 400, 'bad request', 'text/plain'); }

  if (p.startsWith('/api/')) {
    try { return await api(req, res, p); }
    catch (e) { return send(res, 400, { error: e.message || 'خطأ' }); }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method not allowed', 'text/plain');
  const file = p === '/' ? '/index.html' : p === '/store' ? '/store.html' : p;
  if (file === '/index.html' && !basicOK(req)) {
    return send(res, 401, 'مطلوب تسجيل الدخول', 'text/plain; charset=utf-8', { 'WWW-Authenticate': 'Basic realm="Ayar Admin"' });
  }
  const full = path.normalize(path.join(PUBLIC, file));
  if (!full.startsWith(PUBLIC + path.sep)) return send(res, 403, 'forbidden', 'text/plain');
  fs.readFile(full, (err, data) => {
    if (err) return send(res, 404, 'غير موجود', 'text/plain; charset=utf-8');
    const ext = path.extname(full);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300', ...SECURITY_HEADERS });
    res.end(data);
  });
});

loadDB();
server.listen(PORT, HOST, () => {
  console.log(`أيار يعمل على http://localhost:${PORT}  (المتجر: /store)`);
});
