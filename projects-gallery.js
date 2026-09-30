const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const ASSETS = path.join(ROOT, "assets");

/* ---------- 1) build data/projects.json from real files ---------- */
const GROUPS = [
  ["حداد", "حدادة"], ["مظلات", "مظلات"], ["سواتر", "سواتر"],
  ["ساندوتش", "ساندوتش بانل"], ["زجاج", "زجاج"]
];
const WIN = "fdc8a0e9 fcc8ba15 d49212b5 b6b75f58 a477dd6b 486c98a3 87e87ebb 3f5e548d 0da85ff4".split(" ");
const STAIR = "c5664581 b23ab0b5 841640e0 45dd6e66 9d0fc6d7".split(" ");
const DOOR = ["d0518a47"];
const DECOR = ["a0133f6a"];
const SCREEN = ["9e93bf79"];

function label(f, dirGroup) {
  const h = /^[0-9a-f]{32}\./i.test(f) ? f.slice(0, 8) : null;
  if (h) {
    if (WIN.includes(h)) return "شباك حديد";
    if (STAIR.includes(h)) return "سلم حديد";
    if (DOOR.includes(h)) return "باب معدني";
    if (DECOR.includes(h)) return "ديكور حديد";
    if (SCREEN.includes(h)) return "ساتر حديد";
    if (dirGroup === "سواتر") return "ساتر";
    return "درابزين حديد";
  }
  const n = f;
  if (n.includes("كراج")) return "باب كراج";
  if (n.startsWith("بوابة-فيلا") || n.startsWith("بوابة")) return "بوابة حديد";
  if (n.startsWith("باب")) return "باب معدني";
  if (n.includes("زجاجي") && n.startsWith("درابزين")) return "درابزين زجاج";
  if (n.startsWith("درابزين-شرفة")) return "درابزين شرفة";
  if (n.startsWith("درابزين-نوافذ") || n.startsWith("شباك") || n.startsWith("نافذة")) return n.startsWith("نافذة") ? "نافذة" : "شباك حديد";
  if (n.startsWith("درابزين")) return "درابزين حديد";
  if (n.startsWith("درج")) return "سلم";
  if (n.includes("ساندوتش")) return n.includes("سقف") ? "سقف ساندوتش بانل" : "ساندوتش بانل";
  if (n.startsWith("برجولة") || n.startsWith("هيكل-برجولة")) return "برجولة";
  if (n.includes("مظلة-سيارات") || n.includes("مظلة-مواقف")) return "مظلة سيارات";
  if (n.startsWith("مظلة")) return "مظلة";
  if (n.startsWith("جلسة")) return "جلسة خارجية";
  if (n.startsWith("قواطع")) return "قواطع زجاج";
  if (n.startsWith("واجهة")) return "واجهة";
  if (n.startsWith("ساتر") || n.startsWith("حاجز")) return "ساتر";
  if (n.startsWith("سياج")) return "سياج";
  if (n.startsWith("سور")) return "سور حديد";
  if (n.startsWith("غرفة")) return dirGroup === "ساندوتش بانل" ? "غرفة ساندوتش بانل" : "غرفة زجاجية";
  if (n.startsWith("لوح")) return "لوح زجاج";
  if (n.startsWith("ممر")) return "ممر مظلل";
  return dirGroup === "حدادة" ? "أعمال حديد" : dirGroup;
}

function groupOfRoot(f) {
  if (/مظلة|برجولة/.test(f)) return "مظلات";
  if (/ساتر|سياج/.test(f)) return "سواتر";
  if (/زجاج|واجهة/.test(f)) return "زجاج";
  return "حدادة";
}

const IMG = /\.(jpe?g|png|webp)$/i;
const SKIPROOT = /^(hero-|banner|logo)/i;
const seen = new Set();
const byGroup = {};

function add(group, dirName, file) {
  const f = file.normalize("NFC");
  if (/\(copy/i.test(f)) return;
  if (seen.has(f)) return;
  seen.add(f);
  const src = "/assets/" + (dirName ? encodeURIComponent(dirName) + "/" : "") + encodeURIComponent(f);
  (byGroup[group] = byGroup[group] || []).push({ src: src, label: label(f, group), group: group });
}

for (const name of fs.readdirSync(ASSETS)) {
  const p = path.join(ASSETS, name);
  if (fs.statSync(p).isDirectory()) {
    const g = GROUPS.find(x => name.includes(x[0]));
    if (!g) continue;
    fs.readdirSync(p).filter(f => IMG.test(f)).sort().forEach(f => add(g[1], name, f));
  }
}
for (const name of fs.readdirSync(ASSETS)) {
  const p = path.join(ASSETS, name);
  if (fs.statSync(p).isFile() && IMG.test(name) && !SKIPROOT.test(name)) add(groupOfRoot(name.normalize("NFC")), "", name);
}

const lists = GROUPS.map(g => byGroup[g[1]] || []);
const out = [];
for (let i = 0; lists.some(l => l[i]); i++) lists.forEach(l => { if (l[i]) out.push(l[i]); });
out.forEach((x, i) => { x.id = i + 1; });
fs.writeFileSync(path.join(ROOT, "data", "projects.json"), JSON.stringify(out, null, 2) + "\n");
console.log("projects.json: " + out.length + " images");

/* ---------- 2) projects/script.js ---------- */
const client = String.raw`
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
`;
fs.writeFileSync(path.join(ROOT, "projects", "script.js"), client.trim() + "\n");
console.log("projects/script.js written");

/* ---------- 3) projects/style.css ---------- */
const S = "/* PG-GALLERY:START */", E = "/* PG-GALLERY:END */";
const css = S + String.raw`
#projectsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 14px;
}
.pg-card {
  position: relative;
  margin: 0;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border-radius: 6px;
  background: #0b2a3a;
  cursor: zoom-in;
  box-shadow: 0 10px 28px rgba(11, 42, 58, .14);
}
.pg-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 1.1s cubic-bezier(.22, .61, .36, 1), filter .6s ease;
}
.pg-card:hover img { transform: scale(1.07); filter: brightness(.82); }
.pg-ov {
  position: absolute;
  inset: auto 0 0 0;
  padding: 60px 20px 20px;
  background: linear-gradient(180deg, transparent, rgba(8, 18, 30, .78));
  opacity: 0;
  transform: translateY(12px);
  transition: opacity .5s ease, transform .5s ease;
  pointer-events: none;
}
.pg-card:hover .pg-ov { opacity: 1; transform: none; }
.pg-tag {
  display: inline-block;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3b27a;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .06em;
}
.pg-zoom, .pg-card .gl-share, .pg-lb-close, .pg-lb-wrap .gl-share {
  position: absolute;
  right: 12px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(11, 42, 58, .72);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background .25s, transform .25s, opacity .4s;
}
.pg-zoom { top: 12px; }
.pg-card .gl-share { top: 58px; }
.pg-card .pg-zoom, .pg-card .gl-share { opacity: 0; }
.pg-card:hover .pg-zoom, .pg-card:hover .gl-share { opacity: 1; }
.pg-zoom:hover, .pg-card .gl-share:hover { background: var(--brand-accent, #d9782d); transform: scale(1.1); }

.pg-more { text-align: center; margin-top: 50px; }
.pg-more[hidden] { display: none; }
.pg-more button {
  min-height: 52px;
  padding: 0 38px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: transparent;
  color: var(--color-primary);
  font-weight: 800;
  cursor: pointer;
  transition: background .3s, color .3s;
}
.pg-more button:hover { background: var(--color-primary); color: #fff; }

.pg-lb {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 20px;
  background: rgba(6, 12, 22, .94);
}
.pg-lb.on { display: flex; }
.pg-lb-wrap { position: relative; max-width: 88vw; }
.pg-lb-wrap img {
  display: block;
  max-width: 88vw;
  max-height: 88vh;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, .6);
}
.pg-lb-close { top: 12px; font-size: 24px; line-height: 1; }
.pg-lb-wrap .gl-share { top: 58px; }
.pg-lb-tag { position: absolute; left: 18px; bottom: 18px; }
.pg-lb-nav {
  width: 48px;
  height: 48px;
  flex: none;
  border: 1px solid rgba(255, 255, 255, .3);
  border-radius: 50%;
  background: rgba(255, 255, 255, .08);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: background .3s, color .3s;
}
.pg-lb-nav:hover { background: #fff; color: #0b2a3a; }
.pg-lb-prev { transform: scaleX(-1); }

@media (hover: none) {
  .pg-ov, .pg-card .pg-zoom, .pg-card .gl-share { opacity: 1; transform: none; }
}
@media (max-width: 650px) {
  #projectsGrid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .pg-lb-nav { display: none; }
}
` + E;
const cp = path.join(ROOT, "projects", "style.css");
let c = fs.readFileSync(cp, "utf8");
const a = c.indexOf(S), b = c.indexOf(E);
if (a > -1 && b > a) c = c.slice(0, a) + c.slice(b + E.length);
fs.writeFileSync(cp, c.replace(/\s*$/, "\n") + "\n" + css + "\n");
console.log("projects/style.css updated. Hard refresh: Ctrl+Shift+R");
