const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();

/* ---------- 1) projects/script.js : swap load-more for real pagination ---------- */
const sp = path.join(ROOT, "projects", "script.js");
let js = fs.readFileSync(sp, "utf8");

if (js.includes("/* PG-PAGER */")) {
  console.log("script.js already patched, skipping");
} else {
  /* page size + state */
  js = js.replace("var PAGE = 24;", "var PAGE = 12;\nvar page = 1;");

  /* replace renderMore with paged render */
  js = js.replace(/function renderMore\(\) \{[\s\S]*?\n\}\n/, String.raw`/* PG-PAGER */
function pagesTotal() { return Math.max(1, Math.ceil(list.length / PAGE)); }

function seq(total, p) {
  var out = [], last = 0;
  for (var i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - p) <= 2) {
      if (last && i - last > 1) out.push("…");
      out.push(i);
      last = i;
    }
  }
  return out;
}

function renderPager() {
  var box = document.querySelector("#pgPager");
  if (!box) return;
  var total = pagesTotal();
  if (total <= 1) { box.innerHTML = ""; return; }
  var h = '<button type="button" class="pgn-nav" data-p="' + (page - 1) + '"' + (page === 1 ? " disabled" : "") + '><span>&rarr;</span> السابق</button><div class="pgn-nums">';
  seq(total, page).forEach(function (n) {
    if (n === "…") h += '<span class="pgn-dots">…</span>';
    else h += '<button type="button" class="pgn-num' + (n === page ? " on" : "") + '" data-p="' + n + '"' + (n === page ? ' aria-current="page"' : "") + '>' + n + '</button>';
  });
  h += '</div><button type="button" class="pgn-nav" data-p="' + (page + 1) + '"' + (page === total ? " disabled" : "") + '>التالي <span>&larr;</span></button>';
  h += '<div class="pgn-info">صفحة ' + page + ' من ' + total + ' &nbsp;·&nbsp; ' + list.length + ' صورة</div>';
  box.innerHTML = h;
}

function renderPage(scroll) {
  var total = pagesTotal();
  if (page > total) page = total;
  if (page < 1) page = 1;
  var start = (page - 1) * PAGE;
  grid.classList.add("swap");
  setTimeout(function () {
    grid.innerHTML = list.slice(start, start + PAGE).map(function (p, k) { return cardHtml(p, start + k); }).join("");
    grid.querySelectorAll(".pg-card img").forEach(function (img) {
      img.addEventListener("error", function () { var c = img.closest(".pg-card"); if (c) c.remove(); }, { once: true });
    });
    grid.classList.remove("swap");
    renderPager();
    if (scroll) {
      var top = document.querySelector(".projects-heading") || grid;
      window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
    }
  }, scroll ? 220 : 0);
  var u = new URL(location.href);
  if (page > 1) u.searchParams.set("page", page); else u.searchParams.delete("page");
  history.replaceState({}, "", u);
}
`);

  /* filter: reset to page 1 */
  js = js.replace(/function setFilter\(g\) \{[\s\S]*?\n\}\n/, String.raw`function setFilter(g, keep) {
  list = g === "الكل" ? all : all.filter(function (p) { return p.group === g; });
  if (!keep) page = 1;
  renderPage(false);
}
`);

  /* init: pager container instead of load-more */
  js = js.replace(/var more = document\.createElement\("div"\);[\s\S]*?more\.querySelector\("button"\)\.addEventListener\("click", renderMore\);/, String.raw`var pager = document.createElement("nav");
    pager.id = "pgPager";
    pager.className = "pgn";
    pager.setAttribute("aria-label", "تنقل الصفحات");
    grid.insertAdjacentElement("afterend", pager);
    pager.addEventListener("click", function (e) {
      var b = e.target.closest("[data-p]");
      if (!b || b.disabled) return;
      page = parseInt(b.getAttribute("data-p"), 10) || 1;
      renderPage(true);
    });
    page = Math.max(1, parseInt(new URLSearchParams(location.search).get("page"), 10) || 1);`);

  js = js.replace('setFilter("الكل");', 'setFilter("الكل", true);');

  /* lightbox should navigate across the whole filtered list (list index) */
  js = js.replace('data-i="\' + i + \'"', 'data-i="\' + i + \'"');
  fs.writeFileSync(sp, js);
  console.log("script.js patched");
}

/* ---------- 2) style.css ---------- */
const S = "/* PG-PAGER-CSS:START */", E = "/* PG-PAGER-CSS:END */";
const css = S + String.raw`
#projectsGrid { transition: opacity .25s ease, transform .25s ease; }
#projectsGrid.swap { opacity: 0; transform: translateY(10px); }

.pg-more { display: none !important; }

.pgn {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 64px;
  padding-top: 40px;
  border-top: 1px solid var(--color-border, #d5e0e6);
  position: relative;
}
.pgn::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 50%;
  width: 90px;
  height: 2px;
  margin-left: -45px;
  background: var(--brand-accent, #d9782d);
}
.pgn-nums { display: flex; align-items: center; gap: 8px; }

.pgn-num, .pgn-nav {
  height: 52px;
  border: 1px solid var(--color-border, #d5e0e6);
  border-radius: 4px;
  background: #fff;
  color: var(--brand-secondary, #0b2a3a);
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: background .3s ease, color .3s ease, border-color .3s ease, transform .3s ease, box-shadow .3s ease;
}
.pgn-num { min-width: 52px; padding: 0 12px; }
.pgn-nav { display: inline-flex; align-items: center; gap: 10px; padding: 0 22px; }
.pgn-nav span { font-size: 18px; transition: transform .3s ease; }

.pgn-num:hover, .pgn-nav:hover:not(:disabled) {
  border-color: var(--brand-primary, #176d91);
  color: var(--brand-primary, #176d91);
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(11, 42, 58, .12);
}
.pgn-nav:hover:not(:disabled) span:first-child { transform: translateX(3px); }
.pgn-nav:hover:not(:disabled) span:last-child { transform: translateX(-3px); }

.pgn-num.on {
  background: linear-gradient(135deg, #12384b, #0b2a3a);
  border-color: #0b2a3a;
  color: #f3b27a;
  cursor: default;
  transform: none;
  box-shadow: 0 12px 26px rgba(11, 42, 58, .28), inset 0 -3px 0 var(--brand-accent, #d9782d);
}
.pgn-nav:disabled { opacity: .35; cursor: not-allowed; }
.pgn-dots { min-width: 30px; text-align: center; color: #5a7686; font-weight: 900; letter-spacing: 2px; }
.pgn-info {
  flex-basis: 100%;
  margin-top: 18px;
  text-align: center;
  color: #5a7686;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .04em;
}

@media (max-width: 650px) {
  .pgn { gap: 8px; margin-top: 44px; }
  .pgn-num { min-width: 42px; height: 44px; font-size: 14px; padding: 0 8px; }
  .pgn-nav { height: 44px; padding: 0 14px; font-size: 14px; }
  .pgn-nums { gap: 5px; order: 3; flex-basis: 100%; justify-content: center; margin-top: 6px; }
}
` + E;

const cp = path.join(ROOT, "projects", "style.css");
let c = fs.readFileSync(cp, "utf8");
const a = c.indexOf(S), b = c.indexOf(E);
if (a > -1 && b > a) c = c.slice(0, a) + c.slice(b + E.length);
fs.writeFileSync(cp, c.replace(/\s*$/, "\n") + "\n" + css + "\n");
console.log("style.css updated. Hard refresh: Ctrl+Shift+R");
