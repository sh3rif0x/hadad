#!/usr/bin/env node
/**
 * add-faq.js
 * Run from your project root:   node add-faq.js
 * Or pass the root folder:      node add-faq.js path/to/project
 *
 * Adds a "الأسئلة الشائعة" (FAQ) section to:
 *   - index.html  (section + FAQPage schema for Google)
 *   - main.css    (styles, uses your --color-* variables)
 *   - main.js     (accordion behaviour)
 *
 * Safe to re-run: it replaces its own block instead of duplicating it.
 * Backups are saved as <file>.bak (first run only).
 *
 * To change the questions, edit the FAQS array below and run it again.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());

/* ------------------------------------------------------------------ */
/* EDIT YOUR QUESTIONS HERE                                            */
/* ------------------------------------------------------------------ */

const SECTION_ID = "faq";            // link to it with href="#faq"
const CONTACT_LINK = "#contact";     // where the "تواصل معنا" button goes (or a tel:/wa.me link)

const FAQS = [
    {
        q: "كم تكلفة تركيب المظلات والسواتر في الرياض؟",
        a: "يعتمد السعر على المساحة ونوع الخامة والتصميم المطلوب. نقدّم عرض سعر واضح بعد معرفة التفاصيل أو بعد المعاينة، حتى تعرف التكلفة قبل بدء التنفيذ."
    },
    {
        q: "هل توجد معاينة مجانية قبل التنفيذ؟",
        a: "نعم، نزور موقعك ونأخذ المقاسات ونناقش معك الخيارات المناسبة، ثم نرسل لك عرض السعر والمدة المتوقعة للتنفيذ."
    },
    {
        q: "كم تستغرق مدة التنفيذ؟",
        a: "تختلف المدة حسب حجم العمل وتعقيده. المشاريع الصغيرة تنتهي عادة خلال أيام، والمشاريع الأكبر تحتاج وقتًا أطول، ونحدد لك الموعد المتوقع قبل البدء."
    },
    {
        q: "ما أنواع الأعمال التي تنفذونها؟",
        a: "ننفذ أعمال الحدادة بأنواعها من أبواب ونوافذ ودرابزين، ومظلات السيارات والحدائق والمجالس، والسواتر، وأعمال الساندوتش بانل، والزجاج السيكوريت."
    },
    {
        q: "كيف أحمي الحديد من الصدأ؟",
        a: "المعالجة الصحيحة تبدأ بتنظيف السطح ثم وضع طبقة أساس مضادة للصدأ ثم الدهان النهائي المناسب. ومع الصيانة الدورية يبقى الحديد بحالة جيدة لسنوات طويلة."
    },
    {
        q: "هل تعملون في جميع أحياء الرياض؟",
        a: "نعم، نخدم أحياء الرياض والمناطق القريبة منها. تواصل معنا وأخبرنا بموقعك وسنؤكد لك التوفر."
    },
    {
        q: "هل أستطيع اختيار التصميم واللون بنفسي؟",
        a: "بالتأكيد. نعرض عليك نماذج من أعمالنا ويمكنك اختيار التصميم والألوان، أو إرسال صورة تعجبك لنقترح لك تنفيذًا قريبًا منها."
    },
    {
        q: "كيف يمكنني طلب عرض سعر؟",
        a: "تواصل معنا عبر الاتصال أو الواتساب أو نموذج التواصل في الموقع، وأرسل نوع العمل والمقاسات أو صورًا للموقع، وسنرد عليك بأسرع وقت."
    }
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

const esc = (s) =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

function findFile(candidates) {
    for (const c of candidates) {
        const full = path.join(ROOT, c);
        if (fs.existsSync(full)) return full;
    }
    return null;
}

function backupOnce(file) {
    if (!fs.existsSync(file + ".bak")) fs.copyFileSync(file, file + ".bak");
}

function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replace block between markers if present, otherwise insert with insertFn */
function upsert(content, start, end, block, insertFn) {
    const re = new RegExp(escRe(start) + "[\\s\\S]*?" + escRe(end));
    const wrapped = start + "\n" + block + "\n" + end;
    if (re.test(content)) return content.replace(re, () => wrapped);
    return insertFn(content, wrapped);
}

/* ------------------------------------------------------------------ */
/* HTML                                                                */
/* ------------------------------------------------------------------ */

function buildHtml() {
    const items = FAQS.map((f, i) => {
        const id = "faq-" + (i + 1);
        return `            <div class="faq-item${i === 0 ? " is-open" : ""}">
                <h3>
                    <button class="faq-question" type="button" id="${id}-q" aria-expanded="${i === 0}" aria-controls="${id}-a">
                        <span class="faq-num">${String(i + 1).padStart(2, "0")}</span>
                        <span class="faq-text">${esc(f.q)}</span>
                        <span class="faq-icon" aria-hidden="true"></span>
                    </button>
                </h3>
                <div class="faq-answer" id="${id}-a" role="region" aria-labelledby="${id}-q">
                    <div><p>${esc(f.a)}</p></div>
                </div>
            </div>`;
    }).join("\n");

    return `<section class="faq" id="${SECTION_ID}">
    <div class="faq-container">

        <div class="faq-intro">
            <span class="faq-eyebrow">الأسئلة الشائعة</span>
            <h2>إجابات عن أكثر ما <strong>يسأل عنه عملاؤنا</strong></h2>
            <p>جمعنا لك أهم الأسئلة قبل أن تطلب خدمتنا. وإذا لم تجد إجابتك، فريقنا جاهز للرد عليك.</p>
            <a class="faq-cta" href="${esc(CONTACT_LINK)}">لم تجد إجابتك؟ تواصل معنا</a>
        </div>

        <div class="faq-list">
${items}
        </div>

    </div>
</section>`;
}

function buildSchema() {
    const data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
    };
    return '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + "\n</script>";
}

function fixHtml() {
    const file = findFile(["index.html", "1.html"]);
    if (!file) return console.error("✗ index.html not found (run from your project root)");
    backupOnce(file);
    let src = fs.readFileSync(file, "utf8");

    // section: before <footer>, else before </main>, else before </body>
    src = upsert(src, "<!-- FAQ:START -->", "<!-- FAQ:END -->", buildHtml(), (c, block) => {
        const spots = [/<footer[\s>]/i, /<\/main>/i, /<\/body>/i];
        for (const re of spots) {
            const m = re.exec(c);
            if (m) return c.slice(0, m.index) + block + "\n\n" + c.slice(m.index);
        }
        return c + "\n" + block + "\n";
    });

    // schema: before </head>, else before </body>
    src = upsert(src, "<!-- FAQ-SCHEMA:START -->", "<!-- FAQ-SCHEMA:END -->", buildSchema(), (c, block) => {
        const m = /<\/head>/i.exec(c) || /<\/body>/i.exec(c);
        return m ? c.slice(0, m.index) + block + "\n" + c.slice(m.index) : c + "\n" + block;
    });

    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated (section + schema)");
}

/* ------------------------------------------------------------------ */
/* CSS                                                                 */
/* ------------------------------------------------------------------ */

const CSS = `
/* =========================================================
   FAQ
========================================================= */

.faq {
    padding: 110px clamp(24px, 8vw, 140px);
    background: var(--color-bg, #f6f8fa);
}

.faq-container {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 70px;
    align-items: start;
    max-width: 1300px;
    margin: 0 auto;
}

/* ---------- intro ---------- */

.faq-intro { }

.faq-eyebrow {
    display: inline-block;
    margin-bottom: 18px;
    color: var(--color-primary);
    font-size: 15px;
    font-weight: 800;
}

.faq-intro h2 {
    color: var(--color-text-dark, #12384b);
    font-size: clamp(30px, 4vw, 48px);
    font-weight: 900;
    line-height: 1.35;
}

.faq-intro h2 strong { display: block; color: var(--color-primary); }

.faq-intro p {
    margin-top: 20px;
    color: var(--color-text-medium, #4b5b66);
    font-size: 17px;
    line-height: 2;
}

.faq-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 54px;
    margin-top: 28px;
    padding: 0 30px;
    border-radius: var(--radius-sm, 12px);
    background: var(--color-primary);
    color: #fff;
    font-weight: 800;
}

.faq-cta:hover { background: var(--color-primary-dark, var(--color-primary)); }

/* ---------- list ---------- */

.faq-list { display: grid; gap: 14px; }

.faq-item {
    background: #fff;
    border: 1px solid var(--color-border, #e3e8ec);
    border-radius: var(--radius-md, 18px);
}

.faq-item.is-open { border-color: var(--color-primary); }

.faq-item h3 { margin: 0; font-size: inherit; }

.faq-question {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 22px 24px;
    border: 0;
    background: none;
    color: var(--color-text-dark, #12384b);
    font: inherit;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.6;
    text-align: start;
    cursor: pointer;
}

.faq-question:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: -3px;
}

.faq-num {
    flex: none;
    color: var(--color-primary);
    font-size: 15px;
    font-weight: 900;
    opacity: .7;
}

.faq-text { flex: 1; }

/* plus / minus icon */
.faq-icon {
    position: relative;
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-bg, #f0f4f7);
}

.faq-icon::before,
.faq-icon::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 14px;
    height: 2px;
    border-radius: 2px;
    background: var(--color-primary);
    transform: translate(-50%, -50%);
}

.faq-icon::after { transform: translate(-50%, -50%) rotate(90deg); }

.faq-item.is-open .faq-icon { background: var(--color-primary); }
.faq-item.is-open .faq-icon::before,
.faq-item.is-open .faq-icon::after { background: #fff; }
.faq-item.is-open .faq-icon::after { transform: translate(-50%, -50%) rotate(0deg); }

/* plain show/hide: no animation, no layout work */
.faq-answer { display: none; }
.faq-item.is-open .faq-answer { display: block; }

.faq-answer p {
    padding: 0 24px 24px;
    padding-inline-start: 71px;
    color: var(--color-text-medium, #4b5b66);
    font-size: 16px;
    line-height: 2;
}

/* ---------- responsive ---------- */

@media (max-width: 1000px) {
    .faq-container { grid-template-columns: 1fr; gap: 40px; }
    .faq-intro { position: static; }
}

@media (max-width: 650px) {
    .faq { padding: 70px 22px; }
    .faq-question { padding: 18px 16px; font-size: 16px; gap: 12px; }
    .faq-num { display: none; }
    .faq-answer p { padding: 0 16px 20px; font-size: 15px; }
}
`;

function fixCss() {
    const file = findFile(["main.css", "css/main.css", "assets/main.css", "style.css"]);
    if (!file) return console.error("✗ main.css not found");
    backupOnce(file);
    let src = fs.readFileSync(file, "utf8");
    src = upsert(src, "/* FAQ:START */", "/* FAQ:END */", CSS.trim(), (c, block) =>
        c.replace(/\s*$/, "\n\n") + block + "\n"
    );
    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated");
}

/* ------------------------------------------------------------------ */
/* JS                                                                  */
/* ------------------------------------------------------------------ */

const JS = `
(function () {
    function initFaq() {
        var items = document.querySelectorAll(".faq-item");
        if (!items.length) return;

        function setOpen(item, open) {
            var btn = item.querySelector(".faq-question");
            item.classList.toggle("is-open", open);
            if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
        }

        var current = document.querySelector(".faq-item.is-open");

        items.forEach(function (item) {
            var btn = item.querySelector(".faq-question");
            if (!btn) return;

            btn.addEventListener("click", function () {
                if (current && current !== item) setOpen(current, false);
                var willOpen = !item.classList.contains("is-open");
                setOpen(item, willOpen);
                current = willOpen ? item : null;
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFaq);
    } else {
        initFaq();
    }
})();
`;

function fixJs() {
    const file = findFile(["main.js", "js/main.js", "assets/main.js", "script.js"]);
    if (!file) return console.error("✗ main.js not found");
    backupOnce(file);
    let src = fs.readFileSync(file, "utf8");
    src = upsert(src, "/* FAQ:START */", "/* FAQ:END */", JS.trim(), (c, block) =>
        c.replace(/\s*$/, "\n\n") + block + "\n"
    );
    fs.writeFileSync(file, src);
    console.log("✓ " + path.relative(ROOT, file) + " updated");
}

/* ------------------------------------------------------------------ */

console.log("Project root: " + ROOT + "\n");
fixHtml();
fixCss();
fixJs();
console.log('\nDone. Hard-refresh with Ctrl+Shift+R. Link to it anywhere with href="#' + SECTION_ID + '".');
