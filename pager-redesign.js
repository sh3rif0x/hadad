const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();

/* ---------- JS: new markup (chevron icons, no text buttons) ---------- */
const sp = path.join(ROOT, "projects", "script.js");
let js = fs.readFileSync(sp, "utf8");
const fn = String.raw`function renderPager() {
  var box = document.querySelector("#pgPager");
  if (!box) return;
  var total = pagesTotal();
  if (total <= 1) { box.innerHTML = ""; return; }
  var R = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  var L = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  var h = '<div class="pgn-bar">';
  h += '<button type="button" class="pgn-nav" aria-label="السابق" data-p="' + (page - 1) + '"' + (page === 1 ? " disabled" : "") + '>' + R + '</button>';
  seq(total, page).forEach(function (n) {
    if (n === "…") h += '<span class="pgn-dots">···</span>';
    else h += '<button type="button" class="pgn-num' + (n === page ? " on" : "") + '" data-p="' + n + '"' + (n === page ? ' aria-current="page"' : "") + '>' + n + '</button>';
  });
  h += '<button type="button" class="pgn-nav" aria-label="التالي" data-p="' + (page + 1) + '"' + (page === total ? " disabled" : "") + '>' + L + '</button>';
  h += '</div><div class="pgn-info">صفحة ' + page + ' من ' + total + '<i></i>' + list.length + ' صورة</div>';
  box.innerHTML = h;
}
`;
if (/function renderPager\(\) \{[\s\S]*?\n\}\n/.test(js)) {
  js = js.replace(/function renderPager\(\) \{[\s\S]*?\n\}\n/, () => fn);
  fs.writeFileSync(sp, js);
  console.log("script.js updated");
} else console.log("renderPager not found - run projects-pagination.js first");

/* ---------- CSS ---------- */
const S = "/* PG-PAGER-CSS:START */", E = "/* PG-PAGER-CSS:END */";
const css = S + String.raw`
#projectsGrid { transition: opacity .25s ease, transform .25s ease; }
#projectsGrid.swap { opacity: 0; transform: translateY(10px); }
.pg-more { display: none !important; }

.pgn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin-top: 70px;
}
.pgn-bar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(11, 42, 58, .08);
  box-shadow: 0 18px 44px rgba(11, 42, 58, .10);
}
.pgn-num, .pgn-nav {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #0b2a3a;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: background .3s ease, color .3s ease, transform .3s ease, box-shadow .3s ease;
}
.pgn-num:hover:not(.on) { background: #eaf1f5; color: #176d91; }
.pgn-nav {
  color: #176d91;
  background: #f5f8fa;
}
.pgn-nav:hover:not(:disabled) { background: #0b2a3a; color: #fff; transform: scale(1.06); }
.pgn-nav:disabled { opacity: .3; cursor: not-allowed; }

.pgn-num.on {
  background: linear-gradient(145deg, #e8944a, #d9782d);
  color: #fff;
  cursor: default;
  box-shadow: 0 8px 20px rgba(217, 120, 45, .42);
}
.pgn-dots {
  min-width: 26px;
  text-align: center;
  color: #9fb2bd;
  font-weight: 900;
  letter-spacing: 1px;
}
.pgn-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #5a7686;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .05em;
}
.pgn-info i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #d9782d;
}

@media (max-width: 650px) {
  .pgn { margin-top: 46px; }
  .pgn-bar { padding: 6px; gap: 2px; }
  .pgn-num, .pgn-nav { width: 38px; height: 38px; font-size: 14px; }
  .pgn-dots { min-width: 18px; }
}
` + E;
const cp = path.join(ROOT, "projects", "style.css");
let c = fs.readFileSync(cp, "utf8");
const a = c.indexOf(S), b = c.indexOf(E);
if (a > -1 && b > a) c = c.slice(0, a) + c.slice(b + E.length);
fs.writeFileSync(cp, c.replace(/\s*$/, "\n") + "\n" + css + "\n");
console.log("style.css updated. Hard refresh: Ctrl+Shift+R");
