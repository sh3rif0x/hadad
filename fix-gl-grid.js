#!/usr/bin/env node
// Run from the site root:  node fix-gl-grid.js
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "main.css");
if (!fs.existsSync(file)) { console.error("✖ missing: main.css (run this from the site root)"); process.exit(1); }
if (!fs.existsSync(file + ".gl.bak")) fs.copyFileSync(file, file + ".gl.bak");

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const S = "/* GL-ONECOL:START */", E = "/* GL-ONECOL:END */";

const block = `${S}
@media (max-width: 650px) {
    .gl-grid { grid-template-columns: 1fr; gap: 8px; }
    .gl-item { aspect-ratio: 4 / 5; }
}
${E}`;

let css = fs.readFileSync(file, "utf8");
css = css.replace(new RegExp("\\n*" + esc(S) + "[\\s\\S]*?" + esc(E) + "\\n*", "g"), "\n");
fs.writeFileSync(file, css.replace(/\s*$/, "\n") + "\n" + block + "\n");

console.log("✔ .gl-grid is now 1 column on screens ≤ 650px");
console.log("  Hard refresh: Ctrl+Shift+R.  Backup: main.css.gl.bak");
