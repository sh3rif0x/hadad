#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const f = (n) => path.join(__dirname, n);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

for (const n of ["index.html", "main.css"]) {
  if (!fs.existsSync(f(n))) { console.error("✖ missing: " + n); process.exit(1); }
  if (!fs.existsSync(f(n) + ".share.bak")) fs.copyFileSync(f(n), f(n) + ".share.bak");
}

const SHARE_SVG = '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';
const WA = '<svg viewBox="0 0 24 24" class="fill"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.25.7-1.4 1.3-1.95 1.35-.5.05-1.1.07-1.75-.12a15 15 0 0 1-1.6-.6c-2.8-1.2-4.6-4-4.75-4.2-.13-.2-1.1-1.45-1.1-2.8s.7-2 .95-2.25c.25-.27.55-.33.73-.33h.52c.17 0 .4-.05.62.47.25.6.85 2.05.92 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.32.38-.45.5-.15.15-.3.3-.13.6.17.3.75 1.25 1.6 2 1.1.98 2.02 1.28 2.32 1.43.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.8 2.02.95.3.15.5.22.57.35.07.12.07.72-.18 1.4z"/></svg>';
const FB = '<svg viewBox="0 0 24 24" class="fill"><path d="M14 8V6.5c0-.8.2-1.2 1.3-1.2H17V2.2C16.6 2.1 15.6 2 14.5 2 12 2 10.3 3.5 10.3 6.2V8H8v3.2h2.3V22H14V11.2h2.6L17 8z"/></svg>';
const XX = '<svg viewBox="0 0 24 24" class="fill"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-6l-4.8-6.2L5.4 21h-3l7-8.1L2.3 3h6.1l4.3 5.7zm-1 16.2h1.7L7.6 4.7H5.8z"/></svg>';
const LINK = '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>';

/* ---------- index.html ---------- */
let html = fs.readFileSync(f("index.html"), "utf8");

// 1) share icon on every grid item (idempotent)
html = html.replace(/\s*<span class="gl-share"[\s\S]*?<\/span>/g, "");
html = html.replace(/<span class="gl-zoom"/g,
  '<span class="gl-share" role="button" tabindex="0" aria-label="مشاركة الصورة">' + SHARE_SVG + '</span>\n                    <span class="gl-zoom"');

// 2) lightbox markup: one column (image on top, share bar under it)
const boxRe = /<div class="gl-box" id="glBox" hidden>[\s\S]*?<\/div>(?=\s*<!-- PROJECTS-GALLERY:END -->)/;
const box = `<div class="gl-box" id="glBox" hidden>
            <button type="button" class="gl-x" id="glX" aria-label="إغلاق">&times;</button>
            <button type="button" class="gl-nav gl-p" id="glP" aria-label="السابق"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
            <div class="gl-stage">
                <img id="glImg" alt="">
                <div class="gl-bar">
                    <button type="button" class="gl-sbtn" id="glNative" aria-label="مشاركة">${SHARE_SVG}</button>
                    <a class="gl-sbtn" id="glWa" target="_blank" rel="noopener" aria-label="واتساب">${WA}</a>
                    <a class="gl-sbtn" id="glFb" target="_blank" rel="noopener" aria-label="فيسبوك">${FB}</a>
                    <a class="gl-sbtn" id="glTw" target="_blank" rel="noopener" aria-label="X">${XX}</a>
                    <button type="button" class="gl-sbtn" id="glCopy" aria-label="نسخ الرابط">${LINK}</button>
                </div>
                <span class="gl-c" id="glC"></span>
            </div>
            <button type="button" class="gl-nav gl-n" id="glN" aria-label="التالي"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        </div>`;
if (!boxRe.test(html)) { console.error("✖ glBox not found"); process.exit(1); }
html = html.replace(boxRe, () => box);

// 3) JS
const JS = `<!-- PROJECTS-GALLERY-JS:START -->
<script>
(function () {
  var grid = document.getElementById("glGrid"), box = document.getElementById("glBox");
  if (!grid || !box) return;
  var img = document.getElementById("glImg"), cnt = document.getElementById("glC"), i = 0;
  var wa = document.getElementById("glWa"), fb = document.getElementById("glFb"),
      tw = document.getElementById("glTw"), nat = document.getElementById("glNative"),
      cp = document.getElementById("glCopy");
  function list() { return [].slice.call(grid.querySelectorAll(".gl-item img")); }
  function abs(u) { return new URL(u, location.href).href; }
  function links(url) {
    var t = encodeURIComponent(document.title), u = encodeURIComponent(url);
    wa.href = "https://wa.me/?text=" + t + "%20" + u;
    fb.href = "https://www.facebook.com/sharer/sharer.php?u=" + u;
    tw.href = "https://twitter.com/intent/tweet?text=" + t + "&url=" + u;
  }
  function nativeShare(url) {
    if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return true; }
    return false;
  }
  function copy(url) {
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { flash(cp); });
    else { var t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); flash(cp); }
  }
  function flash(el) { el.classList.add("ok"); setTimeout(function () { el.classList.remove("ok"); }, 1200); }
  function show(n) {
    var l = list(); if (!l.length) return;
    i = (n + l.length) % l.length;
    img.src = l[i].src;
    cnt.textContent = (i + 1) + " / " + l.length;
    links(abs(l[i].src));
  }
  function open(n) { box.hidden = false; document.body.style.overflow = "hidden"; show(n); }
  function close() { box.hidden = true; document.body.style.overflow = ""; img.src = ""; }

  grid.addEventListener("click", function (e) {
    var s = e.target.closest(".gl-share");
    if (s) {
      e.stopPropagation();
      var url = abs(s.closest(".gl-item").querySelector("img").src);
      if (!nativeShare(url)) window.open("https://wa.me/?text=" + encodeURIComponent(document.title + " " + url), "_blank", "noopener");
      return;
    }
    var b = e.target.closest(".gl-item"); if (!b) return;
    open(list().indexOf(b.querySelector("img")));
  });
  grid.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("gl-share")) { e.preventDefault(); e.stopPropagation(); e.target.click(); }
  });

  nat.onclick = function () { var u = abs(img.src); if (!nativeShare(u)) copy(u); };
  cp.onclick = function () { copy(abs(img.src)); };
  document.getElementById("glX").onclick = close;
  document.getElementById("glP").onclick = function () { show(i - 1); };
  document.getElementById("glN").onclick = function () { show(i + 1); };
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(i - 1);
    if (e.key === "ArrowLeft") show(i + 1);
  });
  var sx = 0;
  box.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(dx > 0 ? i - 1 : i + 1);
  });
})();
</script>
<!-- PROJECTS-GALLERY-JS:END -->`;
const jsRe = /<!-- PROJECTS-GALLERY-JS:START -->[\s\S]*?<!-- PROJECTS-GALLERY-JS:END -->/;
if (!jsRe.test(html)) { console.error("✖ gallery JS block not found"); process.exit(1); }
html = html.replace(jsRe, () => JS);
fs.writeFileSync(f("index.html"), html);

/* ---------- main.css ---------- */
const S = "/* GL-SHARE:START */", E = "/* GL-SHARE:END */";
const css = `${S}
/* zoom icon -> RIGHT */
.gl-zoom { left: auto !important; right: 12px; }

/* share icon -> LEFT, clickable */
.gl-share {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 3;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(27, 38, 69, .62);
    border: 1px solid rgba(255, 255, 255, .35);
    backdrop-filter: blur(6px);
    color: #fff;
    cursor: pointer;
    transition: transform .35s ease, background .35s ease;
}
.gl-share svg, .gl-sbtn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.gl-share:hover { background: var(--color-primary); transform: scale(1.12); }

/* lightbox: ONE column = big image, then share bar */
.gl-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 92vw;
}
.gl-stage > img {
    max-width: 92vw;
    max-height: 74vh;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, .6);
}
.gl-bar { display: flex; gap: 10px; }
.gl-sbtn {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, .3);
    border-radius: 50%;
    background: rgba(255, 255, 255, .08);
    color: #fff;
    cursor: pointer;
    transition: background .3s ease, color .3s ease, transform .3s ease;
}
.gl-sbtn svg.fill { fill: currentColor; stroke: none; }
.gl-sbtn:hover { background: #fff; color: #1b2645; transform: translateY(-2px); }
.gl-sbtn.ok { background: #25d366; border-color: #25d366; color: #fff; }
.gl-stage .gl-c { position: static; transform: none; }

@media (max-width: 650px) {
    .gl-zoom { right: 10px; }
    .gl-share { width: 32px; height: 32px; top: 10px; left: 10px; }
    .gl-stage > img { max-height: 66vh; }
    .gl-sbtn { width: 42px; height: 42px; }
}
${E}`;
let c = fs.readFileSync(f("main.css"), "utf8");
c = c.replace(new RegExp("\\n*" + esc(S) + "[\\s\\S]*?" + esc(E) + "\\n*", "g"), "\n");
fs.writeFileSync(f("main.css"), c.replace(/\s*$/, "\n") + "\n" + css + "\n");

console.log("✔ zoom icon on the right, share icon on the left of each image");
console.log("✔ lightbox is one column: big image + share bar (share / WhatsApp / Facebook / X / copy link)");
console.log("  Hard refresh: Ctrl+Shift+R.  Backups: *.share.bak");
