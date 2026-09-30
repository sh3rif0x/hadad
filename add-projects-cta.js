// شغّله من جذر الموقع:  node add-projects-cta.js
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const strip = (t, s, e) => t.replace(new RegExp("\\n*[ \\t]*" + esc(s) + "[\\s\\S]*?" + esc(e) + "[ \\t]*\\n?", "g"), "\n");

const ip = path.join(ROOT, "index.html");
let html = fs.readFileSync(ip, "utf8");

/* ---------- 1) زر المشاريع (تحت المعرض) ---------- */
const PS = "<!-- PROJECTS-CTA:START -->", PE = "<!-- PROJECTS-CTA:END -->";
const projectsBlock = `${PS}
            <div class="gl-cta">
                <a href="/projects/" class="gl-all">
                    <span>شاهد جميع المشاريع</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
                </a>
            </div>
            ${PE}`;

html = strip(html, PS, PE);
const re1 = /(\s*)<\/section>(\s*<div class="gl-box")/;
if (!re1.test(html)) { console.error("✖ ما لقيت نهاية سكشن المعرض"); process.exit(1); }
html = html.replace(re1, (m, a, b) => "\n\n            " + projectsBlock + "\n\n        </section>" + b);

/* ---------- 2) زر المدونة: ينتقل لتحت ---------- */
const BS = "<!-- BLOGS-CTA:START -->", BE = "<!-- BLOGS-CTA:END -->";
html = strip(html, BS, BE);
html = html.replace(/\s*<a href="\/blog\/" class="blogs-all">[\s\S]*?<\/a>/g, "");

const blogsBlock = `${BS}
            <div class="blogs-cta">
                <a href="/blog/" class="blogs-all">
                    <span>شاهد جميع المقالات</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
                </a>
            </div>
            ${BE}`;
const re2 = /(<div class="blogs-grid" id="blogsGrid"><\/div>)/;
if (!re2.test(html)) { console.error("✖ ما لقيت #blogsGrid"); process.exit(1); }
html = html.replace(re2, (m) => m + "\n\n            " + blogsBlock);
fs.writeFileSync(ip, html);
console.log("index.html: تم");

/* ---------- 3) CSS ---------- */
const S = "/* PROJECTS-CTA:START */", E = "/* PROJECTS-CTA:END */";
const css = S + `
.gl-cta, .blogs-cta {
    display: flex;
    justify-content: center;
    margin-top: 56px;
}

.gl-all, .blogs-cta .blogs-all {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 60px;
    margin-top: 0;
    padding: 0 40px;
    border-radius: var(--radius-sm);
    background: var(--color-bg-dark);
    color: #fff;
    font-size: 17px;
    font-weight: 800;
    transition: background .3s ease, transform .3s ease, box-shadow .3s ease;
}

.gl-all svg, .blogs-cta .blogs-all svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform .3s ease;
}

.gl-all:hover, .blogs-cta .blogs-all:hover {
    background: var(--color-primary);
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(11, 42, 58, .22);
}

.gl-all:hover svg, .blogs-cta .blogs-all:hover svg { transform: translateX(-6px); }

@media (max-width: 650px) {
    .gl-cta, .blogs-cta { margin-top: 36px; }
    .gl-all, .blogs-cta .blogs-all { width: 100%; min-height: 56px; padding: 0 24px; font-size: 16px; }
}
` + E;

const cp = path.join(ROOT, "main.css");
let c = fs.readFileSync(cp, "utf8");
c = c.replace(new RegExp("\\n*" + esc(S) + "[\\s\\S]*?" + esc(E) + "\\n*", "g"), "\n");
fs.writeFileSync(cp, c.replace(/\s*$/, "\n") + "\n" + css + "\n");
console.log("main.css: تم");
console.log("اعمل Hard refresh: Ctrl+Shift+R");
