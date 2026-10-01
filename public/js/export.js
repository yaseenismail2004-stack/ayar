// ================= أيار — تصدير التقارير إلى Excel و PDF =================
// Excel: ملف .xlsx حقيقي (من اليمين لليسار، تنسيقات وأرقام وفلاتر) بدون أي مكتبة.
// PDF: صفحات A4 تُرسم بالمتصفح نفسه (فالعربي يظهر صحيحاً 100%) ثم تُجمع في ملف PDF.
window.AyarExport = (() => {
  'use strict';
  const enc = new TextEncoder();
  const xesc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const hesc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- ZIP (بدون ضغط) ----------
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const parts = [], central = []; let offset = 0;
    const d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const f of files) {
      const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
      h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const csize = central.reduce((s, x) => s + x.length, 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // ---------- XLSX ----------
  // sheets: [{ name, title, subtitle, columns: [{ h, t: 'text'|'money'|'num'|'pct'|'date', w }], rows: [[...]], total: [...] , kv: [[label, value, type]] }]
  const colL = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  const ST = { text: 0, head: 1, money: 2, title: 3, totL: 4, totM: 5, sub: 6, pct: 7, num: 8, totN: 9, kvL: 10, date: 11 };
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0"/><numFmt numFmtId="165" formatCode="0.0%"/></numFmts>
<fonts count="6"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="16"/><color rgb="FF5B21B6"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><sz val="10"/><color rgb="FF6B6185"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FF4C1D95"/><name val="Calibri"/><family val="2"/></font></fonts>
<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF7C3AED"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3EEFF"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color rgb="FFE4DDF5"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="12">
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="3" borderId="0" applyFont="1" applyFill="1"><alignment vertical="center"/></xf>
<xf numFmtId="164" fontId="5" fillId="3" borderId="0" applyFont="1" applyFill="1" applyNumberFormat="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1"><alignment vertical="center"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="164" fontId="5" fillId="3" borderId="0" applyFont="1" applyFill="1" applyNumberFormat="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf>
</cellXfs></styleSheet>`;
  function cell(ref, v, s) {
    if (v === null || v === undefined || v === '') return `<c r="${ref}" s="${s}"/>`;
    if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}" s="${s}"><v>${v}</v></c>`;
    return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${xesc(v)}</t></is></c>`;
  }
  const typeStyle = t => ({ money: ST.money, num: ST.num, pct: ST.pct, date: ST.date })[t] ?? ST.text;
  function sheetXml(sh) {
    const cols = sh.columns || [], ncol = Math.max(cols.length, sh.kv ? 2 : 1, 1);
    const rows = []; let r = 0; const merges = [];
    const add = cells => { r++; rows.push(`<row r="${r}"${cells.ht ? ` ht="${cells.ht}" customHeight="1"` : ''}>${cells.map(([v, s], i) => cell(colL(i) + r, v, s)).join('')}</row>`); };
    if (sh.title) { add(Object.assign([[sh.title, ST.title]], { ht: 26 })); merges.push(`A${r}:${colL(ncol - 1)}${r}`); }
    if (sh.subtitle) { add([[sh.subtitle, ST.sub]]); merges.push(`A${r}:${colL(ncol - 1)}${r}`); }
    if (sh.title || sh.subtitle) add([]);
    if (sh.kv) for (const [k, v, t] of sh.kv) add([[k, ST.kvL], [v, typeStyle(t)]]);
    let headRow = 0, last = 0;
    if (cols.length) {
      if (sh.kv) add([]);
      add(Object.assign(cols.map(c => [c.h, ST.head]), { ht: 22 })); headRow = r;
      for (const row of sh.rows || []) add(row.map((v, i) => [v, typeStyle(cols[i]?.t)]));
      last = r;
      if (sh.total) add(sh.total.map((v, i) => [v, typeof v === 'number' ? (cols[i]?.t === 'num' ? ST.totN : ST.totM) : ST.totL]));
    }
    const widths = cols.length ? cols.map((c, i) => c.w || Math.min(48, Math.max(10, String(c.h).length + 4, ...(sh.rows || []).slice(0, 300).map(rw => String(rw[i] ?? '').length * (typeof rw[i] === 'number' ? 1.25 : 1.1) + 2))))
      : [34, 22];
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView rightToLeft="1" workbookViewId="0" showGridLines="0">${headRow ? `<pane ySplit="${headRow}" topLeftCell="A${headRow + 1}" activePane="bottomLeft" state="frozen"/>` : ''}</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="18"/>
<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w.toFixed(1)}" customWidth="1"/>`).join('')}</cols>
<sheetData>${rows.join('')}</sheetData>
${headRow && last > headRow ? `<autoFilter ref="A${headRow}:${colL(cols.length - 1)}${last}"/>` : ''}
${merges.length ? `<mergeCells count="${merges.length}">${merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : ''}
<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
<pageSetup paperSize="9" orientation="${cols.length > 6 ? 'landscape' : 'portrait'}" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
  }
  function xlsx(sheets) {
    const used = new Set();
    const names = sheets.map((s, i) => {
      let n = String(s.name || `ورقة ${i + 1}`).replace(/[\[\]:*?\/\\]/g, ' ').trim().slice(0, 31) || `ورقة ${i + 1}`, base = n, k = 2;
      while (used.has(n)) n = `${base.slice(0, 28)} ${k++}`;
      used.add(n); return n;
    });
    const files = [
      { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
      { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
      { name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>أيار</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created></cp:coreProperties>` },
      { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${names.map((n, i) => `<sheet name="${xesc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
      { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
      { name: 'xl/styles.xml', data: STYLES },
      ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s) }))
    ];
    return zip(files);
  }

  // ---------- PDF من صور JPEG (صفحة لكل صورة) ----------
  function pdfFromJpegs(pages) {
    const chunks = [], offsets = []; let len = 0;
    const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; chunks.push(b); len += b.length; };
    const obj = (n, body) => { offsets[n] = len; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };
    push('%PDF-1.4\n'); push(new Uint8Array([37, 226, 227, 207, 211, 10])); // ترويسة + علامة ملف ثنائي
    const W = 595.28, H = 841.89, n = pages.length, kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
    obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => push(`<< /Type /Pages /Count ${n} /Kids [${kids}] >>`));
    pages.forEach((p, i) => {
      const po = 3 + i * 3, co = po + 1, io = po + 2;
      const content = `q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
      obj(po, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${io} 0 R >> >> /Contents ${co} 0 R >>`));
      obj(co, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
      obj(io, () => { push(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.data.length} >>\nstream\n`); push(p.data); push('\nendstream'); });
    });
    const total = 3 + n * 3, xref = len;
    push(`xref\n0 ${total}\n0000000000 65535 f \n`);
    for (let i = 1; i < total; i++) push(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
    push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(chunks, { type: 'application/pdf' });
  }

  // ---------- تخطيط صفحات A4 ----------
  const PAGE_W = 794, PAGE_H = 1123;
  let h2iPromise = null;
  const loadH2I = () => h2iPromise || (h2iPromise = new Promise((ok, no) => {
    if (window.htmlToImage) return ok();
    const s = document.createElement('script'); s.src = 'vendor/html-to-image.js'; s.onload = ok; s.onerror = () => { h2iPromise = null; no(new Error('تعذر تحميل أداة PDF')); };
    document.head.appendChild(s);
  }));
  const fmtV = (v, t, cur) => v === null || v === undefined || v === '' ? '—'
    : t === 'money' ? `${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${hesc(cur)}`
    : t === 'num' ? Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })
    : t === 'pct' ? `${(Number(v) * 100).toFixed(1)}%` : hesc(v);

  // report: { title, subtitle, brand: {name, sub}, currency, blocks: [...] }
  // blocks: {kind:'kpis', items:[{label,value,delta,tone}]} | {kind:'chart', title, html} | {kind:'row', items:[{title, html}]}
  //         {kind:'table', title, columns, rows, total} | {kind:'note', html}
  // شعار الصيدلية كـ data URL (يُحمّل مرة واحدة) حتى يظهر داخل صفحات PDF
  let logoP = null;
  const logoUrl = () => logoP || (logoP = fetch('brand/logo-192.png').then(r => r.ok ? r.blob() : null)
    .then(b => b && new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(b); }))
    .catch(() => null));
  async function buildPages(report, onProgress) {
    const logo = await logoUrl();
    const host = document.createElement('div');
    host.className = 'pdf-host'; host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
    const pages = [];
    const newPage = () => {
      const pg = document.createElement('div');
      pg.className = 'pdf-page'; pg.dir = 'rtl';
      pg.innerHTML = `<div class="pdf-head"><div class="pdf-brand">${logo ? `<img class="pdf-logo" src="${logo}" alt="">` : '<div class="pdf-logo">أ</div>'}<div><b>${hesc(report.brand?.name)}</b><small>${hesc(report.brand?.sub || '')}</small></div></div>
        <div class="pdf-title"><b>${hesc(report.title)}</b><small>${hesc(report.subtitle || '')}</small></div></div>
        <div class="pdf-body"></div><div class="pdf-foot"><span>${hesc(report.footer || '')}</span><span class="pdf-pn"></span></div>`;
      host.appendChild(pg); pages.push(pg); return pg.querySelector('.pdf-body');
    };
    let body = newPage();
    const fits = () => body.scrollHeight <= body.clientHeight + 1;
    const place = el => {
      body.appendChild(el);
      if (fits()) return true;
      if (body.children.length === 1) return true; // أكبر من صفحة كاملة: نتركه
      el.remove(); body = newPage(); body.appendChild(el); return true;
    };
    const tableHead = b => `<thead><tr>${b.columns.map(c => `<th class="${c.t && c.t !== 'text' ? 'n' : ''}">${hesc(c.h)}</th>`).join('')}</tr></thead>`;
    for (const b of report.blocks) {
      if (b.kind === 'table') {
        const mk = (cont) => {
          const wrap = document.createElement('div'); wrap.className = 'pdf-block';
          wrap.innerHTML = `${b.title ? `<h3>${hesc(b.title)}${cont ? ' <small>(تابع)</small>' : ''}</h3>` : ''}<table class="pdf-table">${tableHead(b)}<tbody></tbody></table>`;
          return wrap;
        };
        let wrap = mk(false); place(wrap);
        let tb = wrap.querySelector('tbody');
        const rows = (b.rows || []).map(r => `<tr>${r.map((v, i) => `<td class="${b.columns[i]?.t && b.columns[i].t !== 'text' ? 'n' : ''}">${fmtV(v, b.columns[i]?.t, report.currency)}</td>`).join('')}</tr>`);
        if (b.total) rows.push(`<tr class="tot">${b.total.map((v, i) => `<td class="${typeof v === 'number' ? 'n' : ''}">${typeof v === 'number' ? fmtV(v, b.columns[i]?.t, report.currency) : hesc(v ?? '')}</td>`).join('')}</tr>`);
        if (!rows.length) tb.innerHTML = `<tr><td colspan="${b.columns.length}" class="pdf-empty">لا توجد بيانات</td></tr>`;
        for (const html of rows) {
          tb.insertAdjacentHTML('beforeend', html);
          if (!fits()) {
            const tr = tb.lastElementChild; tr.remove();
            if (!tb.children.length) { wrap.remove(); }
            body = newPage(); wrap = mk(tb.children.length > 0); body.appendChild(wrap); tb = wrap.querySelector('tbody'); tb.appendChild(tr);
          }
        }
        continue;
      }
      const el = document.createElement('div'); el.className = 'pdf-block';
      if (b.kind === 'kpis') el.innerHTML = `<div class="pdf-kpis">${b.items.map(k => `<div class="pdf-kpi"><small>${hesc(k.label)}</small><b>${k.value}</b>${k.delta ? `<span class="pdf-delta ${k.deltaTone || ''}">${k.delta}</span>` : ''}</div>`).join('')}</div>`;
      else if (b.kind === 'chart') el.innerHTML = `<h3>${hesc(b.title)}</h3><div class="pdf-chart">${b.html}</div>`;
      else if (b.kind === 'row') el.innerHTML = `<div class="pdf-row">${b.items.map(x => `<div class="pdf-col"><h3>${hesc(x.title)}</h3><div class="pdf-chart">${x.html}</div></div>`).join('')}</div>`;
      else if (b.kind === 'note') el.innerHTML = `<div class="pdf-note">${b.html}</div>`;
      place(el);
    }
    pages.forEach((pg, i) => { pg.querySelector('.pdf-pn').textContent = `صفحة ${i + 1} من ${pages.length}`; });
    return { host, pages };
  }

  async function pdf(report, onProgress = () => {}) {
    await loadH2I();
    if (document.fonts?.ready) await document.fonts.ready;
    const { host, pages } = await buildPages(report);
    try {
      const fontEmbedCSS = await window.htmlToImage.getFontEmbedCSS(pages[0]).catch(() => '');
      const isWebKit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Android/.test(navigator.userAgent);
      const out = [];
      for (let i = 0; i < pages.length; i++) {
        onProgress(i + 1, pages.length);
        const opts = { pixelRatio: 2, backgroundColor: '#ffffff', width: PAGE_W, height: PAGE_H, fontEmbedCSS, cacheBust: false, skipAutoScale: true };
        if (isWebKit && i === 0) await window.htmlToImage.toCanvas(pages[i], opts).catch(() => {}); // سفاري يحتاج تمريرة أولى لتحميل الخطوط
        const canvas = await window.htmlToImage.toCanvas(pages[i], opts);
        const data = canvas.toDataURL('image/jpeg', 0.9);
        const bin = atob(data.split(',')[1]), bytes = new Uint8Array(bin.length);
        for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
        out.push({ data: bytes, w: canvas.width, h: canvas.height });
        canvas.width = canvas.height = 0; // تحرير الذاكرة (مهم على الآيفون)
      }
      return pdfFromJpegs(out);
    } finally { host.remove(); }
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return { xlsx, pdf, download, buildPages, fmtV };
})();
