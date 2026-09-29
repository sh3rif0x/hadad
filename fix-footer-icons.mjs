import fs from "node:fs";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

for (const f of ["index.html", "main.css", "main.js", "components/footer/index.html"]) {
  if (!fs.existsSync(f)) { console.error("✖ لم أجد: " + f); process.exit(1); }
}

/* 1) تنظيف ملف الفوتر (شيل ```html لو موجودة، وخلّي مسار اللوجو ثابت) */
let ft = fs.readFileSync("components/footer/index.html", "utf8");
ft = ft.replace(/^\s*```html\s*/i, "").replace(/\s*```\s*$/, "\n").replace(/\.\.\/\.\.\/assets\//g, "/assets/");
fs.writeFileSync("components/footer/index.html", ft);

/* 2) index.html: أيقونات الشمال بشكل صحيح */
const phone = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg>';
const wa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.25.7-1.4 1.3-1.95 1.35-.5.05-1.1.07-1.75-.12a15 15 0 0 1-1.6-.6c-2.8-1.2-4.6-4-4.75-4.2-.13-.2-1.1-1.45-1.1-2.8s.7-2 .95-2.25c.25-.27.55-.33.73-.33h.52c.17 0 .4-.05.62.47.25.6.85 2.05.92 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.32.38-.45.5-.15.15-.3.3-.13.6.17.3.75 1.25 1.6 2 1.1.98 2.02 1.28 2.32 1.43.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.8 2.02.95.3.15.5.22.57.35.07.12.07.72-.18 1.4z"/></svg>';
const up = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';

const block = `<div class="floating-actions">

        <a href="tel:0534107471" class="floating-action floating-phone" aria-label="اتصل بنا" title="اتصل بنا">
            <span class="floating-icon">${phone}</span>
        </a>

        <a href="https://wa.me/966534107471" class="floating-action floating-whatsapp" target="_blank" rel="noopener" aria-label="تواصل معنا عبر واتساب" title="واتساب">
            <span class="floating-icon">${wa}</span>
        </a>

        <button type="button" class="floating-action floating-top" id="scrollTopButton" aria-label="العودة إلى أعلى الصفحة" title="العودة إلى الأعلى">
            <span class="floating-icon floating-icon-stroke">${up}</span>
        </button>

    </div>`;

let idx = fs.readFileSync("index.html", "utf8");
const re = /<div class="floating-actions">[\s\S]*?<\/div>/;
if (!re.test(idx)) { console.error("✖ لم أجد floating-actions في index.html"); process.exit(1); }
idx = idx.replace(re, () => block);
fs.writeFileSync("index.html", idx);

/* 3) CSS: الاتنين تحت الشمال فوق بعض بنفس المحاذاة */
inject("main.css", "/* FLOATING-FIX:START */", "/* FLOATING-FIX:END */", `
.floating-action {
    width: 54px;
    height: 54px;
    padding: 0;
    color: #fff;
}

.floating-icon svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
    display: block;
}

.floating-icon-stroke svg {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
}

/* الزرين على الشمال، تحت بعض، نفس الـ left */
.floating-whatsapp,
.floating-phone {
    left: 24px;
    top: auto;
    transform: none;
}

.floating-whatsapp { bottom: 24px; }
.floating-phone { bottom: 90px; }

.floating-phone:hover,
.floating-whatsapp:hover {
    transform: translateY(-4px) scale(1.05);
}

@media (max-width: 650px) {
    .floating-action { width: 48px; height: 48px; }
    .floating-icon svg { width: 22px; height: 22px; }
    .floating-whatsapp,
    .floating-phone { left: 16px; }
    .floating-whatsapp { bottom: 16px; }
    .floating-phone { bottom: 74px; }
}
`);

/* 4) JS: تحميل الفوتر في الصفحة الرئيسية */
inject("main.js", "/* FOOTER-LOAD:START */", "/* FOOTER-LOAD:END */", `
(async function loadFooter() {
    async function run() {
        const target = document.getElementById("footer");
        if (!target) return;
        try {
            const r = await fetch("/components/footer/index.html");
            if (!r.ok) throw new Error("HTTP " + r.status);
            let html = await r.text();
            html = html.replace(/^\\s*\`\`\`html\\s*/i, "").replace(/\\s*\`\`\`\\s*$/, "");
            target.innerHTML = html;
        } catch (e) {
            console.error("Footer load error:", e);
        }
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();
`);

console.log("✔ تم: الفوتر اتربط + الأيقونات اتظبطت");
