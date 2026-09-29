import fs from "node:fs";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/* يحذف النسخة القديمة (لو موجودة) ويضيف الجديدة في آخر الملف */
function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

for (const f of ["main.js", "main.css", "components/header/style.css"]) {
  if (!fs.existsSync(f)) { console.error("✖ لم أجد: " + f); process.exit(1); }
}

/* ---------- 1) CSS: الهيرو السينمائي ---------- */
inject("main.css", "/* CINEMATIC:START */", "/* CINEMATIC:END */", `
.hero { background-image: none !important; overflow: hidden; }

.hero-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background: #12384b;
}

.hero-bg::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 5;
    background: rgba(7, 35, 48, .35);
    pointer-events: none;
}

.hero-slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0;
    transform: scale(1.15);
    transition: opacity 1.1s ease;
    animation: cinematicZoom 6s ease-out forwards;
}

.hero-slide.on { opacity: 1; }

@keyframes cinematicZoom {
    0%   { transform: scale(1.15); }
    100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
    .hero-slide { animation: none; transform: none; }
}
`);

/* ---------- 2) CSS: الهيدر أبيض عند السكرول ---------- */
inject("components/header/style.css", "/* HEADER-WHITE:START */", "/* HEADER-WHITE:END */", `
.site-header.scrolled {
    background: #ffffff !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: 0 4px 24px rgba(0, 0, 0, .10) !important;
}
`);

/* ---------- 3) JS: استبدال background-image بطبقات صور متحركة ---------- */
let js = fs.readFileSync("main.js", "utf8");
const re = /home\.style\.backgroundImage\s*=\s*`url\("\.\/assets\/\$\{item\.imageName\}"\)`\s*;/;

if (re.test(js)) {
  js = js.replace(re, () => "setHeroImage(item.imageName);");
  fs.writeFileSync("main.js", js);
} else if (!js.includes("setHeroImage(item.imageName)")) {
  console.error("✖ لم أجد سطر backgroundImage داخل main.js");
  process.exit(1);
}

inject("main.js", "/* CINEMATIC:START */", "/* CINEMATIC:END */", `
function setHeroImage(name) {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    let bg = hero.querySelector(".hero-bg");
    if (!bg) {
        bg = document.createElement("div");
        bg.className = "hero-bg";
        hero.prepend(bg);
    }

    const img = new Image();
    img.className = "hero-slide";
    img.alt = "";
    img.src = "./assets/" + name;
    bg.appendChild(img);

    requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add("on")));

    const old = [...bg.querySelectorAll(".hero-slide")].filter((x) => x !== img);
    setTimeout(() => old.forEach((x) => x.remove()), 1300);
}
`);

console.log("✔ تم: main.js + main.css + components/header/style.css");
