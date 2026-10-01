// أيار — خادم بسيط بدون أي مكتبات خارجية
// يقدّم الملفات من public/ ويحفظ البيانات في data/db.json
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''; // اختياري: يحمي لوحة الإدارة
const PUBLIC = path.join(__dirname, 'public');
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return null; }
}
function writeDB(obj) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj));
  fs.renameSync(tmp, DB_FILE);
}

function isAuthorized(req) {
  if (!ADMIN_PASSWORD) return true;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const [, pass] = Buffer.from(h.slice(6), 'base64').toString().split(':');
  return pass === ADMIN_PASSWORD;
}
function askAuth(res) {
  res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Ayar Admin"', 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('مطلوب تسجيل الدخول');
}

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

// بيانات عامة للمتجر فقط (بدون أسعار الشراء أو المبيعات)
function publicStore(db) {
  if (!db) return { settings: {}, categories: [], products: [] };
  const today = new Date().toISOString().slice(0, 10);
  const s = db.settings || {};
  return {
    settings: { name: s.name, phone: s.phone, address: s.address, whatsapp: s.whatsapp, currency: s.currency, theme: s.theme, storeNote: s.storeNote },
    categories: db.categories || [],
    products: (db.products || []).filter(p => p.showInStore !== false).map(p => ({
      id: p.id, name: p.name, sci: p.sci, category: p.category, price: p.price,
      description: p.description, image: p.image, unit: p.unit,
      inStock: (p.batches || []).some(b => b.qty > 0 && (!b.expiry || b.expiry >= today))
    }))
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);

  // ---- API ----
  if (p === '/api/store' && req.method === 'GET') return send(res, 200, publicStore(readDB()));
  if (p === '/api/state') {
    if (!isAuthorized(req)) return askAuth(res);
    if (req.method === 'GET') return send(res, 200, readDB() || {});
    if (req.method === 'PUT') {
      let body = '';
      req.on('data', c => { body += c; if (body.length > 50e6) req.destroy(); });
      req.on('end', () => {
        try { writeDB(JSON.parse(body)); send(res, 200, { ok: true }); }
        catch (e) { send(res, 400, { ok: false, error: e.message }); }
      });
      return;
    }
    return send(res, 405, { ok: false });
  }

  // ---- ملفات ثابتة ----
  let file = p === '/' ? '/index.html' : p === '/store' ? '/store.html' : p;
  if (file === '/index.html' && !isAuthorized(req)) return askAuth(res);
  const full = path.normalize(path.join(PUBLIC, file));
  if (!full.startsWith(PUBLIC)) return send(res, 403, 'forbidden', 'text/plain');
  fs.readFile(full, (err, data) => {
    if (err) return send(res, 404, 'غير موجود', 'text/plain; charset=utf-8');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`أيار يعمل على http://localhost:${PORT}  (المتجر: /store)`);
});
