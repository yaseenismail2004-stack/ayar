// مولّد باركود Code128-B بصيغة SVG (بدون مكتبات) + توليد رمز EAN-13 داخلي
const Barcode = (() => {
  const P = ['212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212','112232','122132','122231','113222','123122','123221','223211','221132','221231','213212','223112','312131','311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321','112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121','313121','211331','231131','213113','213311','213131','311123','311321','331121','312113','312311','332111','314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114','122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212','124112','124211','411212','421112','421211','212141','214121','412121','111143','111341','131141','114113','114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'];

  function svg(text, { height = 60, module = 2, showText = true } = {}) {
    text = String(text || '').replace(/[^\x20-\x7E]/g, '');
    if (!text) return '';
    const codes = [104];
    for (const ch of text) codes.push(ch.charCodeAt(0) - 32);
    let sum = 104;
    for (let i = 1; i < codes.length; i++) sum += codes[i] * i;
    codes.push(sum % 103, 106);
    const pattern = codes.map(c => P[c]).join('');
    const quiet = 10 * module;
    let x = quiet, rects = '';
    for (let i = 0; i < pattern.length; i++) {
      const w = +pattern[i] * module;
      if (i % 2 === 0) rects += `<rect x="${x}" y="0" width="${w}" height="${height}"/>`;
      x += w;
    }
    const width = x + quiet, th = showText ? 18 : 0;
    const label = showText ? `<text x="${width / 2}" y="${height + 15}" font-family="monospace" font-size="14" text-anchor="middle">${text}</text>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height + th}" width="${width}" height="${height + th}"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${rects}</g>${label}</svg>`;
  }

  // رمز داخلي EAN-13 يبدأ بـ 200 (نطاق الاستخدام الداخلي للمتاجر)
  function generate(existing = new Set()) {
    let code;
    do {
      let base = '200' + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      base = base.slice(0, 12);
      let s = 0;
      for (let i = 0; i < 12; i++) s += +base[i] * (i % 2 ? 3 : 1);
      code = base + ((10 - (s % 10)) % 10);
    } while (existing.has(code));
    return code;
  }

  return { svg, generate };
})();
