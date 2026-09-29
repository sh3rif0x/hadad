#!/usr/bin/env node
/**
 * fix-projects.js
 * Run from your project root:   node fix-projects.js
 * Or pass the root folder:      node fix-projects.js path/to/project
 *
 * Replaces ONLY the "projects" section with a fancy gallery:
 *  - big bento grid, 12 cards (placeholder images from picsum.photos)
 *  - filter pills (all / iron / shades / screens / panels / glass)
 *  - hover zoom + glass tag + arrow, staggered reveal on scroll
 *  - click a card = fullscreen lightbox (arrows, keyboard, swipe-free)
 *
 * Edits: index.html (section), main.css (styles), main.js (behavior).
 * Safe to re-run. Backups: <file>.bak (first run only).
 * To use your own images, edit the ITEMS list below.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());

/* ------------------------------------------------------------------ */
/* EDIT HERE: img = local path (./assets/...) or any URL               */
/* size: "" | "pj-wide" | "pj-tall"                                    */
/* ------------------------------------------------------------------ */

const CATS = {
    iron:   "حدادة",
    shade:  "مظلات",
    screen: "سواتر",
    panel:  "سندوتش بانل",
    glass:  "زجاج"
};

const p = (seed, w, h) => "https://picsum.photos/seed/" + seed + "/" + w + "/" + h;

const ITEMS = [
    { cat: "iron",   size: "pj-tall", title: "بوابة حديد مشغول",     img: "./assets/image-1790545454628.jpg" },
    { cat: "shade",  size: "",        title: "مظلة سيارات فيلا",      img: p("hadad-shade-1", 900, 700) },
    { cat: "glass",  size: "pj-wide", title: "واجهة زجاج سيكوريت",    img: "./assets/Sliding-French-Glass-Doors.webp" },
    { cat: "screen", size: "",        title: "ساتر خصوصية",           img: "./assets/hero-4.jpg" },
    { cat: "panel",  size: "",        title: "غرفة سندوتش بانل",      img: "./assets/hero-2.webp" },
    { cat: "iron",   size: "pj-tall", title: "درابزين حديد حديث",     img: p("hadad-iron-2", 800, 1100) },
    { cat: "shade",  size: "pj-wide", title: "مظلة مواقف واسعة",      img: p("hadad-shade-3", 1300, 800) },
    { cat: "panel",  size: "",        title: "مجلس سندوتش بانل",      img: p("hadad-panel-4", 900, 700) },
    { cat: "screen", size: "",        title: "سواتر حديقة",           img: p("hadad-screen-5", 900, 700) },
    { cat: "glass",  size: "",        title: "باب زجاج سيكوريت",      img: p("hadad-glass-6", 900, 700) },
    { cat: "iron",   size: "pj-wide", title: "هيكل حديدي لمستودع",    img: p("hadad-iron-7", 1300, 800) },
    { cat: "shade",  size: "pj-tall", title: "مظلة حديقة وجلسات",     img: p("hadad-shade-8", 800, 1100) }
];

const FALLBACK = "./assets/hero-1.jpeg";

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

function findFile(candidates) {
    for (const c of candidates) {
        const full = path.join(ROOT, c);
        if (fs.existsSync(full)) return full;
    }
    return null;
}

const read = (f) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");

function backupOnce(f) {
    if (!fs.existsSync(f + ".bak")) fs.copyFileSync(f, f + ".bak");
}

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function upsert(content, start, end, block, insertFn) {
    const re = new RegExp(escRe(start) + "[\\s\\S]*?" + escRe(end));
    const wrapped = start + "\n" + block + "\n" + end;
    if (re.test(content)) return content.replace(re, () => wrapped);
    return insertFn(content, wrapped);
}

/* ------------------------------------------------------------------ */
/* HTML                                                                */
/* ------------------------------------------------------------------ */

function buildSection() {
    const filters =
        '<button type="button" class="pj-filter on" data-f="all">الكل</button>\n' +
        Object.keys(CATS)
            .map((k) => '                    <button type="button" class="pj-filter" data-f="' + k + '">' + CATS[k] + "</button>")
            .join("\n");

    const cards = ITEMS.map((it, i) => {
        const cls = ("pj-card " + it.size).trim();
        return (
            '            <article class="' + cls + '" data-cat="' + it.cat + '" style="--d:' + ((i % 4) * 0.08).toFixed(2) + 's" tabindex="0" role="button" aria-label="' + it.title + '">\n' +
            '                <img src="' + it.img + '" alt="' + it.title + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + FALLBACK + "'\">\n" +
            '                <div class="pj-info">\n' +
            '                    <div class="pj-text">\n' +
            '                        <span class="pj-tag">' + CATS[it.cat] + "</span>\n" +
            "                        <h3>" + it.title + "</h3>\n" +
            "                    </div>\n" +
            '                    <span class="pj-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M17 17L7 7M7 7h9M7 7v9"/></svg></span>\n' +
            "                </div>\n" +
            "            </article>"
        );
    }).join("\n\n");

    return (
        '<section class="projects section" id="projects">\n\n' +
        '            <div class="pj-head">\n' +
        '                <div class="section-heading">\n' +
        "                    <span>أعمالنا</span>\n" +
        "                    <h2>\n                        مشاريع\n                        <strong>نفذناها</strong>\n                    </h2>\n" +
        "                </div>\n" +
        '                <div class="pj-filters" role="tablist" aria-label="تصفية الأعمال">\n' +
        "                    " + filters + "\n" +
        "                </div>\n" +
        "            </div>\n\n" +
        '            <div class="pj-grid" id="pjGrid">\n\n' +
        cards + "\n\n" +
        "            </div>\n\n" +
        '            <div class="pj-more"><a href="#contact">ابدأ مشروعك معنا <span>←</span></a></div>\n\n' +
        "        </section>"
    );
}

function fixHtml() {
    const file = findFile(["index.html", "1.html"]);
    if (!file) return console.error("✗ index.html not found (run from your project root)");
    backupOnce(file);
    let src = read(file);

    const S = "<!-- PROJECTS:START -->", E = "<!-- PROJECTS:END -->";
    const block = S + "\n        " + buildSection() + "\n        " + E;
    const markRe = new RegExp(escRe(S) + "[\\s\\S]*?" + escRe(E));
    const origRe = /<section class="projects section" id="projects">[\s\S]*?<\/section>/;

    if (markRe.test(src)) src = src.replace(markRe, () => block);
    else if (origRe.test(src)) src = src.replace(origRe, () => block);
    else return console.error('✗ <section class="projects section" id="projects"> not found');

    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated");
}

/* ------------------------------------------------------------------ */
/* JS                                                                  */
/* ------------------------------------------------------------------ */

const JS = `(function () {

    function init() {
        var grid = document.getElementById("pjGrid");
        if (!grid) return;

        var cards = [].slice.call(grid.querySelectorAll(".pj-card"));
        var btns = [].slice.call(document.querySelectorAll(".pj-filter"));

        grid.classList.add("pj-js");

        /* ---------- reveal on scroll ---------- */
        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
                });
            }, { threshold: 0.12 });
            cards.forEach(function (c) { io.observe(c); });
        } else {
            cards.forEach(function (c) { c.classList.add("in"); });
        }

        /* ---------- filters ---------- */
        btns.forEach(function (b) {
            b.addEventListener("click", function () {
                var f = b.getAttribute("data-f");
                btns.forEach(function (x) { x.classList.toggle("on", x === b); });
                grid.classList.toggle("filtered", f !== "all");
                cards.forEach(function (c) {
                    var show = f === "all" || c.getAttribute("data-cat") === f;
                    c.classList.toggle("hide", !show);
                    if (show) { c.classList.remove("in"); void c.offsetWidth; c.classList.add("in"); }
                });
            });
        });

        /* ---------- lightbox ---------- */
        var lb = document.createElement("div");
        lb.className = "pj-lb";
        lb.setAttribute("role", "dialog");
        lb.setAttribute("aria-modal", "true");
        lb.setAttribute("aria-label", "معرض الأعمال");
        lb.innerHTML =
            '<button type="button" class="pj-lb-btn pj-lb-x" aria-label="إغلاق"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
            '<button type="button" class="pj-lb-btn pj-lb-prev" aria-label="السابق"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
            '<button type="button" class="pj-lb-btn pj-lb-next" aria-label="التالي"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
            '<figure><img alt=""><figcaption><span></span><h3></h3></figcaption></figure>';
        document.body.appendChild(lb);

        var lbImg = lb.querySelector("img");
        var lbTag = lb.querySelector("figcaption span");
        var lbTitle = lb.querySelector("figcaption h3");
        var list = [], cur = 0;

        function visible() {
            return cards.filter(function (c) { return !c.classList.contains("hide"); });
        }

        function show(i) {
            cur = (i + list.length) % list.length;
            var c = list[cur];
            var im = c.querySelector("img");
            lbImg.classList.remove("swap");
            void lbImg.offsetWidth;
            lbImg.src = im.currentSrc || im.src;
            lbImg.alt = im.alt;
            lbTag.textContent = c.querySelector(".pj-tag").textContent;
            lbTitle.textContent = c.querySelector("h3").textContent;
            lbImg.classList.add("swap");
        }

        function open(c) {
            list = visible();
            show(list.indexOf(c));
            lb.classList.add("open");
            document.documentElement.style.overflow = "hidden";
        }

        function close() {
            lb.classList.remove("open");
            document.documentElement.style.overflow = "";
        }

        cards.forEach(function (c) {
            c.addEventListener("click", function () { open(c); });
            c.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(c); }
            });
        });

        lb.querySelector(".pj-lb-x").addEventListener("click", close);
        lb.querySelector(".pj-lb-prev").addEventListener("click", function () { show(cur - 1); });
        lb.querySelector(".pj-lb-next").addEventListener("click", function () { show(cur + 1); });
        lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

        document.addEventListener("keydown", function (e) {
            if (!lb.classList.contains("open")) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") show(cur + 1);
            if (e.key === "ArrowRight") show(cur - 1);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();`;

function fixJs() {
    const file = findFile(["main.js", "js/main.js", "assets/main.js", "script.js"]);
    if (!file) return console.error("✗ main.js not found");
    backupOnce(file);
    let src = read(file);
    src = upsert(src, "/* PROJECTS:START */", "/* PROJECTS:END */", JS, (c, b) => c.replace(/\s*$/, "\n\n") + b + "\n");
    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated");
}

/* ------------------------------------------------------------------ */
/* CSS                                                                 */
/* ------------------------------------------------------------------ */

const CSS = `
/* =========================================================
   PROJECTS: fancy bento gallery
========================================================= */

.projects {
    position: relative;
    overflow: hidden;
    color: #fff;
    background:
        radial-gradient(circle at 85% 6%, rgba(43, 137, 173, .30), transparent 42%),
        radial-gradient(circle at 6% 94%, rgba(174, 228, 245, .10), transparent 40%),
        linear-gradient(165deg, #0d2f40 0%, #071c28 100%);
}

.pj-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 28px;
    margin-bottom: 48px;
}

.projects .section-heading { margin-bottom: 0; }
.projects .section-heading > span { color: var(--color-accent-light); }
.projects .section-heading h2 { color: #fff; }
.projects .section-heading h2 strong { color: var(--color-accent-light); }

/* filters */
.pj-filters { display: flex; flex-wrap: wrap; gap: 10px; }

.pj-filter {
    padding: 11px 22px;
    border: 1px solid rgba(255, 255, 255, .2);
    border-radius: 99px;
    background: rgba(255, 255, 255, .06);
    backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, .8);
    font-size: 15px;
    font-weight: 800;
    transition: background .3s ease, color .3s ease, transform .3s ease, border-color .3s ease;
}

.pj-filter:hover {
    background: rgba(255, 255, 255, .16);
    color: #fff;
    transform: translateY(-2px);
}

.pj-filter.on {
    background: #fff;
    border-color: #fff;
    color: var(--color-bg-dark);
}

/* grid */
.pj-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: 270px;
    grid-auto-flow: dense;
    gap: 18px;
}

.pj-wide { grid-column: span 2; }
.pj-tall { grid-row: span 2; }

.pj-grid.filtered .pj-card {
    grid-column: auto !important;
    grid-row: auto !important;
}

.pj-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-radius: 26px;
    background: #0d2b3a;
    box-shadow: 0 18px 40px rgba(0, 0, 0, .35);
    cursor: pointer;
    transition: transform .5s cubic-bezier(.22, .61, .36, 1), box-shadow .5s ease;
}

.pj-card.hide { display: none; }

.pj-card:focus-visible { outline: 3px solid var(--color-accent-light); outline-offset: 3px; }

.pj-card img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.2s cubic-bezier(.22, .61, .36, 1);
}

.pj-card::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 38%, rgba(0, 0, 0, .82) 100%);
    pointer-events: none;
}

.pj-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 0 0 1px rgba(174, 228, 245, .45), 0 30px 60px rgba(0, 0, 0, .5);
}

.pj-card:hover img { transform: scale(1.1); }

.pj-info {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 14px;
    padding: 24px;
}

.pj-tag {
    display: inline-block;
    margin-bottom: 10px;
    padding: 6px 14px;
    border: 1px solid rgba(255, 255, 255, .25);
    border-radius: 99px;
    background: rgba(255, 255, 255, .16);
    backdrop-filter: blur(8px);
    color: #fff;
    font-size: 12.5px;
    font-weight: 800;
}

.pj-info h3 {
    color: #fff;
    font-size: clamp(18px, 1.6vw, 24px);
    font-weight: 900;
    line-height: 1.3;
}

.pj-arrow {
    flex: none;
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #fff;
    color: var(--color-bg-dark);
    opacity: 0;
    transform: scale(.55) rotate(-45deg);
    transition: opacity .4s ease, transform .5s cubic-bezier(.22, .61, .36, 1);
}

.pj-arrow svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.pj-card:hover .pj-arrow { opacity: 1; transform: none; }

/* staggered reveal (only when JS is running) */
.pj-js .pj-card { opacity: 0; transform: translateY(40px) scale(.97); }

.pj-js .pj-card.in {
    opacity: 1;
    transform: none;
    animation: pjIn .9s cubic-bezier(.22, .61, .36, 1) backwards;
    animation-delay: var(--d, 0s);
}

.pj-js .pj-card.in:hover { transform: translateY(-6px); }

@keyframes pjIn {
    from { opacity: 0; transform: translateY(40px) scale(.97); }
    to   { opacity: 1; transform: none; }
}

/* bottom button */
.pj-more { display: flex; justify-content: center; margin-top: 52px; }

.pj-more a {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 16px 34px;
    border: 1px solid rgba(255, 255, 255, .4);
    border-radius: 99px;
    background: rgba(255, 255, 255, .08);
    backdrop-filter: blur(10px);
    color: #fff;
    font-size: 17px;
    font-weight: 800;
    transition: background .35s ease, color .35s ease, transform .35s ease;
}

.pj-more a span { transition: transform .35s ease; }
.pj-more a:hover { background: #fff; color: var(--color-bg-dark); transform: translateY(-3px); }
.pj-more a:hover span { transform: translateX(-6px); }

/* lightbox */
.pj-lb {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: grid;
    place-items: center;
    padding: 60px 24px 40px;
    background: rgba(3, 14, 20, .92);
    backdrop-filter: blur(12px);
    opacity: 0;
    visibility: hidden;
    transition: opacity .35s ease, visibility .35s ease;
}

.pj-lb.open { opacity: 1; visibility: visible; }

.pj-lb figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    max-width: min(1200px, 100%);
    max-height: 100%;
    margin: 0;
}

.pj-lb img {
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 74vh;
    border-radius: 20px;
    object-fit: contain;
    box-shadow: 0 30px 80px rgba(0, 0, 0, .6);
}

.pj-lb img.swap { animation: pjSwap .5s cubic-bezier(.22, .61, .36, 1); }

@keyframes pjSwap {
    from { opacity: 0; transform: scale(.96); }
    to   { opacity: 1; transform: none; }
}

.pj-lb figcaption { text-align: center; color: #fff; }
.pj-lb figcaption span { color: var(--color-accent-light); font-size: 14px; font-weight: 800; }
.pj-lb figcaption h3 { margin-top: 4px; font-size: 24px; font-weight: 900; }

.pj-lb-btn {
    position: absolute;
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, .3);
    border-radius: 50%;
    background: rgba(255, 255, 255, .08);
    backdrop-filter: blur(10px);
    color: #fff;
    cursor: pointer;
    transition: background .3s ease, color .3s ease, transform .3s ease;
}

.pj-lb-btn:hover { background: #fff; color: var(--color-bg-dark); transform: scale(1.08); }

.pj-lb-btn svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.pj-lb-x { top: 20px; left: 20px; }
.pj-lb-prev { top: 50%; right: 20px; margin-top: -26px; }
.pj-lb-next { top: 50%; left: 20px; margin-top: -26px; }

/* responsive */
@media (max-width: 1000px) {
    .pj-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 240px; }
}

@media (max-width: 650px) {
    .pj-head { margin-bottom: 32px; }
    .pj-grid { grid-template-columns: 1fr; grid-auto-rows: 300px; gap: 14px; }
    .pj-wide { grid-column: auto; }
    .pj-tall { grid-row: auto; }
    .pj-card { border-radius: 22px; }
    .pj-info { padding: 20px; }
    .pj-lb { padding: 70px 12px 30px; }
    .pj-lb-btn { width: 44px; height: 44px; }
    .pj-lb-prev { top: auto; bottom: 24px; right: 24px; margin: 0; }
    .pj-lb-next { top: auto; bottom: 24px; left: 24px; margin: 0; }
}

@media (hover: none) {
    .pj-arrow { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
    .pj-card, .pj-card img, .pj-arrow { transition: none; }
    .pj-js .pj-card.in { animation: none; }
}
`;

function fixCss() {
    const file = findFile(["main.css", "css/main.css", "assets/main.css", "style.css"]);
    if (!file) return console.error("✗ main.css not found");
    backupOnce(file);
    let src = read(file);
    src = upsert(src, "/* PROJECTS-UI:START */", "/* PROJECTS-UI:END */", CSS.trim(), (c, b) => c.replace(/\s*$/, "\n\n") + b + "\n");
    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated");
}

/* ------------------------------------------------------------------ */

console.log("Project root: " + ROOT + "\n");
fixHtml();
fixJs();
fixCss();
console.log("\nDone. Hard-refresh with Ctrl+Shift+R.");
