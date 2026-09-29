import fs from "node:fs";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

const D = "components/header/";
for (const f of ["index.html", "style.css", "script.js"]) {
  if (!fs.existsSync(D + f)) { console.error("✖ لم أجد: " + D + f); process.exit(1); }
}

const groups = {
  "شمال الرياض": ["الملقا","حطين","النرجس","العارض","الياسمين","الصحافة","القيروان","الربيع","الغدير","الوادي","النخيل","الفلاح","بنبان","الخير","المروج","الرحمانية","الواحة","الرائد","الازدهار","الندى","الروضة"],
  "شرق الرياض": ["النسيم","السلام","الرمال","القادسية","اليرموك","غرناطة","الحمراء","قرطبة","الجزيرة","النهضة","الخليج","الأندلس","المونسية","الريان","الفيحاء","المعيزيلة","الشرق","الجنادرية"],
  "غرب الرياض": ["لبن","ظهرة لبن","نمار","ديراب","الحزم","شبرا","عرقة","السويدي","السويدي الغربي","طويق","الدرعية","العريجاء","الجرادية","الحائر","عليشة","الخالدية","الشفا","المهدية"],
  "جنوب الرياض": ["العزيزية","الدار البيضاء","المنصورية","منفوحة","بدر","الفاخرية","الشعلة","الشفا الجديدة","الحزم الجنوبي","المصانع","السلي","نمار الجنوبي","الدفاع","الزهرة"],
  "وسط الرياض": ["العليا","السليمانية","الملز","المربع","الفوطة","الوزارات","المعذر","الظهيرة","العود","البطحاء","أم الحمام","الرفيعة","غبيراء","الورود","العقيق","الملك فهد","الملك عبدالله","الملك سلمان","الشهداء","النزهة"]
};

/* ---------- HTML ---------- */
const li = `<!-- AREAS:START -->
                <li class="nav-item has-dropdown">
                    <button class="services-toggle areas-toggle" type="button" aria-expanded="false">
                        <span>مناطق الخدمة</span>
                        <span class="dropdown-arrow">⌄</span>
                    </button>

                    <div class="areas-panel">
${Object.entries(groups).map(([g, list]) => `                        <div class="areas-group">
                            <button class="areas-region" type="button" aria-expanded="false">
                                <span>${g}</span>
                                <span class="areas-chev">⌄</span>
                            </button>
                            <div class="areas-sub">
                                <div class="areas-sub-inner">
${list.map((a) => `                                    <span>حي ${a}</span>`).join("\n")}
                                </div>
                            </div>
                        </div>`).join("\n")}
                    </div>
                </li>
                <!-- AREAS:END -->`;

let html = fs.readFileSync(D + "index.html", "utf8");
const re = /<!-- AREAS:START -->[\s\S]*?<!-- AREAS:END -->/;
if (!re.test(html)) { console.error("✖ لم أجد AREAS:START في header/index.html"); process.exit(1); }
fs.writeFileSync(D + "index.html", html.replace(re, () => li));

/* ---------- CSS ---------- */
inject(D + "style.css", "/* AREAS:START */", "/* AREAS:END */", `
.nav-item.has-dropdown { position: relative; }

.areas-toggle .dropdown-arrow { transition: transform .25s ease; }
.has-dropdown:hover .dropdown-arrow,
.has-dropdown.open .dropdown-arrow { transform: rotate(180deg) translateY(2px); }

.areas-panel {
    position: absolute;
    top: calc(100% + 2px);
    right: 50%;
    z-index: 200;
    width: 290px;
    padding: 8px;
    background: rgba(255, 255, 255, .98);
    border: 1px solid rgba(80, 150, 180, .16);
    border-radius: 14px;
    box-shadow: 0 18px 50px rgba(20, 70, 90, .16);
    text-align: right;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateX(50%) translateY(12px);
    transition: opacity .2s ease, transform .2s ease, visibility .2s ease;
}

.has-dropdown:hover > .areas-panel,
.has-dropdown:focus-within > .areas-panel,
.has-dropdown.open > .areas-panel {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(50%) translateY(0);
}

.areas-group + .areas-group { border-top: 1px solid #e9f1f5; }

.areas-region {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 46px;
    padding: 8px 14px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #173f51;
    font-family: Arial, Tahoma, sans-serif;
    font-size: 16px;
    font-weight: 800;
    text-align: right;
    cursor: pointer;
    transition: background-color .2s ease, color .2s ease;
}

.areas-region:hover,
.areas-group.open .areas-region { background: #e8f6fc; color: #106b91; }

.areas-chev { transition: transform .3s ease; font-size: 18px; line-height: 1; }
.areas-group.open .areas-chev { transform: rotate(180deg); }

.areas-sub {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .3s ease;
}

.areas-group.open .areas-sub { grid-template-rows: 1fr; }

.areas-sub-inner {
    min-height: 0;
    overflow: hidden;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px 6px;
    padding: 0 6px;
}

.areas-group.open .areas-sub-inner {
    max-height: 230px;
    overflow-y: auto;
    padding: 6px;
}

.areas-sub-inner span {
    padding: 6px 8px;
    border-radius: 6px;
    color: #4f7181;
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.5;
    cursor: default;
}

.areas-sub-inner span:hover { background: #f2faff; color: #106b91; }

@media (max-width: 850px) {
    .areas-panel {
        position: static;
        width: 100%;
        display: none;
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: none;
        border: 0;
        box-shadow: none;
        background: #f2faff;
    }
    .has-dropdown:hover > .areas-panel { display: none; }
    .has-dropdown.open > .areas-panel { display: block; transform: none; }
}
`);

/* ---------- JS ---------- */
inject(D + "script.js", "/* AREAS:START */", "/* AREAS:END */", `
document.addEventListener("click", function (e) {
    var toggle = e.target.closest(".areas-toggle");
    var region = e.target.closest(".areas-region");
    var item = document.querySelector(".nav-item.has-dropdown");
    if (!item) return;

    /* فتح/قفل القايمة الرئيسية */
    if (toggle) {
        var open = item.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        return;
    }

    /* فتح منطقة وقفل اللي قبلها */
    if (region) {
        var group = region.parentElement;
        var willOpen = !group.classList.contains("open");
        item.querySelectorAll(".areas-group").forEach(function (g) {
            g.classList.remove("open");
            g.querySelector(".areas-region").setAttribute("aria-expanded", "false");
        });
        if (willOpen) {
            group.classList.add("open");
            region.setAttribute("aria-expanded", "true");
        }
        return;
    }

    /* الضغط بره القايمة يقفلها */
    if (!e.target.closest(".has-dropdown")) {
        item.classList.remove("open");
        item.querySelectorAll(".areas-group").forEach(function (g) { g.classList.remove("open"); });
    }
});
`);

console.log("✔ تم: القايمة بقت مضغوطة (accordion) بدون روابط");
