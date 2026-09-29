#!/usr/bin/env node
/**
 * fix-hero-nav.js
 * Run from your project root:   node fix-hero-nav.js
 * Or pass the root folder:      node fix-hero-nav.js path/to/project
 *
 * Changes ONLY the hero navigation (the "01 / 05" counter + the timeline bars).
 * CSS only: no HTML or JS is touched, your slider keeps working as is.
 * Safe to re-run. Backup: main.css.bak (first run only).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());

const CSS = `
/* =========================================================
   HERO NAVIGATION: glass pill, big counter, animated bars
========================================================= */

.hero-navigation {
    position: absolute;
    left: 50%;
    right: auto;
    bottom: 34px;
    transform: translateX(-50%);
    z-index: 10;
    width: min(560px, calc(100% - 48px));
    display: flex;
    align-items: center;
    gap: 22px;
    padding: 12px 26px;
    border: 1px solid rgba(255, 255, 255, .16);
    border-radius: 999px;
    background: rgba(6, 28, 40, .38);
    backdrop-filter: blur(14px);
    box-shadow: 0 14px 40px rgba(0, 0, 0, .28);
}

/* counter: 01 ── 05 */
.hero-counter {
    direction: ltr;
    flex: none;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-variant-numeric: tabular-nums;
}

.hero-counter .current {
    min-width: 1.4em;
    color: #fff;
    font-size: 26px;
    font-weight: 900;
    line-height: 1;
    text-align: center;
}

.hero-counter span:nth-child(2) {
    width: 22px;
    height: 1px;
    font-size: 0;
    background: rgba(255, 255, 255, .45);
}

.hero-counter span:nth-child(3) {
    color: rgba(255, 255, 255, .55);
    font-size: 13px;
    font-weight: 700;
}

/* timeline: active bar grows wider, big click area */
.hero-timeline {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
}

.hero-timeline span {
    position: relative;
    flex: 1;
    height: 22px;
    border-radius: 0;
    background: transparent !important;
    overflow: visible;
    cursor: pointer;
    transition: flex .55s cubic-bezier(.22, .61, .36, 1);
}

.hero-timeline span.active { flex: 2.4; }

.hero-timeline span::before,
.hero-timeline span::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    width: auto;
    height: 4px;
    margin-top: -2px;
    border-radius: 99px;
}

.hero-timeline span::before {
    background: rgba(255, 255, 255, .25);
    transition: background .3s ease;
}

.hero-timeline span:hover::before { background: rgba(255, 255, 255, .5); }

.hero-timeline span::after {
    background: linear-gradient(270deg, #fff, #aee4f5);
    box-shadow: 0 0 14px rgba(174, 228, 245, .7);
    transform: scaleX(0);
    transform-origin: right;
}

.hero-timeline span.active::after {
    transform: scaleX(1);
    transition: transform 5s linear;
}

@media (max-width: 650px) {
    .hero-navigation {
        bottom: 22px;
        gap: 14px;
        width: calc(100% - 32px);
        padding: 10px 18px;
    }
    .hero-counter .current { font-size: 20px; }
    .hero-counter span:nth-child(2) { width: 14px; }
    .hero-counter span:nth-child(3) { font-size: 12px; }
}
`;

function findFile(candidates) {
    for (const c of candidates) {
        const full = path.join(ROOT, c);
        if (fs.existsSync(full)) return full;
    }
    return null;
}

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const file = findFile(["main.css", "css/main.css", "assets/main.css", "style.css"]);
if (!file) {
    console.error("✗ main.css not found (run from your project root)");
    process.exit(1);
}

if (!fs.existsSync(file + ".bak")) fs.copyFileSync(file, file + ".bak");

let src = fs.readFileSync(file, "utf8");
const START = "/* HERO-NAV:START */";
const END = "/* HERO-NAV:END */";
const block = START + "\n" + CSS.trim() + "\n" + END;
const re = new RegExp(escRe(START) + "[\\s\\S]*?" + escRe(END));

src = re.test(src) ? src.replace(re, () => block) : src.replace(/\s*$/, "\n\n") + block + "\n";

fs.writeFileSync(file, src);
console.log("✓ " + path.relative(ROOT, file) + " updated (hero navigation only)");
console.log("Done. Hard-refresh with Ctrl+Shift+R.");
