#!/usr/bin/env node
// Run from the site root:  node add-projects-slider.js
const fs = require("fs");
const path = require("path");

const f = (n) => path.join(__dirname, n);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const MAX_EXTRA = 16; // extra images picked up from /assets

for (const n of ["index.html", "main.css"]) {
  if (!fs.existsSync(f(n))) { console.error("✖ missing: " + n + " (run this from the site root)"); process.exit(1); }
  if (!fs.existsSync(f(n) + ".slider.bak")) fs.copyFileSync(f(n), f(n) + ".slider.bak");
}
const assetsDir = f("assets");
if (!fs.existsSync(assetsDir)) { console.error("✖ missing folder: assets/"); process.exit(1); }

/* ---------------- 1) collect images that REALLY exist ---------------- */
const onDisk = fs.readdirSync(assetsDir).filter((n) => /\.(jpe?g|png|webp|avif)$/i.test(n));
const lower = new Map(onDisk.map((n) => [n.normalize("NFC").toLowerCase(), n]));
const find = (name) => lower.get(name.normalize("NFC").toLowerCase());

const DESC = {
  "أعمال حدادة": "أبواب وهياكل ومداخل حديدية بتفاصيل دقيقة وتشطيب نظيف.",
  "مظلات سيارات": "مظلات للمواقف والمساحات الخارجية بتصاميم عملية ومتينة.",
  "سواتر": "سواتر توفر الخصوصية والحماية للمنازل والفلل والمنشآت.",
  "سندوتش بانل": "غرف ومستودعات وحلول سندوتش بانل بمقاسات مختلفة.",
  "غرف ومجالس": "غرف ومجالس خارجية جاهزة للاستخدام السكني والتجاري.",
  "زجاج وواجهات": "واجهات وأبواب زجاجية سيكوريت بتفاصيل تناسب المكان.",
  "أبواب زجاجية": "أبواب زجاجية منزلقة وسيكوريت للمداخل والمساحات المختلفة.",
  "من أعمالنا": "تنفيذ متقن حسب المكان والاستخدام واحتياج المشروع."
};

// known files first (in this order), with the right category
const KNOWN = [
  ["image-1790545454628.jpg", "أعمال حدادة"],
  ["hero-1.webp", "مظلات سيارات"],
  ["hero-3.webp", "سواتر"],
  ["hero-4.jpg", "سواتر"],
  ["hero-2.webp", "سندوتش بانل"],
  ["غرف-ساندوتش-بانل-14.webp", "غرف ومجالس"],
  ["facades-6.jpg", "زجاج وواجهات"],
  ["Sliding-French-Glass-Doors.webp", "أبواب زجاجية"],
  ["مجالس-ساندوتش-بانل-مؤسسة-مظلات-وسواتر-اركان-التميز.jpg", "غرف ومجالس"]
];

const used = new Set();
const slides = [];
const missing = [];

for (const [name, title] of KNOWN) {
  const real = find(name);
  if (!real) { missing.push(name); continue; }
  used.add(real);
  slides.push({ file: real, title });
}

const SKIP = /logo|icon|favicon|banner|sprite|placeholder/i;
function guess(name) {
  const n = name.toLowerCase();
  if (/facade|glass|زجاج|واجه|door/.test(n)) return "زجاج وواجهات";
  if (/sandwich|panel|سندوتش|ساندوتش|غرف|مجالس|room|majlis/.test(n)) return "غرف ومجالس";
  if (/shade|car|parking|مظل/.test(n)) return "مظلات سيارات";
  if (/fence|screen|ساتر|سواتر/.test(n)) return "سواتر";
  if (/iron|metal|weld|gate|حدد|حديد/.test(n)) return "أعمال حدادة";
  return "من أعمالنا";
}
let extra = 0;
for (const name of onDisk.sort()) {
  if (used.has(name) || SKIP.test(name) || extra >= MAX_EXTRA) continue;
  used.add(name);
  slides.push({ file: name, title: guess(name) });
  extra++;
}

if (!slides.length) { console.error("✖ no images found in assets/"); process.exit(1); }

/* ---------------- 2) index.html: replace the projects section ---------------- */
const HS = "<!-- PROJECTS-SLIDER:START -->";
const HE = "<!-- PROJECTS-SLIDER:END -->";
const pad = (n) => String(n).padStart(2, "0");
const total = pad(slides.length);

const slideHtml = slides.map((s, i) => {
  const src = "./assets/" + encodeURI(s.file);
  const desc = DESC[s.title] || DESC["من أعمالنا"];
  return `                <article class="pj-slide${i === 0 ? " on" : ""}">
                    <img src="${src}" alt="${s.title}" ${i < 2 ? 'loading="eager"' : 'loading="lazy"'} decoding="async" onerror="this.closest('.pj-slide').remove();window.dispatchEvent(new Event('pj-refresh'))">
                    <div class="pj-shade"></div>
                    <span class="pj-tag">${s.title}</span>
                    <span class="pj-num">${pad(i + 1)}</span>
                    <div class="pj-info">
                        <h3>${s.title}</h3>
                        <p>${desc}</p>
                        <a href="#contact">اطلب مشروع مثله ←</a>
                    </div>
                </article>`;
}).join("\n\n");

const sectionHtml = `${HS}
        <section class="pj" id="projects">

            <div class="pj-head">
                <div>
                    <span>أعمالنا</span>
                    <h2>
                        مشاريع
                        <strong>نفذناها</strong>
                    </h2>
                </div>
                <div class="pj-tools">
                    <div class="pj-count"><b id="pjCur">01</b><i>/</i><em id="pjTotal">${total}</em></div>
                    <div class="pj-arrows">
                        <button type="button" class="pj-arrow" id="pjPrev" aria-label="السابق"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
                        <button type="button" class="pj-arrow" id="pjNext" aria-label="التالي"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
                    </div>
                </div>
            </div>

            <div class="pj-track" id="pjTrack" tabindex="0" aria-label="معرض المشاريع">

${slideHtml}

            </div>

            <div class="pj-bar"><span id="pjBar"></span></div>

        </section>
${HE}`;

let html = fs.readFileSync(f("index.html"), "utf8");
html = html.replace(new RegExp("\\n*[ \\t]*" + esc(HS) + "[\\s\\S]*?" + esc(HE) + "\\n*", "g"), "\n");

const orig = /[ \t]*<section class="projects section" id="projects">[\s\S]*?<\/section>/;
if (orig.test(html)) {
  html = html.replace(orig, () => sectionHtml);
} else {
  console.error("✖ could not find the projects section in index.html");
  process.exit(1);
}

// script tag
const TS = "<!-- PROJECTS-SLIDER-JS:START -->";
const TE = "<!-- PROJECTS-SLIDER-JS:END -->";
html = html.replace(new RegExp("\\n*" + esc(TS) + "[\\s\\S]*?" + esc(TE) + "\\n*", "g"), "\n");
html = html.replace("</body>", `${TS}\n<script src="./projects-slider.js" defer></script>\n${TE}\n</body>`);
fs.writeFileSync(f("index.html"), html);

/* ---------------- 3) projects-slider.js ---------------- */
const js = `(function () {
    var track = document.getElementById("pjTrack");
    if (!track) return;

    var cur = document.getElementById("pjCur");
    var total = document.getElementById("pjTotal");
    var bar = document.getElementById("pjBar");
    var prev = document.getElementById("pjPrev");
    var next = document.getElementById("pjNext");
    var idx = 0;

    function slides() { return Array.prototype.slice.call(track.querySelectorAll(".pj-slide")); }
    function pad(n) { return String(n).padStart(2, "0"); }

    function setActive(i) {
        var list = slides();
        if (!list.length) return;
        idx = Math.max(0, Math.min(list.length - 1, i));
        list.forEach(function (s, k) { s.classList.toggle("on", k === idx); });
        cur.textContent = pad(idx + 1);
        total.textContent = pad(list.length);
        bar.style.width = ((idx + 1) / list.length * 100) + "%";
    }

    function go(i) {
        var list = slides();
        i = Math.max(0, Math.min(list.length - 1, i));
        if (list[i]) list[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    // which slide is centered
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) setActive(slides().indexOf(e.target));
        });
    }, { root: track, threshold: 0.6 });

    function observeAll() { io.disconnect(); slides().forEach(function (s) { io.observe(s); }); setActive(idx); }
    observeAll();
    window.addEventListener("pj-refresh", observeAll);

    prev.addEventListener("click", function () { go(idx - 1); });
    next.addEventListener("click", function () { go(idx + 1); });

    track.addEventListener("keydown", function (e) {
        var rtl = getComputedStyle(track).direction === "rtl";
        if (e.key === "ArrowRight") { e.preventDefault(); go(idx + (rtl ? -1 : 1)); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); go(idx + (rtl ? 1 : -1)); }
    });

    // mouse wheel -> horizontal (page scrolls normally at both ends)
    track.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        var max = track.scrollWidth - track.clientWidth;
        var pos = Math.abs(track.scrollLeft);
        var forward = e.deltaY > 0;
        if ((forward && pos >= max - 4) || (!forward && pos <= 4)) return;
        e.preventDefault();
        var rtl = getComputedStyle(track).direction === "rtl";
        track.scrollLeft += (rtl ? -1 : 1) * e.deltaY;
    }, { passive: false });

    // mouse drag
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse") return;
        down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
        track.classList.add("drag");
    });
    window.addEventListener("pointermove", function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 4) moved = true;
        track.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", function () {
        if (!down) return;
        down = false;
        track.classList.remove("drag");
        if (moved) go(idx);
    });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });
})();
`;
fs.writeFileSync(f("projects-slider.js"), js);

/* ---------------- 4) main.css ---------------- */
const CS = "/* PROJECTS-SLIDER:START */";
const CE = "/* PROJECTS-SLIDER:END */";
const css = `${CS}
.pj {
    --sw: min(84vw, 1240px);
    padding: 110px 0 90px;
    background: var(--color-bg);
    color: var(--color-text);
    overflow: hidden;
}

.pj-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;
    padding: 0 clamp(24px, 8vw, 140px);
    margin-bottom: 44px;
}

.pj-head > div:first-child > span {
    color: var(--color-primary);
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 1px;
}

.pj-head h2 {
    margin-top: 16px;
    color: var(--color-text-dark);
    font-size: clamp(40px, 5vw, 65px);
    font-weight: 900;
    line-height: 1.1;
}

.pj-head h2 strong { color: var(--color-primary); font-weight: 900; }

.pj-tools { display: flex; align-items: center; gap: 26px; }

.pj-count {
    display: flex;
    align-items: baseline;
    gap: 8px;
    direction: ltr;
    color: var(--color-text-light);
    font-size: 15px;
    font-weight: 800;
}

.pj-count b { color: var(--color-text-dark); font-size: 34px; font-weight: 900; line-height: 1; }
.pj-count i, .pj-count em { font-style: normal; }

.pj-arrows { display: flex; gap: 10px; }

.pj-arrow {
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    border: 1px solid var(--color-border-dark);
    border-radius: 50%;
    background: #fff;
    color: var(--color-text-dark);
    transition: background .3s ease, color .3s ease, transform .3s ease, border-color .3s ease;
}

.pj-arrow svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.pj-arrow:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
    transform: scale(1.07);
}

/* ---------- track ---------- */

.pj-track {
    display: flex;
    gap: 26px;
    padding: 10px calc((100% - var(--sw)) / 2) 30px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x proximity;
    scroll-padding-inline: calc((100% - var(--sw)) / 2);
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    outline: none;
    cursor: grab;
}

.pj-track::-webkit-scrollbar { display: none; }
.pj-track.drag { cursor: grabbing; scroll-snap-type: none; scroll-behavior: auto; }

.pj-slide {
    position: relative;
    flex: 0 0 var(--sw);
    height: clamp(440px, 80vh, 780px);
    border-radius: 30px;
    overflow: hidden;
    background: var(--color-bg-dark);
    scroll-snap-align: center;
    scroll-snap-stop: always;
    opacity: .5;
    transform: scale(.93);
    box-shadow: 0 16px 40px rgba(27, 38, 69, .14);
    transition: opacity .7s ease, transform .7s cubic-bezier(.22, .61, .36, 1), box-shadow .7s ease;
}

.pj-slide.on {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 34px 80px rgba(27, 38, 69, .3);
}

.pj-slide img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.14);
    transition: transform 2.2s cubic-bezier(.22, .61, .36, 1);
    user-select: none;
    -webkit-user-drag: none;
}

.pj-slide.on img { transform: scale(1); }

.pj-shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(16, 23, 48, .35) 0%, transparent 30%, rgba(16, 23, 48, .88) 100%);
}

.pj-tag {
    position: absolute;
    top: 26px;
    right: 26px;
    z-index: 3;
    padding: 9px 18px;
    border: 1px solid rgba(255, 255, 255, .28);
    border-radius: 40px;
    background: rgba(255, 255, 255, .1);
    backdrop-filter: blur(10px);
    color: #fff;
    font-size: 13px;
    font-weight: 800;
}

.pj-num {
    position: absolute;
    top: 18px;
    left: 30px;
    z-index: 3;
    direction: ltr;
    color: rgba(255, 255, 255, .28);
    font-size: clamp(56px, 8vw, 120px);
    font-weight: 900;
    line-height: 1;
}

.pj-info {
    position: absolute;
    right: clamp(24px, 3.5vw, 52px);
    bottom: clamp(24px, 3.5vw, 46px);
    z-index: 3;
    max-width: min(560px, 80%);
    color: #fff;
    opacity: 0;
    transform: translateY(22px);
    transition: opacity .7s ease .2s, transform .7s cubic-bezier(.22, .61, .36, 1) .2s;
}

.pj-slide.on .pj-info { opacity: 1; transform: none; }

.pj-info h3 {
    font-size: clamp(28px, 3.6vw, 52px);
    font-weight: 900;
    line-height: 1.15;
}

.pj-info p {
    margin-top: 12px;
    color: rgba(255, 255, 255, .8);
    font-size: 16px;
    line-height: 1.9;
}

.pj-info a {
    display: inline-block;
    margin-top: 18px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--color-accent-light);
    color: var(--color-accent-light);
    font-size: 15px;
    font-weight: 800;
    transition: color .3s ease;
}

.pj-info a:hover { color: #fff; }

.pj-bar {
    height: 3px;
    margin: 10px clamp(24px, 8vw, 140px) 0;
    border-radius: 3px;
    background: var(--color-border);
    overflow: hidden;
}

.pj-bar span {
    display: block;
    height: 100%;
    width: 0;
    margin-inline-start: 0;
    border-radius: 3px;
    background: var(--color-primary);
    transition: width .6s cubic-bezier(.22, .61, .36, 1);
}

@media (max-width: 900px) {
    .pj-head { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 650px) {
    .pj { --sw: 88vw; padding: 80px 0 70px; }
    .pj-head { padding: 0 22px; margin-bottom: 30px; }
    .pj-arrow { width: 46px; height: 46px; }
    .pj-track { gap: 14px; }
    .pj-slide { height: 68vh; min-height: 400px; border-radius: 22px; }
    .pj-tag { top: 16px; right: 16px; }
    .pj-num { top: 12px; left: 18px; font-size: 52px; }
    .pj-info { right: 20px; bottom: 22px; max-width: calc(100% - 40px); }
    .pj-info p { font-size: 14px; }
    .bar, .pj-bar { margin-inline: 22px; }
}

@media (prefers-reduced-motion: reduce) {
    .pj-slide, .pj-slide img, .pj-info, .pj-bar span { transition: none; }
}
${CE}`;

let main = fs.readFileSync(f("main.css"), "utf8");
main = main.replace(new RegExp("\\n*" + esc(CS) + "[\\s\\S]*?" + esc(CE) + "\\n*", "g"), "\n");
fs.writeFileSync(f("main.css"), main.replace(/\s*$/, "\n") + "\n" + css + "\n");

/* ---------------- report ---------------- */
console.log("✔ projects slider added with " + slides.length + " slides");
slides.forEach((s, i) => console.log("   " + pad(i + 1) + "  " + s.title + "  ←  assets/" + s.file));
if (missing.length) {
  console.log("\\n⚠ these files were NOT found in assets/ (skipped, no broken images):");
  missing.forEach((m) => console.log("   - " + m));
}
console.log("\\n  Hard refresh: Ctrl+Shift+R.  Backups: *.slider.bak");
