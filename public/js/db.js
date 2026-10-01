// طبقة البيانات: تحفظ على الخادم (data/db.json) وإن لم يتوفر خادم تحفظ محلياً في المتصفح
const DB = (() => {
  const LS_KEY = 'ayar-db-v1';
  let state = null, useServer = false, saveTimer = null;

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function defaults() {
    return {
      settings: {
        name: 'صيدلية أيار', currency: 'د.ع', theme: 'violet', phone: '', address: '', whatsapp: '',
        expiryWarnDays: 90, lowStock: 5, storeNote: 'صحتك أولويتنا 💜', receiptFooter: 'شكراً لزيارتكم — نتمنى لكم الشفاء العاجل'
      },
      categories: ['أدوية', 'مضادات حيوية', 'مسكنات', 'فيتامينات', 'عناية بالبشرة', 'أطفال', 'مستلزمات طبية'],
      products: [], sales: [], stocktakes: [], seq: { sale: 1 }
    };
  }

  function demo(s) {
    const d = n => { const t = new Date(); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); };
    const mk = (name, sci, category, price, cost, barcode, batches) => ({
      id: uid(), name, sci, category, price, cost, barcode, unit: 'علبة', minStock: 5, description: '', image: '',
      showInStore: true, createdAt: new Date().toISOString(),
      batches: batches.map(([expiry, qty, batchNo]) => ({ id: uid(), expiry, qty, batchNo: batchNo || '', cost }))
    });
    s.products = [
      mk('بنادول أدفانس 500mg', 'Paracetamol', 'مسكنات', 3000, 2000, '6285074000017', [[d(400), 40, 'PN-221'], [d(60), 12, 'PN-198']]),
      mk('أوغمنتين 1g', 'Amoxicillin + Clavulanate', 'مضادات حيوية', 12000, 9000, '5000123456781', [[d(300), 15, 'AG-77']]),
      mk('فيتامين سي 1000', 'Vitamin C', 'فيتامينات', 8000, 5000, '2001234567893', [[d(700), 30], [d(25), 4]]),
      mk('بروفين 400mg', 'Ibuprofen', 'مسكنات', 2500, 1500, '6291100000123', [[d(500), 3]]),
      mk('سيرافي كريم مرطب', 'CeraVe', 'عناية بالبشرة', 25000, 18000, '3337875597197', [[d(900), 8]]),
      mk('شراب سعال أطفال', 'Dextromethorphan', 'أطفال', 6000, 4000, '2009876543213', [[d(-5), 2], [d(200), 10]])
    ];
    return s;
  }

  async function load() {
    try {
      const r = await fetch('/api/state', { cache: 'no-store' });
      if (r.ok) {
        useServer = true;
        const data = await r.json();
        state = data && data.settings ? data : null;
      }
    } catch { useServer = false; }
    if (!state) {
      try { state = JSON.parse(localStorage.getItem(LS_KEY)); } catch { state = null; }
    }
    if (!state || !state.settings) { state = demo(defaults()); persist(true); }
    // ترقية آمنة لأي حقول ناقصة
    const def = defaults();
    state.settings = { ...def.settings, ...state.settings };
    for (const k of ['categories', 'products', 'sales', 'stocktakes']) state[k] = state[k] || def[k];
    state.seq = state.seq || def.seq;
    return state;
  }

  function persist(now = false) {
    clearTimeout(saveTimer);
    const run = async () => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
      if (useServer) {
        try {
          await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
        } catch { console.warn('تعذر الحفظ على الخادم'); }
      }
    };
    now ? run() : (saveTimer = setTimeout(run, 400));
  }

  return {
    load, uid,
    get s() { return state; },
    save: () => persist(),
    replace(newState) { state = newState; persist(true); },
    reset() { state = defaults(); persist(true); },
    get online() { return useServer; }
  };
})();
