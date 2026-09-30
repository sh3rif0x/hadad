(function () {
  if (window.__sharePopup) return;
  window.__sharePopup = true;

  var css = [
    '.gl-zoom,.gl-share{position:absolute!important;right:12px!important;left:auto!important;bottom:auto!important;width:38px!important;height:38px!important;display:grid!important;place-items:center;z-index:5;border:0;border-radius:50%;background:rgba(20,28,54,.72);color:#fff;cursor:pointer;backdrop-filter:blur(6px);transition:background .25s,transform .25s}',
    '.gl-zoom{top:12px!important}',
    '.gl-share{top:58px!important}',
    '.gl-zoom:hover,.gl-share:hover{background:var(--color-primary,#dd9a3b);transform:scale(1.1)}',
    '.gl-bar .gl-sbtn:not(:first-child){display:none!important}',
    '.sp-ov{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(10,14,30,.7);backdrop-filter:blur(6px)}',
    '.sp-ov.on{display:flex}',
    '.sp-box{width:min(440px,100%);padding:26px;border-radius:22px;background:#fff;color:#1b2645;direction:rtl;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.45)}',
    '.sp-box h3{margin:0 0 6px;font-size:22px;font-weight:900}',
    '.sp-box p{margin:0 0 18px;color:#5b6479;font-size:14px}',
    '.sp-thumb{width:100%;height:150px;object-fit:cover;border-radius:14px;margin-bottom:20px}',
    '.sp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}',
    '.sp-it{display:flex;flex-direction:column;align-items:center;gap:8px;padding:0;border:0;background:none;color:#1b2645;font:inherit;font-size:12px;font-weight:700;cursor:pointer}',
    '.sp-ic{width:54px;height:54px;display:grid;place-items:center;border-radius:50%;color:#fff;font-weight:900;font-size:15px;transition:transform .25s}',
    '.sp-it:hover .sp-ic{transform:translateY(-4px) scale(1.06)}',
    '.sp-close{margin-top:22px;width:100%;height:46px;border:1px solid #e6e3dc;border-radius:12px;background:#faf9f6;color:#1b2645;font:inherit;font-weight:800;cursor:pointer}',
    '.sp-toast{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);z-index:2147483001;padding:12px 22px;border-radius:30px;background:#1b2645;color:#fff;font-weight:700;font-size:14px}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var PLATFORMS = [
    { k: 'wa', n: 'واتساب', c: '#25d366', t: 'WA', u: function (l, t) { return 'https://wa.me/?text=' + encodeURIComponent(t + ' ' + l); } },
    { k: 'fb', n: 'فيسبوك', c: '#1877f2', t: 'f', u: function (l) { return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(l); } },
    { k: 'ig', n: 'انستجرام', c: 'linear-gradient(45deg,#f9a03f,#e1306c,#833ab4)', t: 'IG', copy: 'https://www.instagram.com/' },
    { k: 'x', n: 'إكس', c: '#000', t: 'X', u: function (l, t) { return 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(l) + '&text=' + encodeURIComponent(t); } },
    { k: 'tg', n: 'تيليجرام', c: '#229ed9', t: 'TG', u: function (l, t) { return 'https://t.me/share/url?url=' + encodeURIComponent(l) + '&text=' + encodeURIComponent(t); } },
    { k: 'pin', n: 'بنترست', c: '#e60023', t: 'P', u: function (l, t) { return 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent(l) + '&media=' + encodeURIComponent(l) + '&description=' + encodeURIComponent(t); } },
    { k: 'in', n: 'لينكدإن', c: '#0a66c2', t: 'in', u: function (l) { return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(l); } },
    { k: 'cp', n: 'نسخ الرابط', c: '#5b6479', t: 'URL', copy: true }
  ];

  var ov = document.createElement('div');
  ov.className = 'sp-ov';
  var html = '<div class="sp-box"><h3>مشاركة الصورة</h3><p>اختر المنصة التي تريد المشاركة عليها</p><img class="sp-thumb" alt=""><div class="sp-grid">';
  PLATFORMS.forEach(function (p) {
    html += '<button type="button" class="sp-it" data-k="' + p.k + '"><span class="sp-ic" style="background:' + p.c + '">' + p.t + '</span>' + p.n + '</button>';
  });
  html += '</div><button type="button" class="sp-close">إغلاق</button></div>';
  ov.innerHTML = html;
  document.body.appendChild(ov);

  var cur = '';
  function toast(m) {
    var t = document.createElement('div');
    t.className = 'sp-toast';
    t.textContent = m;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2400);
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (res) {
      var a = document.createElement('textarea');
      a.value = text; a.style.position = 'fixed'; a.style.opacity = '0';
      document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); res();
    });
  }
  function open(src) {
    cur = new URL(src, location.href).href;
    ov.querySelector('.sp-thumb').src = cur;
    ov.classList.add('on');
  }
  function close() { ov.classList.remove('on'); }

  ov.addEventListener('click', function (e) {
    if (e.target === ov || e.target.closest('.sp-close')) return close();
    var b = e.target.closest('.sp-it');
    if (!b) return;
    var p = PLATFORMS.filter(function (x) { return x.k === b.getAttribute('data-k'); })[0];
    var title = document.title;
    if (p.copy) {
      copy(cur).then(function () {
        toast(p.copy === true ? 'تم نسخ رابط الصورة' : 'تم نسخ الرابط، الصقه في انستجرام');
        if (p.copy !== true) window.open(p.copy, '_blank', 'noopener');
      });
    } else {
      window.open(p.u(cur, title), '_blank', 'noopener');
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  function findImg(el) {
    var stage = el.closest('.gl-stage');
    if (stage && stage.querySelector('img')) return stage.querySelector('img');
    var n = el.parentElement;
    while (n && n !== document.body) {
      var i = n.querySelector('img');
      if (i) return i;
      n = n.parentElement;
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.gl-share, .gl-sbtn');
    if (!b) return;
    var img = findImg(b);
    if (!img) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    open(img.currentSrc || img.src);
  }, true);
})();
