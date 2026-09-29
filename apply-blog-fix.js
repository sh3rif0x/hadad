#!/usr/bin/env node
/**
 * apply-blog-fix.js
 * Run from your project root:   node apply-blog-fix.js
 * Or pass the root folder:      node apply-blog-fix.js path/to/project
 *
 * It will:
 *  1. blog/index.html  -> replace the #blogList section with a dark hero
 *  2. blog/template.js -> replace the <header class="blog-post-hero"> block
 *  3. data/blog.json   -> set real image.src for every post
 *  4. blog/style.css   -> replace the whole file with the project palette
 *
 * Every file is backed up first as <file>.bak
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const p = (...parts) => path.join(ROOT, ...parts);

function backup(file) {
    fs.copyFileSync(file, file + ".bak");
}

function need(file) {
    if (!fs.existsSync(file)) {
        console.error("✗ File not found: " + file);
        console.error("  Run this script from your project root.");
        process.exit(1);
    }
}

/* ------------------------------------------------------------------ */
/* 1. blog/index.html                                                  */
/* ------------------------------------------------------------------ */

const LIST_SECTION = `<section id="blogList" class="blog-list-page">

    <div class="blog-hero">
        <div class="blog-hero-content">
            <span class="blog-eyebrow">مدونة حداد الرياض</span>
            <h1>
                المقالات
                <strong>والنصائح</strong>
            </h1>
            <p>أدلة ونصائح عملية عن الحدادة والمظلات والساندوتش بانل لتختار التنفيذ المناسب لمشروعك.</p>
        </div>
    </div>

    <div class="blog-list-body">
        <div id="blogFilters" class="blog-filters"></div>
        <div id="blogGrid" class="blog-grid"></div>
    </div>

</section>`;

function fixIndex() {
    const file = p("blog", "index.html");
    need(file);
    const src = fs.readFileSync(file, "utf8");
    const re = /<section[^>]*id=["']blogList["'][^>]*>[\s\S]*?<\/section>/;
    if (!re.test(src)) {
        console.warn("! blog/index.html: #blogList section not found, skipped");
        return;
    }
    backup(file);
    fs.writeFileSync(file, src.replace(re, () => LIST_SECTION));
    console.log("✓ blog/index.html updated");
}

/* ------------------------------------------------------------------ */
/* 2. blog/template.js                                                 */
/* ------------------------------------------------------------------ */

// NOTE: \${ is escaped so the script writes a literal ${ into template.js
const POST_HEADER = `<header class="blog-post-hero">
            <div class="blog-post-hero-image">
                \${img(post.image, true)}
            </div>
            <div class="blog-post-hero-overlay"></div>

            <div class="blog-post-hero-content">
                <nav class="blog-breadcrumb" aria-label="breadcrumb">
                    <a href="/">الرئيسية</a>
                    <span>/</span>
                    <a href="/blog/">المدونة</a>
                    <span>/</span>
                    <strong>\${esc(post.category)}</strong>
                </nav>

                <span class="blog-post-category">\${esc(post.category)}</span>
                <h1>\${esc(post.title)}</h1>

                <div class="blog-post-meta">
                    <span>\${esc(fmtDate(post.publishedAt))}</span>
                    <span>•</span>
                    <span>\${esc(post.readingTime)}</span>
                    <span>•</span>
                    <span>\${esc(site.name || "حداد الرياض")}</span>
                </div>
            </div>
        </header>`;

function fixTemplate() {
    const file = p("blog", "template.js");
    need(file);
    const src = fs.readFileSync(file, "utf8");
    const re = /<header class="blog-post-hero">[\s\S]*?<\/header>/;
    if (!re.test(src)) {
        console.warn('! blog/template.js: <header class="blog-post-hero"> not found, skipped');
        return;
    }
    backup(file);
    fs.writeFileSync(file, src.replace(re, () => POST_HEADER));
    console.log("✓ blog/template.js updated");
}

/* ------------------------------------------------------------------ */
/* 3. data/blog.json                                                   */
/* ------------------------------------------------------------------ */

const IMAGES = {
    "all-blacksmith-works-riyadh": "/assets/image-1790545454628.jpg",
    "car-parking-shades-riyadh": "/assets/hero-1.jpeg",
    "garden-and-majlis-shades-types": "/assets/hero-4.jpeg",
    "privacy-screens-villas-farms-riyadh": "/assets/hero-3.jpeg",
    "sandwich-panel-benefits-uses": "/assets/0015sandwich.webp",
    "tempered-glass-security-benefits": "/assets/Aluminum-Sliding-Glass-Doors.webp",
    "how-to-choose-best-blacksmith-riyadh": "/assets/image-1790545449952.jpg",
    "iron-doors-windows-railings-designs": "/assets/facades-6.jpg",
    "factors-affecting-blacksmith-shades-price": "/assets/panel-big.webp",
    "protect-iron-from-rust-maintenance-tips": "/assets/444.jpeg"
};

function fixJson() {
    const file = p("data", "blog.json");
    need(file);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    // supports [ ...posts ] or { posts: [ ... ] }
    const posts = Array.isArray(data)
        ? data
        : Array.isArray(data.posts)
            ? data.posts
            : Array.isArray(data.articles)
                ? data.articles
                : null;

    if (!posts) {
        console.warn("! data/blog.json: could not find the posts array, skipped");
        return;
    }

    let changed = 0;
    posts.forEach((post) => {
        const src = IMAGES[post.slug];
        if (!src) return;
        post.image = Object.assign({}, post.image, { src });
        changed++;
    });

    backup(file);
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log("✓ data/blog.json updated (" + changed + " posts)");
}

/* ------------------------------------------------------------------ */
/* 4. blog/style.css                                                   */
/* ------------------------------------------------------------------ */

const CSS = `/* =========================================================
   BLOG (uses variables from /main.css)
========================================================= */

#blogPage {
    min-height: 60vh;
    background: var(--color-bg);
    color: var(--color-text);
}

html { scroll-behavior: smooth; }

.blog-list-page,
.blog-detail-page,
.blog-not-found { width: 100%; }

/* ---------- LIST HERO ---------- */

.blog-hero {
    display: flex;
    align-items: flex-end;
    min-height: 520px;
    padding: 150px clamp(24px, 8vw, 140px) 90px;
    background:
        linear-gradient(rgba(18, 56, 75, .74), rgba(18, 56, 75, .92)),
        url("/assets/banner.png") center / cover no-repeat;
}

.blog-hero-content { max-width: 820px; }

.blog-eyebrow {
    display: inline-block;
    margin-bottom: 22px;
    color: var(--color-accent-light);
    font-size: 15px;
    font-weight: 800;
}

.blog-hero h1 {
    color: #fff;
    font-size: clamp(46px, 7vw, 86px);
    font-weight: 900;
    line-height: 1.05;
}

.blog-hero h1 strong { display: block; color: var(--color-accent-light); }

.blog-hero p {
    max-width: 640px;
    margin-top: 26px;
    color: rgba(255, 255, 255, .78);
    font-size: 18px;
    line-height: 2;
}

.blog-list-body {
    padding: 80px clamp(24px, 8vw, 140px) 110px;
}

/* ---------- FILTERS ---------- */

.blog-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 35px; }

.blog-filter {
    min-height: 48px;
    padding: 0 22px;
    border: 1px solid var(--color-border);
    border-radius: 30px;
    background: #fff;
    color: var(--color-text);
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: var(--transition);
}

.blog-filter:hover { border-color: var(--color-primary); color: var(--color-primary); }

.blog-filter.is-active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
}

/* ---------- CARDS ---------- */

.blog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }

.blog-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    color: inherit;
    transition: transform .35s ease, box-shadow .35s ease;
}

.blog-card:hover { transform: translateY(-7px); box-shadow: var(--shadow-lg); }

.blog-card-image { aspect-ratio: 16 / 10; overflow: hidden; background: var(--color-bg-dark); }

.blog-card-image img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform .6s ease;
}

.blog-card:hover .blog-card-image img { transform: scale(1.06); }

.blog-card-content { display: flex; flex-direction: column; gap: 10px; padding: 24px; flex: 1; }

.blog-card-meta {
    display: flex; justify-content: space-between;
    color: var(--color-text-light); font-size: 13px; font-weight: 700;
}

.blog-card-category { color: var(--color-primary); font-weight: 800; }

.blog-card h2 { color: var(--color-text-dark); font-size: 21px; font-weight: 900; line-height: 1.5; }

.blog-card p { color: var(--color-text-medium); font-size: 15px; line-height: 1.9; }

.blog-card-link { margin-top: auto; padding-top: 6px; color: var(--color-primary); font-weight: 800; }

.blog-empty { grid-column: 1 / -1; padding: 60px 0; text-align: center; color: var(--color-text-medium); }

/* ---------- POST HERO ---------- */

.blog-post-hero {
    position: relative;
    display: flex;
    align-items: flex-end;
    min-height: 640px;
    overflow: hidden;
    background: var(--color-bg-dark);
}

.blog-post-hero-image { position: absolute; inset: 0; }
.blog-post-hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; }

.blog-post-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(7, 25, 35, .35), rgba(7, 25, 35, .9));
}

.blog-post-hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 170px 24px 70px;
}

.blog-breadcrumb {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, .7); font-size: .9rem;
}

.blog-breadcrumb a { color: inherit; }
.blog-breadcrumb a:hover { color: var(--color-accent-light); }
.blog-breadcrumb strong { color: #fff; }

.blog-post-category {
    display: inline-block;
    margin-bottom: 14px;
    color: var(--color-accent-light);
    font-weight: 800; font-size: .95rem;
}

.blog-post-hero h1 {
    color: #fff;
    font-size: clamp(32px, 5vw, 60px);
    font-weight: 900; line-height: 1.3;
    margin-bottom: 20px;
}

.blog-post-meta {
    display: flex; flex-wrap: wrap; gap: 10px;
    color: rgba(255, 255, 255, .75); font-size: .95rem;
}

/* ---------- POST BODY ---------- */

.blog-detail-page { padding-bottom: 100px; }

.blog-post-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 290px;
    gap: 48px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 80px 24px 0;
}

.blog-post-aside { order: 2; }

.blog-toc {
    position: sticky; top: 110px;
    padding: 22px;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.blog-toc strong { display: block; margin-bottom: 14px; color: var(--color-text-dark); font-weight: 900; }
.blog-toc ol { display: grid; gap: 10px; padding-inline-start: 18px; list-style: decimal; }
.blog-toc a { color: var(--color-text-medium); font-size: .93rem; line-height: 1.6; }
.blog-toc a:hover { color: var(--color-primary); }

.blog-post-body { font-size: 1.05rem; line-height: 2; color: var(--color-text); }

.blog-post-excerpt {
    margin-bottom: 36px;
    padding-inline-start: 18px;
    border-inline-start: 4px solid var(--color-primary);
    color: var(--color-text-medium);
    font-size: 1.15rem;
}

.blog-section { margin-bottom: 38px; scroll-margin-top: 110px; }

.blog-section h2 {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 14px;
    color: var(--color-text-dark);
    font-size: 1.6rem; font-weight: 900; line-height: 1.5;
}

.blog-section h2 span { color: var(--color-primary); font-size: 1rem; font-weight: 900; }
.blog-section p { margin-bottom: 14px; color: var(--color-text-medium); }
.blog-section ul { display: grid; gap: 10px; margin-bottom: 14px; }
.blog-section li { position: relative; padding-inline-start: 30px; color: var(--color-text-medium); }

.blog-section li::before {
    content: "✓";
    position: absolute; inset-inline-start: 0;
    color: var(--color-primary); font-weight: 900;
}

/* ---------- FAQ ---------- */

.blog-faq { margin: 50px 0; }
.blog-faq h2 { margin-bottom: 18px; color: var(--color-text-dark); font-size: 1.6rem; font-weight: 900; }

.blog-faq-item {
    margin-bottom: 10px;
    padding: 4px 20px;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: 14px;
}

.blog-faq-item summary { padding: 16px 0; color: var(--color-text-dark); font-weight: 800; cursor: pointer; }
.blog-faq-item p { margin-bottom: 16px; color: var(--color-text-medium); }

/* ---------- CTA ---------- */

.blog-cta {
    padding: 36px;
    background: var(--color-bg-dark);
    border-radius: 24px;
    text-align: center;
}

.blog-cta h2 { margin-bottom: 22px; color: #fff; font-size: 1.4rem; line-height: 1.8; }
.blog-cta-buttons { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }

.blog-btn {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 54px; padding: 0 30px;
    border-radius: var(--radius-sm);
    font-weight: 800;
    transition: var(--transition);
}

.blog-btn-primary { background: var(--color-primary); color: #fff; }
.blog-btn-primary:hover { background: var(--color-primary-dark); }
.blog-btn-secondary { background: #fff; color: var(--color-text-dark); }
.blog-btn:hover { transform: translateY(-2px); }

/* ---------- RELATED ---------- */

.blog-related { max-width: 1100px; margin: 80px auto 0; padding: 0 24px; }
.blog-related h2 { margin-bottom: 22px; color: var(--color-text-dark); font-size: 1.7rem; font-weight: 900; }

/* ---------- 404 ---------- */

.blog-not-found {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 80vh;
    padding: 140px 22px 100px;
    background: var(--color-bg-dark);
    text-align: center;
}

.blog-not-found span { color: var(--color-accent-light); font-size: 5rem; font-weight: 900; line-height: 1; }
.blog-not-found h1 { margin: 12px 0; color: #fff; }
.blog-not-found p { color: rgba(255, 255, 255, .7); }

.blog-not-found a {
    display: inline-flex; align-items: center;
    min-height: 52px; margin-top: 22px; padding: 0 26px;
    border-radius: var(--radius-sm);
    background: var(--color-primary);
    color: #fff; font-weight: 800;
}

/* ---------- RESPONSIVE ---------- */

@media (max-width: 1000px) {
    .blog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .blog-post-layout { grid-template-columns: 1fr; gap: 24px; }
    .blog-post-aside { order: 0; }
    .blog-toc { position: static; }
}

@media (max-width: 650px) {
    .blog-hero { min-height: 480px; padding: 120px 22px 70px; }
    .blog-hero p { font-size: 16px; }
    .blog-list-body { padding: 60px 22px 80px; }
    .blog-grid { grid-template-columns: 1fr; }
    .blog-post-hero { min-height: 560px; }
    .blog-post-hero-content { padding: 130px 22px 50px; }
    .blog-post-layout { padding: 50px 22px 0; }
    .blog-related { padding: 0 22px; }
    .blog-cta { padding: 26px 18px; }
}
`;

function fixCss() {
    const file = p("blog", "style.css");
    if (fs.existsSync(file)) backup(file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, CSS);
    console.log("✓ blog/style.css replaced");
}

/* ------------------------------------------------------------------ */

console.log("Project root: " + ROOT + "\n");
fixIndex();
fixTemplate();
fixJson();
fixCss();
console.log("\nDone. Backups saved as *.bak. Hard-refresh the browser with Ctrl+Shift+R.");
