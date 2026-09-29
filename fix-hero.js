#!/usr/bin/env node
/**
 * fix-hero.js
 * Run from your project root:   node fix-hero.js
 * Or pass the root folder:      node fix-hero.js path/to/project
 *
 * Patches your EXISTING project (no new files):
 *  - Hero title: ONE line, ONE color (white)
 *  - Hero description: ONE line, short text
 *  - Removes the small top title (eyebrow)
 *  - ONE button only: "اتصل بنا" (fancy pill with phone icon + pulse)
 *  - Content centered (slightly to the right)
 *  - Overlay = real linear-gradient (not one flat color)
 *  - Adds prev/next arrows (change image + text together) for all 5 slides
 *  - Header / nav items are NOT touched
 *
 * Safe to re-run. Backups: <file>.bak (first run only).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());

/* ------------------------------------------------------------------ */
/* EDIT THESE (one short line per slide, keep them under ~45 chars)    */
/* ------------------------------------------------------------------ */

const PARAGRAPHS = [
    "أبواب وبوابات وهياكل حديدية بتشطيبات متقنة",
    "مظلات للمواقف والمساحات الخارجية بهياكل قوية",
    "سواتر توفر الخصوصية والحماية بمقاسات دقيقة",
    "سندوتش بانل للمستودعات والغرف والمنشآت",
    "زجاج سيكوريت للأبواب والواجهات والفواصل"
];

const PHONE = "0534107471";
const CALL_TEXT = "اتصل بنا";

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

function read(file) {
    return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function backupOnce(file) {
    if (!fs.existsSync(file + ".bak")) fs.copyFileSync(file, file + ".bak");
}

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function upsert(content, start, end, block, insertFn) {
    const re = new RegExp(escRe(start) + "[\\s\\S]*?" + escRe(end));
    const wrapped = start + "\n" + block + "\n" + end;
    if (re.test(content)) return content.replace(re, () => wrapped);
    return insertFn(content, wrapped);
}

/* ------------------------------------------------------------------ */
/* HTML  (adds the arrows only)                                        */
/* ------------------------------------------------------------------ */

function fixHtml() {
    const file = findFile(["index.html", "1.html"]);
    if (!file) return console.error("✗ index.html not found (run from your project root)");
    backupOnce(file);
    let src = read(file);

    if (src.indexOf('id="heroPrev"') !== -1) {
        console.log("✓ " + path.relative(ROOT, file) + " already has arrows");
        return;
    }

    const arrows =
        '<button type="button" class="hero-arrow hero-arrow-prev" id="heroPrev" aria-label="السابق">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>\n' +
        '            <button type="button" class="hero-arrow hero-arrow-next" id="heroNext" aria-label="التالي">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>\n\n            ';

    const re = /<div class="hero-navigation">/;
    if (!re.test(src)) return console.error("✗ .hero-navigation not found in " + path.basename(file));

    src = src.replace(re, () => arrows + '<div class="hero-navigation">');
    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated (arrows added)");
}

/* ------------------------------------------------------------------ */
/* JS                                                                  */
/* ------------------------------------------------------------------ */

const RENDER_HERO = `    function renderHero(item) {

        heroContent.classList.remove("hero-animate");

        void heroContent.offsetWidth;

        heroContent.innerHTML = \`
            <h1 class="hero-title">
                <span>\${item.h1[0]}</span>
                <span>\${item.h1[1]}</span>
                <strong>\${item.h1[2]}</strong>
            </h1>

            <p class="hero-description">\${item.paragraph}</p>

            <div class="hero-buttons">
                <a href="tel:${PHONE}" class="hero-call">
                    <i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg></i>
                    <span>${CALL_TEXT}</span>
                </a>
            </div>
        \`;

        heroContent.classList.add("hero-animate");
    }`;

const ARROWS_JS = `
        /* HERO-ARROWS:START */
        let heroTimer;

        function restartHero() {
            clearInterval(heroTimer);
            heroTimer = setInterval(() => {
                currentSlide = (currentSlide + 1) % content.length;
                changeHero(currentSlide);
            }, 5000);
        }

        const heroPrev = home.querySelector("#heroPrev");
        const heroNext = home.querySelector("#heroNext");

        if (heroPrev) {
            heroPrev.addEventListener("click", () => {
                currentSlide = (currentSlide - 1 + content.length) % content.length;
                changeHero(currentSlide);
                restartHero();
            });
        }

        if (heroNext) {
            heroNext.addEventListener("click", () => {
                currentSlide = (currentSlide + 1) % content.length;
                changeHero(currentSlide);
                restartHero();
            });
        }
        /* HERO-ARROWS:END */`;

function fixJs() {
    const file = findFile(["main.js", "js/main.js", "assets/main.js", "script.js"]);
    if (!file) return console.error("✗ main.js not found");
    backupOnce(file);
    let src = read(file);
    const report = [];

    /* 1) short one-line paragraphs (in the content array) */
    const arrRe = /const content = \[[\s\S]*?\n\s*\];/;
    if (arrRe.test(src)) {
        src = src.replace(arrRe, (block) => {
            let n = 0;
            return block.replace(/paragraph:\s*"[^"]*"/g, () => {
                const p = PARAGRAPHS[n] !== undefined ? PARAGRAPHS[n] : PARAGRAPHS[PARAGRAPHS.length - 1];
                n++;
                return 'paragraph: "' + p + '"';
            });
        });
        report.push("paragraphs shortened");
    } else {
        console.warn("! could not find `const content = [...]` in main.js");
    }

    /* 2) renderHero: no eyebrow, one button */
    const MS = "/* HERO-FANCY:START */", ME = "/* HERO-FANCY:END */";
    const wrapped = MS + "\n" + RENDER_HERO + "\n    " + ME;
    const markRe = new RegExp(escRe(MS) + "[\\s\\S]*?" + escRe(ME));
    const origRe = /( *)function renderHero\(item\)\s*\{[\s\S]*?\n    \}\n/;

    if (markRe.test(src)) {
        src = src.replace(markRe, () => wrapped);
        report.push("renderHero refreshed");
    } else if (origRe.test(src)) {
        src = src.replace(origRe, () => "    " + wrapped + "\n");
        report.push("renderHero replaced");
    } else {
        console.warn("! could not find function renderHero(item) in main.js");
    }

    /* 3) arrows + single timer (only once) */
    if (src.indexOf("HERO-ARROWS:START") === -1) {
        const startRe = /let currentSlide = 0;\s*changeHero\(currentSlide\);/;
        const timerRe = /setInterval\(\(\) => \{\s*currentSlide\+\+;[\s\S]*?\}, 5000\);/;

        if (startRe.test(src) && timerRe.test(src)) {
            src = src.replace(timerRe, () => "restartHero();");
            src = src.replace(startRe, (m) => m + "\n" + ARROWS_JS);
            report.push("arrows wired");
        } else {
            console.warn("! could not wire arrows (currentSlide / setInterval block not found)");
        }
    } else {
        report.push("arrows already wired");
    }

    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated (" + report.join(", ") + ")");
}

/* ------------------------------------------------------------------ */
/* CSS                                                                 */
/* ------------------------------------------------------------------ */

const CSS = `
/* =========================================================
   HERO: centered, one line, one color, gradient overlay
========================================================= */

.hero {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 120px 24px 110px;
}

/* real linear gradients (dark top for header, dark bottom for controls) */
.hero-bg::after {
    background:
        linear-gradient(180deg,
            rgba(6, 28, 40, .82) 0%,
            rgba(6, 28, 40, .38) 35%,
            rgba(6, 28, 40, .45) 65%,
            rgba(6, 28, 40, .92) 100%),
        linear-gradient(90deg,
            rgba(6, 28, 40, .35) 0%,
            rgba(6, 28, 40, 0) 50%,
            rgba(6, 28, 40, .35) 100%) !important;
}

/* content: centered, nudged a little to the right */
.hero-content {
    position: relative;
    left: clamp(0px, 4vw, 72px);
    width: min(1100px, calc(100% - 8vw));
    max-width: none;
    justify-self: auto;
    text-align: center;
}

.hero-content.hero-animate { animation: none; }

.hero-eyebrow { display: none !important; }

/* title: one line, one color */
.hero h1 {
    margin: 0;
    color: #fff;
    font-size: clamp(20px, 4.6vw, 72px);
    font-weight: 900;
    line-height: 1.25;
    letter-spacing: 0;
    white-space: nowrap;
    text-shadow: 0 6px 30px rgba(0, 0, 0, .35);
}

.hero h1 span,
.hero h1 strong {
    display: inline !important;
    color: #fff !important;
    font-weight: 900;
}

.hero h1::after {
    content: "";
    display: block;
    width: 90px;
    height: 3px;
    margin: 22px auto 0;
    border-radius: 3px;
    background: linear-gradient(90deg, transparent, #aee4f5, transparent);
}

/* description: one line */
.hero-description {
    max-width: none;
    margin: 22px auto 0;
    color: #fff;
    font-size: clamp(12px, 1.5vw, 20px);
    font-weight: 600;
    line-height: 1.6;
    white-space: nowrap;
    text-shadow: 0 2px 16px rgba(0, 0, 0, .4);
}

/* single fancy call button */
.hero-buttons {
    display: flex;
    justify-content: center;
    margin-top: 34px;
}

.hero-call {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 8px 8px 8px 30px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, .4);
    border-radius: 999px;
    background: rgba(255, 255, 255, .12);
    backdrop-filter: blur(12px);
    color: #fff;
    font-size: 17px;
    font-weight: 800;
    transition: background .35s ease, color .35s ease, transform .35s ease, box-shadow .35s ease;
}

.hero-call::before {
    content: "";
    position: absolute;
    top: 0;
    left: -60%;
    width: 40%;
    height: 100%;
    background: linear-gradient(100deg, transparent, rgba(255, 255, 255, .45), transparent);
    transform: skewX(-20deg);
    transition: left .7s ease;
}

.hero-call:hover {
    background: #fff;
    color: var(--color-primary-dark);
    transform: translateY(-3px);
    box-shadow: 0 16px 36px rgba(0, 0, 0, .3);
}

.hero-call:hover::before { left: 130%; }

.hero-call i {
    position: relative;
    z-index: 1;
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: linear-gradient(135deg, #2b89ad, #176d91);
    animation: heroPulse 2.2s ease-out infinite;
}

.hero-call svg {
    width: 20px;
    height: 20px;
    fill: #fff;
}

.hero-call span { position: relative; z-index: 1; }

@keyframes heroPulse {
    0%   { box-shadow: 0 0 0 0 rgba(43, 137, 173, .65); }
    70%  { box-shadow: 0 0 0 16px rgba(43, 137, 173, 0); }
    100% { box-shadow: 0 0 0 0 rgba(43, 137, 173, 0); }
}

/* staggered entrance (replays on every slide) */
.hero-content.hero-animate > * {
    animation: heroUp .9s cubic-bezier(.22, .61, .36, 1) both;
}
.hero-content.hero-animate > :nth-child(2) { animation-delay: .12s; }
.hero-content.hero-animate > :nth-child(3) { animation-delay: .24s; }

@keyframes heroUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: none; }
}

/* arrows */
.hero-arrow {
    position: absolute;
    top: 50%;
    z-index: 10;
    width: 54px;
    height: 54px;
    margin-top: -27px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, .55);
    border-radius: 50%;
    background: rgba(255, 255, 255, .08);
    backdrop-filter: blur(10px);
    color: #fff;
    cursor: pointer;
    transition: background .3s ease, color .3s ease, transform .3s ease;
}

.hero-arrow:hover {
    background: #fff;
    color: var(--color-primary-dark);
    transform: scale(1.08);
}

.hero-arrow svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.hero-arrow-prev { right: 24px; }
.hero-arrow-next { left: 24px; }

@media (max-width: 650px) {
    .hero { padding: 110px 16px 100px; }
    .hero-content { left: 0; width: 100%; }
    .hero h1 { font-size: clamp(18px, 5.4vw, 40px); }
    .hero h1::after { margin-top: 16px; }
    .hero-description { font-size: clamp(10px, 3.2vw, 15px); }
    .hero-call { font-size: 15px; }
    .hero-call i { width: 40px; height: 40px; }
    .hero-arrow { width: 40px; height: 40px; margin-top: -20px; }
    .hero-arrow-prev { right: 8px; }
    .hero-arrow-next { left: 8px; }
}
`;

function fixCss() {
    const file = findFile(["main.css", "css/main.css", "assets/main.css", "style.css"]);
    if (!file) return console.error("✗ main.css not found");
    backupOnce(file);
    let src = read(file);
    src = upsert(src, "/* HERO-FANCY:START */", "/* HERO-FANCY:END */", CSS.trim(), (c, block) =>
        c.replace(/\s*$/, "\n\n") + block + "\n"
    );
    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated");
}

/* ------------------------------------------------------------------ */

console.log("Project root: " + ROOT + "\n");
fixHtml();
fixJs();
fixCss();
console.log("\nDone. Hard-refresh with Ctrl+Shift+R.");
