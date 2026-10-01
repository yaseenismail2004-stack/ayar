// أيار — خادم التطوير المحلي (Node.js 22+) بنفس منطق Cloudflare
// يستخدم SQLite المدمج في Node بواجهة مطابقة لـ D1، ويحفظ في data/ayar.sqlite
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { handleApi, SECURITY_HEADERS } from './src/core.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DB_FILE = process.env.DB_FILE || path.join(ROOT, 'data', 'ayar.sqlite');

// ---- محوّل SQLite → واجهة D1 ----
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const sqlite = new DatabaseSync(DB_FILE);
sqlite.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
class Stmt {
  constructor(sql, args = []) { this.sql = sql; this.args = args; }
  bind(...args) { return new Stmt(this.sql, args); }
  _all() { return sqlite.prepare(this.sql).all(...this.args).map(r => ({ ...r })); }
  async first() { const r = sqlite.prepare(this.sql).get(...this.args); return r ? { ...r } : null; }
  async all() { return { results: this._all() }; }
  async run() { const r = sqlite.prepare(this.sql).run(...this.args); return { meta: { changes: r.changes } }; }
}
const db = {
  prepare: sql => new Stmt(sql),
  async batch(stmts) {
    sqlite.exec('BEGIN IMMEDIATE');
    try { const out = stmts.map(s => ({ results: s._all() })); sqlite.exec('COMMIT'); return out; }
    catch (e) { sqlite.exec('ROLLBACK'); throw e; }
  }
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end(); }

  if (p.startsWith('/api/')) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(new URL(req.url, `http://${req.headers.host || 'localhost'}`), {
      method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks)
    });
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
    const response = await handleApi(request, { db, ip });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    return res.end(Buffer.from(await response.arrayBuffer()));
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  if (p === '/store' || p === '/store.html' || p === '/admin.html') { res.writeHead(301, { Location: p === '/admin.html' ? '/admin' : '/' }); return res.end(); }
  let file = p === '/' ? '/index.html' : p;
  if (!path.extname(file) && fs.existsSync(path.join(PUBLIC, file + '.html'))) file += '.html'; // /store → store.html
  const full = path.normalize(path.join(PUBLIC, file));
  if (!full.startsWith(PUBLIC + path.sep) || path.basename(full).startsWith('_')) { res.writeHead(404); return res.end(); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS }); return res.end('غير موجود'); }
    const ext = path.extname(full);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300', ...SECURITY_HEADERS });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => console.log(`أيار يعمل: موقع الزبائن http://localhost:${PORT}/  —  لوحة الإدارة http://localhost:${PORT}/admin`));
