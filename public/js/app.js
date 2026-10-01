// ================= أيار — تطبيق إدارة الصيدلية =================
(() => {
'use strict';

// ---------- أيقونات ----------
const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  home: ic('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  cart: ic('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11.5l2-8H6.2"/>'),
  box: ic('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
  clip: ic('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>'),
  receipt: ic('<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),
  store: ic('<path d="M3 9 5 4h14l2 5M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v8h14v-8"/><path d="M10 21v-5h4v5"/>'),
  gear: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  scan: ic('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M13 8v8M17 8v8"/>'),
  barcode: ic('<path d="M4 6v12M7 6v12M10 6v12M14 6v12M17 6v12M20 6v12"/>'),
  edit: ic('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  trash: ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'),
  x: ic('<path d="M18 6 6 18M6 6l12 12"/>'),
  alert: ic('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'),
  clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  money: ic('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>'),
  print: ic('<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/>'),
  menu: ic('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  camera: ic('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
  wand: ic('<path d="m15 4 5 5M3 21l11-11M14 3l1 1M20 9l1 1M19 3v2M18 4h2"/>'),
  eye: ic('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'),
  download: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  upload: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>'),
  check: ic('<path d="M20 6 9 17l-5-5"/>'),
  undo: ic('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>'),
  users: ic('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  truck: ic('<path d="M1 4h14v12H1zM15 9h4l3 3v4h-7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>'),
  wallet: ic('<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.5"/>'),
  logout: ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
  lock: ic('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>')
};

// ---------- SHA-256 (لتخزين كلمات المرور مشفّرة) ----------
function sha256(str) {
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bytes = new TextEncoder().encode(str), l = bytes.length;
  const n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n);
  m.set(bytes); m[l] = 0x80;
  const dv = new DataView(m.buffer); dv.setUint32(n - 4, l * 8); dv.setUint32(n - 8, Math.floor(l / 0x20000000));
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19], W = new Uint32Array(64);
  const r = (x, k) => (x >>> k) | (x << (32 - k));
  for (let o = 0; o < n; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = r(W[i-15],7) ^ r(W[i-15],18) ^ (W[i-15] >>> 3), s1 = r(W[i-2],17) ^ r(W[i-2],19) ^ (W[i-2] >>> 10);
      W[i] = (W[i-16] + s0 + W[i-7] + s1) | 0;
    }
    let [a,b,c,d,e,f,g,h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e,6) ^ r(e,11) ^ r(e,25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
      const t2 = ((r(a,2) ^ r(a,13) ^ r(a,22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0; H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
const hashPass = (user, pass) => sha256('ayar:' + String(user).toLowerCase() + ':' + pass);

// ---------- المستخدمون والصلاحيات ----------
const ROLES = {
  admin: { t: 'مدير', routes: '*' },
  pharmacist: { t: 'صيدلاني', routes: ['dashboard', 'pos', 'products', 'inventory', 'purchases', 'customers', 'sales', 'store'] },
  cashier: { t: 'كاشير', routes: ['pos', 'customers', 'sales', 'store'] }
};
let me = null; // المستخدم الحالي
const can = route => !!me && (ROLES[me.role]?.routes === '*' || ROLES[me.role]?.routes.includes(route));
const isAdmin = () => me?.role === 'admin';
const canManage = () => me && me.role !== 'cashier'; // صلاحيات حساسة: الإرجاع، الحذف، أسعار الشراء

// ---------- أدوات ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = () => DB.s;
const finePointer = () => !window.matchMedia || matchMedia('(pointer: fine)').matches; // لا نفتح الكيبورد تلقائياً على اللمس
const today = () => new Date().toISOString().slice(0, 10);
const num = v => { const n = parseFloat(String(v).replace(/,/g, '')); return isNaN(n) ? 0 : n; };
const money = v => `${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${esc(S()?.settings.currency || '')}`;
const safeImg = v => (typeof v === 'string' && (/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v) || /^\/api\/img\/[a-z0-9]+$/.test(v))) ? v : '';
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB') : '—';
const fmtDT = d => new Date(d).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
const daysTo = d => Math.ceil((new Date(d) - new Date(today())) / 864e5);

function toast(msg, err = false) {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : '');
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 2600);
}
function beep(ok = true) {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    const o = a.createOscillator(), g = a.createGain();
    o.frequency.value = ok ? 1100 : 300; g.gain.value = .08;
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + .09);
  } catch {}
}

// ---------- منطق المخزون ----------
const stockOf = p => (p.batches || []).reduce((s, b) => s + (b.qty || 0), 0);
const sellableBatches = p => (p.batches || []).filter(b => b.qty > 0 && (!b.expiry || b.expiry >= today()))
  .sort((a, b) => (a.expiry || '9999').localeCompare(b.expiry || '9999'));
const sellableQty = p => sellableBatches(p).reduce((s, b) => s + b.qty, 0);
const nearestExpiry = p => sellableBatches(p)[0]?.expiry || null;
const findProduct = id => S().products.find(p => p.id === id);
const customerBalance = id => S().sales.filter(x => x.customerId === id).reduce((t, x) => t + (x.due || 0), 0)
  - S().customerPayments.filter(x => x.customerId === id).reduce((t, x) => t + x.amount, 0);
const supplierBalance = id => S().purchases.filter(x => x.supplierId === id).reduce((t, x) => t + (x.total - (x.paid || 0)), 0)
  - S().supplierPayments.filter(x => x.supplierId === id).reduce((t, x) => t + x.amount, 0);
const findByCode = code => S().products.find(p => p.barcode && p.barcode === String(code).trim());
function expiryState(exp) {
  if (!exp) return { cls: '', txt: 'بدون' };
  const d = daysTo(exp);
  if (d < 0) return { cls: 'danger', txt: 'منتهي' };
  if (d <= S().settings.expiryWarnDays) return { cls: 'warn', txt: `${d} يوم` };
  return { cls: 'ok', txt: fmtDate(exp) };
}
function alerts() {
  const warn = S().settings.expiryWarnDays, out = { expired: [], soon: [], low: [] };
  for (const p of S().products) {
    for (const b of p.batches || []) {
      if (!b.qty || !b.expiry) continue;
      const d = daysTo(b.expiry);
      if (d < 0) out.expired.push({ p, b, d });
      else if (d <= warn) out.soon.push({ p, b, d });
    }
    if (sellableQty(p) <= (p.minStock ?? S().settings.lowStock)) out.low.push(p);
  }
  out.soon.sort((a, b) => a.d - b.d);
  return out;
}
const thumb = (p, cls = 'thumb') => safeImg(p?.image) ? `<img class="${cls}" src="${safeImg(p.image)}" alt="">` : `<div class="${cls}">${esc((p?.name || '؟')[0])}</div>`;

// ---------- نافذة منبثقة ----------
function modal(html, { size = '', onClose } = {}) {
  const root = $('#modal-root');
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `<div class="modal glass ${size}">${html}</div>`;
  const close = () => { back.remove(); onClose && onClose(); };
  back.addEventListener('mousedown', e => { if (e.target === back) close(); });
  $$('[data-close]', back).forEach(b => b.onclick = close);
  root.appendChild(back);
  const first = $('input[autofocus], input:not([type=hidden]):not([type=file]):not([type=checkbox])', back);
  first && finePointer() && setTimeout(() => first.focus(), 50);
  return { el: back, close };
}
const modalHead = t => `<div class="modal-head"><h2>${t}</h2><button class="btn icon ghost" data-close>${I.x}</button></div>`;
function confirmBox(msg, onYes, yesText = 'تأكيد', danger = true) {
  const m = modal(`${modalHead('تأكيد')}<p>${msg}</p><div class="row" style="justify-content:flex-end">
    <button class="btn ghost" data-close>إلغاء</button><button class="btn ${danger ? 'danger' : 'primary'}" id="yes">${yesText}</button></div>`, { size: 'sm' });
  $('#yes', m.el).onclick = () => { m.close(); onYes(); };
}

// ---------- ماسح الكاميرا ----------
let zxingLoading = null;
function loadZXing() {
  if (window.ZXingBrowser) return Promise.resolve();
  if (zxingLoading) return zxingLoading;
  zxingLoading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@zxing/browser@0.1.5/umd/zxing-browser.min.js';
    s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  return zxingLoading;
}
function openScanner(onCode) {
  let stream = null, stopped = false, controls = null;
  const m = modal(`${modalHead('مسح الباركود بالكاميرا')}
    <video id="scanner-video" playsinline muted></video>
    <p class="muted small center" id="scan-msg">وجّه الكاميرا نحو الباركود…</p>`, {
    size: 'sm', onClose: () => { stopped = true; stream && stream.getTracks().forEach(t => t.stop()); controls && controls.stop(); }
  });
  const video = $('#scanner-video', m.el), msg = $('#scan-msg', m.el);
  const done = code => { if (stopped) return; beep(); m.close(); onCode(code); };
  (async () => {
    try {
      if ('BarcodeDetector' in window) {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream; await video.play();
        const det = new BarcodeDetector();
        const loop = async () => {
          if (stopped) return;
          try { const r = await det.detect(video); if (r.length) return done(r[0].rawValue); } catch {}
          requestAnimationFrame(loop);
        };
        loop();
      } else {
        msg.textContent = 'جاري تحميل الماسح…';
        await loadZXing();
        if (stopped) return;
        msg.textContent = 'وجّه الكاميرا نحو الباركود…';
        const reader = new ZXingBrowser.BrowserMultiFormatReader();
        controls = await reader.decodeFromVideoDevice(undefined, video, r => { if (r) done(r.getText()); });
      }
    } catch (e) {
      msg.textContent = 'تعذر تشغيل الكاميرا. يمكنك استخدام جهاز قارئ الباركود أو الإدخال اليدوي.';
    }
  })();
}

// ================= العرض والتنقل =================
const ROUTES = {
  dashboard: { t: 'لوحة التحكم', i: I.home, r: renderDashboard },
  pos: { t: 'الكاشير', i: I.cart, r: renderPOS },
  products: { t: 'المنتجات', i: I.box, r: renderProducts },
  inventory: { t: 'الجرد', i: I.clip, r: renderInventory },
  purchases: { t: 'المشتريات والموردين', i: I.truck, r: renderPurchases },
  customers: { t: 'الزبائن والديون', i: I.wallet, r: renderCustomers },
  sales: { t: 'المبيعات', i: I.receipt, r: renderSales },
  store: { t: 'موقع العرض', i: I.store, r: renderStoreLink },
  users: { t: 'المستخدمين', i: I.users, r: renderUsers },
  settings: { t: 'الإعدادات والثيمات', i: I.gear, r: renderSettings }
};
let current = 'dashboard';

function applyTheme() {
  document.documentElement.dataset.theme = S().settings.theme;
  $('#brand-name').textContent = S().settings.name || 'أيار';
  document.title = `${S().settings.name} — إدارة الصيدلية`;
}
function renderNav() {
  $('#nav').innerHTML = Object.entries(ROUTES).filter(([k]) => can(k)).map(([k, v]) =>
    `<a href="#${k}" class="${k === current ? 'active' : ''}">${v.i}<span>${v.t}</span></a>`).join('');
  $('#user-box').innerHTML = me ? `<div class="list-item" style="border:none;padding:6px 4px"><div class="thumb">${esc(me.name[0])}</div>
    <div class="grow" style="min-width:0"><b style="font-size:14px">${esc(me.name)}</b><div class="small muted">${ROLES[me.role].t}</div></div>
    <button class="btn icon ghost sm" id="logout" title="تسجيل الخروج">${I.logout}</button></div>` : '';
  const lo = $('#logout'); lo && (lo.onclick = logout);
  // شريط التبويبات السفلي للموبايل
  const tabs = ['dashboard', 'pos', 'products', 'customers', 'sales', 'store'].filter(can).slice(0, 4);
  $('#tabbar').innerHTML = tabs.map(k => `<a href="#${k}" class="${k === current ? 'active' : ''}">${ROUTES[k].i}<span>${({ dashboard: 'الرئيسية', pos: 'الكاشير', products: 'المنتجات', customers: 'الزبائن', sales: 'المبيعات', store: 'المتجر' })[k]}</span></a>`).join('')
    + `<button id="tab-more" class="${tabs.includes(current) ? '' : 'active'}">${I.menu}<span>المزيد</span></button>`;
  $('#tab-more').onclick = () => setNav(true);
}
function setNav(open) { $('#sidebar').classList.toggle('open', open); document.body.classList.toggle('nav-open', open); }
function setCart(open) { $('#cart')?.classList.toggle('open', open); document.body.classList.toggle('cart-open', open); }
// تسمية خلايا الجداول لعرضها كبطاقات على الموبايل
let labelTimer = null;
function labelTables() {
  for (const t of $$('.table-wrap table')) {
    const heads = $$('thead th', t).map(th => th.textContent.trim());
    for (const tr of $$('tbody tr', t)) [...tr.children].forEach((td, i) => { if (!td.hasAttribute('data-label')) td.setAttribute('data-label', heads[i] || ''); });
  }
}
new MutationObserver(() => { clearTimeout(labelTimer); labelTimer = setTimeout(labelTables, 30); }).observe(document.body, { childList: true, subtree: true });
function go() {
  if (!me) return showLogin();
  current = (location.hash.slice(1) || 'dashboard');
  if (!ROUTES[current]) current = 'dashboard';
  if (!can(current)) { current = Object.keys(ROUTES).find(can); if (location.hash.slice(1) !== current) return void (location.hash = current); }
  renderNav();
  $('#page-title').textContent = ROUTES[current].t;
  $('#page-sub').textContent = new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' });
  $('#top-actions').innerHTML = '';
  setNav(false); setCart(false);
  window.scrollTo(0, 0);
  ROUTES[current].r($('#view'));
}

// ---------- تسجيل الدخول ----------
let pharmacyName = 'صيدلية أيار', firstRun = false;
function showLogin() {
  $('.app').classList.add('hidden');
  $('#view').innerHTML = ''; $('#modal-root').innerHTML = '';
  let el = $('#login');
  if (!el) { el = document.createElement('div'); el.id = 'login'; document.body.appendChild(el); }
  el.innerHTML = `<div class="login-wrap"><form class="glass login-card" id="login-form" autocomplete="on">
    <div class="brand-logo" style="width:64px;height:64px;font-size:30px;margin:0 auto 12px;border-radius:20px">أ</div>
    <h2 style="margin:0 0 4px">${esc(pharmacyName)}</h2><p class="muted" style="margin:0 0 20px">سجّل الدخول للمتابعة</p>
    <div class="field input-icon">${I.user}<input id="l-user" placeholder="اسم المستخدم" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
    <div class="field input-icon">${I.lock}<input id="l-pass" type="password" placeholder="كلمة المرور" autocomplete="current-password"></div>
    <button class="btn primary lg" style="width:100%" id="l-btn">تسجيل الدخول</button>
    <p class="small muted" style="margin-bottom:0">${firstRun ? 'أول دخول: المستخدم <b>admin</b> وكلمة المرور <b>1234</b>' : ''}</p>
    ${DB.online ? '' : '<p class="small" style="color:var(--warn);margin-bottom:0">وضع محلي بدون خادم — البيانات في هذا المتصفح فقط</p>'}
  </form></div>`;
  if (finePointer()) $('#l-user').focus();
  $('#login-form').onsubmit = async e => {
    e.preventDefault();
    const un = $('#l-user').value.trim().toLowerCase(), pw = $('#l-pass').value, btn = $('#l-btn');
    btn.disabled = true;
    try {
      let user;
      if (DB.online) user = await DB.login(un, pw);
      else {
        user = S().users.find(x => x.username === un && x.active !== false);
        if (!user || user.pass !== hashPass(un, pw)) throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        sessionStorage.setItem('ayar-user', user.id);
      }
      await startSession(user);
      toast(`أهلاً ${me.name} 👋`);
    } catch (err) { beep(false); toast(err.message, true); $('#l-pass').select(); }
    finally { btn.disabled = false; }
  };
}
async function startSession(user) {
  DB.user = user.id;
  if (DB.online) {
    try { await DB.load(); }
    catch (e) { toast(e.message, true); return showLogin(); }
  }
  me = S().users.find(x => x.id === user.id) || user;
  applyTheme();
  $('#login')?.remove(); $('.app').classList.remove('hidden');
  go();
  if (me.mustChange) setTimeout(() => changePassword(true), 300);
}
async function logout() {
  await DB.flush();
  await DB.logout();
  me = null; cart = []; posCustomer = null; sessionStorage.removeItem('ayar-user');
  showLogin();
}
function changePassword(forced = false) {
  const needCurrent = !forced && !me.mustChange;
  const m = modal(`${modalHead('تغيير كلمة المرور')}
    ${forced ? '<p class="muted small">لأمان النظام، غيّر كلمة المرور الافتراضية.</p>' : ''}
    ${needCurrent ? '<div class="field"><label>كلمة المرور الحالية</label><input type="password" id="np0" autocomplete="current-password"></div>' : ''}
    <div class="field"><label>كلمة المرور الجديدة (6 أحرف على الأقل)</label><input type="password" id="np1" autocomplete="new-password"></div>
    <div class="field"><label>تأكيد كلمة المرور</label><input type="password" id="np2" autocomplete="new-password"></div>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>لاحقاً</button><button class="btn primary" id="np-save">حفظ</button></div>`, { size: 'sm' });
  $('#np-save', m.el).onclick = async () => {
    const a = $('#np1', m.el).value, b = $('#np2', m.el).value, cur = $('#np0', m.el)?.value || '';
    if (a.length < 6) return toast('كلمة المرور 6 أحرف على الأقل', true);
    if (a !== b) return toast('كلمتا المرور غير متطابقتين', true);
    if (['123456', '1234567', '12345678', 'password', 'admin1'].includes(a)) return toast('كلمة المرور سهلة جداً', true);
    try {
      if (DB.online) await DB.api('/api/password', { method: 'POST', body: { current: cur, password: a } });
      else { if (needCurrent && me.pass !== hashPass(me.username, cur)) throw new Error('كلمة المرور الحالية غير صحيحة'); me.pass = hashPass(me.username, a); DB.save(); }
      delete me.mustChange; m.close(); toast('تم تغيير كلمة المرور ✅');
    } catch (e) { toast(e.message, true); }
  };
}

// ================= لوحة التحكم =================
function renderDashboard(v) {
  const a = alerts(), s = S();
  const todaySales = s.sales.filter(x => x.date.slice(0, 10) === today());
  const todayTotal = todaySales.reduce((t, x) => t + x.total, 0);
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
  const totals = days.map(d => s.sales.filter(x => x.date.slice(0, 10) === d).reduce((t, x) => t + x.total, 0));
  const max = Math.max(...totals, 1);
  $('#top-actions').innerHTML = `<a href="#pos" class="btn primary">${I.cart} فتح الكاشير</a>`;

  v.innerHTML = `
  <div class="grid g4">
    ${stat(I.money, money(todayTotal), `مبيعات اليوم (${todaySales.length} فاتورة)`)}
    ${stat(I.box, s.products.length, 'عدد المنتجات')}
    ${stat(I.clock, a.soon.length, 'دفعات قريبة الانتهاء')}
    ${stat(I.alert, a.low.length + a.expired.length, 'نواقص ومنتهية')}
  </div>
  <div class="grid g2">
    <a href="#customers" style="text-decoration:none;color:inherit">${stat(I.wallet, money(s.customers.reduce((t, c) => t + Math.max(0, customerBalance(c.id)), 0)), 'ديون على الزبائن')}</a>
    <a href="#purchases" style="text-decoration:none;color:inherit">${stat(I.truck, money(s.suppliers.reduce((t, x) => t + Math.max(0, supplierBalance(x.id)), 0)), 'مستحقات للموردين')}</a>
  </div>
  <div class="grid g2">
    <div class="card glass"><h3>مبيعات آخر ٧ أيام</h3>
      <div class="bar-chart">${totals.map((t, i) => `<div class="b" title="${money(t)}"><small>${t ? Math.round(t / 1000) + 'k' : ''}</small><i style="height:${(t / max) * 100}%"></i><small>${new Date(days[i]).toLocaleDateString('ar-IQ', { weekday: 'short' })}</small></div>`).join('')}</div>
    </div>
    <div class="card glass"><h3>تنبيهات الصلاحية <a href="#inventory" class="btn sm">التقرير</a></h3>
      ${[...a.expired.map(x => ({ ...x, exp: true })), ...a.soon].slice(0, 6).map(({ p, b, d, exp }) => `
        <div class="list-item">${thumb(p)}<div class="grow"><b>${esc(p.name)}</b><div class="small muted">الكمية ${b.qty} • ${fmtDate(b.expiry)}</div></div>
        <span class="badge ${exp ? 'danger' : 'warn'}">${exp ? 'منتهي' : `باقي ${d} يوم`}</span></div>`).join('') || `<div class="empty">لا توجد تنبيهات 🎉</div>`}
    </div>
  </div>
  <div class="grid g2">
    <div class="card glass"><h3>نواقص المخزون</h3>
      ${a.low.slice(0, 6).map(p => `<div class="list-item">${thumb(p)}<div class="grow"><b>${esc(p.name)}</b><div class="small muted">الحد الأدنى ${p.minStock ?? s.settings.lowStock}</div></div><span class="badge ${sellableQty(p) ? 'warn' : 'danger'}">${sellableQty(p)} متوفر</span></div>`).join('') || `<div class="empty">المخزون جيد</div>`}
    </div>
    <div class="card glass"><h3>آخر الفواتير <a href="#sales" class="btn sm">الكل</a></h3>
      ${s.sales.slice(-6).reverse().map(x => `<div class="list-item"><div class="thumb">${I.receipt}</div><div class="grow"><b>فاتورة #${x.no}</b><div class="small muted">${fmtDT(x.date)} • ${x.items.length} صنف</div></div><b>${money(x.total)}</b></div>`).join('') || `<div class="empty">لا توجد مبيعات بعد</div>`}
    </div>
  </div>`;
}
const stat = (icon, val, label) => `<div class="stat glass"><div class="ic">${icon}</div><div><b>${val}</b><span>${label}</span></div></div>`;

// ================= الكاشير =================
let cart = [], posCat = 'الكل', posQuery = '', discount = 0, posCustomer = null, payMethod = 'نقد';
function renderPOS(v) {
  const cats = ['الكل', ...S().categories];
  v.innerHTML = `
  <div class="pos">
    <div class="content">
      <div class="card glass">
        <div class="row">
          <div class="input-icon grow scan-box">${I.barcode}<input id="scan" placeholder="امسح الباركود أو اكتب اسم المنتج ثم Enter" autocomplete="off"></div>
          <button class="btn lg" id="cam">${I.camera}</button>
        </div>
        <div class="row cat-row" style="margin-top:12px">${cats.map(c => `<button class="btn sm ${c === posCat ? 'primary' : 'ghost'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      </div>
      <div class="pos-products" id="pos-grid"></div>
    </div>
    <div class="cart glass" id="cart"></div>
  </div>
  <button class="cart-fab" id="cart-fab"></button>`;
  $('#cart-fab').onclick = () => setCart(true);
  const scan = $('#scan');
  scan.value = posQuery;
  if (finePointer()) scan.focus();
  scan.oninput = () => { posQuery = scan.value; drawGrid(); };
  scan.onkeydown = e => {
    if (e.key !== 'Enter') return;
    const q = scan.value.trim(); if (!q) return;
    const p = findByCode(q) || (() => { const r = filtered(); return r.length === 1 ? r[0] : null; })();
    if (p) { addToCart(p); scan.value = ''; posQuery = ''; drawGrid(); }
    else { beep(false); toast('لم يتم العثور على المنتج', true); }
  };
  $('#cam').onclick = () => openScanner(code => { const p = findByCode(code); p ? addToCart(p) : toast(`الرمز ${code} غير مسجّل`, true); });
  $$('[data-cat]', v).forEach(b => b.onclick = () => { posCat = b.dataset.cat; renderPOS(v); });
  drawGrid(); drawCart();
}
function filtered() {
  const q = posQuery.trim().toLowerCase();
  return S().products.filter(p => (posCat === 'الكل' || p.category === posCat) &&
    (!q || p.name.toLowerCase().includes(q) || (p.sci || '').toLowerCase().includes(q) || (p.barcode || '').includes(q)));
}
function drawGrid() {
  const list = filtered();
  $('#pos-grid').innerHTML = list.map(p => {
    const q = sellableQty(p);
    return `<div class="pos-item glass ${q ? '' : 'out'}" data-id="${p.id}">${thumb(p)}<b>${esc(p.name)}</b>
      <div class="price">${money(p.price)}</div><div class="small muted">${q ? `متوفر ${q}` : 'نفد'}</div></div>`;
  }).join('') || `<div class="empty glass" style="grid-column:1/-1">لا توجد منتجات</div>`;
  $$('.pos-item').forEach(el => el.onclick = () => addToCart(findProduct(el.dataset.id)));
}
function addToCart(p, n = 1) {
  const avail = sellableQty(p);
  const line = cart.find(l => l.id === p.id);
  const want = (line ? line.qty : 0) + n;
  if (want > avail) { beep(false); return toast(avail ? `المتوفر فقط ${avail}` : `${p.name}: نفد المخزون أو منتهي الصلاحية`, true); }
  line ? line.qty = want : cart.push({ id: p.id, qty: n, price: p.price });
  beep(); drawCart();
}
function drawCart() {
  const el = $('#cart'); if (!el) return;
  const sub = cart.reduce((s, l) => s + l.qty * l.price, 0);
  const total = Math.max(0, sub - discount);
  el.innerHTML = `
    <h3 style="margin:0" class="row between"><span>السلة</span><span class="row">${cart.length ? `<button class="btn sm danger" id="clear">${I.trash} تفريغ</button>` : ''}<button class="btn sm icon ghost cart-close" id="cart-close">${I.x}</button></span></h3>
    <div class="cart-items">${cart.map((l, i) => {
      const p = findProduct(l.id);
      return `<div class="cart-line">${thumb(p)}<div class="nm"><b>${esc(p.name)}</b><span class="small muted">${money(l.price)}</span></div>
        <div class="qty"><button data-dec="${i}">−</button><input data-q="${i}" value="${l.qty}" inputmode="numeric"><button data-inc="${i}">+</button></div>
        <b style="min-width:70px;text-align:left">${money(l.qty * l.price)}</b></div>`;
    }).join('') || `<div class="empty">${I.cart}<div>السلة فارغة<br><span class="small">امسح باركود منتج للبدء</span></div></div>`}</div>
    <div class="totals">
      <div><span class="muted">المجموع</span><b>${money(sub)}</b></div>
      <div class="row"><span class="muted grow">الخصم</span><input id="disc" style="width:120px" inputmode="decimal" value="${discount || ''}" placeholder="0"></div>
      <div class="grand"><span>الإجمالي</span><span>${money(total)}</span></div>
    </div>
    <div id="cust-area">${posCustomer ? `<div class="cust-chip">${I.user}<div class="grow"><b>${esc(posCustomer.name)}</b><div class="small muted">الرصيد السابق: ${money(customerBalance(posCustomer.id))}</div></div><button class="btn sm icon ghost" id="cust-x">${I.x}</button></div>`
      : `<button class="btn ghost sm" id="cust-pick" style="width:100%">${I.user} ربط الفاتورة بزبون (اختياري)</button>`}</div>
    <div class="seg" id="method" style="width:100%">${['نقد', 'بطاقة', 'آجل'].map(m => `<button style="flex:1" data-m="${m}" class="${payMethod === m ? 'on' : ''}">${m === 'آجل' ? 'آجل (دين)' : m}</button>`).join('')}</div>
    <input id="paid" inputmode="decimal" placeholder="${payMethod === 'آجل' ? 'دفعة مقدمة (اختياري)' : 'المبلغ المستلم'}">
    <div class="small muted" id="change"></div>
    <button class="btn primary lg" id="checkout" ${cart.length ? '' : 'disabled'}>${I.check} إتمام البيع</button>`;
  $$('[data-inc]', el).forEach(b => b.onclick = () => addToCart(findProduct(cart[b.dataset.inc].id)));
  $$('[data-dec]', el).forEach(b => b.onclick = () => { const l = cart[b.dataset.dec]; l.qty--; if (l.qty <= 0) cart.splice(b.dataset.dec, 1); drawCart(); });
  $$('[data-q]', el).forEach(inp => inp.onchange = () => {
    const l = cart[inp.dataset.q], p = findProduct(l.id), n = Math.floor(num(inp.value));
    if (n <= 0) cart.splice(inp.dataset.q, 1);
    else if (n > sellableQty(p)) toast(`المتوفر فقط ${sellableQty(p)}`, true);
    else l.qty = n;
    drawCart();
  });
  $('#cart-close', el).onclick = () => setCart(false);
  const fab = $('#cart-fab');
  if (fab) { fab.innerHTML = `<span class="row">${I.cart}<span>السلة</span><span class="count">${cart.reduce((t, l) => t + l.qty, 0)}</span></span><span>${money(total)}</span>`; fab.style.visibility = cart.length ? 'visible' : 'hidden'; }
  const clr = $('#clear', el); clr && (clr.onclick = () => { cart = []; discount = 0; posCustomer = null; payMethod = 'نقد'; drawCart(); });
  $('#disc', el).onchange = e => { discount = num(e.target.value); drawCart(); };
  const cp = $('#cust-pick', el); cp && (cp.onclick = () => pickCustomer(c => { posCustomer = c; drawCart(); }));
  const cx = $('#cust-x', el); cx && (cx.onclick = () => { posCustomer = null; if (payMethod === 'آجل') payMethod = 'نقد'; drawCart(); });
  $$('#method button', el).forEach(b => b.onclick = () => {
    payMethod = b.dataset.m;
    if (payMethod === 'آجل' && !posCustomer) return pickCustomer(c => { posCustomer = c; drawCart(); }, () => { payMethod = 'نقد'; drawCart(); });
    drawCart();
  });
  $('#paid', el).oninput = e => {
    const v = num(e.target.value), c = v - total;
    $('#change').textContent = !e.target.value ? '' : payMethod === 'آجل' ? `يُسجَّل ديناً: ${money(Math.max(0, total - v))}` : (c >= 0 ? `الباقي للزبون: ${money(c)}` : `ناقص: ${money(-c)} — اختر "آجل" لتسجيله ديناً`);
  };
  $('#checkout', el).onclick = () => checkout(payMethod, $('#paid', el).value);
}
let checkingOut = false;
async function checkout(method, paidRaw) {
  if (!cart.length || checkingOut) return;
  const s = S();
  const sub0 = cart.reduce((t, l) => t + l.qty * l.price, 0), total0 = Math.max(0, sub0 - discount);
  if (method === 'آجل' && !posCustomer) return pickCustomer(c => { posCustomer = c; drawCart(); });
  if (method !== 'آجل' && paidRaw !== '' && num(paidRaw) < total0) { beep(false); return toast('المبلغ المستلم أقل من الإجمالي — اختر "آجل" لتسجيل الباقي ديناً', true); }
  for (const l of cart) { const p = findProduct(l.id); if (!p || l.qty > sellableQty(p)) return toast(`الكمية غير متوفرة: ${p?.name || 'منتج محذوف'}`, true); }
  let sale;
  if (DB.online) {
    // البيع يتم على الخادم: يخصم المخزون بأمان حتى لو باع جهازان بنفس الوقت
    checkingOut = true;
    const btn = $('#checkout'); if (btn) { btn.disabled = true; btn.textContent = 'جاري الحفظ…'; }
    try {
      sale = await DB.checkout({ items: cart.map(l => ({ productId: l.id, qty: l.qty })), discount, method,
        paid: paidRaw === '' ? (method === 'آجل' ? 0 : '') : num(paidRaw), customerId: posCustomer?.id || null });
    } catch (e) { beep(false); toast(e.message, true); if (e.status === 409) await DB.pull(); drawCart(); return; }
    finally { checkingOut = false; }
  } else {
    let paid, due = 0;
    if (method === 'آجل') { paid = Math.min(num(paidRaw), total0); due = total0 - paid; }
    else paid = paidRaw === '' ? total0 : num(paidRaw);
    const items = [];
    for (const l of cart) {
      const p = findProduct(l.id);
      let need = l.qty; const used = [];
      for (const b of sellableBatches(p)) { // صرف من الأقرب انتهاءً أولاً (FEFO)
        if (!need) break;
        const take = Math.min(b.qty, need);
        b.qty -= take; need -= take;
        used.push({ batchId: b.id, qty: take, expiry: b.expiry });
      }
      items.push({ productId: p.id, name: p.name, qty: l.qty, price: p.price, cost: p.cost || 0, batches: used });
    }
    const subtotal = items.reduce((t, i) => t + i.qty * i.price, 0);
    sale = { id: DB.uid(), no: s.seq.sale++, date: new Date().toISOString(), items, subtotal, discount, total: Math.max(0, subtotal - discount),
      paid, due, method, userId: me.id, userName: me.name, customerId: posCustomer?.id || null, customerName: posCustomer?.name || '' };
    s.sales.push(sale);
    DB.save();
  }
  cart = []; discount = 0; posCustomer = null; payMethod = 'نقد';
  setCart(false);
  beep();
  const paid = sale.paid, due = sale.due;
  const m = modal(`${modalHead('تم البيع بنجاح ✅')}
    <div class="center"><div class="muted">فاتورة رقم #${sale.no}${sale.customerName ? ` — ${esc(sale.customerName)}` : ''}</div><div style="font-size:34px;font-weight:800;color:var(--primary);margin:10px 0">${money(sale.total)}</div>
    ${paid > sale.total ? `<div>الباقي للزبون: <b>${money(paid - sale.total)}</b></div>` : ''}
    ${due ? `<div class="badge danger" style="font-size:14px">سُجّل ديناً: ${money(due)} — إجمالي ذمته ${money(customerBalance(sale.customerId))}</div>` : ''}</div>
    <div class="row" style="justify-content:center;margin-top:18px"><button class="btn primary" id="pr">${I.print} طباعة الفاتورة</button><button class="btn ghost" data-close>فاتورة جديدة</button></div>`,
    { size: 'sm', onClose: () => current === 'pos' && renderPOS($('#view')) });
  $('#pr', m.el).onclick = () => printReceipt(sale);
}
// اختيار زبون (بحث + إضافة سريعة)
function pickCustomer(onPick, onCancel) {
  let picked = false;
  const m = modal(`${modalHead('اختيار زبون')}
    <div class="input-icon">${I.search}<input id="cq" placeholder="ابحث بالاسم أو الهاتف…" autofocus></div>
    <div class="pick-list" id="clist"></div>
    <h3 style="margin:16px 0 8px;font-size:15px">أو زبون جديد</h3>
    <div class="row" style="flex-wrap:nowrap"><input id="cn" placeholder="الاسم"><input id="cph" placeholder="الهاتف" inputmode="tel"><button class="btn primary" id="cadd">${I.plus}</button></div>`,
    { size: 'sm', onClose: () => { if (!picked && onCancel) onCancel(); } });
  const done = c => { picked = true; m.close(); onPick(c); };
  const draw = () => {
    const q = $('#cq', m.el).value.trim().toLowerCase();
    const list = S().customers.filter(c => !q || c.name.toLowerCase().includes(q) || (c.phone || '').includes(q));
    $('#clist', m.el).innerHTML = list.map(c => { const b = customerBalance(c.id); return `<div data-cid="${c.id}" class="row between"><span><b>${esc(c.name)}</b> <span class="small muted">${esc(c.phone)}</span></span>${b > 0 ? `<span class="badge danger">${money(b)}</span>` : ''}</div>`; }).join('') || '<div class="muted small">لا يوجد زبائن</div>';
    $$('[data-cid]', m.el).forEach(d => d.onclick = () => done(S().customers.find(c => c.id === d.dataset.cid)));
  };
  $('#cq', m.el).oninput = draw;
  $('#cadd', m.el).onclick = () => {
    const name = $('#cn', m.el).value.trim(); if (!name) return toast('اكتب اسم الزبون', true);
    const c = { id: DB.uid(), name, phone: $('#cph', m.el).value.trim(), note: '', createdAt: new Date().toISOString() };
    S().customers.push(c); DB.save(); done(c);
  };
  draw();
}
function printReceipt(sale) {
  const s = S().settings;
  $('#print-area').innerHTML = `<div class="receipt" dir="rtl" style="font-family:Tahoma,sans-serif">
    <div style="text-align:center"><h2 style="margin:4px 0">${esc(s.name)}</h2><div>${esc(s.address)}</div><div>${esc(s.phone)}</div>
    <div>فاتورة #${sale.no} — ${fmtDT(sale.date)}</div>${sale.userName ? `<div>الكاشير: ${esc(sale.userName)}</div>` : ''}${sale.customerName ? `<div>الزبون: ${esc(sale.customerName)}</div>` : ''}</div><hr>
    <table style="width:100%"><tr><th>الصنف</th><th>الكمية</th><th>المبلغ</th></tr>
    ${sale.items.map(i => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${money(i.qty * i.price)}</td></tr>`).join('')}</table>
    <p>المجموع: ${money(sale.subtotal)}<br>${sale.discount ? `الخصم: ${money(sale.discount)}<br>` : ''}<b>الإجمالي: ${money(sale.total)}</b><br>الدفع: ${esc(sale.method)}${sale.due ? `<br>المدفوع: ${money(sale.paid)}<br><b>المتبقي (دين): ${money(sale.due)}</b>` : ''}</p>
    <div style="text-align:center">${esc(s.receiptFooter)}</div></div>`;
  setTimeout(() => window.print(), 50);
}

// ================= المنتجات =================
let prodQuery = '', prodFilter = 'all', prodCat = '';
function renderProducts(v) {
  $('#top-actions').innerHTML = `<button class="btn ghost" id="quick-stock">${I.scan} استلام بضاعة</button><button class="btn primary" id="add-p">${I.plus} منتج جديد</button>`;
  $('#add-p').onclick = () => productForm();
  $('#quick-stock').onclick = quickReceive;
  v.innerHTML = `
  <div class="card glass">
    <div class="row">
      <div class="input-icon grow">${I.search}<input id="pq" placeholder="بحث بالاسم، الاسم العلمي أو الباركود…" value="${esc(prodQuery)}"></div>
      <select id="pcat" style="width:auto"><option value="">كل الأصناف</option>${S().categories.map(c => `<option ${c === prodCat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      <div class="seg" id="pf">${[['all', 'الكل'], ['low', 'نواقص'], ['soon', 'قريب الانتهاء'], ['expired', 'منتهي']].map(([k, t]) => `<button data-f="${k}" class="${k === prodFilter ? 'on' : ''}">${t}</button>`).join('')}</div>
    </div>
  </div>
  <div class="card glass table-wrap" id="ptable"></div>`;
  $('#pq').oninput = e => { prodQuery = e.target.value; drawProducts(); };
  $('#pq').onkeydown = e => { if (e.key === 'Enter') { const p = findByCode(e.target.value); if (p) productForm(p); } };
  $('#pcat').onchange = e => { prodCat = e.target.value; drawProducts(); };
  $$('#pf button').forEach(b => b.onclick = () => { prodFilter = b.dataset.f; $$('#pf button').forEach(x => x.classList.toggle('on', x === b)); drawProducts(); });
  drawProducts();
}
function drawProducts() {
  const q = prodQuery.trim().toLowerCase(), warn = S().settings.expiryWarnDays;
  const list = S().products.filter(p => {
    if (prodCat && p.category !== prodCat) return false;
    if (q && !(p.name.toLowerCase().includes(q) || (p.sci || '').toLowerCase().includes(q) || (p.barcode || '').includes(q))) return false;
    if (prodFilter === 'low') return sellableQty(p) <= (p.minStock ?? S().settings.lowStock);
    if (prodFilter === 'soon') return p.batches.some(b => b.qty > 0 && b.expiry && daysTo(b.expiry) >= 0 && daysTo(b.expiry) <= warn);
    if (prodFilter === 'expired') return p.batches.some(b => b.qty > 0 && b.expiry && daysTo(b.expiry) < 0);
    return true;
  });
  $('#ptable').innerHTML = list.length ? `<table><thead><tr><th></th><th>المنتج</th><th class="col-code">الباركود</th><th>الصنف</th><th>السعر</th><th>الكمية</th><th>الدفعات / التواريخ</th><th></th></tr></thead><tbody>
    ${list.map(p => {
      const total = stockOf(p), sellable = sellableQty(p), low = sellable <= (p.minStock ?? S().settings.lowStock);
      return `<tr>
        <td>${thumb(p)}</td>
        <td><b>${esc(p.name)}</b><div class="small muted">${esc(p.sci)}</div></td>
        <td class="small col-code" style="font-family:monospace">${esc(p.barcode) || '—'}</td>
        <td><span class="badge">${esc(p.category)}</span></td>
        <td style="white-space:nowrap"><b>${money(p.price)}</b></td>
        <td><span class="badge ${low ? (sellable ? 'warn' : 'danger') : 'ok'}">${total}</span></td>
        <td>${p.batches.filter(b => b.qty > 0).map(b => { const e = expiryState(b.expiry); return `<span class="badge ${e.cls}" title="الدفعة ${esc(b.batchNo)}" style="margin:2px">${b.qty} • ${b.expiry ? fmtDate(b.expiry) : 'بدون'}</span>`; }).join('') || '<span class="muted small">لا يوجد</span>'}</td>
        <td><div class="row acts" style="flex-wrap:nowrap">
          <button class="btn sm icon" data-edit="${p.id}" title="تعديل">${I.edit}</button>
          <button class="btn sm icon" data-plabel="${p.id}" title="طباعة باركود">${I.barcode}</button>
          <button class="btn sm icon danger" data-del="${p.id}" title="حذف">${I.trash}</button></div></td></tr>`;
    }).join('')}</tbody></table>` : `<div class="empty">${I.box}<div>لا توجد منتجات مطابقة</div></div>`;
  $$('[data-edit]').forEach(b => b.onclick = () => productForm(findProduct(b.dataset.edit)));
  $$('[data-plabel]').forEach(b => b.onclick = () => printLabels(findProduct(b.dataset.plabel)));
  $$('[data-del]').forEach(b => b.onclick = () => {
    const p = findProduct(b.dataset.del);
    confirmBox(`هل تريد حذف <b>${esc(p.name)}</b> نهائياً؟`, () => { S().products = S().products.filter(x => x !== p); DB.save(); drawProducts(); toast('تم الحذف'); }, 'حذف');
  });
}

// نموذج إضافة/تعديل منتج — يدعم الباركود (مسح/يدوي/توليد) ودفعات بتواريخ متعددة
function productForm(p = null, presetCode = '') {
  const isNew = !p;
  const d = p ? JSON.parse(JSON.stringify(p)) : {
    id: DB.uid(), name: '', sci: '', category: S().categories[0] || '', barcode: presetCode, price: '', cost: '', unit: 'علبة',
    minStock: S().settings.lowStock, description: '', image: '', showInStore: true, createdAt: new Date().toISOString(),
    batches: [{ id: DB.uid(), batchNo: '', expiry: '', qty: '', cost: '' }]
  };
  let codeMode = 'scan';
  const m = modal(`${modalHead(isNew ? 'إضافة منتج جديد' : 'تعديل المنتج')}
    <div class="field">
      <label>طريقة إدخال الكود</label>
      <div class="seg" id="code-mode"><button data-m="scan" class="on">مسح / يدوي</button><button data-m="auto">توليد تلقائي</button><button data-m="none">بدون كود</button></div>
    </div>
    <div class="grid g2" style="gap:12px;align-items:start">
      <div class="field">
        <label>الباركود</label>
        <div class="row" style="flex-wrap:nowrap">
          <div class="input-icon grow">${I.barcode}<input id="f-barcode" value="${esc(d.barcode)}" placeholder="امسح بالقارئ أو اكتب الرمز يدوياً" autocomplete="off" autofocus></div>
          <button class="btn icon" id="f-cam" title="مسح بالكاميرا">${I.camera}</button>
          <button class="btn icon" id="f-gen" title="توليد رمز">${I.wand}</button>
        </div>
        <div class="small" id="code-warn" style="margin-top:6px"></div>
      </div>
      <div class="center" id="code-preview"></div>
    </div>
    <div class="grid g2" style="gap:0 12px">
      <div class="field"><label>اسم المنتج *</label><input id="f-name" value="${esc(d.name)}" placeholder="مثال: بنادول 500mg"></div>
      <div class="field"><label>الاسم العلمي</label><input id="f-sci" value="${esc(d.sci)}" placeholder="Paracetamol"></div>
      <div class="field"><label>الصنف</label><select id="f-cat">${S().categories.map(c => `<option ${c === d.category ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      <div class="field"><label>الوحدة</label><input id="f-unit" value="${esc(d.unit)}" placeholder="علبة / شريط / قنينة"></div>
      <div class="field"><label>سعر البيع *</label><input id="f-price" inputmode="decimal" value="${esc(d.price)}"></div>
      <div class="field"><label>سعر الشراء</label><input id="f-cost" inputmode="decimal" value="${esc(d.cost)}"></div>
      <div class="field"><label>الحد الأدنى للتنبيه</label><input id="f-min" inputmode="numeric" value="${esc(d.minStock)}"></div>
      <div class="field"><label>صورة المنتج</label><div class="row img-pick"><span class="img-thumb" id="f-img-thumb">${d.image ? `<img src="${esc(d.image)}" alt="">` : I.camera}</span><label class="btn grow" style="margin:0;color:var(--primary)">${I.upload} <span id="f-img-label">${d.image ? 'تغيير الصورة' : 'اختيار صورة'}</span><input type="file" id="f-img" accept="image/*" hidden></label></div></div>
    </div>
    <div class="field"><label>الوصف (يظهر في موقع العرض)</label><textarea id="f-desc">${esc(d.description)}</textarea></div>
    <label class="row" style="color:var(--text);margin-bottom:16px"><input type="checkbox" id="f-store" style="width:auto" ${d.showInStore !== false ? 'checked' : ''}> عرض المنتج في موقع العرض للزبائن</label>

    <h3 class="row between" style="margin:8px 0 10px">الكميات وتواريخ الصلاحية <button class="btn sm" id="add-batch">${I.plus} إضافة تاريخ آخر</button></h3>
    <div id="batches"></div>
    <div class="row" style="justify-content:flex-end;margin-top:18px">
      <button class="btn ghost" data-close>إلغاء</button><button class="btn primary" id="save">${I.check} حفظ المنتج</button>
    </div>`);
  const el = m.el, bc = $('#f-barcode', el);

  const preview = () => {
    const code = bc.value.trim();
    $('#code-preview', el).innerHTML = code ? `<div class="barcode-box">${Barcode.svg(code, { height: 50, module: 1.6 })}</div>` : '';
    const dup = code && S().products.find(x => x.barcode === code && x.id !== d.id);
    $('#code-warn', el).innerHTML = dup ? `<span style="color:var(--warn)">⚠ هذا الرمز مسجّل لـ <b>${esc(dup.name)}</b></span> <button class="btn sm" id="open-dup">إضافة دفعة له</button>` : '';
    const od = $('#open-dup', el);
    od && (od.onclick = () => { m.close(); productForm(dup); setTimeout(() => $('#add-batch')?.click(), 80); });
  };
  const generate = () => { bc.value = Barcode.generate(new Set(S().products.map(x => x.barcode))); preview(); };
  bc.oninput = preview;
  bc.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); beep(); $('#f-name', el).focus(); } };
  $('#f-gen', el).onclick = generate;
  $('#f-cam', el).onclick = () => openScanner(code => { bc.value = code; preview(); });
  $$('#code-mode button', el).forEach(b => b.onclick = () => {
    codeMode = b.dataset.m;
    $$('#code-mode button', el).forEach(x => x.classList.toggle('on', x === b));
    bc.disabled = codeMode === 'none';
    if (codeMode === 'auto' && !bc.value) generate();
    if (codeMode === 'none') { bc.value = ''; preview(); }
    if (codeMode === 'scan') bc.focus();
  });
  preview();

  const drawBatches = () => {
    $('#batches', el).innerHTML = d.batches.map((b, i) => `
      <div class="batch-row">
        <div><label>رقم الدفعة</label><input data-b="${i}" data-k="batchNo" value="${esc(b.batchNo)}" placeholder="اختياري"></div>
        <div><label>تاريخ الانتهاء</label><input type="date" data-b="${i}" data-k="expiry" value="${esc(b.expiry)}"></div>
        <div><label>الكمية</label><input data-b="${i}" data-k="qty" inputmode="numeric" value="${esc(b.qty)}"></div>
        <div><label>سعر الشراء</label><input data-b="${i}" data-k="cost" inputmode="decimal" value="${esc(b.cost)}" placeholder="اختياري"></div>
        <button class="btn icon danger" data-rm="${i}" title="حذف">${I.trash}</button>
      </div>`).join('') || '<div class="muted small center">لا توجد دفعات — أضف تاريخاً وكمية</div>';
    $$('[data-b]', el).forEach(inp => inp.oninput = () => { d.batches[inp.dataset.b][inp.dataset.k] = inp.value; });
    $$('[data-rm]', el).forEach(b => b.onclick = () => { d.batches.splice(b.dataset.rm, 1); drawBatches(); });
  };
  $('#add-batch', el).onclick = () => {
    d.batches.push({ id: DB.uid(), batchNo: '', expiry: '', qty: '', cost: '' }); drawBatches();
    const rows = $$('.batch-row', el); rows[rows.length - 1].querySelector('[data-k=expiry]').focus();
  };
  drawBatches();

  $('#f-img', el).onchange = async e => { const f = e.target.files[0]; if (f) { d.image = await compressImage(f); $('#f-img-thumb', el).innerHTML = `<img src="${esc(d.image)}" alt="">`; $('#f-img-label', el).textContent = 'تغيير الصورة'; toast('تم تحميل الصورة'); } };

  $('#save', el).onclick = () => {
    const name = $('#f-name', el).value.trim(), price = num($('#f-price', el).value);
    if (!name) return toast('اكتب اسم المنتج', true);
    if (!price) return toast('أدخل سعر البيع', true);
    const code = bc.value.trim();
    if (code && S().products.find(x => x.barcode === code && x.id !== d.id)) return toast('الباركود مستخدم لمنتج آخر', true);
    Object.assign(d, {
      name, price, barcode: code, sci: $('#f-sci', el).value.trim(), category: $('#f-cat', el).value, unit: $('#f-unit', el).value.trim(),
      cost: num($('#f-cost', el).value), minStock: Math.floor(num($('#f-min', el).value)), description: $('#f-desc', el).value.trim(),
      showInStore: $('#f-store', el).checked
    });
    d.batches = d.batches.filter(b => num(b.qty) > 0 || b.expiry || b.batchNo)
      .map(b => ({ ...b, qty: Math.floor(num(b.qty)), cost: b.cost === '' ? d.cost : num(b.cost) }));
    // دمج الدفعات ذات نفس التاريخ ورقم الدفعة
    const merged = [];
    for (const b of d.batches) {
      const ex = merged.find(x => x.expiry === b.expiry && x.batchNo === b.batchNo);
      ex ? ex.qty += b.qty : merged.push(b);
    }
    d.batches = merged;
    if (isNew) S().products.push(d);
    else Object.assign(findProduct(d.id), d);
    DB.save(); m.close(); toast(isNew ? 'تمت إضافة المنتج ✅' : 'تم حفظ التعديلات');
    if (current === 'products') drawProducts();
  };
}
function compressImage(file, max = 480) {
  return new Promise(res => {
    const img = new Image(), r = new FileReader();
    r.onload = () => { img.src = r.result; };
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', .8));
    };
    r.readAsDataURL(file);
  });
}
// استلام بضاعة سريع: امسح الكود ← إذا موجود أضف دفعة بتاريخ جديد، وإلا أنشئ منتج جديد
function quickReceive() {
  const m = modal(`${modalHead('استلام بضاعة بالباركود')}
    <p class="muted small">امسح الباركود: إذا كان المنتج مسجّلاً ستضيف له كمية بتاريخ صلاحية جديد، وإن لم يكن مسجّلاً سيفتح نموذج منتج جديد.</p>
    <div class="row" style="flex-wrap:nowrap"><div class="input-icon grow scan-box">${I.barcode}<input id="qr-code" placeholder="امسح أو اكتب الرمز ثم Enter" autofocus></div><button class="btn lg" id="qr-cam">${I.camera}</button></div>
    <div id="qr-body" style="margin-top:14px"></div>`, { size: 'sm' });
  const el = m.el;
  const handle = code => {
    code = code.trim(); if (!code) return;
    const p = findByCode(code);
    if (!p) { m.close(); toast('منتج جديد — أكمل بياناته'); return productForm(null, code); }
    beep();
    $('#qr-body', el).innerHTML = `<div class="list-item">${thumb(p)}<div class="grow"><b>${esc(p.name)}</b><div class="small muted">الكمية الحالية ${stockOf(p)}</div></div></div>
      <div class="grid g2" style="gap:10px;margin-top:10px">
        <div><label>تاريخ الانتهاء</label><input type="date" id="qr-exp"></div>
        <div><label>الكمية</label><input id="qr-qty" inputmode="numeric" value="1"></div>
        <div><label>رقم الدفعة</label><input id="qr-no" placeholder="اختياري"></div>
        <div><label>سعر الشراء</label><input id="qr-cost" inputmode="decimal" value="${p.cost || ''}"></div>
      </div>
      <button class="btn primary" style="width:100%;margin-top:14px" id="qr-save">${I.plus} إضافة للمخزون</button>`;
    $('#qr-exp', el).focus();
    $('#qr-save', el).onclick = () => {
      const qty = Math.floor(num($('#qr-qty', el).value)), expiry = $('#qr-exp', el).value, batchNo = $('#qr-no', el).value.trim();
      if (qty <= 0) return toast('أدخل الكمية', true);
      const ex = p.batches.find(b => b.expiry === expiry && (b.batchNo || '') === batchNo);
      ex ? ex.qty += qty : p.batches.push({ id: DB.uid(), expiry, qty, batchNo, cost: num($('#qr-cost', el).value) });
      DB.save(); toast(`تمت إضافة ${qty} إلى ${p.name}`);
      $('#qr-body', el).innerHTML = ''; $('#qr-code', el).value = ''; $('#qr-code', el).focus();
      if (current === 'products') drawProducts();
    };
  };
  $('#qr-code', el).onkeydown = e => { if (e.key === 'Enter') handle(e.target.value); };
  $('#qr-cam', el).onclick = () => openScanner(code => { $('#qr-code', el).value = code; handle(code); });
}
function printLabels(p) {
  if (!p.barcode) return toast('هذا المنتج بدون باركود — أضف أو ولّد رمزاً أولاً', true);
  const m = modal(`${modalHead('طباعة ملصقات الباركود')}
    <div class="center"><div class="barcode-box">${Barcode.svg(p.barcode)}</div><div style="margin-top:8px"><b>${esc(p.name)}</b> — ${money(p.price)}</div></div>
    <div class="row" style="margin-top:16px"><label class="grow" style="margin:0">عدد الملصقات</label><input id="n" style="width:100px" value="12" inputmode="numeric"></div>
    <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn primary" id="go">${I.print} طباعة</button></div>`, { size: 'sm' });
  $('#go', m.el).onclick = () => {
    const n = Math.min(200, Math.max(1, Math.floor(num($('#n', m.el).value))));
    $('#print-area').innerHTML = `<div class="labels-print" dir="rtl">${Array(n).fill(`<div class="label-item"><b>${esc(p.name)}</b>${Barcode.svg(p.barcode, { height: 40, module: 1.4 })}<div>${money(p.price)}</div></div>`).join('')}</div>`;
    m.close(); setTimeout(() => window.print(), 50);
  };
}

// ================= الجرد =================
let invTab = 'count', counts = {};
function renderInventory(v) {
  const tabs = [['count', 'جرد جديد'], ['expiry', 'تقرير الصلاحية'], ['value', 'قيمة المخزون'], ['history', 'سجل الجرد']];
  v.innerHTML = `<div class="card glass row between"><div class="seg" id="itabs">${tabs.map(([k, t]) => `<button data-t="${k}" class="${k === invTab ? 'on' : ''}">${t}</button>`).join('')}</div><div id="inv-actions" class="row"></div></div><div id="inv-body"></div>`;
  $$('#itabs button').forEach(b => b.onclick = () => { invTab = b.dataset.t; renderInventory(v); });
  ({ count: invCount, expiry: invExpiry, value: invValue, history: invHistory })[invTab]($('#inv-body'));
}
function invCount(body) {
  const rows = [];
  for (const p of S().products) for (const b of p.batches) rows.push({ p, b });
  $('#inv-actions').innerHTML = `<button class="btn ghost" id="inv-reset">${I.undo} مسح الإدخالات</button><button class="btn primary" id="inv-save">${I.check} اعتماد الجرد</button>`;
  body.innerHTML = `
  <div class="card glass">
    <div class="row"><div class="input-icon grow scan-box">${I.barcode}<input id="inv-scan" placeholder="امسح باركود المنتج للانتقال إليه وزيادة العدّ +1"></div><input id="inv-filter" class="grow" placeholder="تصفية بالاسم…"></div>
    <p class="small muted" style="margin-bottom:0">أدخل الكمية الفعلية الموجودة على الرف لكل دفعة. الحقول الفارغة لا تُغيَّر. عند الاعتماد تُحدَّث الكميات ويُحفظ سجل بالفروقات.</p>
  </div>
  <div class="card glass table-wrap"><table><thead><tr><th>المنتج</th><th>الدفعة</th><th>الانتهاء</th><th>بالنظام</th><th>الفعلي</th><th>الفرق</th></tr></thead><tbody>
  ${rows.map(({ p, b }) => { const e = expiryState(b.expiry); return `<tr data-row="${b.id}" data-name="${esc(p.name.toLowerCase())}" data-code="${esc(p.barcode)}">
    <td><div class="row" style="flex-wrap:nowrap">${thumb(p)}<b>${esc(p.name)}</b></div></td><td class="small">${esc(b.batchNo) || '—'}</td>
    <td><span class="badge ${e.cls}">${b.expiry ? fmtDate(b.expiry) : 'بدون'}</span></td><td><b>${b.qty}</b></td>
    <td><input style="width:90px" data-count="${b.id}" data-sys="${b.qty}" inputmode="numeric" value="${counts[b.id] ?? ''}"></td><td data-diff="${b.id}">—</td></tr>`; }).join('')}
  </tbody></table></div>`;
  const updDiff = inp => {
    const cell = $(`[data-diff="${inp.dataset.count}"]`), sys = +inp.dataset.sys;
    if (inp.value === '') { cell.innerHTML = '—'; delete counts[inp.dataset.count]; return; }
    counts[inp.dataset.count] = inp.value;
    const df = Math.floor(num(inp.value)) - sys;
    cell.innerHTML = `<span class="badge ${df === 0 ? 'ok' : df < 0 ? 'danger' : 'warn'}">${df > 0 ? '+' : ''}${df}</span>`;
  };
  $$('[data-count]').forEach(inp => { inp.oninput = () => updDiff(inp); updDiff(inp); });
  $('#inv-filter').oninput = e => { const q = e.target.value.toLowerCase(); $$('[data-row]').forEach(r => r.classList.toggle('hidden', !!q && !r.dataset.name.includes(q))); };
  $('#inv-scan').onkeydown = e => {
    if (e.key !== 'Enter') return;
    const code = e.target.value.trim(); e.target.value = '';
    const row = $$('[data-row]').find(r => r.dataset.code === code);
    if (!row) { beep(false); return toast('الرمز غير موجود', true); }
    beep();
    const inp = row.querySelector('[data-count]');
    inp.value = Math.floor(num(inp.value)) + 1; updDiff(inp);
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.style.background = 'var(--primary-soft)'; setTimeout(() => row.style.background = '', 900);
  };
  $('#inv-reset').onclick = () => { counts = {}; invCount(body); };
  $('#inv-save').onclick = () => {
    const ids = Object.keys(counts);
    if (!ids.length) return toast('لم تُدخل أي كمية', true);
    confirmBox(`سيتم تحديث كميات <b>${ids.length}</b> دفعة حسب العدّ الفعلي. متابعة؟`, () => {
      const lines = [];
      for (const p of S().products) for (const b of p.batches) if (ids.includes(b.id)) {
        const counted = Math.floor(num(counts[b.id]));
        lines.push({ productId: p.id, name: p.name, batchNo: b.batchNo, expiry: b.expiry, system: b.qty, counted, cost: b.cost ?? p.cost ?? 0 });
        b.qty = counted;
      }
      S().stocktakes.push({ id: DB.uid(), date: new Date().toISOString(), lines });
      counts = {}; DB.save(); toast('تم اعتماد الجرد ✅'); invTab = 'history'; renderInventory($('#view'));
    }, 'اعتماد', false);
  };
}
function invExpiry(body) {
  const rows = [];
  for (const p of S().products) for (const b of p.batches) if (b.qty > 0 && b.expiry) rows.push({ p, b, d: daysTo(b.expiry) });
  rows.sort((a, b) => a.d - b.d);
  $('#inv-actions').innerHTML = `<button class="btn ghost" id="pr-exp">${I.print} طباعة</button>`;
  const table = `<table><thead><tr><th>المنتج</th><th>الدفعة</th><th>تاريخ الانتهاء</th><th>المتبقي</th><th>الكمية</th><th></th></tr></thead><tbody>
    ${rows.map(({ p, b, d }) => `<tr><td><b>${esc(p.name)}</b></td><td>${esc(b.batchNo) || '—'}</td><td>${fmtDate(b.expiry)}</td>
      <td><span class="badge ${d < 0 ? 'danger' : d <= S().settings.expiryWarnDays ? 'warn' : 'ok'}">${d < 0 ? `منتهي منذ ${-d} يوم` : `${d} يوم`}</span></td><td>${b.qty}</td>
      <td>${d < 0 ? `<button class="btn sm danger" data-dispose="${p.id}|${b.id}">إتلاف</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
  body.innerHTML = `<div class="card glass table-wrap">${rows.length ? table : '<div class="empty">لا توجد دفعات بتواريخ صلاحية</div>'}</div>`;
  $$('[data-dispose]').forEach(btn => btn.onclick = () => {
    const [pid, bid] = btn.dataset.dispose.split('|'), p = findProduct(pid), b = p.batches.find(x => x.id === bid);
    confirmBox(`إتلاف ${b.qty} من ${esc(p.name)} (منتهي)؟ سيتم تسجيلها في سجل الجرد.`, () => {
      S().stocktakes.push({ id: DB.uid(), date: new Date().toISOString(), note: 'إتلاف منتهي الصلاحية', lines: [{ productId: p.id, name: p.name, batchNo: b.batchNo, expiry: b.expiry, system: b.qty, counted: 0, cost: b.cost ?? p.cost ?? 0 }] });
      b.qty = 0; DB.save(); invExpiry(body); toast('تم الإتلاف');
    }, 'إتلاف');
  });
  $('#pr-exp').onclick = () => { $('#print-area').innerHTML = `<div dir="rtl" style="font-family:Tahoma"><h2>تقرير الصلاحية — ${esc(S().settings.name)}</h2>${table}</div>`; setTimeout(() => window.print(), 50); };
}
function invValue(body) {
  let units = 0, costV = 0, saleV = 0;
  const rows = S().products.map(p => {
    const q = stockOf(p), c = p.batches.reduce((s, b) => s + b.qty * (b.cost || p.cost || 0), 0), sv = q * p.price;
    units += q; costV += c; saleV += sv;
    return { p, q, c, sv };
  }).sort((a, b) => b.sv - a.sv);
  body.innerHTML = `<div class="grid g3">${stat(I.box, units, 'إجمالي الوحدات')}${stat(I.money, money(costV), 'قيمة المخزون (شراء)')}${stat(I.money, money(saleV), 'قيمة المخزون (بيع)')}</div>
  <div class="card glass table-wrap"><table><thead><tr><th>المنتج</th><th>الكمية</th><th>قيمة الشراء</th><th>قيمة البيع</th><th>الربح المتوقع</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td><b>${esc(r.p.name)}</b></td><td>${r.q}</td><td>${money(r.c)}</td><td>${money(r.sv)}</td><td>${money(r.sv - r.c)}</td></tr>`).join('')}</tbody></table></div>`;
}
function invHistory(body) {
  const list = [...S().stocktakes].reverse();
  body.innerHTML = list.length ? list.map(st => {
    const loss = st.lines.reduce((s, l) => s + (l.counted - l.system) * (l.cost || 0), 0);
    return `<div class="card glass"><h3><span>${st.note ? esc(st.note) : 'جرد'} — ${fmtDT(st.date)}</span><span class="badge ${loss < 0 ? 'danger' : 'ok'}">${loss < 0 ? 'عجز' : 'فرق'} ${money(loss)}</span></h3>
    <div class="table-wrap"><table><thead><tr><th>المنتج</th><th>الدفعة</th><th>الانتهاء</th><th>بالنظام</th><th>الفعلي</th><th>الفرق</th></tr></thead><tbody>
    ${st.lines.map(l => { const df = l.counted - l.system; return `<tr><td>${esc(l.name)}</td><td>${esc(l.batchNo) || '—'}</td><td>${fmtDate(l.expiry)}</td><td>${l.system}</td><td>${l.counted}</td><td><span class="badge ${df === 0 ? 'ok' : df < 0 ? 'danger' : 'warn'}">${df > 0 ? '+' : ''}${df}</span></td></tr>`; }).join('')}
    </tbody></table></div></div>`;
  }).join('') : `<div class="card glass empty">${I.clip}<div>لا يوجد سجل جرد بعد</div></div>`;
}

// ================= المبيعات =================
let salesFrom = '', salesTo = '';
function renderSales(v) {
  const list = S().sales.filter(x => (!salesFrom || x.date.slice(0, 10) >= salesFrom) && (!salesTo || x.date.slice(0, 10) <= salesTo)).reverse();
  const total = list.reduce((t, x) => t + x.total, 0);
  const profit = list.reduce((t, x) => t + x.items.reduce((s, i) => s + (i.price - (i.cost || 0)) * i.qty, 0) - (x.discount || 0), 0);
  v.innerHTML = `
  <div class="card glass row"><label style="margin:0">من</label><input type="date" id="sf" value="${salesFrom}" style="width:auto"><label style="margin:0">إلى</label><input type="date" id="st" value="${salesTo}" style="width:auto">
    <button class="btn sm ghost" id="s-today">اليوم</button><button class="btn sm ghost" id="s-all">الكل</button></div>
  <div class="grid g3">${stat(I.receipt, list.length, 'عدد الفواتير')}${stat(I.money, money(total), 'إجمالي المبيعات')}${canManage() ? stat(I.money, money(profit), 'الربح التقديري') : stat(I.wallet, money(list.reduce((t, x) => t + (x.due || 0), 0)), 'منها آجل')}</div>
  <div class="card glass table-wrap">${list.length ? `<table><thead><tr><th>#</th><th>التاريخ</th><th>الأصناف</th><th>الزبون</th><th>الكاشير</th><th>الدفع</th><th>الإجمالي</th><th></th></tr></thead><tbody>
    ${list.map(x => `<tr><td><b>${x.no}</b></td><td>${fmtDT(x.date)}</td><td class="small">${x.items.map(i => `${esc(i.name)} ×${i.qty}`).join('، ')}</td><td class="small">${esc(x.customerName) || '—'}</td><td class="small">${esc(x.userName) || '—'}</td><td><span class="badge ${x.method === 'آجل' ? 'danger' : ''}">${esc(x.method)}</span>${x.due ? `<div class="small" style="color:var(--danger)">دين ${money(x.due)}</div>` : ''}</td><td><b>${money(x.total)}</b></td>
    <td><div class="row" style="flex-wrap:nowrap"><button class="btn sm icon" data-print="${x.id}">${I.print}</button>${canManage() ? `<button class="btn sm icon danger" data-ret="${x.id}" title="إرجاع الفاتورة">${I.undo}</button>` : ''}</div></td></tr>`).join('')}</tbody></table>` : '<div class="empty">لا توجد فواتير في هذه الفترة</div>'}</div>`;
  $('#sf').onchange = e => { salesFrom = e.target.value; renderSales(v); };
  $('#st').onchange = e => { salesTo = e.target.value; renderSales(v); };
  $('#s-today').onclick = () => { salesFrom = salesTo = today(); renderSales(v); };
  $('#s-all').onclick = () => { salesFrom = salesTo = ''; renderSales(v); };
  $$('[data-print]').forEach(b => b.onclick = () => printReceipt(S().sales.find(x => x.id === b.dataset.print)));
  $$('[data-ret]').forEach(b => b.onclick = () => {
    const sale = S().sales.find(x => x.id === b.dataset.ret);
    confirmBox(`إرجاع الفاتورة #${sale.no} وإعادة الكميات إلى المخزون؟`, () => {
      for (const it of sale.items) {
        const p = findProduct(it.productId); if (!p) continue;
        for (const u of it.batches || []) {
          const bt = p.batches.find(x => x.id === u.batchId);
          bt ? bt.qty += u.qty : p.batches.push({ id: u.batchId, expiry: u.expiry, qty: u.qty, batchNo: '', cost: it.cost });
        }
      }
      S().sales = S().sales.filter(x => x !== sale); DB.save(); renderSales(v); toast('تم إرجاع الفاتورة');
    }, 'إرجاع');
  });
}

// ================= المشتريات والموردين =================
let purTab = 'invoices', purSupplier = '';
const waLink = (phone, text) => { let d = String(phone || '').replace(/\D/g, ''); if (d.startsWith('00')) d = d.slice(2); else if (d.startsWith('0')) d = '964' + d.slice(1); return d ? `https://wa.me/${d}?text=${encodeURIComponent(text)}` : ''; };
const supplierName = id => S().suppliers.find(x => x.id === id)?.name || '—';

function renderPurchases(v) {
  $('#top-actions').innerHTML = `<button class="btn ghost" id="new-sup">${I.plus} مورد جديد</button><button class="btn primary" id="new-pur">${I.truck} فاتورة شراء</button>`;
  $('#new-sup').onclick = () => supplierForm(null, () => renderPurchases(v));
  $('#new-pur').onclick = () => purchaseForm(() => renderPurchases(v));
  const payable = S().suppliers.reduce((t, x) => t + Math.max(0, supplierBalance(x.id)), 0);
  const month = today().slice(0, 7);
  const monthTotal = S().purchases.filter(x => x.date.slice(0, 7) === month).reduce((t, x) => t + x.total, 0);
  v.innerHTML = `
  <div class="grid g3">${stat(I.wallet, money(payable), 'مستحقات للموردين')}${stat(I.truck, money(monthTotal), 'مشتريات هذا الشهر')}${stat(I.users, S().suppliers.length, 'عدد الموردين')}</div>
  <div class="card glass row between"><div class="seg" id="ptabs"><button data-t="invoices" class="${purTab === 'invoices' ? 'on' : ''}">فواتير الشراء</button><button data-t="suppliers" class="${purTab === 'suppliers' ? 'on' : ''}">الموردين</button></div>
    ${purTab === 'invoices' ? `<select id="psup" style="width:auto"><option value="">كل الموردين</option>${S().suppliers.map(x => `<option value="${x.id}" ${x.id === purSupplier ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>` : ''}</div>
  <div class="card glass table-wrap" id="pur-body"></div>`;
  $$('#ptabs button').forEach(b => b.onclick = () => { purTab = b.dataset.t; renderPurchases(v); });
  const ps = $('#psup'); ps && (ps.onchange = e => { purSupplier = e.target.value; renderPurchases(v); });
  const body = $('#pur-body');
  if (purTab === 'invoices') {
    const list = S().purchases.filter(x => !purSupplier || x.supplierId === purSupplier).slice().reverse();
    body.innerHTML = list.length ? `<table><thead><tr><th>#</th><th>التاريخ</th><th>المورد</th><th>رقم فاتورة المورد</th><th>الأصناف</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th></th></tr></thead><tbody>
      ${list.map(x => `<tr><td><b>${x.no}</b></td><td>${fmtDate(x.date)}</td><td>${esc(supplierName(x.supplierId))}</td><td>${esc(x.invoiceNo) || '—'}</td><td>${x.items.length}</td>
        <td><b>${money(x.total)}</b></td><td>${money(x.paid)}</td><td>${x.total - x.paid > 0 ? `<span class="badge danger">${money(x.total - x.paid)}</span>` : '<span class="badge ok">مسددة</span>'}</td>
        <td><div class="row" style="flex-wrap:nowrap"><button class="btn sm icon" data-view="${x.id}">${I.eye}</button><button class="btn sm icon danger" data-delp="${x.id}">${I.trash}</button></div></td></tr>`).join('')}</tbody></table>`
      : `<div class="empty">${I.truck}<div>لا توجد فواتير شراء<br><span class="small">أضف فاتورة شراء وستُضاف الكميات للمخزون تلقائياً</span></div></div>`;
    $$('[data-view]', body).forEach(b => b.onclick = () => viewPurchase(S().purchases.find(x => x.id === b.dataset.view)));
    $$('[data-delp]', body).forEach(b => b.onclick = () => {
      const pu = S().purchases.find(x => x.id === b.dataset.delp);
      confirmBox(`حذف فاتورة الشراء #${pu.no}؟ سيتم سحب كمياتها من المخزون (بقدر المتوفر).`, () => {
        for (const it of pu.items) {
          const p = findProduct(it.productId), bt = p?.batches.find(x => x.id === it.batchId);
          if (bt) bt.qty = Math.max(0, bt.qty - it.qty);
        }
        S().purchases = S().purchases.filter(x => x !== pu); DB.save(); toast('تم حذف الفاتورة'); renderPurchases(v);
      }, 'حذف');
    });
  } else {
    body.innerHTML = S().suppliers.length ? `<table><thead><tr><th>المورد</th><th>الهاتف</th><th>عدد الفواتير</th><th>إجمالي المشتريات</th><th>الرصيد المستحق</th><th></th></tr></thead><tbody>
      ${S().suppliers.map(x => { const pu = S().purchases.filter(p => p.supplierId === x.id), bal = supplierBalance(x.id); return `<tr>
        <td><b>${esc(x.name)}</b><div class="small muted">${esc(x.address)}</div></td><td style="direction:ltr;text-align:right">${esc(x.phone) || '—'}</td><td>${pu.length}</td><td>${money(pu.reduce((t, p) => t + p.total, 0))}</td>
        <td><span class="badge ${bal > 0 ? 'danger' : 'ok'}">${bal > 0 ? money(bal) : 'لا يوجد'}</span></td>
        <td><div class="row" style="flex-wrap:nowrap"><button class="btn sm" data-stmt="${x.id}">${I.receipt} كشف حساب</button><button class="btn sm icon" data-eds="${x.id}">${I.edit}</button><button class="btn sm icon danger" data-dels="${x.id}">${I.trash}</button></div></td></tr>`; }).join('')}</tbody></table>`
      : `<div class="empty">${I.users}<div>لا يوجد موردين بعد</div></div>`;
    $$('[data-stmt]', body).forEach(b => b.onclick = () => supplierStatement(S().suppliers.find(x => x.id === b.dataset.stmt), () => renderPurchases(v)));
    $$('[data-eds]', body).forEach(b => b.onclick = () => supplierForm(S().suppliers.find(x => x.id === b.dataset.eds), () => renderPurchases(v)));
    $$('[data-dels]', body).forEach(b => b.onclick = () => {
      const sp = S().suppliers.find(x => x.id === b.dataset.dels);
      if (S().purchases.some(p => p.supplierId === sp.id)) return toast('لا يمكن حذف مورد لديه فواتير', true);
      confirmBox(`حذف المورد ${esc(sp.name)}؟`, () => { S().suppliers = S().suppliers.filter(x => x !== sp); DB.save(); renderPurchases(v); }, 'حذف');
    });
  }
}
function supplierForm(sp, after) {
  const d = sp || { id: DB.uid(), name: '', phone: '', address: '', note: '' };
  const m = modal(`${modalHead(sp ? 'تعديل مورد' : 'مورد جديد')}
    <div class="field"><label>اسم المورد / الشركة *</label><input id="s-n" value="${esc(d.name)}" autofocus></div>
    <div class="field"><label>الهاتف</label><input id="s-p" value="${esc(d.phone)}" inputmode="tel"></div>
    <div class="field"><label>العنوان</label><input id="s-a" value="${esc(d.address)}"></div>
    <div class="field"><label>ملاحظات</label><textarea id="s-no">${esc(d.note)}</textarea></div>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>إلغاء</button><button class="btn primary" id="s-save">حفظ</button></div>`, { size: 'sm' });
  $('#s-save', m.el).onclick = () => {
    const name = $('#s-n', m.el).value.trim(); if (!name) return toast('اكتب اسم المورد', true);
    Object.assign(d, { name, phone: $('#s-p', m.el).value.trim(), address: $('#s-a', m.el).value.trim(), note: $('#s-no', m.el).value.trim() });
    if (!sp) S().suppliers.push(d);
    DB.save(); m.close(); toast('تم الحفظ'); after && after(d);
  };
}
function purchaseForm(after) {
  const lines = [];
  const m = modal(`${modalHead('فاتورة شراء جديدة')}
    <div class="grid g3" style="gap:0 12px">
      <div class="field"><label>المورد *</label><div class="row" style="flex-wrap:nowrap"><select id="pu-sup"><option value="">— اختر —</option>${S().suppliers.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select><button class="btn icon" id="pu-newsup" title="مورد جديد">${I.plus}</button></div></div>
      <div class="field"><label>رقم فاتورة المورد</label><input id="pu-inv"></div>
      <div class="field"><label>التاريخ</label><input type="date" id="pu-date" value="${today()}"></div>
    </div>
    <div class="field"><label>إضافة منتج (امسح الباركود أو ابحث بالاسم)</label>
      <div class="row" style="flex-wrap:nowrap"><div class="input-icon grow">${I.barcode}<input id="pu-q" placeholder="باركود أو اسم المنتج…" autocomplete="off"></div><button class="btn icon" id="pu-cam">${I.camera}</button></div>
      <div class="pick-list hidden" id="pu-pick"></div></div>
    <div class="table-wrap"><table><thead><tr><th>المنتج</th><th>رقم الدفعة</th><th>تاريخ الانتهاء</th><th>الكمية</th><th>سعر الشراء</th><th>المجموع</th><th></th></tr></thead><tbody id="pu-lines"></tbody></table></div>
    <div class="grid g2" style="margin-top:14px;align-items:end">
      <div class="field" style="margin:0"><label>المبلغ المدفوع للمورد الآن</label><input id="pu-paid" inputmode="decimal" placeholder="0 = آجل بالكامل"></div>
      <div class="totals"><div class="grand"><span>إجمالي الفاتورة</span><span id="pu-total">0</span></div><div class="small muted" id="pu-rem"></div></div>
    </div>
    <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn ghost" data-close>إلغاء</button><button class="btn primary" id="pu-save">${I.check} حفظ وإضافة للمخزون</button></div>`);
  const el = m.el;
  const total = () => lines.reduce((t, l) => t + num(l.qty) * num(l.cost), 0);
  const updTotals = () => {
    $('#pu-total', el).textContent = money(total());
    const paid = num($('#pu-paid', el).value), rem = total() - paid;
    $('#pu-rem', el).textContent = rem > 0 ? `يُسجَّل بذمة المورد: ${money(rem)}` : '';
  };
  const draw = () => {
    $('#pu-lines', el).innerHTML = lines.map((l, i) => { const p = findProduct(l.productId); return `<tr>
      <td><b>${esc(p.name)}</b></td>
      <td><input data-l="${i}" data-k="batchNo" value="${esc(l.batchNo)}" style="width:100px"></td>
      <td><input type="date" data-l="${i}" data-k="expiry" value="${esc(l.expiry)}" style="width:150px"></td>
      <td><input data-l="${i}" data-k="qty" value="${esc(l.qty)}" inputmode="numeric" style="width:80px"></td>
      <td><input data-l="${i}" data-k="cost" value="${esc(l.cost)}" inputmode="decimal" style="width:100px"></td>
      <td data-lt="${i}">${money(num(l.qty) * num(l.cost))}</td>
      <td><button class="btn sm icon danger" data-rml="${i}">${I.trash}</button></td></tr>`; }).join('') || `<tr><td colspan="7" class="muted center">لم تتم إضافة منتجات بعد</td></tr>`;
    $$('[data-l]', el).forEach(inp => inp.oninput = () => {
      const l = lines[inp.dataset.l]; l[inp.dataset.k] = inp.value;
      $(`[data-lt="${inp.dataset.l}"]`, el).textContent = money(num(l.qty) * num(l.cost)); updTotals();
    });
    $$('[data-rml]', el).forEach(b => b.onclick = () => { lines.splice(b.dataset.rml, 1); draw(); });
    updTotals();
  };
  const addLine = p => {
    lines.push({ productId: p.id, batchNo: '', expiry: '', qty: 1, cost: p.cost || '' });
    beep(); draw(); $('#pu-q', el).value = ''; $('#pu-pick', el).classList.add('hidden');
    const ex = $$('[data-k=expiry]', el); ex[ex.length - 1]?.focus();
  };
  const notFound = code => {
    beep(false);
    const t = document.createElement('div'); t.className = 'toast err';
    t.innerHTML = `الرمز غير مسجّل <button class="btn sm primary" style="margin-right:8px">تسجيل المنتج</button>`;
    t.querySelector('button').onclick = () => { t.remove(); productForm(null, code); };
    $('#toasts').appendChild(t); setTimeout(() => t.remove(), 5000);
  };
  const q = $('#pu-q', el), pick = $('#pu-pick', el);
  q.oninput = () => {
    const k = q.value.trim().toLowerCase();
    if (!k) return pick.classList.add('hidden');
    const r = S().products.filter(p => p.name.toLowerCase().includes(k) || (p.sci || '').toLowerCase().includes(k) || (p.barcode || '').includes(k)).slice(0, 8);
    pick.innerHTML = r.map(p => `<div data-pp="${p.id}">${esc(p.name)} <span class="small muted">${esc(p.barcode)}</span></div>`).join('') || '<div class="muted small">لا نتائج</div>';
    pick.classList.remove('hidden');
    $$('[data-pp]', pick).forEach(d => d.onclick = () => addLine(findProduct(d.dataset.pp)));
  };
  q.onkeydown = e => {
    if (e.key !== 'Enter') return; e.preventDefault();
    const code = q.value.trim(); if (!code) return;
    const p = findByCode(code);
    if (p) return addLine(p);
    const first = $('[data-pp]', pick);
    first ? addLine(findProduct(first.dataset.pp)) : notFound(code);
  };
  $('#pu-cam', el).onclick = () => openScanner(code => { const p = findByCode(code); p ? addLine(p) : notFound(code); });
  $('#pu-newsup', el).onclick = () => supplierForm(null, sp => {
    const sel = $('#pu-sup', el); sel.insertAdjacentHTML('beforeend', `<option value="${sp.id}">${esc(sp.name)}</option>`); sel.value = sp.id;
  });
  $('#pu-paid', el).oninput = updTotals;
  draw(); q.focus();
  $('#pu-save', el).onclick = () => {
    const supplierId = $('#pu-sup', el).value;
    if (!supplierId) return toast('اختر المورد', true);
    const valid = lines.filter(l => Math.floor(num(l.qty)) > 0);
    if (!valid.length) return toast('أضف منتجاً واحداً على الأقل بكمية', true);
    const items = valid.map(l => {
      const p = findProduct(l.productId), qty = Math.floor(num(l.qty)), cost = num(l.cost), batchNo = String(l.batchNo || '').trim();
      let bt = p.batches.find(b => b.expiry === l.expiry && (b.batchNo || '') === batchNo);
      if (bt) bt.qty += qty; else { bt = { id: DB.uid(), batchNo, expiry: l.expiry, qty, cost }; p.batches.push(bt); }
      if (cost) { bt.cost = cost; p.cost = cost; }
      return { productId: p.id, name: p.name, batchId: bt.id, batchNo, expiry: l.expiry, qty, cost };
    });
    const t = items.reduce((s, i) => s + i.qty * i.cost, 0);
    const pu = { id: DB.uid(), no: S().seq.purchase++, date: $('#pu-date', el).value || today(), supplierId, invoiceNo: $('#pu-inv', el).value.trim(),
      items, total: t, paid: Math.min(num($('#pu-paid', el).value), t), userName: me.name, createdAt: new Date().toISOString() };
    S().purchases.push(pu); DB.save(); m.close(); toast(`تم حفظ فاتورة الشراء وإضافة ${items.reduce((s, i) => s + i.qty, 0)} وحدة للمخزون ✅`);
    after && after();
  };
}
function viewPurchase(pu) {
  const html = `<div class="row between"><div><b>المورد:</b> ${esc(supplierName(pu.supplierId))}</div><div><b>التاريخ:</b> ${fmtDate(pu.date)}</div><div><b>رقم المورد:</b> ${esc(pu.invoiceNo) || '—'}</div></div>
    <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>المنتج</th><th>الدفعة</th><th>الانتهاء</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead><tbody>
    ${pu.items.map(i => `<tr><td>${esc(i.name)}</td><td>${esc(i.batchNo) || '—'}</td><td>${fmtDate(i.expiry)}</td><td>${i.qty}</td><td>${money(i.cost)}</td><td>${money(i.qty * i.cost)}</td></tr>`).join('')}</tbody></table></div>
    <div class="totals" style="margin-top:10px"><div><span>الإجمالي</span><b>${money(pu.total)}</b></div><div><span>المدفوع</span><b>${money(pu.paid)}</b></div><div><span>المتبقي</span><b>${money(pu.total - pu.paid)}</b></div></div>`;
  const m = modal(`${modalHead(`فاتورة شراء #${pu.no}`)}${html}<div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn primary" id="pp">${I.print} طباعة</button></div>`);
  $('#pp', m.el).onclick = () => printDoc(`فاتورة شراء #${pu.no}`, html);
}
function printDoc(title, html) {
  $('#print-area').innerHTML = `<div dir="rtl" style="font-family:Tahoma,sans-serif;color:#000"><h2 style="margin:0">${esc(S().settings.name)}</h2><h3>${title}</h3><div class="small">${fmtDT(new Date())}</div><hr>${html}</div>`;
  setTimeout(() => window.print(), 50);
}
// كشف حساب عام (للزبون أو المورد)
function statementModal({ title, party, entries, balance, dueLabel, payLabel, onPay, extra = '' }) {
  entries.sort((a, b) => a.date.localeCompare(b.date));
  let run = 0;
  const rows = entries.map(e => { run += e.debit - e.credit; return `<tr><td>${fmtDate(e.date)}</td><td>${e.desc}</td><td>${e.debit ? money(e.debit) : ''}</td><td>${e.credit ? money(e.credit) : ''}</td><td><b>${money(run)}</b></td></tr>`; }).join('');
  const table = `<table><thead><tr><th>التاريخ</th><th>البيان</th><th>عليه</th><th>دفع</th><th>الرصيد</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="muted center">لا توجد حركات</td></tr>'}</tbody></table>`;
  const m = modal(`${modalHead(title)}
    <div class="row between"><div><b style="font-size:18px">${esc(party.name)}</b><div class="small muted" style="direction:ltr;text-align:right">${esc(party.phone)}</div></div>
      <div style="text-align:left"><div class="small muted">${dueLabel}</div><div class="balance ${balance > 0 ? 'due' : 'clear'}">${money(balance)}</div></div></div>
    ${onPay ? `<div class="card" style="background:var(--primary-soft);border-radius:16px;margin:14px 0;padding:14px"><b>${payLabel}</b>
      <div class="row" style="margin-top:8px;flex-wrap:nowrap"><input id="pay-amt" inputmode="decimal" placeholder="المبلغ" value="${balance > 0 ? balance : ''}"><input id="pay-note" placeholder="ملاحظة (اختياري)"><button class="btn primary" id="pay-go">${I.check} تسجيل</button></div></div>` : ''}
    <div class="table-wrap" style="max-height:340px">${table}</div>
    <div class="row" style="justify-content:flex-end;margin-top:14px">${extra}<button class="btn" id="st-print">${I.print} طباعة الكشف</button></div>`);
  $('#st-print', m.el).onclick = () => printDoc(`${title} — ${esc(party.name)}`, `${table}<h3>${dueLabel}: ${money(balance)}</h3>`);
  if (onPay) $('#pay-go', m.el).onclick = () => {
    const amt = num($('#pay-amt', m.el).value); if (amt <= 0) return toast('أدخل المبلغ', true);
    onPay(amt, $('#pay-note', m.el).value.trim()); m.close();
  };
  return m;
}
function supplierStatement(sp, after) {
  const entries = [
    ...S().purchases.filter(p => p.supplierId === sp.id).flatMap(p => [
      { date: p.date, desc: `فاتورة شراء #${p.no}${p.invoiceNo ? ` (${esc(p.invoiceNo)})` : ''}`, debit: p.total, credit: 0 },
      ...(p.paid ? [{ date: p.date, desc: `مدفوع مع الفاتورة #${p.no}`, debit: 0, credit: p.paid }] : [])
    ]),
    ...S().supplierPayments.filter(p => p.supplierId === sp.id).map(p => ({ date: p.date, desc: `دفعة للمورد${p.note ? ' — ' + esc(p.note) : ''}`, debit: 0, credit: p.amount }))
  ];
  statementModal({ title: 'كشف حساب مورد', party: sp, entries, balance: supplierBalance(sp.id), dueLabel: 'المستحق للمورد', payLabel: 'تسجيل دفعة للمورد',
    onPay: (amount, note) => { S().supplierPayments.push({ id: DB.uid(), supplierId: sp.id, date: new Date().toISOString(), amount, note, userName: me.name }); DB.save(); toast('تم تسجيل الدفعة'); after && after(); supplierStatement(sp, after); } });
}

// ================= الزبائن والديون =================
let custQuery = '', custDebtOnly = false;
function renderCustomers(v) {
  $('#top-actions').innerHTML = `<button class="btn primary" id="new-cust">${I.plus} زبون جديد</button>`;
  $('#new-cust').onclick = () => customerForm(null, () => renderCustomers(v));
  const debtors = S().customers.filter(c => customerBalance(c.id) > 0);
  const totalDebt = debtors.reduce((t, c) => t + customerBalance(c.id), 0);
  const todayPay = S().customerPayments.filter(p => p.date.slice(0, 10) === today()).reduce((t, p) => t + p.amount, 0);
  v.innerHTML = `
  <div class="grid g3">${stat(I.wallet, money(totalDebt), 'إجمالي الديون على الزبائن')}${stat(I.users, debtors.length, 'زبائن عليهم ديون')}${stat(I.money, money(todayPay), 'تسديدات اليوم')}</div>
  <div class="card glass row"><div class="input-icon grow">${I.search}<input id="cq2" placeholder="بحث بالاسم أو الهاتف…" value="${esc(custQuery)}"></div>
    <div class="seg" id="cf"><button data-f="0" class="${custDebtOnly ? '' : 'on'}">الكل</button><button data-f="1" class="${custDebtOnly ? 'on' : ''}">المدينين فقط</button></div></div>
  <div class="card glass table-wrap" id="cust-body"></div>`;
  const draw = () => {
    const q = custQuery.trim().toLowerCase();
    const list = S().customers.map(c => ({ c, bal: customerBalance(c.id) }))
      .filter(({ c, bal }) => (!q || c.name.toLowerCase().includes(q) || (c.phone || '').includes(q)) && (!custDebtOnly || bal > 0))
      .sort((a, b) => b.bal - a.bal);
    $('#cust-body').innerHTML = list.length ? `<table><thead><tr><th>الزبون</th><th>الهاتف</th><th>عدد الفواتير</th><th>آخر شراء</th><th>الرصيد (الدين)</th><th></th></tr></thead><tbody>
      ${list.map(({ c, bal }) => { const sales = S().sales.filter(x => x.customerId === c.id); const last = sales[sales.length - 1]; return `<tr>
        <td><div class="row" style="flex-wrap:nowrap"><div class="thumb">${esc(c.name[0])}</div><div><b>${esc(c.name)}</b><div class="small muted">${esc(c.note)}</div></div></div></td>
        <td style="direction:ltr;text-align:right">${esc(c.phone) || '—'}</td><td>${sales.length}</td><td>${last ? fmtDate(last.date) : '—'}</td>
        <td><span class="badge ${bal > 0 ? 'danger' : 'ok'}">${bal > 0 ? money(bal) : 'لا يوجد'}</span></td>
        <td><div class="row" style="flex-wrap:nowrap"><button class="btn sm ${bal > 0 ? 'primary' : ''}" data-cst="${c.id}">${I.wallet} ${bal > 0 ? 'تسديد / كشف' : 'كشف حساب'}</button>
          <button class="btn sm icon" data-edc="${c.id}">${I.edit}</button>${canManage() ? `<button class="btn sm icon danger" data-delc="${c.id}">${I.trash}</button>` : ''}</div></td></tr>`; }).join('')}</tbody></table>`
      : `<div class="empty">${I.users}<div>لا يوجد زبائن${custDebtOnly ? ' عليهم ديون 🎉' : ''}<br><span class="small">يمكنك إضافة زبون من هنا أو من الكاشير عند البيع بالآجل</span></div></div>`;
    $$('[data-cst]').forEach(b => b.onclick = () => customerStatement(S().customers.find(c => c.id === b.dataset.cst), () => renderCustomers(v)));
    $$('[data-edc]').forEach(b => b.onclick = () => customerForm(S().customers.find(c => c.id === b.dataset.edc), () => renderCustomers(v)));
    $$('[data-delc]').forEach(b => b.onclick = () => {
      const c = S().customers.find(x => x.id === b.dataset.delc);
      if (customerBalance(c.id) > 0) return toast('لا يمكن حذف زبون عليه دين', true);
      confirmBox(`حذف الزبون ${esc(c.name)}؟`, () => { S().customers = S().customers.filter(x => x !== c); DB.save(); renderCustomers(v); }, 'حذف');
    });
  };
  $('#cq2').oninput = e => { custQuery = e.target.value; draw(); };
  $$('#cf button').forEach(b => b.onclick = () => { custDebtOnly = b.dataset.f === '1'; renderCustomers(v); });
  draw();
}
function customerForm(c, after) {
  const d = c || { id: DB.uid(), name: '', phone: '', note: '', createdAt: new Date().toISOString() };
  const m = modal(`${modalHead(c ? 'تعديل زبون' : 'زبون جديد')}
    <div class="field"><label>الاسم *</label><input id="c-n" value="${esc(d.name)}" autofocus></div>
    <div class="field"><label>الهاتف</label><input id="c-p" value="${esc(d.phone)}" inputmode="tel" placeholder="07XXXXXXXXX"></div>
    <div class="field"><label>ملاحظات</label><input id="c-no" value="${esc(d.note)}"></div>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>إلغاء</button><button class="btn primary" id="c-save">حفظ</button></div>`, { size: 'sm' });
  $('#c-save', m.el).onclick = () => {
    const name = $('#c-n', m.el).value.trim(); if (!name) return toast('اكتب الاسم', true);
    Object.assign(d, { name, phone: $('#c-p', m.el).value.trim(), note: $('#c-no', m.el).value.trim() });
    if (!c) S().customers.push(d);
    DB.save(); m.close(); toast('تم الحفظ'); after && after(d);
  };
}
function customerStatement(c, after) {
  const bal = customerBalance(c.id);
  const entries = [
    ...S().sales.filter(x => x.customerId === c.id && x.due).map(x => ({ date: x.date, desc: `فاتورة #${x.no} (${x.items.map(i => esc(i.name)).join('، ')})`, debit: x.due, credit: 0 })),
    ...S().customerPayments.filter(p => p.customerId === c.id).map(p => ({ date: p.date, desc: `تسديد${p.note ? ' — ' + esc(p.note) : ''}${p.userName ? ` (${esc(p.userName)})` : ''}`, debit: 0, credit: p.amount }))
  ];
  const wa = bal > 0 && c.phone ? waLink(c.phone, `مرحباً ${c.name}، نود تذكيركم بأن الرصيد المتبقي لدى ${S().settings.name} هو ${money(bal)}. شكراً لكم 💜`) : '';
  statementModal({ title: 'كشف حساب زبون', party: c, entries, balance: bal, dueLabel: 'الدين المتبقي', payLabel: 'تسجيل تسديد من الزبون',
    extra: wa ? `<a class="btn" target="_blank" href="${wa}">تذكير واتساب</a>` : '',
    onPay: (amount, note) => {
      const pay = { id: DB.uid(), customerId: c.id, date: new Date().toISOString(), amount, note, userName: me.name };
      S().customerPayments.push(pay); DB.save(); toast(`تم تسجيل تسديد ${money(amount)}`);
      after && after(); customerStatement(c, after);
    } });
}

// ================= المستخدمين =================
function renderUsers(v) {
  $('#top-actions').innerHTML = `<button class="btn ghost" id="my-pass">${I.lock} تغيير كلمة مروري</button><button class="btn primary" id="new-user">${I.plus} مستخدم جديد</button>`;
  $('#my-pass').onclick = () => changePassword();
  $('#new-user').onclick = () => userForm(null, () => renderUsers(v));
  v.innerHTML = `
  <div class="card glass table-wrap"><table><thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الصلاحية</th><th>عدد المبيعات</th><th>الحالة</th><th></th></tr></thead><tbody>
    ${S().users.map(u => `<tr><td><div class="row" style="flex-wrap:nowrap"><div class="thumb">${esc(u.name[0])}</div><b>${esc(u.name)}</b>${u.id === me.id ? ' <span class="badge">أنت</span>' : ''}</div></td>
      <td style="font-family:monospace">${esc(u.username)}</td><td><span class="badge">${ROLES[u.role]?.t}</span></td><td>${S().sales.filter(x => x.userId === u.id).length}</td>
      <td><span class="badge ${u.active !== false ? 'ok' : 'danger'}">${u.active !== false ? 'فعّال' : 'موقوف'}</span></td>
      <td><div class="row" style="flex-wrap:nowrap"><button class="btn sm icon" data-edu="${u.id}">${I.edit}</button>${u.id !== me.id ? `<button class="btn sm icon danger" data-delu="${u.id}">${I.trash}</button>` : ''}</div></td></tr>`).join('')}
  </tbody></table></div>
  <div class="grid g3">
    ${Object.entries(ROLES).map(([k, r]) => `<div class="card glass"><h3>${r.t}</h3><div class="row">${(r.routes === '*' ? Object.keys(ROUTES) : r.routes).map(x => `<span class="badge">${ROUTES[x].t}</span>`).join('')}</div>
      ${k === 'cashier' ? '<p class="small muted" style="margin-bottom:0">لا يستطيع حذف الزبائن أو إرجاع الفواتير ولا يرى الأرباح.</p>' : ''}</div>`).join('')}
  </div>`;
  $$('[data-edu]').forEach(b => b.onclick = () => userForm(S().users.find(u => u.id === b.dataset.edu), () => renderUsers(v)));
  $$('[data-delu]').forEach(b => b.onclick = () => {
    const u = S().users.find(x => x.id === b.dataset.delu);
    confirmBox(`حذف المستخدم ${esc(u.name)}؟ (تبقى مبيعاته مسجّلة باسمه)`, async () => {
      try {
        if (DB.online) S().users = (await DB.api('/api/users/' + encodeURIComponent(u.id), { method: 'DELETE' })).users;
        else { S().users = S().users.filter(x => x !== u); DB.save(); }
        renderUsers(v);
      } catch (e) { toast(e.message, true); }
    }, 'حذف');
  });
}
function userForm(u, after) {
  const isNew = !u;
  const m = modal(`${modalHead(isNew ? 'مستخدم جديد' : 'تعديل مستخدم')}
    <div class="field"><label>الاسم *</label><input id="u-n" value="${esc(u?.name)}"></div>
    <div class="field"><label>اسم المستخدم (للدخول) *</label><input id="u-u" value="${esc(u?.username)}" style="direction:ltr" autocomplete="off" autocapitalize="none" spellcheck="false"></div>
    <div class="field"><label>الصلاحية</label><select id="u-r" ${u?.id === me.id ? 'disabled' : ''}>${Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${(u?.role || 'cashier') === k ? 'selected' : ''}>${r.t}</option>`).join('')}</select></div>
    <div class="field"><label>${isNew ? 'كلمة المرور * (6 أحرف على الأقل)' : 'كلمة مرور جديدة (اتركها فارغة لعدم التغيير)'}</label><input id="u-p" type="password" autocomplete="new-password"></div>
    ${u && u.id !== me.id ? `<label class="row" style="color:var(--text)"><input type="checkbox" id="u-a" style="width:auto" ${u.active !== false ? 'checked' : ''}> الحساب فعّال</label>` : ''}
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-close>إلغاء</button><button class="btn primary" id="u-save">حفظ</button></div>`, { size: 'sm' });
  $('#u-save', m.el).onclick = async () => {
    const name = $('#u-n', m.el).value.trim(), username = $('#u-u', m.el).value.trim().toLowerCase(), pass = $('#u-p', m.el).value;
    const role = $('#u-r', m.el).value, active = $('#u-a', m.el) ? $('#u-a', m.el).checked : true;
    if (!name || !username) return toast('أكمل الاسم واسم المستخدم', true);
    if (!/^[a-z0-9._-]{2,40}$/.test(username)) return toast('اسم المستخدم: أحرف إنجليزية وأرقام فقط', true);
    if ((isNew || pass) && pass.length < 6) return toast('كلمة المرور 6 أحرف على الأقل', true);
    try {
      if (DB.online) {
        const r = await DB.api('/api/users', { method: 'POST', body: { id: u?.id, name, username, role, active, password: pass } });
        S().users = r.users;
        me = S().users.find(x => x.id === me.id) || me;
      } else {
        if (S().users.some(x => x.username === username && x !== u)) throw new Error('اسم المستخدم مستخدم مسبقاً');
        if (!isNew && !pass && u.username !== username) throw new Error('عند تغيير اسم المستخدم أدخل كلمة مرور جديدة');
        const d = u || { id: DB.uid(), active: true };
        Object.assign(d, { name, username, role: u?.id === me.id ? u.role : role, active: u?.id === me.id ? true : active });
        if (pass) { d.pass = hashPass(username, pass); delete d.mustChange; }
        if (isNew) S().users.push(d);
        DB.save();
      }
      m.close(); toast('تم الحفظ'); renderNav(); after && after();
    } catch (e) { toast(e.message, true); }
  };
}

// ================= موقع العرض =================
function renderStoreLink(v) {
  const url = location.origin + '/';
  const shown = S().products.filter(p => p.showInStore !== false).length;
  v.innerHTML = `
  <div class="card glass">
    <h3>موقع عرض المنتجات للزبائن</h3>
    <p class="muted">صفحة عامة أنيقة تعرض منتجات الصيدلية وأسعارها وحالة التوفر، مع زر طلب عبر واتساب. لا تظهر فيها أسعار الشراء أو المبيعات.</p>
    <div class="row"><input readonly value="${url}" id="surl" class="grow" style="direction:ltr"><button class="btn" id="copy">نسخ الرابط</button><a class="btn primary" href="/" target="_blank">${I.eye} فتح الموقع</a></div>
    <p class="small muted">${shown} منتج معروض حالياً. يمكنك إخفاء أي منتج من نموذج التعديل. عدّل رقم الواتساب ورسالة الترحيب من الإعدادات.</p>
  </div>
  <div class="card glass" style="padding:0;overflow:hidden;height:70vh"><iframe src="/" style="width:100%;height:100%;border:0"></iframe></div>`;
  $('#copy').onclick = () => { navigator.clipboard?.writeText(url); toast('تم نسخ الرابط'); };
}

// ================= الإعدادات =================
const THEMES = [
  ['violet', 'بنفسجي أيار', 'linear-gradient(135deg,#7c3aed,#c4b5fd,#fff)'],
  ['lavender', 'لافندر', 'linear-gradient(135deg,#a78bfa,#ede9fe,#fff)'],
  ['royal', 'أرجواني ملكي', 'linear-gradient(135deg,#4c1d95,#7c3aed,#ddd6fe)'],
  ['orchid', 'أوركيد', 'linear-gradient(135deg,#a21caf,#f0abfc,#fff)'],
  ['mono', 'أبيض نقي', 'linear-gradient(135deg,#fff,#f5f3ff,#7c3aed)'],
  ['dark', 'ليلي', 'linear-gradient(135deg,#0f0a1f,#4c1d95,#a78bfa)']
];
function renderSettings(v) {
  const s = S().settings;
  v.innerHTML = `
  <div class="card glass"><h3>الثيمات</h3><div class="themes">${THEMES.map(([k, t, g]) => `<div class="theme-opt glass ${s.theme === k ? 'on' : ''}" data-theme-k="${k}"><div class="sw" style="background:${g}"></div>${t}</div>`).join('')}</div></div>
  <div class="grid g2">
    <div class="card glass"><h3>معلومات الصيدلية</h3>
      <div class="field"><label>اسم الصيدلية</label><input data-s="name" value="${esc(s.name)}"></div>
      <div class="field"><label>رقم الهاتف</label><input data-s="phone" value="${esc(s.phone)}"></div>
      <div class="field"><label>رقم واتساب للطلبات (بالصيغة الدولية مثل 9647701234567)</label><input data-s="whatsapp" value="${esc(s.whatsapp)}" style="direction:ltr"></div>
      <div class="field"><label>العنوان</label><input data-s="address" value="${esc(s.address)}"></div>
      <div class="field"><label>رسالة الترحيب في موقع العرض</label><input data-s="storeNote" value="${esc(s.storeNote)}"></div>
      <div class="field"><label>تذييل الفاتورة</label><input data-s="receiptFooter" value="${esc(s.receiptFooter)}"></div>
    </div>
    <div class="content">
      <div class="card glass"><h3>إعدادات عامة</h3>
        <div class="field"><label>العملة</label><input data-s="currency" value="${esc(s.currency)}"></div>
        <div class="field"><label>التنبيه قبل انتهاء الصلاحية (أيام)</label><input data-s="expiryWarnDays" data-n="1" value="${s.expiryWarnDays}" inputmode="numeric"></div>
        <div class="field"><label>الحد الأدنى الافتراضي للمخزون</label><input data-s="lowStock" data-n="1" value="${s.lowStock}" inputmode="numeric"></div>
      </div>
      <div class="card glass"><h3>الأصناف</h3>
        <div class="row" id="cats">${S().categories.map((c, i) => `<span class="badge" style="padding:6px 10px">${esc(c)} <a href="#" data-rmcat="${i}" style="color:inherit;text-decoration:none">✕</a></span>`).join('')}</div>
        <div class="row" style="margin-top:10px;flex-wrap:nowrap"><input id="newcat" placeholder="صنف جديد"><button class="btn" id="addcat">${I.plus}</button></div>
      </div>
      <div class="card glass"><h3>النسخ الاحتياطي</h3>
        <div class="row"><button class="btn" id="exp">${I.download} تصدير نسخة</button><label class="btn" style="margin:0;color:var(--primary)">${I.upload} استيراد<input type="file" id="imp" accept=".json" hidden></label><button class="btn danger" id="reset">${I.trash} تصفير</button></div>
        <p class="small muted" style="margin-bottom:0">${DB.online ? '✅ البيانات محفوظة على الخادم.' : '⚠ البيانات محفوظة في هذا المتصفح فقط — شغّل الخادم (npm start) للحفظ المركزي.'}</p>
      </div>
    </div>
  </div>`;
  $$('[data-theme-k]').forEach(el => el.onclick = () => { s.theme = el.dataset.themeK; DB.save(); applyTheme(); renderSettings(v); });
  $$('[data-s]').forEach(inp => inp.onchange = () => { s[inp.dataset.s] = inp.dataset.n ? Math.floor(num(inp.value)) : inp.value.trim(); DB.save(); applyTheme(); toast('تم الحفظ'); });
  $('#addcat').onclick = () => { const c = $('#newcat').value.trim(); if (c && !S().categories.includes(c)) { S().categories.push(c); DB.save(); renderSettings(v); } };
  $$('[data-rmcat]').forEach(a => a.onclick = e => { e.preventDefault(); S().categories.splice(+a.dataset.rmcat, 1); DB.save(); renderSettings(v); });
  $('#exp').onclick = () => {
    const blob = new Blob([JSON.stringify(S(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `ayar-backup-${today()}.json`; a.click();
  };
  $('#imp').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); if (!d.settings || !d.products) throw 0; DB.replace(d); DB.flush().then(() => { toast('تم الاستيراد'); setTimeout(() => location.reload(), 600); }); } catch { toast('ملف غير صالح', true); } };
    r.readAsText(f);
  };
  $('#reset').onclick = () => confirmBox('سيتم حذف <b>جميع</b> البيانات (المنتجات، المبيعات، الجرد، الموردين والزبائن). حسابات المستخدمين تبقى كما هي. هل أنت متأكد؟', async () => { DB.reset(); await DB.flush(); toast('تم التصفير'); setTimeout(() => location.reload(), 600); }, 'حذف الكل');
}

// ================= تشغيل =================
(async () => {
  DB.onAuthLost = () => { if (me) { me = null; toast('انتهت الجلسة — سجّل الدخول مجدداً', true); showLogin(); } };
  DB.onSaveError = msg => toast(msg, true);
  // تحديث الشاشة عند وصول تغييرات من جهاز آخر (بدون مقاطعة المستخدم أثناء الكتابة أو داخل نافذة)
  let remoteTimer = null;
  DB.onRemoteChange = () => {
    clearTimeout(remoteTimer);
    remoteTimer = setTimeout(function refresh() {
      if (!me) return;
      const busy = $('#modal-root').children.length || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.body.classList.contains('cart-open');
      if (busy) { remoteTimer = setTimeout(refresh, 3000); return; }
      me = S().users.find(u => u.id === me.id) || me;
      applyTheme();
      if (!can(current)) return go();
      const y = window.scrollY;
      $('#top-actions').innerHTML = ''; renderNav(); ROUTES[current].r($('#view'));
      window.scrollTo(0, y);
    }, 400);
  };
  DB.onStatus = st => {
    const el = $('#sync-status'); if (!el) return;
    el.textContent = !st.online ? '● وضع محلي' : st.offline ? `● غير متصل${st.pending ? ` — ${st.pending} بانتظار الحفظ` : ''}` : st.saving || st.pending ? '● جاري الحفظ…' : '● محفوظ على السحابة';
    el.style.color = st.offline ? 'var(--danger)' : '';
  };
  $('#menu-btn').innerHTML = I.menu;
  $('#menu-btn').onclick = () => setNav(true);
  $('#scrim').onclick = () => { setNav(false); setCart(false); };
  window.addEventListener('hashchange', () => me && go());
  const ping = await DB.detect();
  const ss = $('#sync-status');
  ss.innerHTML = `<i class="dot"></i>${DB.online ? 'متصل بالخادم' : 'وضع محلي (غير متصل)'}`;
  ss.classList.toggle('offline', !DB.online);
  if (DB.online) {
    pharmacyName = ping.name || pharmacyName; firstRun = !!ping.firstRun;
    const u = await DB.me();
    return u ? startSession(u) : showLogin();
  }
  // وضع محلي (فتح الملف مباشرة بدون خادم)
  await DB.load();
  if (!S().users.length) {
    S().users.push({ id: DB.uid(), name: 'المدير', username: 'admin', pass: hashPass('admin', '1234'), role: 'admin', mustChange: true, active: true });
    DB.save();
  }
  pharmacyName = S().settings.name; firstRun = S().users.some(u => u.mustChange);
  applyTheme();
  const local = S().users.find(u => u.id === sessionStorage.getItem('ayar-user') && u.active !== false);
  local ? startSession(local) : showLogin();
})();
})();
