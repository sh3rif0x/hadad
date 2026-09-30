import { initHeader } from "/components/header/script.js";

var PAGE = 24;
var grid = document.querySelector("#projectsGrid");
var filtersBox = document.querySelector("#projectsFilters");
var all = [], list = [], shown = 0, cur = 0;

var ICON_ZOOM = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>';
var ICON_SHARE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';

async function loadComponent(sel, url) {
  var t = document.querySelector(sel);
  if (!t) return;
  var r = await fetch(url);
  if (r.ok) t.innerHTML = await r.text();
}

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

function cardHtml(p, i) {
  return '<figure class="pg-card" data-i="' + i + '">' +
    '<img src="' + esc(p.src) + '" alt="' + esc(p.label) + '" loading="lazy">' +
    '<div class="pg-ov"><span class="pg-tag">' + esc(p.label) + '</span></div>' +
    '<button type="button" class="pg-zoom" aria-label="تكبير">' + ICON_ZOOM + '</button>' +
    '<button type="button" class="gl-share" aria-label="مشاركة">' + ICON_SHARE + '</button>' +
    '</figure>';
}

function renderMore() {
  var next = list.slice(shown, shown + PAGE);
  var html = next.map(function (p, k) { return cardHtml(p, shown + k); }).join("");
  grid.insertAdjacentHTML("beforeend", html);
  shown += next.length;
  grid.querySelectorAll(".pg-card img").forEach(function (img) {
    if (img.__b) return;
    img.__b = true;
    img.addEventListener("error", function () { var c = img.closest(".pg-card"); if (c) c.remove(); }, { once: true });
  });
  var more = document.querySelector("#pgMore");
  if (more) more.hidden = shown >= list.length;
}

function setFilter(g) {
  list = g === "الكل" ? all : all.filter(function (p) { return p.group === g; });
  shown = 0;
  grid.innerHTML = "";
  renderMore();
}

function buildFilters() {
  var groups = ["الكل"];
  all.forEach(function (p) { if (groups.indexOf(p.group) < 0) groups.push(p.group); });
  filtersBox.innerHTML = groups.map(function (g, i) {
    return '<button class="project-filter' + (i === 0 ? ' active' : '') + '" type="button" data-g="' + esc(g) + '">' + esc(g) + '</button>';
  }).join("");
  filtersBox.addEventListener("click", function (e) {
    var b = e.target.closest(".project-filter");
    if (!b) return;
    filtersBox.querySelectorAll(".project-filter").forEach(function (x) { x.classList.toggle("active", x === b); });
    setFilter(b.getAttribute("data-g"));
  });
}

/* lightbox */
var lb = document.createElement("div");
lb.className = "pg-lb";
lb.innerHTML = '<button type="button" class="pg-lb-nav pg-lb-prev" aria-label="السابق">&#8250;</button>' +
  '<div class="pg-lb-wrap"><img alt=""><button type="button" class="pg-lb-close" aria-label="إغلاق">&times;</button>' +
  '<button type="button" class="gl-share" aria-label="مشاركة">' + ICON_SHARE + '</button>' +
  '<span class="pg-tag pg-lb-tag"></span></div>' +
  '<button type="button" class="pg-lb-nav pg-lb-next" aria-label="التالي">&#8250;</button>';
document.body.appendChild(lb);

function show(i) {
  if (!list.length) return;
  cur = (i + list.length) % list.length;
  var p = list[cur];
  lb.querySelector(".pg-lb-wrap img").src = p.src;
  lb.querySelector(".pg-lb-tag").textContent = p.label;
  lb.classList.add("on");
  document.body.style.overflow = "hidden";
}
function closeLb() { lb.classList.remove("on"); document.body.style.overflow = ""; }

lb.addEventListener("click", function (e) {
  if (e.target.closest(".gl-share")) return;
  if (e.target.closest(".pg-lb-close") || e.target === lb) return closeLb();
  if (e.target.closest(".pg-lb-next")) return show(cur + 1);
  if (e.target.closest(".pg-lb-prev")) return show(cur - 1);
});
document.addEventListener("keydown", function (e) {
  if (!lb.classList.contains("on")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") show(cur + 1);
  if (e.key === "ArrowRight") show(cur - 1);
});

grid.addEventListener("click", function (e) {
  if (e.target.closest(".gl-share")) return;
  var c = e.target.closest(".pg-card");
  if (c) show(parseInt(c.getAttribute("data-i"), 10));
});

(async function init() {
  try {
    await loadComponent("#header", "/components/header/index.html");
    initHeader();
    await loadComponent("#footer", "/components/footer/index.html");
    var r = await fetch("/data/projects.json");
    all = await r.json();
    var old = document.querySelector("#projectsPagination, .projects-pagination, .blog-pagination");
    if (old) old.remove();
    var more = document.createElement("div");
    more.id = "pgMore";
    more.className = "pg-more";
    more.innerHTML = '<button type="button">عرض المزيد</button>';
    grid.insertAdjacentElement("afterend", more);
    more.querySelector("button").addEventListener("click", renderMore);
    buildFilters();
    setFilter("الكل");
  } catch (err) {
    console.error("Projects init failed:", err);
  }
})();
