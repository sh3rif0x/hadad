#!/usr/bin/env node
// Run from the blog dir:  node add-pagination.js
// Change the page size here (or edit PER_PAGE in script.js later):
const PER_PAGE = 15;

const fs = require("fs");
const path = require("path");
const f = (n) => path.join(__dirname, n);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

for (const n of ["index.html", "script.js", "template.js", "style.css"]) {
  if (!fs.existsSync(f(n))) { console.error("✖ missing: " + n + " (run this inside the blog folder)"); process.exit(1); }
  if (!fs.existsSync(f(n) + ".pag.bak")) fs.copyFileSync(f(n), f(n) + ".pag.bak");
}

function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

/* ---------------- 1) index.html: pagination container ---------------- */
let html = fs.readFileSync(f("index.html"), "utf8");
if (!html.includes('id="blogPagination"')) {
  const re = /(<div id="blogGrid" class="blog-grid"><\/div>)/;
  if (!re.test(html)) { console.error("✖ #blogGrid not found in index.html"); process.exit(1); }
  html = html.replace(re, '$1\n        <nav id="blogPagination" class="blog-pagination" aria-label="تنقل الصفحات"></nav>');
  fs.writeFileSync(f("index.html"), html);
}

/* ---------------- 2) template.js: renderPagination ---------------- */
inject(f("template.js"), "/* PAGINATION:START */", "/* PAGINATION:END */", String.raw`
export function renderPagination(total, page, perPage) {
    var pages = Math.ceil(total / perPage);
    if (pages <= 1) return "";

    var seq = [];
    for (var i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || Math.abs(i - page) <= 1) seq.push(i);
        else if (seq[seq.length - 1] !== "...") seq.push("...");
    }

    var out = '<button type="button" class="pg-btn pg-nav" data-page="' + (page - 1) + '"' +
        (page === 1 ? " disabled" : "") + '>→ السابق</button>';

    seq.forEach(function (p) {
        if (p === "...") {
            out += '<span class="pg-dots">…</span>';
        } else {
            out += '<button type="button" class="pg-btn' + (p === page ? " is-active" : "") + '" data-page="' + p + '"' +
                (p === page ? ' aria-current="page"' : "") + ">" + p + "</button>";
        }
    });

    out += '<button type="button" class="pg-btn pg-nav" data-page="' + (page + 1) + '"' +
        (page === pages ? " disabled" : "") + '>التالي ←</button>';

    return out;
}
`);

/* ---------------- 3) script.js ---------------- */
let js = fs.readFileSync(f("script.js"), "utf8");

// import renderPagination
if (!js.includes("renderPagination")) {
  js = js.replace(
    /import\s*\{([^}]*)\}\s*from\s*"\/blog\/template\.js";/,
    (m, names) => 'import {' + names.trimEnd() + ', renderPagination } from "/blog/template.js";'
  );
}

// remove old drawList (original or previous run) and put the paginated one in its place
const S = "/* PAGINATION:START */", E = "/* PAGINATION:END */";
const block = String.raw`${S}
const PER_PAGE = ${PER_PAGE};
const blogPagination = $("#blogPagination");
let currentPage = Math.max(1, parseInt(new URLSearchParams(location.search).get("page"), 10) || 1);
let lastCategory = activeCategory;

function setPageUrl(push) {
    const u = new URL(location.href);
    if (currentPage > 1) u.searchParams.set("page", currentPage);
    else u.searchParams.delete("page");
    history[push ? "pushState" : "replaceState"]({}, "", u);
}

function drawList() {
    const filtered = activeCategory === "all"
        ? posts
        : posts.filter(p => p.category === activeCategory);

    if (activeCategory !== lastCategory) {
        lastCategory = activeCategory;
        currentPage = 1;
        setPageUrl(false);
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (currentPage > totalPages) { currentPage = totalPages; setPageUrl(false); }

    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = filtered.slice(start, start + PER_PAGE);

    if (blogFilters) blogFilters.innerHTML = renderFilters(posts, activeCategory);
    if (blogGrid) blogGrid.innerHTML = renderList(pageItems);
    if (blogPagination) blogPagination.innerHTML = renderPagination(filtered.length, currentPage, PER_PAGE);
}

if (blogPagination) {
    blogPagination.addEventListener("click", e => {
        const btn = e.target.closest("[data-page]");
        if (!btn || btn.disabled) return;
        currentPage = parseInt(btn.getAttribute("data-page"), 10) || 1;
        setPageUrl(true);
        drawList();
        const top = blogList && blogList.querySelector(".blog-list-body");
        if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

window.addEventListener("popstate", () => {
    if (!blogList || blogList.hidden) return;
    currentPage = Math.max(1, parseInt(new URLSearchParams(location.search).get("page"), 10) || 1);
    drawList();
});
${E}`;

const marked = new RegExp(esc(S) + "[\\s\\S]*?" + esc(E));
const original = /function drawList\(\)\s*\{[\s\S]*?\n\}\n/;
if (marked.test(js)) js = js.replace(marked, () => block);
else if (original.test(js)) js = js.replace(original, () => block + "\n");
else { console.error("✖ could not find drawList() in script.js"); process.exit(1); }

fs.writeFileSync(f("script.js"), js);

/* ---------------- 4) style.css ---------------- */
inject(f("style.css"), "/* PAGINATION:START */", "/* PAGINATION:END */", `
.blog-list-body { scroll-margin-top: 100px; }

.blog-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 50px;
}

.blog-pagination:empty { display: none; }

.pg-btn {
    min-width: 46px;
    height: 46px;
    padding: 0 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: #fff;
    color: var(--color-text);
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: var(--transition);
}

.pg-btn:hover:not(:disabled):not(.is-active) {
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-2px);
}

.pg-btn.is-active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
    cursor: default;
}

.pg-btn:disabled { opacity: .4; cursor: not-allowed; }

.pg-nav { padding: 0 20px; }

.pg-dots { min-width: 24px; text-align: center; color: var(--color-text-light); font-weight: 800; }

@media (max-width: 650px) {
    .pg-btn { min-width: 40px; height: 40px; padding: 0 10px; font-size: 14px; }
    .pg-nav { padding: 0 14px; }
    .blog-pagination { gap: 6px; margin-top: 36px; }
}
`);

console.log("✔ pagination added (" + PER_PAGE + " posts per page)");
console.log("  Hard refresh: Ctrl+Shift+R.  Backups: *.pag.bak");
