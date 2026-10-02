/* KHAN TRADERS — Cart + COD/bKash/Nagad checkout + Telegram & Google Sheet order notification */
(function () {
  'use strict';

  /* ========= CONFIG ========= */
  const CFG = {
    TELEGRAM_PROXY_URL: 'https://khandradersbot.rabbykst5.workers.dev/',
    GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbx9Y5Dp1VSBPc4FAlxuQ9vXyuY_dC9-XYRubqTRrLUpb7SWiGhwkxwfYct4_3hvLyHS/exec',
    HOTLINE: '01751297055',
    MFS_NUMBER: '01751297055', // বিকাশ ও নগদ পার্সোনাল নম্বর
    MAX_QTY: 99,
    COOLDOWN_MS: 20000,
    DELIVERY_INSIDE_KUSHTIA: 0,   // কুষ্টিয়া জেলার ভেতরে ফ্রি
    DELIVERY_OUTSIDE_KUSHTIA: 150, // কুষ্টিয়ার বাইরে ডেলিভারি চার্জ
    buildPayload: (text) => ({ text: text, parse_mode: 'HTML' })
  };

  const CART_KEY = 'kt_cart_v1';
  const CUSTOMER_KEY = 'kt_customer_v1';
  const LAST_ORDER_KEY = 'kt_last_order_at';

  /* ========= DISTRICT & THANA DATA ========= */
  const BD_GEO = {
    "কুষ্টিয়া": ["কুষ্টিয়া সদর", "কুমারখালী", "খোকসা", "মিরপুর", "ভেড়ামারা", "দৌলতপুর"],
    "ঢাকা": ["ধানমন্ডি", "মিরপুর", "গুলশান", "উত্তরা", "মতিঝিল", "মোহাম্মদপুর", "সাভার", "কেরানীগঞ্জ", "ধামরাই", "যাত্রাবাড়ী"],
    "যশোর": ["যশোর সদর", "ঝিকরগাছা", "কেশবপুর", "মণিরামপুর", "শার্শা", "অভয়নগর", "বাঘারপাড়া", "চৌগাছা"],
    "ঝিনাইদহ": ["ঝিনাইদহ সদর", "শৈলকুপা", "হরিণাকুণ্ডু", "কালীগঞ্জ", "কোটচাঁদপুর", "মহেশপুর"],
    "চুয়াডাঙ্গা": ["চুয়াডাঙ্গা সদর", "আলমডাঙ্গা", "দামুড়হুদা", "জীবননগর"],
    "মেহেরপুর": ["মেহেরপুর সদর", "গাংনী", "মুজিবনগর"],
    "পাবনা": ["পাবনা সদর", "ঈশ্বরদী", "আটঘরিয়া", "চাটমোহর", "ভাঙ্গুড়া", "ফরিদপুর", "সুজানগর", "বেড়া", "সাঁথিয়া"],
    "রাজশাহী": ["বোয়ালিয়া", "মতিহার", "রাজপাড়া", "শাহ মখদুম", "পবা", "গোদাগাড়ী", "তানোর", "বাগমারা", "পুঠিয়া", "চারঘাট", "বাঘা", "দুর্গাপুর"],
    "বগুড়া": ["বগুড়া সদর", "শিবগঞ্জ", "সোনাতলা", "গাবতলী", "শাজাহানপুর", "কাহালু", "নন্দীগ্রাম", "শেরপুর", "ধুনট", "আদমদীঘি", "দুপচাঁচিয়া"],
    "খুলনা": ["খুলনা সদর", "সোনাডাঙ্গা", "খালিশপুর", "দৌলতপুর", "খানজাহান আলী", "ডুমুরিয়া", "বটিয়াঘাটা", "রূপসা", "তেরখাদা", "ফুলতলা", "দিঘলিয়া", "কয়রা", "পাইকগাছা", "দাকোপ"],
    "বরিশাল": ["বরিশাল সদর", "বাকেরগঞ্জ", "বাবুগঞ্জ", "উজিরপুর", "বানারীপাড়া", "গৌরনদী", "আগৈলঝাড়া", "মেহেন্দীগঞ্জ", "মুলাদী", "হিজলা"],
    "সিলেট": ["সিলেট সদর", "দক্ষিণ সুরমা", "গোলাপগঞ্জ", "ফেঞ্চুগঞ্জ", "বিয়ানীবাজার", "জকিগঞ্জ", "কানাইঘাট", "জৈন্তাপুর", "গোয়াইনঘাট", "কোম্পানীগঞ্জ", "বালাগঞ্জ"],
    "চট্টগ্রাম": ["কোতোয়ালী", "পাঁচলাইশ", "পাহাড়তলী", "হালিশহর", "খুলশী", "বাকলিয়া", "সীতাকুণ্ড", "মীরসরাই", "পটিয়া", "হাটহাজারী", "রাউজান", "ফটিকছড়ি", "বোয়ালখালী", "আনোয়ারা", "চন্দনাইশ"],
    "গাজীপুর": ["গাজীপুর সদর", "টঙ্গী", "কালিয়াকৈর", "শ্রীপুর", "কাপাসিয়া", "কালীগঞ্জ"],
    "নারায়ণগঞ্জ": ["নারায়ণগঞ্জ সদর", "বন্দর", "সোনারগাঁও", "রূপগঞ্জ", "আড়াইহাজার"],
    "রংপুর": ["রংপুর সদর", "পীরগঞ্জ", "পীরগাছা", "কাউনিয়া", "গঙ্গাচড়া", "তারাগঞ্জ", "বদরগঞ্জ", "মিঠাপুকুর"],
    "ময়মনসিংহ": ["ময়মনসিংহ সদর", "মুক্তাগাছা", "ফুলবাড়িয়া", "ত্রিশাল", "ভালুকা", "গফরগাঁও", "নান্দাইল", "ঈশ্বরগঞ্জ", "গৌরীপুর", "ফুলপুর", "তারাকান্দা", "ধোবাউড়া", "হালুয়াঘাট"],
    "ফরিদপুর": ["ফরিদপুর সদর", "বোয়ালমারী", "মধুখালী", "আলফাডাঙ্গা", "ভাঙ্গা", "নগরকান্দা", "চরভদ্রাসন", "সদরপুর", "সালথা"],
    "রাজবাড়ী": ["রাজবাড়ী সদর", "গোয়ালন্দ", "পাংশা", "বালিয়াকান্দি", "কালুখালী"],
    "মাগুরা": ["মাগুরা সদর", "শ্রীপুর", "মহম্মদপুর", "শালিখা"],
    "নড়াইল": ["নড়াইল সদর", "লোহাগড়া", "কালিয়া"],
    "অন্যান্য": ["সদর / স্থানীয় থানা"]
  };

  /* ========= HELPERS ========= */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const taka = (n) => '৳ ' + Number(n || 0).toLocaleString('en-BD');
  const products = () => (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS) ? PRODUCTS : []);
  const find = (id) => products().find((p) => p.id === id);

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { }
  }

  /* ========= STATE ========= */
  let cart = readJSON(CART_KEY, {});
  Object.keys(cart).forEach((id) => {
    const p = find(id);
    if (!p || !p.stock || !(cart[id] > 0)) delete cart[id];
  });

  let view = 'cart';
  let isOpen = false;
  let sending = false;
  let lastOrder = null;
  let draft = Object.assign({ 
    name: '', 
    phone: '', 
    district: '', 
    thana: '', 
    address: '', 
    note: '',
    payMethod: 'cod', // 'cod' অথবা 'mfs'
    trxId: ''
  }, readJSON(CUSTOMER_KEY, {}));
  draft.note = '';

  const lines = () => Object.keys(cart).map((id) => ({ p: find(id), qty: cart[id] })).filter((x) => x.p);
  const count = () => lines().reduce((s, x) => s + x.qty, 0);
  const subtotal = () => lines().reduce((s, x) => s + x.p.price * x.qty, 0);

  const deliveryFee = () => {
    if (!draft.district) return 0;
    return draft.district === 'কুষ্টিয়া' ? CFG.DELIVERY_INSIDE_KUSHTIA : CFG.DELIVERY_OUTSIDE_KUSHTIA;
  };

  const grandTotal = () => subtotal() + deliveryFee();

  const savings = () => lines().reduce((s, x) => {
    const oldP = Number(x.p.oldPrice || 0);
    const curP = Number(x.p.price || 0);
    return s + (oldP > curP ? (oldP - curP) * x.qty : 0);
  }, 0);

  /* ========= STYLES ========= */
  const style = document.createElement('style');
  style.textContent = `
  @keyframes rjc-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .rjc-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2.5px solid rgba(3, 19, 12, 0.25);
    border-top-color: #03130c;
    border-radius: 50%;
    animation: rjc-spin 0.75s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }
  .rjc-overlay{position:fixed;inset:0;background:rgba(2,6,14,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .2s;z-index:80}
  .rjc-overlay.open{opacity:1;pointer-events:auto}
  .rjc-drawer{position:fixed;top:0;right:0;height:100%;height:100dvh;width:min(440px,100%);transform:translateX(100%);transition:transform .25s ease;z-index:90;display:flex;flex-direction:column;background:#06111f;border-left:1px solid rgba(56,189,248,.18);color:#f1f5f9;font-family:system-ui,-apple-system,"Segoe UI","Noto Sans Bengali",sans-serif}
  .rjc-drawer.open{transform:none}
  .rjc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(148,163,184,.14)}
  .rjc-head h2{margin:0;font-size:18px;font-weight:900}
  .rjc-icon{width:38px;height:38px;border-radius:12px;border:1px solid rgba(148,163,184,.2);background:transparent;color:#cbd5e1;font-size:18px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
  .rjc-icon:hover{border-color:rgba(34,211,238,.5);color:#67e8f9}
  .rjc-body{flex:1;overflow-y:auto;padding:14px 18px;-webkit-overflow-scrolling:touch}
  .rjc-foot{padding:14px 18px calc(14px + env(safe-area-inset-bottom,0px));border-top:1px solid rgba(148,163,184,.14);background:rgba(3,9,20,.6)}
  .rjc-line{display:grid;grid-template-columns:64px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid rgba(148,163,184,.1)}
  .rjc-line:last-child{border-bottom:0}
  .rjc-thumb{width:64px;height:64px;border-radius:12px;background:#0a2138;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:24px}
  .rjc-thumb img{width:100%;height:100%;object-fit:cover}
  .rjc-name{font-size:13px;font-weight:700;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#f1f5f9;text-decoration:none}
  .rjc-unit{font-size:12px;color:#94a3b8;margin-top:2px;display:flex;gap:6px;align-items:baseline}
  .rjc-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}
  .rjc-linetotal{font-weight:900;color:#67e8f9;font-size:15px}
  .rjc-remove{background:none;border:0;color:#94a3b8;font-size:12px;cursor:pointer;padding:4px}
  .rjc-remove:hover{color:#fb7185}
  .rjc-step{display:inline-flex;align-items:center;border:1px solid rgba(34,211,238,.35);border-radius:12px;overflow:hidden;background:rgba(34,211,238,.06);width:100%;justify-content:space-between}
  .rjc-step button{width:40px;height:38px;border:0;background:transparent;color:#67e8f9;font-size:20px;font-weight:800;cursor:pointer}
  .rjc-step button:hover{background:rgba(34,211,238,.14)}
  .rjc-step span{font-weight:900;font-size:14px;min-width:28px;text-align:center}
  .rjc-line .rjc-step{width:auto}
  .rjc-line .rjc-step button{width:34px;height:32px}
  .rjc-btn{display:block;width:100%;border:0;border-radius:12px;padding:10px 12px;font-weight:800;font-size:13px;cursor:pointer;text-align:center;font-family:inherit;transition:filter .15s,transform .1s}
  .rjc-btn:active{transform:scale(.98)}
  .rjc-btn:hover{filter:brightness(1.1)}
  .rjc-btn-add{background:linear-gradient(135deg,#0891b2,#2563eb);color:#fff}
  .rjc-btn-order{background:linear-gradient(135deg,#10b981,#22c55e);color:#03130c;padding:14px;font-size:15px;font-weight:900}
  .rjc-btn-ghost{background:transparent;border:1px solid rgba(148,163,184,.3);color:#e2e8f0}
  .rjc-btn-off{background:rgba(148,163,184,.12);color:#64748b;cursor:not-allowed}
  .rjc-btn[disabled]{opacity:.6;cursor:not-allowed;filter:none}
  [data-size="lg"] .rjc-btn{padding:14px;font-size:15px;border-radius:16px}
  [data-size="lg"] .rjc-step{border-radius:16px}
  [data-size="lg"] .rjc-step button{height:48px;width:52px}
  .rjc-sum{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
  .rjc-sum b{font-size:22px;color:#67e8f9;font-weight:900}
  .rjc-savebox{display:flex;align-items:center;justify-content:space-between;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);color:#34d399;font-size:12px;font-weight:800;padding:6px 10px;border-radius:8px;margin-bottom:10px}
  .rjc-hint{font-size:12px;color:#94a3b8;line-height:1.6;margin-bottom:12px}
  .rjc-field{margin-bottom:14px}
  .rjc-field label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:#cbd5e1}
  .rjc-input{width:100%;background:rgba(8,22,40,.9);border:1px solid rgba(148,163,184,.22);border-radius:12px;padding:12px 14px;color:#f1f5f9;font-size:15px;font-family:inherit}
  .rjc-input:focus{outline:none;border-color:rgba(34,211,238,.65);box-shadow:0 0 0 3px rgba(34,211,238,.1)}
  .rjc-input.bad{border-color:#fb7185}
  .rjc-err{color:#fb7185;font-size:12px;margin-top:4px;display:none}
  .rjc-input.bad + .rjc-err{display:block}
  .rjc-formerr{background:rgba(251,113,133,.1);border:1px solid rgba(251,113,133,.35);color:#fda4af;border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.6;margin-bottom:12px}
  .rjc-mini{border:1px solid rgba(148,163,184,.14);border-radius:12px;padding:10px 12px;margin-bottom:16px;font-size:13px}
  .rjc-mini div{display:flex;justify-content:space-between;gap:10px;padding:3px 0;color:#cbd5e1}
  .rjc-mini div span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rjc-mini .t{border-top:1px solid rgba(148,163,184,.14);margin-top:6px;padding-top:8px;font-weight:900;color:#67e8f9}
  .rjc-hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}
  .rjc-empty,.rjc-done{text-align:center;padding:56px 12px}
  .rjc-empty .em,.rjc-done .em{font-size:52px;margin-bottom:12px}
  .rjc-empty p,.rjc-done p{color:#94a3b8;font-size:14px;line-height:1.7;margin:8px 0 0}
  .rjc-oid{display:inline-block;margin-top:14px;padding:8px 14px;border-radius:10px;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.3);color:#67e8f9;font-weight:900;letter-spacing:.5px}
  .rjc-bar{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translate(-50%,140%);z-index:70;display:flex;align-items:center;gap:12px;width:min(520px,calc(100% - 24px));padding:12px 16px;border:1px solid rgba(103,232,249,.5);border-radius:18px;background:linear-gradient(135deg,#0891b2,#2563eb);color:#fff;font-weight:800;font-size:14px;box-shadow:0 12px 40px rgba(0,0,0,.45);cursor:pointer;transition:transform .25s ease;font-family:system-ui,-apple-system,"Segoe UI","Noto Sans Bengali",sans-serif}
  .rjc-bar.show{transform:translate(-50%,0)}
  .rjc-bar .grow{flex:1;text-align:left}
  .rjc-bar .price{font-weight:900}
  .rjc-toast{position:fixed;left:50%;top:78px;transform:translate(-50%,-20px);opacity:0;pointer-events:none;z-index:95;background:#0b1f36;border:1px solid rgba(34,211,238,.5);color:#e0f2fe;padding:10px 16px;border-radius:12px;font-size:13px;font-weight:700;transition:all .22s ease;max-width:calc(100% - 24px);font-family:system-ui,-apple-system,"Segoe UI","Noto Sans Bengali",sans-serif}
  .rjc-toast.show{opacity:1;transform:translate(-50%,0)}
  .rjc-badge{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#22d3ee;color:#03131c;font-size:11px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;line-height:1}
  @media (prefers-reduced-motion:reduce){.rjc-drawer,.rjc-overlay,.rjc-bar,.rjc-toast{transition:none}}
  `;
  document.head.appendChild(style);

  /* ========= DOM ========= */
  const overlay = document.createElement('div');
  overlay.className = 'rjc-overlay';
  const drawer = document.createElement('aside');
  drawer.className = 'rjc-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'কার্ট');
  drawer.innerHTML = '<div class="rjc-head"></div><div class="rjc-body"></div><div class="rjc-foot"></div>';
  const bar = document.createElement('button');
  bar.type = 'button';
  bar.className = 'rjc-bar';
  bar.setAttribute('data-cart-open', '');
  const toast = document.createElement('div');
  toast.className = 'rjc-toast';
  toast.setAttribute('role', 'status');

  function mount() {
    document.body.append(overlay, drawer, bar, toast);
    renderAll();
  }

  const elHead = () => drawer.children[0];
  const elBody = () => drawer.children[1];
  const elFoot = () => drawer.children[2];

  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
  }

  function actionsHTML(id, size) {
    const p = find(id);
    if (!p) return '';
    if (!p.stock) return '<button type="button" disabled class="rjc-btn rjc-btn-off">স্টক শেষ</button>';
    const q = cart[id] || 0;
    if (!q) return '<button type="button" data-cart-add="' + esc(id) + '" class="rjc-btn rjc-btn-add">কার্টে যোগ করুন</button>';
    return '<div class="rjc-step"><button type="button" data-cart-dec="' + esc(id) + '" aria-label="কমান">−</button><span>' + q + '</span><button type="button" data-cart-inc="' + esc(id) + '" aria-label="বাড়ান">+</button></div>';
  }

  function refreshActions() {
    document.querySelectorAll('[data-cart-actions]').forEach((el) => {
      el.innerHTML = actionsHTML(el.getAttribute('data-cart-actions'), el.dataset.size);
    });
  }

  function refreshBadges() {
    const n = count();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = n;
      el.style.display = n ? 'inline-flex' : 'none';
    });
    bar.innerHTML = '<span aria-hidden="true">🛒</span><span class="grow">' + n + 'টি পণ্য · <span class="price">' + taka(subtotal()) + '</span></span><span>কার্ট দেখুন</span>';
    bar.classList.toggle('show', n > 0 && !isOpen);
  }

  function renderCart() {
    const list = lines();
    elHead().innerHTML = '<h2>আপনার কার্ট</h2><button type="button" class="rjc-icon" data-cart-close aria-label="বন্ধ করুন">✕</button>';

    if (!list.length) {
      elBody().innerHTML = '<div class="rjc-empty"><div class="em">🛒</div><b>কার্ট খালি আছে</b><p>পছন্দের পণ্য কার্টে যোগ করুন, তারপর একসাথে অর্ডার দিন।</p></div>';
      elFoot().innerHTML = '<button type="button" class="rjc-btn rjc-btn-ghost" data-cart-close style="padding:13px;font-size:14px">কেনাকাটা করুন</button>';
      return;
    }

    elBody().innerHTML = list.map(({ p, qty }) => {
      const img = p.images && p.images[0];
      const hasOldPrice = p.oldPrice && p.oldPrice > p.price;
      const oldPriceHTML = hasOldPrice ? '<span style="text-decoration:line-through;color:#64748b;font-size:11px">' + taka(p.oldPrice) + '</span>' : '';

      return '<div class="rjc-line">' +
        '<div class="rjc-thumb">' + (img ? '<img src="' + esc(img) + '" alt="" onerror="this.remove()">' : '📦') + '</div>' +
        '<div><a class="rjc-name" href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a>' +
        '<div class="rjc-unit">' + oldPriceHTML + '<span>' + taka(p.price) + (p.unit ? ' / ' + esc(p.unit) : '') + '</span></div>' +
        '<div class="rjc-row"><div class="rjc-step"><button type="button" data-cart-dec="' + esc(p.id) + '" aria-label="কমান">−</button><span>' + qty + '</span><button type="button" data-cart-inc="' + esc(p.id) + '" aria-label="বাড়ান">+</button></div>' +
        '<span class="rjc-linetotal">' + taka(p.price * qty) + '</span></div>' +
        '<button type="button" class="rjc-remove" data-cart-remove="' + esc(p.id) + '">মুছে ফেলুন</button></div></div>';
    }).join('');

    const savedAmount = savings();
    const savingsHTML = savedAmount > 0 
      ? '<div class="rjc-savebox"><span>🎉 আপনার মোট সাশ্রয় হচ্ছে:</span><span>' + taka(savedAmount) + '</span></div>' 
      : '';

    elFoot().innerHTML =
      savingsHTML +
      '<div class="rjc-sum"><span>সাবটোটাল (' + count() + 'টি পণ্য)</span><b>' + taka(subtotal()) + '</b></div>' +
      '<div class="rjc-hint">ডেলিভারি চার্জ: কুষ্টিয়া জেলায় ফ্রি, অন্য জেলায় ৳ ' + CFG.DELIVERY_OUTSIDE_KUSHTIA + '।</div>' +
      '<button type="button" class="rjc-btn rjc-btn-order" data-cart-checkout>অর্ডার করতে এগিয়ে যান</button>';
  }

  function fieldHTML(id, label, input, err) {
    return '<div class="rjc-field"><label for="' + id + '">' + label + '</label>' + input + '<div class="rjc-err">' + err + '</div></div>';
  }

  function populateThanas(districtName, selectedThana) {
    const thanaSelect = document.getElementById('rjcThana');
    if (!thanaSelect) return;
    
    const thanas = BD_GEO[districtName] || [];
    if (!thanas.length) {
      thanaSelect.innerHTML = '<option value="">প্রথমে জেলা নির্বাচন করুন</option>';
      thanaSelect.disabled = true;
      return;
    }

    thanaSelect.disabled = false;
    thanaSelect.innerHTML = '<option value="">থানা / উপজেলা নির্বাচন করুন</option>' +
      thanas.map(t => `<option value="${t}" ${t === selectedThana ? 'selected' : ''}>${t}</option>`).join('');
  }

  function renderCheckout() {
    const list = lines();
    elHead().innerHTML = '<button type="button" class="rjc-icon" data-cart-back aria-label="ফিরে যান">←</button><h2 style="flex:1">অর্ডারের তথ্য</h2><button type="button" class="rjc-icon" data-cart-close aria-label="বন্ধ করুন">✕</button>';

    const savedAmount = savings();
    const saveRow = savedAmount > 0 
      ? '<div style="color:#34d399;font-weight:700"><span>মোট ছাড় (ডিসকাউন্ট)</span><span>-' + taka(savedAmount) + '</span></div>' 
      : '';

    const currentFee = deliveryFee();
    const feeText = draft.district ? (currentFee === 0 ? 'ফ্রি' : taka(currentFee)) : 'জেলা নির্বাচন করুন';

    const mini = '<div class="rjc-mini">' +
      list.map(({ p, qty }) => '<div><span>' + esc(p.name) + ' × ' + qty + '</span><span>' + taka(p.price * qty) + '</span></div>').join('') +
      saveRow +
      '<div><span>পণ্যের সাবটোটাল</span><span>' + taka(subtotal()) + '</span></div>' +
      '<div><span>ডেলিভারি চার্জ</span><span id="rjcDeliveryFeeText" style="font-weight:700;color:' + (currentFee === 0 && draft.district ? '#34d399' : '#cbd5e1') + '">' + feeText + '</span></div>' +
      '<div class="t"><span>পরিশোধযোগ্য সর্বমোট</span><span id="rjcGrandTotalText">' + taka(grandTotal()) + '</span></div></div>';

    const districtOptions = Object.keys(BD_GEO).map(d => 
      `<option value="${d}" ${d === draft.district ? 'selected' : ''}>${d}</option>`
    ).join('');

    const districtThanaHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div>
          <label for="rjcDistrict" style="display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:#cbd5e1">জেলা</label>
          <select class="rjc-input" id="rjcDistrict" name="district" style="background:#081628">
            <option value="">জেলা নির্বাচন করুন</option>
            ${districtOptions}
          </select>
          <div class="rjc-err">জেলা নির্বাচন করুন</div>
        </div>
        <div>
          <label for="rjcThana" style="display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:#cbd5e1">থানা / উপজেলা</label>
          <select class="rjc-input" id="rjcThana" name="thana" style="background:#081628">
            <option value="">প্রথমে জেলা নির্বাচন করুন</option>
          </select>
          <div class="rjc-err">থানা নির্বাচন করুন</div>
        </div>
      </div>
    `;

    // পেমেন্ট মেথড (COD vs bKash/Nagad) সিলেকশন UI
    const isMFS = draft.payMethod === 'mfs';
    const payMethodHTML = `
      <div style="margin-bottom:16px">
        <label style="display:block;font-size:13px;font-weight:700;margin-bottom:8px;color:#cbd5e1">পেমেন্ট মেথড নির্বাচন করুন</label>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label style="display:flex;align-items:center;gap:8px;padding:12px;border-radius:12px;border:1px solid ${!isMFS ? 'rgba(34,211,238,.6)' : 'rgba(148,163,184,.2)'};background:${!isMFS ? 'rgba(34,211,238,.08)' : 'rgba(8,22,40,.6)'};cursor:pointer">
            <input type="radio" name="payMethod" value="cod" ${!isMFS ? 'checked' : ''} style="accent-color:#22d3ee">
            <span style="font-size:13px;font-weight:700">ক্যাশ অন ডেলিভারি</span>
          </label>

          <label style="display:flex;align-items:center;gap:8px;padding:12px;border-radius:12px;border:1px solid ${isMFS ? 'rgba(236,72,153,.6)' : 'rgba(148,163,184,.2)'};background:${isMFS ? 'rgba(236,72,153,.08)' : 'rgba(8,22,40,.6)'};cursor:pointer">
            <input type="radio" name="payMethod" value="mfs" ${isMFS ? 'checked' : ''} style="accent-color:#ec4899">
            <span style="font-size:13px;font-weight:700">বিকাশ / নগদ</span>
          </label>
        </div>

        <div id="rjcMfsBox" style="display:${isMFS ? 'block' : 'none'};margin-top:12px;padding:14px;border-radius:12px;background:rgba(236,72,153,.06);border:1px solid rgba(236,72,153,.25)">
          <div style="font-size:12px;line-height:1.6;color:#cbd5e1;margin-bottom:10px">
            📌 নিচের নম্বরে সেন্ড মানি (Send Money) করে প্রাপ্ত Transaction ID দিন:<br>
            বিকাশ / নগদ (Personal): <b style="color:#f472b6;font-size:14px">${CFG.MFS_NUMBER}</b>
          </div>
          <label for="rjcTrxId" style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:#f472b6">ট্রানজেকশন আইডি (TrxID)</label>
          <input class="rjc-input" id="rjcTrxId" name="trxId" type="text" placeholder="যেমন: CLG98X4Z" value="${esc(draft.trxId)}" style="text-transform:uppercase">
          <div class="rjc-err">সঠিক ট্রানজেকশন আইডি দিন</div>
        </div>
      </div>
    `;

    elBody().innerHTML = mini +
      '<form id="rjcForm" novalidate autocomplete="on">' +
      '<input class="rjc-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      fieldHTML('rjcName', 'আপনার নাম', '<input class="rjc-input" id="rjcName" name="name" type="text" autocomplete="name" placeholder="যেমন: আর এস বিডি সফট " value="' + esc(draft.name) + '">', 'নাম লিখুন') +
      fieldHTML('rjcPhone', 'মোবাইল নম্বর', '<input class="rjc-input" id="rjcPhone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="01615450447" value="' + esc(draft.phone) + '">', 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (01XXXXXXXXX)') +
      districtThanaHTML +
      fieldHTML('rjcAddress', 'বিস্তারিত ডেলিভারি ঠিকানা', '<textarea class="rjc-input" id="rjcAddress" name="address" rows="2" autocomplete="street-address" placeholder="গ্রাম/মহল্লা, বাজার, রোড নম্বর">' + esc(draft.address) + '</textarea>', 'পুরো ঠিকানা লিখুন') +
      payMethodHTML +
      fieldHTML('rjcNote', 'নোট (ঐচ্ছিক)', '<input class="rjc-input" id="rjcNote" name="note" type="text" placeholder="কিছু জানানোর থাকলে" value="' + esc(draft.note) + '">', '') +
      '<div id="rjcFormErr" class="rjc-formerr" style="display:none;margin-top:12px"></div>' +
      '</form>';

    elFoot().innerHTML = '<button type="submit" form="rjcForm" id="rjcSubmit" class="rjc-btn rjc-btn-order">অর্ডার কনফার্ম করুন · <span id="rjcBtnTotal">' + taka(grandTotal()) + '</span></button>';

    if (draft.district) {
      populateThanas(draft.district, draft.thana);
    }
  }

  function renderSuccess() {
    elHead().innerHTML = '<h2>অর্ডার সম্পন্ন</h2><button type="button" class="rjc-icon" data-cart-close aria-label="বন্ধ করুন">✕</button>';
    const payMethodTitle = lastOrder.payMethod === 'mfs' ? 'বিকাশ / নগদ' : 'ক্যাশ অন ডেলিভারি';
    elBody().innerHTML = '<div class="rjc-done"><div class="em">✅</div><b style="font-size:20px">ধন্যবাদ! অর্ডার পাঠানো হয়েছে</b>' +
      '<div class="rjc-oid">' + esc(lastOrder.id) + '</div>' +
      '<p>আমাদের প্রতিনিধি শীঘ্রই আপনার নম্বরে কল করে অর্ডার কনফার্ম করবেন।<br>পেমেন্ট: ' + payMethodTitle + ' · সর্বমোট ' + taka(lastOrder.total) + '</p>' +
      '<a href="track.html?id=' + encodeURIComponent(lastOrder.id) + '" class="rjc-btn rjc-btn-add" style="margin-top:16px;text-decoration:none">অর্ডার ট্র্যাক করুন →</a>' +
      '<p style="margin-top:14px">জরুরি প্রয়োজনে কল করুন: <a href="tel:' + CFG.HOTLINE.replace(/-/g, '') + '" style="color:#67e8f9;font-weight:800">' + CFG.HOTLINE + '</a></p></div>';
    elFoot().innerHTML = '<button type="button" class="rjc-btn rjc-btn-ghost" data-cart-close style="padding:13px;font-size:14px">কেনাকাটা চালিয়ে যান</button>';
  }

  function renderDrawer() {
    if (view === 'checkout' && !lines().length) view = 'cart';
    if (view === 'success') renderSuccess();
    else if (view === 'checkout') renderCheckout();
    else renderCart();
  }

  function renderAll() {
    refreshBadges();
    refreshActions();
    if (isOpen) renderDrawer();
  }

  function commit() {
    writeJSON(CART_KEY, cart);
    renderAll();
    document.dispatchEvent(new CustomEvent('cart:change'));
  }

  function add(id, n) {
    const p = find(id);
    if (!p || !p.stock) return;
    const first = !cart[id];
    cart[id] = Math.min(CFG.MAX_QTY, (cart[id] || 0) + (n || 1));
    commit();
    if (first) showToast('কার্টে যোগ হয়েছে ✓');
  }
  function setQty(id, q) {
    if (q <= 0) delete cart[id];
    else cart[id] = Math.min(CFG.MAX_QTY, q);
    commit();
  }
  function remove(id) { delete cart[id]; commit(); }
  function clear() { cart = {}; commit(); }

  function open(v) {
    view = v || 'cart';
    isOpen = true;
    renderDrawer();
    refreshBadges();
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    isOpen = false;
    if (view === 'success') view = 'cart';
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    refreshBadges();
  }

  function normalizePhone(v) {
    let d = String(v || '').replace(/[^\d+]/g, '');
    d = d.replace(/^\+?880/, '0');
    return d;
  }
  const phoneOk = (v) => /^01[3-9]\d{8}$/.test(v);

  function makeOrderId() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'KT' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + rand;
  }

  function buildMessage(o) {
    const when = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: true });
    const rows = o.lines.map((l, i) => {
      const unitStr = l.p.unit ? ' / ' + esc(l.p.unit) : '';
      return (i + 1) + '. ' + esc(l.p.name) + '\n    ' + l.qty + ' × ' + taka(l.p.price) + unitStr + ' = <b>' + taka(l.p.price * l.qty) + '</b>';
    }).join('\n');

    const saveText = o.saved > 0 ? '🎉 <b>মোট ছাড় পেয়েছেন: ' + taka(o.saved) + '</b>\n' : '';
    const feeText = o.deliveryFee === 0 ? 'ফ্রি (৳ ০)' : taka(o.deliveryFee);
    const payText = o.payMethod === 'mfs' 
      ? `বিকাশ / নগদ (TrxID: <code>${esc(o.trxId)}</code>)` 
      : 'ক্যাশ অন ডেলিভারি (Cash on Delivery)';

    let msg =
      '🛒 <b>নতুন স্টোর অর্ডার #' + o.id + '</b>\n\n' +
      '👤 নাম: ' + esc(o.name) + '\n' +
      '📞 ফোন: ' + esc(o.phone) + '\n' +
      '🏙️ জেলা: ' + esc(o.district) + '\n' +
      '🏢 থানা: ' + esc(o.thana) + '\n' +
      '📍 বিস্তারিত ঠিকানা: ' + esc(o.address) + '\n' +
      (o.note ? '📝 নোট: ' + esc(o.note) + '\n' : '') +
      '\n📦 <b>পণ্য তালিকা:</b>\n' + rows + '\n\n' +
      saveText +
      '💵 পণ্যের সাবটোটাল: ' + taka(o.subtotal) + '\n' +
      '🚚 ডেলিভারি চার্জ: ' + feeText + '\n' +
      '💰 <b>পরিশোধযোগ্য সর্বমোট: ' + taka(o.total) + '</b>\n' +
      '💳 <b>পেমেন্ট মোড:</b> ' + payText + '\n' +
      '🕒 সময়: ' + when;
    if (msg.length > 3900) msg = msg.slice(0, 3850) + '\n… (মেসেজ ছোট করা হয়েছে)';
    return msg;
  }

  async function sendToTelegram(text) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(CFG.TELEGRAM_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(CFG.buildPayload(text)),
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } finally {
      clearTimeout(timer);
    }
  }

  async function sendToGoogleSheet(order) {
    try {
      const itemsSummary = order.lines.map(l => `${l.p.name} (x${l.qty})`).join(', ');
      const payload = {
        orderId: order.id,
        name: order.name,
        phone: order.phone,
        address: order.address,
        thana: order.thana,
        district: order.district,
        items: itemsSummary,
        total: order.total,
        payMethod: order.payMethod === 'mfs' ? `bKash/Nagad (Trx: ${order.trxId})` : 'COD'
      };

      await fetch(CFG.GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Google Sheet save error:', err);
    }
  }

  async function onSubmit(form) {
    if (sending) return;
    const fd = new FormData(form);
    if (fd.get('website')) return;

    const name = String(fd.get('name') || '').trim();
    const phone = normalizePhone(fd.get('phone'));
    const district = String(fd.get('district') || '').trim();
    const thana = String(fd.get('thana') || '').trim();
    const address = String(fd.get('address') || '').trim();
    const payMethod = String(fd.get('payMethod') || 'cod');
    const trxId = String(fd.get('trxId') || '').trim().toUpperCase();
    const note = String(fd.get('note') || '').trim().slice(0, 300);

    draft = { 
      name, 
      phone: String(fd.get('phone') || '').trim(), 
      district, 
      thana, 
      address, 
      payMethod,
      trxId,
      note 
    };

    const errBox = form.querySelector('#rjcFormErr');
    errBox.style.display = 'none';

    const checks = [
      ['name', name.length >= 2],
      ['phone', phoneOk(phone)],
      ['district', district.length > 0],
      ['thana', thana.length > 0],
      ['address', address.length >= 5]
    ];

    if (payMethod === 'mfs') {
      checks.push(['trxId', trxId.length >= 6]);
    }

    let firstBad = null;
    checks.forEach(([field, ok]) => {
      const el = form.elements[field];
      if (el) {
        el.classList.toggle('bad', !ok);
        if (!ok && !firstBad) firstBad = el;
      }
    });
    if (firstBad) { firstBad.focus(); return; }

    const list = lines();
    if (!list.length) { view = 'cart'; renderDrawer(); return; }

    const since = Date.now() - Number(localStorage.getItem(LAST_ORDER_KEY) || 0);
    if (since < CFG.COOLDOWN_MS) {
      errBox.textContent = 'একটু অপেক্ষা করে আবার চেষ্টা করুন।';
      errBox.style.display = 'block';
      return;
    }

    const order = { 
      id: makeOrderId(), 
      name, 
      phone, 
      district, 
      thana, 
      address, 
      payMethod,
      trxId,
      note, 
      lines: list,
      subtotal: subtotal(),
      deliveryFee: deliveryFee(),
      total: grandTotal(),
      saved: savings()
    };

    const btn = document.getElementById('rjcSubmit');
    const btnContent = btn.innerHTML;
    sending = true;
    btn.disabled = true;
    btn.style.cursor = 'not-allowed';
    btn.style.opacity = '0.85';
    btn.innerHTML = '<span class="rjc-spinner"></span> অর্ডার পাঠানো হচ্ছে...';

    try {
      await Promise.all([
        sendToTelegram(buildMessage(order)),
        sendToGoogleSheet(order)
      ]);

      try { localStorage.setItem(LAST_ORDER_KEY, String(Date.now())); } catch (e) {}
      writeJSON(CUSTOMER_KEY, { 
        name: name, 
        phone: draft.phone, 
        district: district, 
        thana: thana, 
        address: address 
      });
      lastOrder = { id: order.id, total: order.total, payMethod: order.payMethod };
      draft.note = '';
      draft.trxId = '';
      sending = false;
      view = 'success';
      clear();
    } catch (err) {
      sending = false;
      btn.disabled = false;
      btn.style.cursor = '';
      btn.style.opacity = '';
      btn.innerHTML = btnContent;
      errBox.innerHTML = 'অর্ডার পাঠানো যায়নি। ইন্টারনেট চেক করুন অথবা কল করুন: <a href="tel:' + CFG.HOTLINE.replace(/-/g, '') + '" style="color:#67e8f9;font-weight:800">' + CFG.HOTLINE + '</a>';
      errBox.style.display = 'block';
      console.error('Order send failed:', err);
    }
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cart-add],[data-cart-inc],[data-cart-dec],[data-cart-remove],[data-cart-open],[data-cart-close],[data-cart-checkout],[data-cart-back]');
    if (!t) return;
    if (t.hasAttribute('data-cart-add')) { add(t.getAttribute('data-cart-add')); return; }
    if (t.hasAttribute('data-cart-inc')) { const id = t.getAttribute('data-cart-inc'); setQty(id, (cart[id] || 0) + 1); return; }
    if (t.hasAttribute('data-cart-dec')) { const id = t.getAttribute('data-cart-dec'); setQty(id, (cart[id] || 0) - 1); return; }
    if (t.hasAttribute('data-cart-remove')) { remove(t.getAttribute('data-cart-remove')); return; }
    if (t.hasAttribute('data-cart-open')) { e.preventDefault(); open('cart'); return; }
    if (t.hasAttribute('data-cart-close')) { close(); return; }
    if (t.hasAttribute('data-cart-checkout')) { view = 'checkout'; renderDrawer(); elBody().scrollTop = 0; return; }
    if (t.hasAttribute('data-cart-back')) { view = 'cart'; renderDrawer(); return; }
  });

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) close(); });

  drawer.addEventListener('submit', (e) => {
    if (e.target.id === 'rjcForm') { e.preventDefault(); onSubmit(e.target); }
  });

  drawer.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.form || el.form.id !== 'rjcForm') return;
    el.classList.remove('bad');
    if (el.name in draft) draft[el.name] = el.value;
  });

  drawer.addEventListener('change', (e) => {
    const el = e.target;
    if (!el.form || el.form.id !== 'rjcForm') return;
    el.classList.remove('bad');

    if (el.name === 'payMethod') {
      draft.payMethod = el.value;
      renderCheckout();
      return;
    }

    if (el.name === 'district') {
      draft.district = el.value;
      draft.thana = '';
      populateThanas(el.value, '');

      const feeEl = document.getElementById('rjcDeliveryFeeText');
      const totalEl = document.getElementById('rjcGrandTotalText');
      const btnTotalEl = document.getElementById('rjcBtnTotal');

      const currentFee = deliveryFee();
      if (feeEl) {
        feeEl.textContent = el.value ? (currentFee === 0 ? 'ফ্রি' : taka(currentFee)) : 'জেলা নির্বাচন করুন';
        feeEl.style.color = (currentFee === 0 && el.value) ? '#34d399' : '#cbd5e1';
      }
      if (totalEl) totalEl.textContent = taka(grandTotal());
      if (btnTotalEl) btnTotalEl.textContent = taka(grandTotal());
    } else if (el.name in draft) {
      draft[el.name] = el.value;
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key !== CART_KEY) return;
    cart = readJSON(CART_KEY, {});
    renderAll();
    document.dispatchEvent(new CustomEvent('cart:change'));
  });

  window.Cart = {
    add: add,
    setQty: setQty,
    remove: remove,
    clear: clear,
    qty: (id) => cart[id] || 0,
    count: count,
    total: subtotal,
    grandTotal: grandTotal,
    savings: savings,
    deliveryFee: deliveryFee,
    open: open,
    close: close,
    refreshActions: refreshActions,
    buyNow: function (id) {
      const p = find(id);
      if (!p || !p.stock) return;
      if (!cart[id]) { cart[id] = 1; commit(); }
      open('checkout');
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();