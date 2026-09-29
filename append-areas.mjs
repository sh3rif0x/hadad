#!/usr/bin/env node
// node append-areas.mjs   (من جذر المشروع)
import fs from "node:fs";
const groups = {
  "شمال الرياض": ["الملقا","حطين","النرجس","العارض","الياسمين","الصحافة","القيروان","الربيع","الغدير","الوادي","النخيل","الفلاح","بنبان","الخير","المروج","الرحمانية","الواحة","الرائد","الازدهار","الندى","الروضة"],
  "شرق الرياض": ["النسيم","السلام","الرمال","القادسية","اليرموك","غرناطة","الحمراء","قرطبة","الجزيرة","النهضة","الخليج","الأندلس","المونسية","الريان","الفيحاء","المعيزيلة","الشرق","الجنادرية"],
  "غرب الرياض": ["لبن","ظهرة لبن","نمار","ديراب","الحزم","شبرا","عرقة","السويدي","السويدي الغربي","طويق","الدرعية","العريجاء","الجرادية","الحائر","عليشة","الخالدية","الشفا","المهدية"],
  "جنوب الرياض": ["العزيزية","الدار البيضاء","المنصورية","منفوحة","بدر","الفاخرية","الشعلة","الشفا الجديدة","الحزم الجنوبي","المصانع","السلي","نمار الجنوبي","الدفاع","الزهرة"],
  "وسط الرياض": ["العليا","السليمانية","الملز","المربع","الفوطة","الوزارات","المعذر","الظهيرة","العود","البطحاء","أم الحمام","الرفيعة","غبيراء","الورود","العقيق","الملك فهد","الملك عبدالله","الملك سلمان","الشهداء","النزهة"]
};
const slug = (s) => encodeURIComponent(s.replace(/\s+/g, "-"));
const cols = Object.entries(groups).map(([g, list]) => `
                        <div class="dropdown-col">
                            <strong>${g}</strong>
                            <ul>
${list.map((a) => `                                <li><a href="/areas/${slug(a)}/">حي ${a}</a></li>`).join("\n")}
                            </ul>
                        </div>`).join("");


const DIR = process.argv.includes("--dir") ? process.argv[process.argv.indexOf("--dir") + 1] : "components/header";
const HTML = DIR + "/index.html", CSS = DIR + "/style.css", JS = DIR + "/script.js";
for (const f of [HTML, CSS, JS]) if (!fs.existsSync(f)) { console.error("✖ لم أجد: " + f); process.exit(1); }

const li = `<!-- AREAS:START -->
                <li class="nav-item has-dropdown">
                    <a href="/">مناطق الخدمة <span class="dropdown-arrow">⌄</span></a>

                    <div class="dropdown">${cols}
                    </div>
                </li>
                <!-- AREAS:END -->`;

const css = `/* ===== مناطق الخدمة ===== */
.nav-item.has-dropdown { position: relative; }
.dropdown-arrow { font-size: 14px; margin-inline-start: 4px; }

.dropdown {
    position: absolute;
    top: 100%;
    right: 50%;
    z-index: 200;
    width: min(980px, 92vw);
    max-height: 70vh;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
    padding: 28px;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    text-align: right;
    opacity: 0;
    visibility: hidden;
    transform: translateX(50%) translateY(12px);
    transition: .25s ease;
}

.nav-item.has-dropdown:hover > .dropdown,
.nav-item.has-dropdown:focus-within > .dropdown,
.nav-item.has-dropdown.open > .dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateX(50%) translateY(0);
}

.dropdown-col strong {
    display: block;
    margin-bottom: 10px;
    padding-bottom: 8px;
    color: var(--color-primary);
    font-size: 15px;
    font-weight: 900;
    border-bottom: 2px solid var(--color-primary-light);
}

.dropdown-col ul { display: flex; flex-direction: column; gap: 2px; }

.dropdown-col a {
    display: block;
    padding: 5px 8px;
    color: var(--color-text);
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
    transition: .2s;
}

.dropdown-col a:hover {
    color: var(--color-primary);
    background: var(--color-blue-100);
    padding-inline-start: 14px;
}

@media (max-width: 1100px) { .dropdown { grid-template-columns: repeat(3, 1fr); } }

@media (max-width: 900px) {
    .dropdown {
        position: static;
        width: 100%;
        max-height: none;
        display: none;
        grid-template-columns: repeat(2, 1fr);
        padding: 16px;
        box-shadow: none;
        opacity: 1;
        visibility: visible;
        transform: none;
    }
    .nav-item.has-dropdown:hover > .dropdown { display: none; }
    .nav-item.has-dropdown.open > .dropdown { display: grid; transform: none; }
}
`;

const js = `document.addEventListener("click", (e) => {
    const link = e.target.closest(".nav-item.has-dropdown > a");
    if (link && window.innerWidth <= 900) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
    }
});`;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}
inject(CSS, "/* AREAS:START */", "/* AREAS:END */", css);
inject(JS, "/* AREAS:START */", "/* AREAS:END */", js);

let html = fs.readFileSync(HTML, "utf8");
const marked = /<!-- AREAS:START -->[\s\S]*?<!-- AREAS:END -->/;
const plain = /<li class="nav-item">\s*<a href="\/">\s*مناطق الخدمة\s*<\/a>\s*<\/li>/;
if (marked.test(html)) html = html.replace(marked, () => li);
else if (plain.test(html)) html = html.replace(plain, () => li);
else { console.error('✖ لم أجد عنصر "مناطق الخدمة" في ' + HTML); process.exit(1); }
fs.writeFileSync(HTML, html);
console.log("✔ تمت الإضافة: " + HTML + " + " + CSS + " + " + JS);
