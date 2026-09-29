#!/usr/bin/env node
/**
 * fix-hero-dots.js
 * Run from your project root:   node fix-hero-dots.js
 * Or pass the root folder:      node fix-hero-dots.js path/to/project
 *
 * Hero navigation becomes centered dots:
 *  - inactive = small gray circle
 *  - active   = long white pill
 *  - no numbers (01 / 05 hidden)
 * CSS only. It replaces the previous HERO-NAV block, so no leftovers.
 * Safe to re-run. Backup: main.css.bak (first run only).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());

const CSS = `
/* =========================================================
   HERO NAVIGATION: centered dots, long active pill
========================================================= */

.hero-navigation {
    position: absolute;
    left: 50%;
    right: auto;
    bottom: 38px;
    transform: translateX(-50%);
    z-index: 10;
    width: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: none;
    box-shadow: none;
    backdrop-filter: none;
}

/* no numbers */
.hero-counter { display: none !important; }

.hero-timeline {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.hero-timeline span {
    position: relative;
    flex: none;
    width: 14px;
    height: 14px;
    border-radius: 99px;
    background: rgba(255, 255, 255, .4) !important;
    overflow: visible;
    cursor: pointer;
    transition: width .5s cubic-bezier(.22, .61, .36, 1), background .3s ease;
}

.hero-timeline span:hover { background: rgba(255, 255, 255, .7) !important; }

.hero-timeline span.active {
    width: 56px;
    background: #fff !important;
}

/* bigger click area */
.hero-timeline span::before {
    content: "";
    position: absolute;
    inset: -10px -4px;
}

.hero-timeline span::after { display: none !important; }

@media (max-width: 650px) {
    .hero-navigation { bottom: 24px; }
    .hero-timeline { gap: 10px; }
    .hero-timeline span { width: 12px; height: 12px; }
    .hero-timeline span.active { width: 44px; }
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
console.log("✓ " + path.relative(ROOT, file) + " updated (hero dots)");
console.log("Done. Hard-refresh with Ctrl+Shift+R.");
