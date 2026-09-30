#!/usr/bin/env node
/*
  التشغيل من جذر المشروع:   node fix-hadada.js
  اختياري:                   node fix-hadada.js --dir حداده

  يعمل على أعمال الحدادة فقط:
   1) data/blog.json (+ 1.json و 2.json لو موجودين): صورة كل مقال حدادة
   2) data/projects.json: يضيف كل الصور في المعرض بتصنيفات فرعية
   3) data/services.json: صور خدمات الحدادة (أبواب/بوابات/درابزين/سلالم/أسوار)
   4) hadada-preview.html: صفحة تعرض كل صورة وتصنيفها وأي صورة أخذها كل مقال
*/
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > -1 ? process.argv[i + 1] : d; };

/* ---------------- المجلد ---------------- */
let DIR_NAME = arg("dir", "حداده");
const ASSETS = path.join(ROOT, "assets");
if (!fs.existsSync(ASSETS)) { console.error("✖ شغّل السكربت من جذر المشروع (فيه مجلد assets)"); process.exit(1); }
if (!fs.existsSync(path.join(ASSETS, DIR_NAME))) {
  const found = fs.readdirSync(ASSETS).find(n => n.includes("حداد") && fs.statSync(path.join(ASSETS, n)).isDirectory());
  if (!found) { console.error("✖ لم أجد مجلد الحدادة داخل assets. استخدم --dir اسم_المجلد"); process.exit(1); }
  DIR_NAME = found;
}
const DIR = path.join(ASSETS, DIR_NAME);
const files = fs.readdirSync(DIR)
  .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  .map(f => f.normalize("NFC"))
  .sort((a, b) => (/\.webp$/i.test(b) - /\.webp$/i.test(a)) || a.localeCompare(b));

/* ---------------- تصحيح الأسماء الغلط (حسب الصور اللي شفتها) ----------------
   أسماء GPT كتير منها غلط، فهنا التصنيف الحقيقي حسب محتوى الصورة.
   لو لقيت صورة في تصنيف غلط: عدّل هنا وشغّل السكربت تاني. */
const BY_NAME = {
  "شباك-حديد-حديقة-مربع.webp": "stairs",
  "درج-داخلي-خشبي-افقي.webp": "stairs",
  "درج-خارجي-حديد-عمودي.webp": "stairs",
  "درابزين-درج-حديد-سلالم-عمودي.webp": "stairs",
  "درابزين-زجاجي-لدرج-عمودي.webp": "railings",
  "درابزين-درج-زجاجي-عمودي.webp": "windows",
  "درابزين-درج-داخلي-افقي.webp": "windows",
  "درابزين-درج-خارجي-حديث-عمودي.webp": "windows",
  "درابزين-نوافذ-حديد-مربع.webp": "windows",
  "درابزين-حديد-داخلي-افقي.webp": "windows",
  "شباك-حديد-مزخرف-عمودي.webp": "windows",
  "نافذة-زجاجية-حديثة-عمودي.webp": "windows",
  "درابزين-درج-خارجي-افقي.webp": "screens",
  "درابزين-درج-حديد-هندسي-افقي.webp": "decor",
  "غرفة-زجاجية-هيكلية-مربع.webp": "pergola"
};
const BY_HASH = {
  "fdc8a0e9": "windows", "fcc8ba15": "windows", "d49212b5": "windows", "b6b75f58": "windows",
  "a477dd6b": "windows", "486c98a3": "windows", "87e87ebb": "windows", "3f5e548d": "windows", "0da85ff4": "windows",
  "d0518a47": "doors",
  "c5664581": "stairs", "b23ab0b5": "stairs", "841640e0": "stairs", "45dd6e66": "stairs", "9d0fc6d7": "stairs",
  "bcf55263": "railings", "a7d36205": "railings", "64490505": "railings", "658418f2": "railings",
  "5891ce93": "railings", "852a3721": "railings", "704f9bc3": "railings", "20e76c76": "railings",
  "9f98e7e3": "railings", "9ce9d2cf": "railings", "5e77ce48": "railings", "5ba597e1": "railings",
  "3fc790fa": "railings", "1b4abd19": "railings",
  "a0133f6a": "decor",
  "9e93bf79": "screens"
};

function classify(f) {
  if (BY_NAME[f]) return BY_NAME[f];
  if (/^[0-9a-f]{32}\./i.test(f)) return BY_HASH[f.slice(0, 8)] || "other";
  if (f.includes("كراج")) return "garage";
  if (f.startsWith("بوابة")) return "gates";
  if (f.startsWith("باب")) return "doors";
  if (f.startsWith("درابزين") || f.startsWith("درج")) return "railings";
  if (f.startsWith("شباك") || f.startsWith("نافذة")) return "windows";
  if (f.startsWith("غرفة")) return "pergola";
  return "other";
}

const LABEL = {
  gates: ["بوابة حديد", "بوابات"], doors: ["باب حديد", "أبواب"], garage: ["باب كراج معدني", "أبواب"],
  railings: ["درابزين حديد", "درابزين"], stairs: ["سلم حديد", "سلالم"], windows: ["حماية شبابيك ونوافذ", "شبابيك"],
  decor: ["ديكور حديد", "ديكور"], screens: ["ساتر حديد مزخرف", "سواتر"], pergola: ["هيكل حديدي وزجاج", "هياكل"]
};

const pools = {};
files.forEach(f => { const c = classify(f); (pools[c] = pools[c] || []).push(f); });

const enc = f => "assets/" + encodeURIComponent(DIR_NAME) + "/" + encodeURIComponent(f);
const abs = f => "/" + enc(f);
const rel = f => "../" + enc(f);

/* ---------------- اختيار الصور ---------------- */
const counters = {};
const used = new Set();
function pick(cats) {
  for (const c of cats) {
    const pool = pools[c];
    if (!pool || !pool.length) continue;
    const fresh = pool.find(f => !used.has(f));
    if (fresh) { used.add(fresh); return { file: fresh, cat: c }; }
    counters[c] = (counters[c] || 0) + 1;
    return { file: pool[counters[c] % pool.length], cat: c, reused: true };
  }
  return null;
}

/* slug المقال => التصنيفات المناسبة (الأول هو الأهم) */
const POSTS = {
  "all-blacksmith-works-riyadh": ["gates"],
  "iron-doors-windows-railings-designs": ["doors"],
  "black-vs-galvanized-iron-blacksmith-riyadh": ["gates"],
  "iron-villa-door-execution-steps": ["doors"],
  "iron-stairs-indoor-outdoor-designs": ["stairs", "railings"],
  "steel-hangars-warehouses-execution": ["pergola"],
  "iron-window-protection-types": ["windows"],
  "iron-gates-sliding-vs-hinged": ["gates"],
  "iron-fences-villas-farms-designs": ["screens", "gates"],
  "iron-shutters-shop-doors": ["garage"],
  "safe-iron-railing-height-spacing": ["railings"],
  "industrial-iron-doors-warehouses": ["garage", "doors"],
  "iron-pergolas-gardens-designs": ["pergola"],
  "interior-iron-decor-partitions-shelves": ["decor", "screens"],
  "welding-types-quality-durability": [],
  "restoring-old-iron-doors-railings": ["doors"]
};
/* صور تقريبية أو ناقصة: هتظهر لك في التقرير عشان تدور عليها */
const NEEDS = {
  "steel-hangars-warehouses-execution": "هنجر / مستودع حديد حقيقي",
  "iron-fences-villas-farms-designs": "سور حديد فيلا / استراحة",
  "iron-shutters-shop-doors": "شتر / باب رول لمحل",
  "industrial-iron-doors-warehouses": "باب مستودع كبير منزلق",
  "iron-pergolas-gardens-designs": "برجولة حديد حديقة",
  "interior-iron-decor-partitions-shelves": "قواطع / أرفف حديد داخلية",
  "welding-types-quality-durability": "صورة لحام حديد (مفيش)"
};

const assign = {};
Object.keys(POSTS).forEach(slug => { if (POSTS[slug].length) assign[slug] = pick(POSTS[slug]); });

/* ---------------- كتابة JSON ---------------- */
function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJson(p, d) {
  if (!fs.existsSync(p + ".hadada.bak")) fs.copyFileSync(p, p + ".hadada.bak");
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
}

/* 1) المقالات */
let blogCount = 0;
["data/blog.json", "data/1.json", "data/2.json"].forEach(rp => {
  const p = path.join(ROOT, rp);
  if (!fs.existsSync(p)) return;
  const data = readJson(p);
  const posts = Array.isArray(data) ? data : data.posts;
  if (!Array.isArray(posts)) return;
  let n = 0;
  posts.forEach(post => {
    const a = assign[post.slug];
    if (!a) return;
    post.image = { src: abs(a.file), alt: (post.image && post.image.alt) || post.title };
    n++;
  });
  writeJson(p, data);
  console.log("✔ " + rp + " : تحديث " + n + " مقال");
  if (rp === "data/blog.json") blogCount = n;
});

/* 2) المعرض */
const pp = path.join(ROOT, "data/projects.json");
if (fs.existsSync(pp)) {
  let projects = readJson(pp).filter(x => x.src !== "hadada");
  const firstGate = pools.gates && pools.gates[0];
  if (firstGate && projects[0]) projects[0].image = rel(firstGate);
  let id = projects.reduce((m, x) => Math.max(m, x.id || 0), 0);
  const nums = {};
  Object.keys(LABEL).forEach(cat => {
    (pools[cat] || []).forEach(f => {
      nums[cat] = (nums[cat] || 0) + 1;
      projects.push({
        id: ++id,
        title: LABEL[cat][0] + " " + String(nums[cat]).padStart(2, "0"),
        category: LABEL[cat][1],
        image: rel(f),
        description: "تنفيذ " + LABEL[cat][0] + " بتصميم ومقاس مناسبين للموقع.",
        src: "hadada"
      });
    });
  });
  writeJson(pp, projects);
  console.log("✔ data/projects.json : أضفت " + projects.filter(x => x.src === "hadada").length + " صورة للمعرض");
}

/* 3) الخدمات */
const sp = path.join(ROOT, "data/services.json");
const svcAssign = {};
if (fs.existsSync(sp)) {
  const SERV = {
    "iron-works": ["gates"], "iron-gates": ["gates"], "iron-doors": ["doors"],
    "iron-railings": ["railings"], "iron-stairs": ["stairs"], "iron-fences": ["screens", "gates"]
  };
  const services = readJson(sp);
  services.forEach(s => {
    if (!SERV[s.slug]) return;
    const a = pick(SERV[s.slug]);
    if (!a) return;
    s.image = rel(a.file);
    svcAssign[s.slug] = a;
  });
  writeJson(sp, services);
  console.log("✔ data/services.json : " + Object.keys(svcAssign).length + " خدمة");
}

/* ---------------- صفحة المعاينة ---------------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const card = (f, note) => '<figure><img loading="lazy" src="' + esc(enc(f)) + '"><figcaption>' + esc(f) + (note ? "<br><b>" + esc(note) + "</b>" : "") + "</figcaption></figure>";
let html = '<!DOCTYPE html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>معاينة الحدادة</title><style>' +
  "body{font-family:Cairo,Tahoma,sans-serif;background:#faf9f6;color:#1b2645;margin:0;padding:24px}h2{margin:36px 0 12px}" +
  ".g{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}figure{margin:0;background:#fff;border:1px solid #e6e3dc;border-radius:8px;overflow:hidden}" +
  "img{width:100%;height:170px;object-fit:cover;display:block}figcaption{font-size:11px;padding:8px;word-break:break-all;direction:ltr;text-align:left}b{color:#c4842a;direction:rtl;display:block}</style>";
html += "<h1>مقال ← صورة</h1><div class=g>" + Object.keys(assign).map(s => card(assign[s].file, s + (NEEDS[s] ? "  (تقريبي)" : ""))).join("") + "</div>";
Object.keys(pools).forEach(c => {
  html += "<h2>" + esc((LABEL[c] ? LABEL[c][0] : "غير مصنف") + " — " + c + " (" + pools[c].length + ")") + "</h2><div class=g>" + pools[c].map(f => card(f)).join("") + "</div>";
});
fs.writeFileSync(path.join(ROOT, "hadada-preview.html"), html);

/* ---------------- تقرير ---------------- */
console.log("\n===== عدد الصور في كل تصنيف =====");
Object.keys(pools).forEach(c => console.log("  " + c.padEnd(9) + pools[c].length));
console.log("\n===== صور ناقصة أو تقريبية (دوّر عليها من النت) =====");
Object.keys(NEEDS).forEach(s => console.log("  • " + s + "  →  " + NEEDS[s] + (assign[s] ? "   [استخدمت: " + assign[s].file + "]" : "   [تُرك كما هو]")));
if (pools.other && pools.other.length) console.log("\n⚠ صور بدون تصنيف (أضفها في BY_HASH / BY_NAME):\n  " + pools.other.join("\n  "));
console.log("\n✔ افتح hadada-preview.html في المتصفح وراجع كل صورة. النسخ الاحتياطية: *.hadada.bak");
console.log("  بعدها Ctrl+Shift+R.  (مقالات محدّثة في blog.json: " + blogCount + ")");
