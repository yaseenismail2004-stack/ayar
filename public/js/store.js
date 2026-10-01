// موقع عرض المنتجات للزبائن
(async () => {
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let data;
  try { const r = await fetch('/api/store'); if (!r.ok) throw 0; data = await r.json(); }
  catch {
    // بدون خادم: اقرأ من بيانات المتصفح المحلية
    const s = JSON.parse(localStorage.getItem('ayar-db-v1') || '{}'), t = (d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)(new Date());
    data = { settings: s.settings || {}, categories: s.categories || [], products: (s.products || []).filter(p => p.showInStore !== false)
      .map(p => ({ ...p, inStock: (p.batches || []).some(b => b.qty > 0 && (!b.expiry || b.expiry >= t)) })) };
  }
  const S = data.settings || {};
  document.documentElement.dataset.theme = S.theme || 'violet';
  const name = S.name || 'صيدلية أيار';
  document.title = `${name} — منتجاتنا`;
  document.getElementById('s-name').textContent = name;
  document.getElementById('s-title').textContent = name;
  document.getElementById('s-note').textContent = S.storeNote || 'صحتك أولويتنا 💜';
  document.getElementById('s-addr').textContent = S.address || 'موقع عرض المنتجات';
  const call = document.getElementById('s-call');
  S.phone ? call.href = 'tel:' + S.phone : call.style.display = 'none';
  document.getElementById('foot').innerHTML = `© ${new Date().getFullYear()} ${esc(name)}${S.phone ? ' • ' + esc(S.phone) : ''}${S.address ? ' • ' + esc(S.address) : ''}`;
  const money = v => `${Number(v || 0).toLocaleString('en-US')} ${esc(S.currency || 'د.ع')}`;
  const safeImg = v => (typeof v === 'string' && (/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v) || /^\/api\/img\/[a-z0-9]+$/.test(v))) ? v : '';
  const wa = p => S.whatsapp ? `https://wa.me/${S.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً، أريد طلب: ${p.name}`)}` : '';

  let cat = 'الكل', q = '';
  const cats = ['الكل', ...data.categories.filter(c => data.products.some(p => p.category === c))];
  const chips = document.getElementById('chips'), grid = document.getElementById('grid');
  const drawChips = () => {
    chips.innerHTML = cats.map(c => `<button class="btn ${c === cat ? 'primary' : 'ghost glass'}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
    chips.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { cat = b.dataset.c; drawChips(); draw(); });
  };
  const draw = () => {
    const k = q.trim().toLowerCase();
    const list = data.products.filter(p => (cat === 'الكل' || p.category === cat) && (!k || p.name.toLowerCase().includes(k) || (p.sci || '').toLowerCase().includes(k)));
    grid.innerHTML = list.map(p => `<div class="p-card glass" data-id="${esc(p.id)}">
      <div class="img">${safeImg(p.image) ? `<img src="${safeImg(p.image)}" alt="" loading="lazy">` : esc((p.name || "؟")[0])}</div>
      <span class="badge" style="align-self:flex-start">${esc(p.category)}</span>
      <b>${esc(p.name)}</b><span class="small muted">${esc(p.sci)}</span>
      <div class="row between"><span class="price">${money(p.price)}</span><span class="badge ${p.inStock ? 'ok' : 'danger'}">${p.inStock ? 'متوفر' : 'غير متوفر'}</span></div>
    </div>`).join('') || '<div class="empty glass" style="grid-column:1/-1">لا توجد منتجات مطابقة</div>';
    grid.querySelectorAll('[data-id]').forEach(c => c.onclick = () => show(data.products.find(p => String(p.id) === c.dataset.id)));
  };
  const show = p => {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal glass sm">
      ${safeImg(p.image) ? `<img class="big-img" src="${safeImg(p.image)}" alt="">` : ''}
      <h2 style="margin:14px 0 4px">${esc(p.name)}</h2><div class="muted">${esc(p.sci)}</div>
      <p>${esc(p.description) || ''}</p>
      <div class="row between"><span style="font-size:24px;font-weight:800;color:var(--primary)">${money(p.price)}</span><span class="badge ${p.inStock ? 'ok' : 'danger'}">${p.inStock ? 'متوفر' : 'غير متوفر'}</span></div>
      <div class="row" style="margin-top:16px">${wa(p) ? `<a class="btn primary grow" target="_blank" href="${esc(wa(p))}">اطلب عبر واتساب</a>` : ''}<button class="btn ghost grow" id="cl">إغلاق</button></div></div>`;
    back.onclick = e => { if (e.target === back || e.target.id === 'cl') back.remove(); };
    document.getElementById('modal-root').appendChild(back);
  };
  document.getElementById('q').oninput = e => { q = e.target.value; draw(); };
  drawChips(); draw();
})();
