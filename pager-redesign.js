// شغّله من جذر الموقع:  node pager-unify.js
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const WINDOW = 3; // عدد الأرقام قبل وبعد الصفحة الحالية (غيّره لو عايز أكتر)

/* ---------- 1) المدونة: زيادة الأرقام ---------- */
const tp = path.join(ROOT, "blog", "template.js");
let t = fs.readFileSync(tp, "utf8");
if (/Math\.abs\(i - page\) <= \d+/.test(t)) {
  t = t.replace(/Math\.abs\(i - page\) <= \d+/, "Math.abs(i - page) <= " + WINDOW);
  fs.writeFileSync(tp, t);
  console.log("blog/template.js: تم");
} else console.log("blog/template.js: ما لقيت الدالة");

/* ---------- 2) المشاريع: نفس شكل المدونة ---------- */
const sp = path.join(ROOT, "projects", "script.js");
let js = fs.readFileSync(sp, "utf8");

js = js.replace(/Math\.abs\(i - p\) <= \d+/, "Math.abs(i - p) <= " + WINDOW);

const fn = String.raw`function renderPager() {
  var box = document.querySelector("#pgPager");
  if (!box) return;
  var total = pagesTotal();
  if (total <= 1) { box.innerHTML = ""; return; }
  var h = '<button type="button" class="pg-btn pg-nav" data-p="' + (page - 1) + '"' + (page === 1 ? " disabled" : "") + '>→ السابق</button>';
  seq(total, page).forEach(function (n) {
    if (n === "…") h += '<span class="pg-dots">…</span>';
    else h += '<button type="button" class="pg-btn' + (n === page ? " is-active" : "") + '" data-p="' + n + '"' + (n === page ? ' aria-current="page"' : "") + '>' + n + '</button>';
  });
  h += '<button type="button" class="pg-btn pg-nav" data-p="' + (page + 1) + '"' + (page === total ? " disabled" : "") + '>التالي ←</button>';
  box.innerHTML = h;
}
`;
const re = /function renderPager\(\) \{[\s\S]*?\n\}\n/;
if (re.test(js)) {
  js = js.replace(re, () => fn);
  fs.writeFileSync(sp, js);
  console.log("projects/script.js: تم");
} else console.log("projects/script.js: ما لقيت renderPager");

/* ---------- 3) CSS للمشاريع (نفس ستايل المدونة) ---------- */
const S = "/* PG-UNIFY:START */", E = "/* PG-UNIFY:END */";
const css = S + `
.pgn {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px !important;
  margin-top: 50px !important;
}
.pgn:empty { display: none !important; }
.pgn .pg-btn {
  min-width: 46px;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--color-text);
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: var(--transition);
}
.pgn .pg-btn:hover:not(:disabled):not(.is-active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
}
.pgn .pg-btn.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  cursor: default;
}
.pgn .pg-btn:disabled { opacity: .4; cursor: not-allowed; }
.pgn .pg-nav { padding: 0 20px; }
.pgn .pg-dots { min-width: 24px; text-align: center; color: var(--color-text-light); font-weight: 800; }
@media (max-width: 650px) {
  .pgn { gap: 6px !important; margin-top: 36px !important; }
  .pgn .pg-btn { min-width: 40px; height: 40px; padding: 0 10px; font-size: 14px; }
  .pgn .pg-nav { padding: 0 14px; }
}
` + E;

const cp = path.join(ROOT, "projects", "style.css");
let c = fs.readFileSync(cp, "utf8");
c = c.replace(new RegExp("\\n*" + esc(S) + "[\\s\\S]*?" + esc(E) + "\\n*", "g"), "\n");
fs.writeFileSync(cp, c.replace(/\s*$/, "\n") + "\n" + css + "\n");
console.log("projects/style.css: تم");
console.log("اعمل Hard refresh: Ctrl+Shift+R");