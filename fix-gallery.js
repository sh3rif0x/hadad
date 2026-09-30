#!/usr/bin/env node
// Run from the site root:  node fix-gallery.js
const fs = require("fs");
const path = require("path");

const TOTAL = 12; // multiple of 6 -> full rows with 2 or 3 columns
const f = (n) => path.join(__dirname, n);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

for (const n of ["index.html", "main.css"]) {
  if (!fs.existsSync(f(n))) { console.error("✖ missing: " + n + " (run from the site root)"); process.exit(1); }
  if (!fs.existsSync(f(n) + ".glfix.bak")) fs.copyFileSync(f(n), f(n) + ".glfix.bak");
}

let html = fs.readFileSync(f("index.html"), "utf8");
const gridRe = /(<div class="gl-grid" id="glGrid">)([\s\S]*?)(\n\s*<\/div>\s*\n\s*<\/section>)/;
const m = html.match(gridRe);
if (!m) { console.error("✖ #glGrid not found in index.html"); process.exit(1); }

const IMG = /\.(jpe?g|png|webp|avif)$/i;
const SKIP = /logo|icon|favicon|banner|sprite|placeholder/i;
const exists = (rel) => { try { return fs.existsSync(f(decodeURI(rel).replace(/^\.\//, ""))); } catch (e) { return false; } };

// 1) current images that really exist
const current = [...m[2].matchAll(/<img src="([^"]+)"/g)].map((x) => x[1]).filter(exists);
const used = new Set(current.map((s) => decodeURI(s).normalize("NFC")));
const list = current.slice();
const dropped = [...m[2].matchAll(/<img src="([^"]+)"/g)].map((x) => x[1]).length - current.length;

// 2) extra candidates from assets (subfolders first, round-robin, then root)
const assets = f("assets");
const folders = fs.readdirSync(assets, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const pools = folders.map((d) =>
  fs.readdirSync(path.join(assets, d)).filter((n) => IMG.test(n) && !SKIP.test(n)).sort().map((n) => "./assets/" + encodeURI(d) + "/" + encodeURI(n))
);
pools.push(fs.readdirSync(assets).filter((n) => IMG.test(n) && !SKIP.test(n)).sort().map((n) => "./assets/" + encodeURI(n)));

let added = 0, guard = 0;
while (list.length < TOTAL && guard++ < 5000) {
  let progressed = false;
  for (const pool of pools) {
    while (pool.length) {
      const cand = pool.shift();
      const key = decodeURI(cand).normalize("NFC");
      if (used.has(key)) continue;
      used.add(key); list.push(cand); added++; progressed = true;
      break;
    }
    if (list.length >= TOTAL) break;
  }
  if (!progressed) break;
}

const items = list.slice(0, TOTAL).map((src) => `
                <button type="button" class="gl-item" aria-label="عرض الصورة بحجم كبير">
                    <img src="${src}" alt="من أعمالنا" loading="lazy" decoding="async">
                    <span class="gl-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg></span>
                </button>`).join("");

html = html.replace(gridRe, (_, a, _b, c) => a + items + c);
fs.writeFileSync(f("index.html"), html);

// 3) css for the zoom icon
const S = "/* GL-ZOOM:START */", E = "/* GL-ZOOM:END */";
const css = `${S}
.gl-zoom {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(27, 38, 69, .62);
    border: 1px solid rgba(255, 255, 255, .35);
    backdrop-filter: blur(6px);
    color: #fff;
    opacity: .9;
    pointer-events: none;
    transition: transform .35s ease, background .35s ease, opacity .35s ease;
}
.gl-zoom svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.gl-item:hover .gl-zoom { background: var(--color-primary); transform: scale(1.12); opacity: 1; }
.gl-item::after { z-index: 1; }
@media (max-width: 650px) { .gl-zoom { width: 32px; height: 32px; top: 10px; left: 10px; } }
${E}`;
let c = fs.readFileSync(f("main.css"), "utf8");
c = c.replace(new RegExp("\\n*" + esc(S) + "[\\s\\S]*?" + esc(E) + "\\n*", "g"), "\n");
fs.writeFileSync(f("main.css"), c.replace(/\s*$/, "\n") + "\n" + css + "\n");

console.log("✔ gallery now has " + Math.min(list.length, TOTAL) + " images (" + added + " added, " + dropped + " missing ones removed)");
if (list.length < TOTAL) console.log("⚠ only " + list.length + " usable images found in assets/");
console.log("  Hard refresh: Ctrl+Shift+R.  Backups: *.glfix.bak");
