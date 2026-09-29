import { initHeader } from "/components/header/script.js";
import { renderList, renderFilters, renderPost, renderNotFound } from "/blog/template.js";

/* DEBUG MODE: add ?debug=1 to the URL, or localStorage.setItem("debug","1") */
const DEBUG =
    new URLSearchParams(location.search).has("debug") ||
    localStorage.getItem("debug") === "1";

const log = (...a) => DEBUG && console.log("%c[blog]", "color:#2980b9", ...a);
const $ = s => document.querySelector(s);

const blogList = $("#blogList");
const blogFilters = $("#blogFilters");
const blogGrid = $("#blogGrid");
const blogDetail = $("#blogDetail");
const blogNotFound = $("#blogNotFound");

const DEFAULT_TITLE = "المدونة | حداد الرياض";
const DEFAULT_DESC = "مقالات ونصائح عن أعمال الحدادة والمظلات والساندوتش بانل في الرياض من حداد الرياض.";

let site = {};
let posts = [];
let activeCategory = "all";

/* ---------- loading ---------- */

async function loadComponent(selector, url) {
    const target = $(selector);
    if (!target) return;
    const r = await fetch(url);
    log("component", url, r.status);
    if (!r.ok) throw new Error("Failed to load " + url + " (" + r.status + ")");
    target.innerHTML = await r.text();
}

async function loadData() {
    const url = "/data/blog.json";
    const r = await fetch(url);
    log("fetch", url, r.status);
    if (!r.ok) throw new Error("Failed to load " + url + " (" + r.status + ")");

    const data = await r.json();
    const list = Array.isArray(data) ? data : data.posts;
    if (!Array.isArray(list)) throw new Error('blog.json must contain a "posts" array');

    // newest first
    list.sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")));

    log("posts:", list.map(p => p.slug));
    return { site: (!Array.isArray(data) && data.site) || {}, posts: list };
}

/* ---------- routing ---------- */

function getPostSlug() {
    const parts = location.pathname.split("/").filter(Boolean);
    const i = parts.indexOf("blog");
    const slug = i === -1 ? null : parts[i + 1] || null;
    log("pathname:", location.pathname, "| slug:", slug);
    return slug ? decodeURIComponent(slug) : null;
}

function findPost(slug) {
    if (!slug) return null;
    const w = slug.trim().toLowerCase();
    return posts.find(p => String(p.slug).trim().toLowerCase() === w) || null;
}

function getRelated(post) {
    const others = posts.filter(p => p.slug !== post.slug);
    const same = others.filter(p => p.category === post.category);
    const rest = others.filter(p => p.category !== post.category);
    return [...same, ...rest].slice(0, 3);
}

/* ---------- SEO helpers ---------- */

function setMeta(name, content) {
    if (content === undefined || content === null) return;
    let el = document.head.querySelector('meta[name="' + name + '"]');
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function setCanonical() {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
    }
    el.setAttribute("href", location.origin + location.pathname);
}

function setJsonLd(data) {
    const old = document.getElementById("jsonld");
    if (old) old.remove();
    if (!data) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "jsonld";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
}

function buildSchema(post) {
    const name = site.name || "حداد الرياض";
    const src = post.image && post.image.src ? post.image.src : "";
    const image = src ? (src.startsWith("/") ? location.origin + src : src) : undefined;
    const url = location.origin + location.pathname;

    const article = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.metaDescription || post.excerpt,
        image: image,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        inLanguage: "ar",
        author: { "@type": "Organization", name: name },
        publisher: { "@type": "Organization", name: name },
        mainEntityOfPage: url
    };

    const faqs = Array.isArray(post.faq) ? post.faq : [];
    if (!faqs.length) return [article];

    return [article, {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
    }];
}

/* ---------- views ---------- */

function show(section) {
    if (blogList) blogList.hidden = section !== "list";
    if (blogDetail) blogDetail.hidden = section !== "detail";
    if (blogNotFound) blogNotFound.hidden = section !== "404";
}

function drawList() {
    const filtered = activeCategory === "all"
        ? posts
        : posts.filter(p => p.category === activeCategory);

    if (blogFilters) blogFilters.innerHTML = renderFilters(posts, activeCategory);
    if (blogGrid) blogGrid.innerHTML = renderList(filtered);
}

function showList() {
    show("list");
    drawList();
    document.title = DEFAULT_TITLE;
    setMeta("description", DEFAULT_DESC);
    setCanonical();
    setJsonLd(null);
}

function showPost(post) {
    show("detail");
    if (blogDetail) blogDetail.innerHTML = renderPost(post, getRelated(post), site);

    document.title = post.metaTitle || (post.title + " | " + (site.name || "حداد الرياض"));
    setMeta("description", post.metaDescription || post.excerpt || "");
    if (Array.isArray(post.keywords)) setMeta("keywords", post.keywords.join("، "));
    setCanonical();
    setJsonLd(buildSchema(post));
    window.scrollTo(0, 0);
}

function showNotFound() {
    show("404");
    if (blogNotFound) blogNotFound.innerHTML = renderNotFound();
    document.title = "404 | حداد الرياض";
    setJsonLd(null);
}

/* ---------- category filter (event delegation) ---------- */

if (blogFilters) {
    blogFilters.addEventListener("click", e => {
        const btn = e.target.closest("[data-category]");
        if (!btn) return;
        activeCategory = btn.getAttribute("data-category");
        log("filter:", activeCategory);
        drawList();
    });
}

/* ---------- init ---------- */

async function init() {
    try {
        log("page:", location.href, "| has #blogList:", !!blogList);

        await loadComponent("#header", "/components/header/index.html");
        initHeader();
        await loadComponent("#footer", "/components/footer/index.html");

        const data = await loadData();
        site = data.site;
        posts = data.posts;

        const slug = getPostSlug();

        if (!slug) {
            log("route: LIST");
            return showList();
        }

        const post = findPost(slug);
        log("route: DETAIL", slug, post ? "FOUND" : "NOT FOUND");

        if (!post) return showNotFound();
        showPost(post);

    } catch (error) {
        console.error("Blog initialization failed:", error);
        showNotFound();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
