#!/usr/bin/env node
// الاستخدام من جذر المشروع:  node add-blog-section.mjs
// اختياري: --data data/blog.json --list-url ./articles/ --article-url "./blog/?slug=" --limit 6
import fs from "node:fs";
import path from "node:path";

const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > -1 ? process.argv[i + 1] : d; };
const INDEX = arg("index", "index.html");
const JS_FILE = arg("js", "main.js");
const CSS_FILE = arg("css", "main.css");
const DATA = "./" + arg("data", "data/blog.json").replace(/^\.\//, "");
const LIST_URL = arg("list-url", "./articles/");
const ARTICLE_URL = arg("article-url", "./blog/?slug=");
const LIMIT = Number(arg("limit", 6));

for (const f of [INDEX, JS_FILE, CSS_FILE]) if (!fs.existsSync(f)) { console.error("✖ لم أجد: " + f); process.exit(1); }
if (!fs.existsSync(DATA)) { console.error("✖ لم أجد ملف البيانات: " + DATA); process.exit(1); }

/* يحذف أي نسخة قديمة ثم يضيف الجديدة في آخر الملف */
function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

/* ======================= CSS -> main.css ======================= */
inject(CSS_FILE, "/* BLOGS:START */", "/* BLOGS:END */", `
/* =========================================================
   BLOGS
========================================================= */

.blogs {
    background: var(--color-bg-soft);
    color: var(--color-text);
}

.blogs-heading {
    max-width: 760px;
    margin: 0 auto 50px;
    text-align: center;
}

.blogs-heading > span {
    color: var(--color-primary);
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 1px;
}

.blogs-heading h2 {
    margin-top: 14px;
    color: var(--color-text-dark);
    font-size: clamp(34px, 4.4vw, 56px);
    font-weight: 900;
    line-height: 1.15;
}

.blogs-heading h2 strong {
    color: var(--color-primary);
    font-weight: 900;
}

.blogs-heading p {
    margin-top: 16px;
    color: var(--color-text-medium);
    font-size: 17px;
    line-height: 1.9;
}

.blogs-all {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 24px;
    padding: 12px 26px;
    color: #ffffff;
    background: var(--color-bg-dark);
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 800;
    transition: var(--transition);
}

.blogs-all:hover {
    background: var(--color-primary);
    transform: translateY(-2px);
}

.blogs-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px;
}

.blog-card {
    display: flex;
    align-items: stretch;
    min-height: 190px;
    overflow: hidden;
    background: var(--color-bg-white);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
}

.blog-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-blue-300);
}

.blog-card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 22px 26px;
    text-align: right;
}

.blog-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-bottom: 10px;
    color: var(--color-text-light);
    font-size: 13px;
    font-weight: 700;
}

.blog-card-meta b {
    color: var(--color-primary);
    font-weight: 800;
}

.blog-card-body h3 {
    color: var(--color-text-dark);
    font-size: 19px;
    font-weight: 900;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.blog-card-body p {
    margin-top: 10px;
    color: var(--color-text-medium);
    font-size: 14.5px;
    line-height: 1.9;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.blog-card-more {
    margin-top: auto;
    padding-top: 14px;
    color: var(--color-primary);
    font-size: 14px;
    font-weight: 800;
}

.blog-card:hover .blog-card-more {
    color: var(--color-primary-dark);
}

.blog-card-image {
    flex: 0 0 210px;
    overflow: hidden;
    background: var(--color-blue-100);
}

.blog-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.blog-card:hover .blog-card-image img {
    transform: scale(1.06);
}

.blogs-state {
    grid-column: 1 / -1;
    padding: 30px 0;
    text-align: center;
    color: var(--color-text-medium);
}

@media (max-width: 1000px) {
    .blogs-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 650px) {
    .blog-card {
        flex-direction: column-reverse;
    }
    .blog-card-image {
        flex: none;
        height: 200px;
    }
}
`);

/* ======================= JS -> main.js ======================= */
const js = String.raw`
(function () {

    const BLOGS_DATA = "__DATA__";
    const BLOGS_LIMIT = __LIMIT__;
    const BLOGS_ARTICLE_URL = "__ARTICLE__";
    const BLOGS_FALLBACK_IMAGES = ["hero-1.jpeg", "hero-2.jpeg", "hero-3.jpeg", "hero-4.jpeg", "hero-5.jpeg"];

    const escapeHTML = (value) =>
        String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));

    function blogCard(post) {

        const image = post.image && post.image.src ? post.image.src : "";
        const alt = post.image && post.image.alt ? post.image.alt : post.title;
        const link = BLOGS_ARTICLE_URL + encodeURIComponent(post.slug);

        return '<a class="blog-card" href="' + escapeHTML(link) + '">' +
            '<div class="blog-card-body">' +
            '<div class="blog-card-meta">' +
            (post.category ? '<b>' + escapeHTML(post.category) + '</b>' : '') +
            (post.readingTime ? '<span>' + escapeHTML(post.readingTime) + '</span>' : '') +
            '</div>' +
            '<h3>' + escapeHTML(post.title) + '</h3>' +
            '<p>' + escapeHTML(post.excerpt) + '</p>' +
            '<span class="blog-card-more">اقرأ المزيد ←</span>' +
            '</div>' +
            '<div class="blog-card-image">' +
            '<img src="' + escapeHTML(image) + '" alt="' + escapeHTML(alt) + '" loading="lazy">' +
            '</div>' +
            '</a>';
    }

    async function loadBlogs() {

        const grid = document.getElementById("blogsGrid");

        if (!grid) {
            return;
        }

        grid.innerHTML = '<p class="blogs-state">جاري تحميل المقالات...</p>';

        try {

            const response = await fetch(BLOGS_DATA);

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const data = await response.json();
            const posts = (Array.isArray(data) ? data : data.posts || []).slice(0, BLOGS_LIMIT);

            if (!posts.length) {
                grid.innerHTML = '<p class="blogs-state">لا توجد مقالات حاليًا.</p>';
                return;
            }

            grid.innerHTML = posts.map(blogCard).join("");

            /* لو الصورة غير موجودة نستبدلها بصورة من assets */
            grid.querySelectorAll(".blog-card-image img").forEach((img, i) => {
                img.addEventListener("error", () => {
                    img.src = "./assets/" + BLOGS_FALLBACK_IMAGES[i % BLOGS_FALLBACK_IMAGES.length];
                }, { once: true });
            });

        } catch (error) {

            console.error("Blogs load error:", error);
            grid.innerHTML = '<p class="blogs-state">تعذر تحميل المقالات.</p>';

        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadBlogs);
    } else {
        loadBlogs();
    }

})();
`.replace("__DATA__", DATA).replace("__LIMIT__", LIMIT).replace("__ARTICLE__", ARTICLE_URL);
inject(JS_FILE, "/* BLOGS:START */", "/* BLOGS:END */", js);

/* ======================= HTML -> index.html ======================= */
let html = fs.readFileSync(INDEX, "utf8");

/* تنظيف بقايا النسخة القديمة */
html = html
  .replace(/\s*<link[^>]*components\/blogs\/style\.css[^>]*>/g, "")
  .replace(/\s*<script[^>]*components\/blogs\/script\.js[^>]*><\/script>/g, "");
fs.rmSync("components/blogs", { recursive: true, force: true });

const S = "<!-- BLOGS:START -->", E = "<!-- BLOGS:END -->";
const section = `${S}
        <section class="blogs section" id="blogs">

            <div class="blogs-heading">
                <span>مقالاتنا</span>

                <h2>
                    أحدث
                    <strong>المقالات</strong>
                </h2>

                <p>
                    استكشف أحدث مقالات حداد الرياض للحصول على معلومات ونصائح مفيدة عن الحدادة والمظلات والسواتر.
                </p>

                <a href="${LIST_URL}" class="blogs-all">شاهد الجميع ←</a>
            </div>

            <div class="blogs-grid" id="blogsGrid"></div>

        </section>
        ${E}`;

const re = new RegExp(S + "[\\s\\S]*?" + E);
if (re.test(html)) html = html.replace(re, section);
else if (html.includes("<!-- CONTACT -->")) html = html.replace("<!-- CONTACT -->", section + "\n\n        <!-- CONTACT -->");
else html = html.replace("</main>", section + "\n    </main>");

fs.writeFileSync(INDEX, html);
console.log("✔ تمت الإضافة: index.html + main.js + main.css  (البيانات: " + DATA + ")");
