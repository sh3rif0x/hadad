#!/usr/bin/env node
// Run from the projects dir:  node add-projects-pagination.js
// 9 = 3 rows of 3 cards. Change it here, or edit PER_PAGE in script.js later.
const PER_PAGE = 9;

const fs = require("fs");
const path = require("path");
const f = (n) => path.join(__dirname, n);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

for (const n of ["index.html", "script.js", "style.css"]) {
  if (!fs.existsSync(f(n))) { console.error("✖ missing: " + n + " (run this inside the projects folder)"); process.exit(1); }
  if (!fs.existsSync(f(n) + ".pag.bak")) fs.copyFileSync(f(n), f(n) + ".pag.bak");
}

function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

/* ---------------- 1) index.html: pagination container ---------------- */
let html = fs.readFileSync(f("index.html"), "utf8");
if (!html.includes('id="projectsPagination"')) {
  const re = /(<div class="projects-grid" id="projectsGrid">\s*<\/div>)/;
  if (!re.test(html)) { console.error("✖ #projectsGrid not found in index.html"); process.exit(1); }
  html = html.replace(re, '$1\n\n            <!-- PAGINATION -->\n            <nav id="projectsPagination" class="projects-pagination" aria-label="تنقل الصفحات"></nav>');
  fs.writeFileSync(f("index.html"), html);
}

/* ---------------- 2) script.js: paginated renderProjects ---------------- */
const S = "/* PROJECTS-PAGINATION:START */", E = "/* PROJECTS-PAGINATION:END */";

const block = S + `
const PER_PAGE = ${PER_PAGE};
const projectsPagination = document.querySelector("#projectsPagination");
let allProjects = [];
let currentCategory = "الكل";
let currentPage = Math.max(1, parseInt(new URLSearchParams(location.search).get("page"), 10) || 1);

function setPageUrl(push) {
    const u = new URL(location.href);
    if (currentPage > 1) u.searchParams.set("page", currentPage);
    else u.searchParams.delete("page");
    history[push ? "pushState" : "replaceState"]({}, "", u);
}

function paginationHtml(total, page, perPage) {
    const pages = Math.ceil(total / perPage);
    if (pages <= 1) return "";

    const seq = [];
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || Math.abs(i - page) <= 1) seq.push(i);
        else if (seq[seq.length - 1] !== "...") seq.push("...");
    }

    let out = '<button type="button" class="pg-btn pg-nav" data-page="' + (page - 1) + '"' +
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

function renderProjects(projects, category = "الكل") {

    allProjects = projects;

    if (category !== currentCategory) {
        currentCategory = category;
        currentPage = 1;
        setPageUrl(false);
    }

    const filtered = category === "الكل"
        ? projects
        : projects.filter(project => project.category === category);

    if (!filtered.length) {
        projectsGrid.innerHTML = '<div class="projects-empty">لا توجد مشاريع في هذا التصنيف.</div>';
        if (projectsPagination) projectsPagination.innerHTML = "";
        return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (currentPage > totalPages) { currentPage = totalPages; setPageUrl(false); }

    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = filtered.slice(start, start + PER_PAGE);

    projectsGrid.innerHTML = pageItems.map(function (project, index) {
        const number = String(start + index + 1).padStart(2, "0");

        return '<article class="project-card">' +
            '<div class="project-card-image">' +
            '<img src="' + project.image + '" alt="' + project.title + '" loading="lazy">' +
            '<span class="project-category">' + project.category + '</span>' +
            '</div>' +
            '<div class="project-card-content">' +
            '<span class="project-number">' + number + '</span>' +
            '<h3>' + project.title + '</h3>' +
            '<p>' + project.description + '</p>' +
            '</div>' +
            '</article>';
    }).join("");

    if (projectsPagination) {
        projectsPagination.innerHTML = paginationHtml(filtered.length, currentPage, PER_PAGE);
    }
}

if (projectsPagination) {
    projectsPagination.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-page]");
        if (!btn || btn.disabled) return;
        currentPage = parseInt(btn.getAttribute("data-page"), 10) || 1;
        setPageUrl(true);
        renderProjects(allProjects, currentCategory);
        const top = document.querySelector(".projects-page");
        if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

window.addEventListener("popstate", function () {
    currentPage = Math.max(1, parseInt(new URLSearchParams(location.search).get("page"), 10) || 1);
    renderProjects(allProjects, currentCategory);
});
` + E;

let js = fs.readFileSync(f("script.js"), "utf8");
const marked = new RegExp(esc(S) + "[\\s\\S]*?" + esc(E));

if (marked.test(js)) {
  js = js.replace(marked, () => block);
} else {
  const fnStart = js.indexOf("function renderProjects(");
  const filterIdx = js.indexOf("FILTER EVENTS");
  if (fnStart === -1 || filterIdx === -1) { console.error("✖ could not find renderProjects() in script.js"); process.exit(1); }
  const fnEnd = js.lastIndexOf("/*", filterIdx);
  js = js.slice(0, fnStart) + block + "\n\n\n" + js.slice(fnEnd);
}
fs.writeFileSync(f("script.js"), js);

/* ---------------- 3) style.css ---------------- */
inject(f("style.css"), "/* PROJECTS-PAGINATION:START */", "/* PROJECTS-PAGINATION:END */", `
.projects-page { scroll-margin-top: 0; }

.projects-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 50px;
}

.projects-pagination:empty { display: none; }

.projects-pagination .pg-btn {
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

.projects-pagination .pg-btn:hover:not(:disabled):not(.is-active) {
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-2px);
}

.projects-pagination .pg-btn.is-active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
    cursor: default;
}

.projects-pagination .pg-btn:disabled { opacity: .4; cursor: not-allowed; }
.projects-pagination .pg-nav { padding: 0 20px; }
.projects-pagination .pg-dots { min-width: 24px; text-align: center; color: var(--color-text-light); font-weight: 800; }

@media (max-width: 650px) {
    .projects-pagination { gap: 6px; margin-top: 36px; }
    .projects-pagination .pg-btn { min-width: 40px; height: 40px; padding: 0 10px; font-size: 14px; }
    .projects-pagination .pg-nav { padding: 0 14px; }
}
`);

console.log("✔ projects pagination added (" + PER_PAGE + " per page)");
console.log("  Hard refresh: Ctrl+Shift+R.  Backups: *.pag.bak");
