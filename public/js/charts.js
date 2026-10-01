// ================= أيار — رسوم بيانية SVG خفيفة (بدون مكتبات) =================
// كل دالة ترجع HTML/SVG كنص، وتعمل داخل التطبيق وداخل تقارير PDF.
// الاتجاه من اليمين لليسار: أقدم قيمة على اليمين وأحدث قيمة على اليسار.
window.Charts = (() => {
  'use strict';
  const PAL = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ef4444', '#14b8a6', '#64748b', '#eab308'];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtN = v => Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtK = v => {
    const a = Math.abs(v);
    if (a >= 1e9) return +(v / 1e9).toFixed(1) + 'B';
    if (a >= 1e6) return +(v / 1e6).toFixed(1) + 'M';
    if (a >= 1e3) return +(v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'k';
    return String(Math.round(v));
  };
  // أعلى قيمة "مرتبة" للمحور وعدد الخطوط
  function niceScale(max, ticks = 4) {
    if (max <= 0) return { max: ticks, step: 1 };
    const raw = max / ticks, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) || 10 * mag;
    return { max: step * Math.ceil(max / step), step };
  }
  let uid = 0;
  const legend = series => series.length > 1 ? `<div class="ch-legend">${series.map((s, i) => `<span><i style="background:${s.color || PAL[i]}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';

  // منحنى ناعم لا يتجاوز النقاط (monotone)
  function smooth(pts) {
    if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = (x1 - x0) / 3;
      d += ` C${x0 + dx},${y0} ${x1 - dx},${y1} ${x1},${y1}`;
    }
    return d;
  }

  // ---- خط/مساحة: series = [{name, values, color}] ----
  function area({ labels, series, width = 640, height = 240, fmt = fmtN, fill = true }) {
    const id = 'g' + (++uid), n = labels.length;
    const P = { l: 12, r: 58, t: 16, b: 28 }, W = width - P.l - P.r, H = height - P.t - P.b;
    const all = series.flatMap(s => s.values), min = Math.min(0, ...all);
    const { max, step } = niceScale(Math.max(...all, 0) - min);
    const top = max + min;
    const X = i => P.l + W - (n === 1 ? W / 2 : (i * W) / (n - 1));
    const Y = v => P.t + H - ((v - min) / (top - min || 1)) * H;
    let g = '';
    for (let v = min; v <= top + 1e-9; v += step) {
      const y = Y(v).toFixed(1);
      g += `<line x1="${P.l}" x2="${P.l + W}" y1="${y}" y2="${y}" class="ch-grid"/><text x="${P.l + W + 16}" y="${+y + 4}" class="ch-ax" text-anchor="start" direction="ltr">${fmtK(v)}</text>`;
    }
    const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(W / 64))));
    labels.forEach((l, i) => { if (i === n - 1 || (i % every === 0 && n - 1 - i >= every * 0.6)) g += `<text x="${X(i).toFixed(1)}" y="${height - 8}" class="ch-ax" text-anchor="middle">${esc(l)}</text>`; });
    let paths = '';
    series.forEach((s, si) => {
      const c = s.color || PAL[si], pts = s.values.map((v, i) => [+X(i).toFixed(1), +Y(v).toFixed(1)]);
      const line = smooth(pts);
      if (fill && si === 0 && pts.length > 1) paths += `<path d="${line} L${pts[pts.length - 1][0]},${P.t + H} L${pts[0][0]},${P.t + H} Z" fill="url(#${id}a)"/>`;
      paths += `<path d="${line}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"${si ? ' stroke-dasharray="1 0"' : ''}/>`;
      if (n <= 40) paths += pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${n <= 14 ? 3.6 : 2.4}" fill="#fff" stroke="${c}" stroke-width="2"><title>${esc(labels[i])}: ${esc(fmt(s.values[i]))}</title></circle>`).join('');
    });
    const c0 = series[0]?.color || PAL[0];
    return `${legend(series)}<svg class="chart" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
      <defs><linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}" stop-opacity=".32"/><stop offset="1" stop-color="${c0}" stop-opacity="0"/></linearGradient></defs>
      ${g}${paths}</svg>`;
  }

  // ---- أعمدة عمودية: values واحدة أو مجموعتين ----
  function bars({ labels, values, width = 640, height = 220, fmt = fmtN, color = PAL[0], showValues }) {
    const id = 'b' + (++uid), n = labels.length;
    if (showValues === undefined) showValues = n <= 12;
    // عند إظهار القيم فوق الأعمدة لا نحتاج أرقام المحور (تفادياً للتداخل)
    const P = { l: 10, r: showValues ? 10 : 48, t: 20, b: 28 }, W = width - P.l - P.r, H = height - P.t - P.b;
    const { max, step } = niceScale(Math.max(...values, 0));
    const slot = W / n, bw = Math.max(4, Math.min(38, slot * 0.62));
    const Y = v => P.t + H - (v / max) * H;
    const best = values.indexOf(Math.max(...values));
    let g = '';
    for (let v = 0; v <= max + 1e-9; v += step) { const y = Y(v).toFixed(1); g += `<line x1="${P.l}" x2="${P.l + W}" y1="${y}" y2="${y}" class="ch-grid"/>${showValues ? '' : `<text x="${P.l + W + 14}" y="${+y + 4}" class="ch-ax" text-anchor="start" direction="ltr">${fmtK(v)}</text>`}`; }
    const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(W / 40))));
    const b = values.map((v, i) => {
      const cx = P.l + W - slot * (i + 0.5), y = Y(v), h = Math.max(0, P.t + H - y), r = Math.min(7, bw / 2, h);
      const x0 = cx - bw / 2, x1 = cx + bw / 2, yb = P.t + H;
      const path = h > 0 ? `M${x0},${yb} L${x0},${y + r} Q${x0},${y} ${x0 + r},${y} L${x1 - r},${y} Q${x1},${y} ${x1},${y + r} L${x1},${yb} Z` : '';
      return `<g><path d="${path}" fill="${i === best && v > 0 ? `url(#${id})` : color}" opacity="${i === best || v === 0 ? 1 : .55}"><title>${esc(labels[i])}: ${esc(fmt(v))}</title></path>
        ${showValues && v > 0 ? `<text x="${cx}" y="${y - 5}" class="ch-val" text-anchor="middle">${fmtK(v)}</text>` : ''}
        ${i % every === 0 ? `<text x="${cx}" y="${height - 8}" class="ch-ax" text-anchor="middle">${esc(labels[i])}</text>` : ''}</g>`;
    }).join('');
    return `<svg class="chart" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>${g}${b}</svg>`;
  }

  // ---- دائرة مجوّفة مع وسيلة إيضاح ----
  function donut({ items, size = 190, fmt = fmtN, center = '', centerSub = '' }) {
    items = items.filter(x => x.value > 0);
    const total = items.reduce((s, x) => s + x.value, 0);
    if (!total) return `<div class="ch-empty">لا توجد بيانات</div>`;
    const r = 70, C = 2 * Math.PI * r, gap = items.length > 1 ? 2.5 : 0;
    let off = 0;
    const segs = items.map((x, i) => {
      const len = (x.value / total) * C, c = x.color || PAL[i % PAL.length];
      const s = `<circle r="${r}" cx="90" cy="90" fill="none" stroke="${c}" stroke-width="26" stroke-dasharray="${Math.max(0, len - gap).toFixed(2)} ${(C - Math.max(0, len - gap)).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 90 90)"><title>${esc(x.label)}: ${esc(fmt(x.value))}</title></circle>`;
      off += len; return s;
    }).join('');
    return `<div class="ch-donut"><svg viewBox="0 0 180 180" width="${size}" height="${size}" role="img">
        <circle r="${r}" cx="90" cy="90" fill="none" class="ch-track" stroke-width="26"/>${segs}
        <text x="90" y="${centerSub ? 88 : 96}" text-anchor="middle" class="ch-center">${esc(center || fmtK(total))}</text>
        ${centerSub ? `<text x="90" y="108" text-anchor="middle" class="ch-ax">${esc(centerSub)}</text>` : ''}</svg>
      <div class="ch-dlegend">${items.map((x, i) => `<div><i style="background:${x.color || PAL[i % PAL.length]}"></i><span class="t">${esc(x.label)}</span><b>${esc(fmt(x.value))}</b><small>${((x.value / total) * 100).toFixed(x.value / total < .1 ? 1 : 0)}%</small></div>`).join('')}</div></div>`;
  }

  // ---- قائمة أعمدة أفقية (ترتيب) ----
  function hbars({ items, fmt = fmtN, color = PAL[0], sub }) {
    if (!items.length) return `<div class="ch-empty">لا توجد بيانات</div>`;
    const max = Math.max(...items.map(x => x.value), 1);
    return `<div class="ch-hbars">${items.map((x, i) => `<div class="hb">
      <div class="hb-top"><span class="hb-rank">${i + 1}</span><span class="hb-l">${esc(x.label)}</span><b>${esc(fmt(x.value))}</b></div>
      <div class="hb-track"><i style="width:${Math.max(2, (x.value / max) * 100).toFixed(1)}%;background:linear-gradient(90deg, ${x.color || color}, ${x.color2 || '#c084fc'})"></i></div>
      ${x.sub || sub ? `<small class="hb-sub">${esc(x.sub || (sub && sub(x)) || '')}</small>` : ''}</div>`).join('')}</div>`;
  }

  // ---- خريطة حرارية: أيام × ساعات ----
  function heat({ rows, cols, data, fmt = fmtN, color = '124,58,237' }) {
    const max = Math.max(...data.flat(), 1);
    return `<div class="ch-heat" style="grid-template-columns: auto repeat(${cols.length}, 1fr)">
      <span></span>${cols.map(c => `<span class="hh">${esc(c)}</span>`).join('')}
      ${rows.map((r, ri) => `<span class="hr">${esc(r)}</span>${cols.map((c, ci) => { const v = data[ri][ci]; return `<i title="${esc(r)} ${esc(c)}: ${esc(fmt(v))}" style="background:rgba(${color},${v ? (.12 + .88 * v / max).toFixed(2) : .05})"></i>`; }).join('')}`).join('')}
    </div>`;
  }

  return { area, bars, donut, hbars, heat, PAL, fmtK, niceScale };
})();
