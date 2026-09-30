#!/usr/bin/env node
// Run from the site root:  node add-footer-credit.js
const fs = require("fs");
const path = require("path");

const NAME = "علي شريف";
const LABEL = "تم تصميم وتطوير هذا الموقع بواسطة";
const LINK = "https://wa.me/201279924599";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

// find components/footer (works from the root or from a sub-folder)
let dir = path.join(__dirname, "components", "footer");
if (!fs.existsSync(dir)) dir = path.join(__dirname, "..", "components", "footer");

const htmlFile = path.join(dir, "index.html");
const cssFile = path.join(dir, "style.css");

for (const file of [htmlFile, cssFile]) {
  if (!fs.existsSync(file)) {
    console.error("✖ missing: " + file + " (run this from the site root)");
    process.exit(1);
  }
  if (!fs.existsSync(file + ".credit.bak")) fs.copyFileSync(file, file + ".credit.bak");
}

/* ---------------- 1) footer/index.html ---------------- */
const HS = "<!-- FOOTER-CREDIT:START -->";
const HE = "<!-- FOOTER-CREDIT:END -->";

const htmlBlock = `${HS}
<div class="footer-credit">
    <span>${LABEL}</span>
    <a href="${LINK}" target="_blank" rel="noopener">${NAME}</a>
</div>
${HE}`;

let html = fs.readFileSync(htmlFile, "utf8");

// remove old copy (so re-running never duplicates)
html = html.replace(new RegExp("\\n*" + esc(HS) + "[\\s\\S]*?" + esc(HE) + "\\n*", "g"), "\n");

const closeIdx = html.lastIndexOf("</footer>");
if (closeIdx !== -1) {
  // put it at the very bottom, inside <footer>
  html = html.slice(0, closeIdx).replace(/\s*$/, "\n\n") + htmlBlock + "\n" + html.slice(closeIdx);
} else {
  html = html.replace(/\s*$/, "\n\n") + htmlBlock + "\n";
}
fs.writeFileSync(htmlFile, html);

/* ---------------- 2) footer/style.css ---------------- */
const CS = "/* FOOTER-CREDIT:START */";
const CE = "/* FOOTER-CREDIT:END */";

const cssBlock = `${CS}
.footer-credit {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
}

.footer-credit a {
    color: #f2c98a;
    font-weight: 800;
    transition: color 0.3s ease;
}

.footer-credit a:hover {
    color: #ffffff;
}
${CE}`;

let css = fs.readFileSync(cssFile, "utf8");
css = css.replace(new RegExp("\\n*" + esc(CS) + "[\\s\\S]*?" + esc(CE) + "\\n*", "g"), "\n");
fs.writeFileSync(cssFile, css.replace(/\s*$/, "\n") + "\n" + cssBlock + "\n");

console.log("✔ footer credit added");
console.log("  Hard refresh: Ctrl+Shift+R.  Backups: *.credit.bak");