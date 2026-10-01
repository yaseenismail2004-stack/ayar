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
  undo: ic('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>')
};

// ---------- أدوات ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = () => DB.s;
const today = () => new Date().toISOString().slice(0, 10);
const num = v => { const n = parseFloat(String(v).replace(/,/g, '')); return isNaN(n) ? 0 : n; };
const money = v => `${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${S().settings.currency}`;
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
const thumb = (p, cls = 'thumb') => p.image ? `<img class="${cls}" src="${p.image}" alt="">` : `<div class="${cls}">${esc((p.name || '؟')[0])}</div>`;

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
  first && setTimeout(() => first.focus(), 50);
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
  sales: { t: 'المبيعات', i: I.receipt, r: renderSales },
  store: { t: 'موقع العرض', i: I.store, r: renderStoreLink },
  settings: { t: 'الإعدادات والثيمات', i: I.gear, r: renderSettings }
};
let current = 'dashboard';

function applyTheme() {
  document.documentElement.dataset.theme = S().settings.theme;
  $('#brand-name').textContent = S().settings.name || 'أيار';
  document.title = `${S().settings.name} — إدارة الصيدلية`;
}
function renderNav() {
  $('#nav').innerHTML = Object.entries(ROUTES).map(([k, v]) =>
    `<a href="#${k}" class="${k === current ? 'active' : ''}">${v.i}<span>${v.t}</span></a>`).join('');
}
function go() {
  current = (location.hash.slice(1) || 'dashboard');
  if (!ROUTES[current]) current = 'dashboard';
  renderNav();
  $('#page-title').textContent = ROUTES[current].t;
  $('#page-sub').textContent = new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  $('#top-actions').innerHTML = '';
  $('#sidebar').classList.remove('open');
  ROUTES[current].r($('#view'));
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
let cart = [], posCat = 'الكل', posQuery = '', discount = 0;
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
        <div class="row" style="margin-top:12px">${cats.map(c => `<button class="btn sm ${c === posCat ? 'primary' : 'ghost'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      </div>
      <div class="pos-products" id="pos-grid"></div>
    </div>
    <div class="cart glass" id="cart"></div>
  </div>`;
  const scan = $('#scan');
  scan.value = posQuery;
  scan.focus();
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
    <h3 style="margin:0" class="row between"><span>السلة</span>${cart.length ? `<button class="btn sm danger" id="clear">${I.trash} تفريغ</button>` : ''}</h3>
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
    <div class="row"><input id="paid" class="grow" inputmode="decimal" placeholder="المبلغ المستلم"><div class="seg" id="method"><button class="on" data-m="نقد">نقد</button><button data-m="بطاقة">بطاقة</button></div></div>
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
  const clr = $('#clear', el); clr && (clr.onclick = () => { cart = []; discount = 0; drawCart(); });
  $('#disc', el).onchange = e => { discount = num(e.target.value); drawCart(); };
  let method = 'نقد';
  $$('#method button', el).forEach(b => b.onclick = () => { method = b.dataset.m; $$('#method button', el).forEach(x => x.classList.toggle('on', x === b)); });
  $('#paid', el).oninput = e => { const c = num(e.target.value) - total; $('#change').textContent = e.target.value ? (c >= 0 ? `الباقي للزبون: ${money(c)}` : `ناقص: ${money(-c)}`) : ''; };
  $('#checkout', el).onclick = () => checkout(method, num($('#paid', el).value) || total);
}
function checkout(method, paid) {
  if (!cart.length) return;
  const s = S();
  const items = [];
  for (const l of cart) {
    const p = findProduct(l.id);
    if (l.qty > sellableQty(p)) return toast(`الكمية غير متوفرة: ${p.name}`, true);
    let need = l.qty; const used = [];
    // صرف من الأقرب انتهاءً أولاً (FEFO)
    for (const b of sellableBatches(p)) {
      if (!need) break;
      const take = Math.min(b.qty, need);
      b.qty -= take; need -= take;
      used.push({ batchId: b.id, qty: take, expiry: b.expiry });
    }
    items.push({ productId: p.id, name: p.name, qty: l.qty, price: l.price, cost: p.cost || 0, batches: used });
  }
  const subtotal = items.reduce((t, i) => t + i.qty * i.price, 0);
  const sale = { id: DB.uid(), no: s.seq.sale++, date: new Date().toISOString(), items, subtotal, discount, total: Math.max(0, subtotal - discount), paid, method };
  s.sales.push(sale);
  DB.save();
  cart = []; discount = 0;
  const m = modal(`${modalHead('تم البيع بنجاح ✅')}
    <div class="center"><div class="muted">فاتورة رقم #${sale.no}</div><div style="font-size:34px;font-weight:800;color:var(--primary);margin:10px 0">${money(sale.total)}</div>
    ${paid > sale.total ? `<div>الباقي للزبون: <b>${money(paid - sale.total)}</b></div>` : ''}</div>
    <div class="row" style="justify-content:center;margin-top:18px"><button class="btn primary" id="pr">${I.print} طباعة الفاتورة</button><button class="btn ghost" data-close>فاتورة جديدة</button></div>`,
    { size: 'sm', onClose: () => current === 'pos' && renderPOS($('#view')) });
  $('#pr', m.el).onclick = () => printReceipt(sale);
}
function printReceipt(sale) {
  const s = S().settings;
  $('#print-area').innerHTML = `<div class="receipt" dir="rtl" style="font-family:Tahoma,sans-serif">
    <div style="text-align:center"><h2 style="margin:4px 0">${esc(s.name)}</h2><div>${esc(s.address)}</div><div>${esc(s.phone)}</div>
    <div>فاتورة #${sale.no} — ${fmtDT(sale.date)}</div></div><hr>
    <table style="width:100%"><tr><th>الصنف</th><th>الكمية</th><th>المبلغ</th></tr>
    ${sale.items.map(i => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${money(i.qty * i.price)}</td></tr>`).join('')}</table>
    <p>المجموع: ${money(sale.subtotal)}<br>${sale.discount ? `الخصم: ${money(sale.discount)}<br>` : ''}<b>الإجمالي: ${money(sale.total)}</b><br>الدفع: ${esc(sale.method)}</p>
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
  $('#ptable').innerHTML = list.length ? `<table><thead><tr><th></th><th>المنتج</th><th>الباركود</th><th>الصنف</th><th>السعر</th><th>الكمية</th><th>الدفعات / التواريخ</th><th></th></tr></thead><tbody>
    ${list.map(p => {
      const total = stockOf(p), sellable = sellableQty(p), low = sellable <= (p.minStock ?? S().settings.lowStock);
      return `<tr>
        <td>${thumb(p)}</td>
        <td><b>${esc(p.name)}</b><div class="small muted">${esc(p.sci)}</div></td>
        <td class="small" style="font-family:monospace">${esc(p.barcode) || '—'}</td>
        <td><span class="badge">${esc(p.category)}</span></td>
        <td><b>${money(p.price)}</b></td>
        <td><span class="badge ${low ? (sellable ? 'warn' : 'danger') : 'ok'}">${total}</span></td>
        <td>${p.batches.filter(b => b.qty > 0).map(b => { const e = expiryState(b.expiry); return `<span class="badge ${e.cls}" title="الدفعة ${esc(b.batchNo)}" style="margin:2px">${b.qty} • ${b.expiry ? fmtDate(b.expiry) : 'بدون'}</span>`; }).join('') || '<span class="muted small">لا يوجد</span>'}</td>
        <td><div class="row" style="flex-wrap:nowrap">
          <button class="btn sm icon" data-edit="${p.id}" title="تعديل">${I.edit}</button>
          <button class="btn sm icon" data-label="${p.id}" title="طباعة باركود">${I.barcode}</button>
          <button class="btn sm icon danger" data-del="${p.id}" title="حذف">${I.trash}</button></div></td></tr>`;
    }).join('')}</tbody></table>` : `<div class="empty">${I.box}<div>لا توجد منتجات مطابقة</div></div>`;
  $$('[data-edit]').forEach(b => b.onclick = () => productForm(findProduct(b.dataset.edit)));
  $$('[data-label]').forEach(b => b.onclick = () => printLabels(findProduct(b.dataset.label)));
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
      <div class="field"><label>صورة المنتج</label><input type="file" id="f-img" accept="image/*"></div>
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
    $('#code-preview', el).innerHTML = code ? `<div class="barcode-box">${Barcode.svg(code, { height: 50, module: 1.6 })}</div>` : '<div class="muted small">معاينة الباركود</div>';
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

  $('#f-img', el).onchange = async e => { const f = e.target.files[0]; if (f) { d.image = await compressImage(f); toast('تم تحميل الصورة'); } };

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
  <div class="grid g3">${stat(I.receipt, list.length, 'عدد الفواتير')}${stat(I.money, money(total), 'إجمالي المبيعات')}${stat(I.money, money(profit), 'الربح التقديري')}</div>
  <div class="card glass table-wrap">${list.length ? `<table><thead><tr><th>#</th><th>التاريخ</th><th>الأصناف</th><th>الدفع</th><th>الإجمالي</th><th></th></tr></thead><tbody>
    ${list.map(x => `<tr><td><b>${x.no}</b></td><td>${fmtDT(x.date)}</td><td class="small">${x.items.map(i => `${esc(i.name)} ×${i.qty}`).join('، ')}</td><td><span class="badge">${esc(x.method)}</span></td><td><b>${money(x.total)}</b></td>
    <td><div class="row" style="flex-wrap:nowrap"><button class="btn sm icon" data-print="${x.id}">${I.print}</button><button class="btn sm icon danger" data-ret="${x.id}" title="إرجاع الفاتورة">${I.undo}</button></div></td></tr>`).join('')}</tbody></table>` : '<div class="empty">لا توجد فواتير في هذه الفترة</div>'}</div>`;
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

// ================= موقع العرض =================
function renderStoreLink(v) {
  const url = location.origin + '/store.html';
  const shown = S().products.filter(p => p.showInStore !== false).length;
  v.innerHTML = `
  <div class="card glass">
    <h3>موقع عرض المنتجات للزبائن</h3>
    <p class="muted">صفحة عامة أنيقة تعرض منتجات الصيدلية وأسعارها وحالة التوفر، مع زر طلب عبر واتساب. لا تظهر فيها أسعار الشراء أو المبيعات.</p>
    <div class="row"><input readonly value="${url}" id="surl" class="grow" style="direction:ltr"><button class="btn" id="copy">نسخ الرابط</button><a class="btn primary" href="store.html" target="_blank">${I.eye} فتح الموقع</a></div>
    <p class="small muted">${shown} منتج معروض حالياً. يمكنك إخفاء أي منتج من نموذج التعديل. عدّل رقم الواتساب ورسالة الترحيب من الإعدادات.</p>
  </div>
  <div class="card glass" style="padding:0;overflow:hidden;height:70vh"><iframe src="store.html" style="width:100%;height:100%;border:0"></iframe></div>`;
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
    r.onload = () => { try { const d = JSON.parse(r.result); if (!d.settings || !d.products) throw 0; DB.replace(d); applyTheme(); toast('تم الاستيراد'); go(); } catch { toast('ملف غير صالح', true); } };
    r.readAsText(f);
  };
  $('#reset').onclick = () => confirmBox('سيتم حذف <b>جميع</b> المنتجات والمبيعات والجرد. هل أنت متأكد؟', () => { DB.reset(); applyTheme(); go(); toast('تم التصفير'); }, 'حذف الكل');
}

// ================= تشغيل =================
(async () => {
  await DB.load();
  applyTheme();
  $('#menu-btn').innerHTML = I.menu;
  $('#menu-btn').onclick = () => $('#sidebar').classList.toggle('open');
  $('#sync-status').textContent = DB.online ? '● متصل بالخادم' : '● وضع محلي';
  window.addEventListener('hashchange', go);
  go();
})();
})();
