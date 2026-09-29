import { initHeader } from "./components/header/script.js";

document.addEventListener("DOMContentLoaded", () => {

    const home = document.querySelector(".hero");

    if (!home) {
        console.error("Hero element not found.");
        return;
    }


    const heroContent = home.querySelector(".hero-content");
    const timelineItems = home.querySelectorAll(".hero-timeline span");
    const currentSlideSpan = home.querySelector(".hero-counter .current");

    async function loadSections() {
        const header = document.getElementById("header");
        const response = await fetch("./components/header/index.html");
        header.innerHTML = await response.text();

        // Header HTML now exists, so initialize its scroll behavior
        initHeader();
    }
    loadSections()
    const content = [

        {
            imageName: "hero-1.jpeg",
            eyebrow: "حداد الرياض",
            h1: ["أعمال", "الحدادة", "باحترافية"],
            paragraph: "تنفيذ أعمال الحدادة والهياكل الحديدية بمختلف أنواعها للمنازل والفلل والمنشآت، مع حلول عملية وتشطيبات تناسب احتياجات كل مشروع في الرياض."
        },

        {
            imageName: "hero-2.jpeg",
            eyebrow: "مظلات السيارات",
            h1: ["مظلات", "متينة", "بتصاميم عملية"],
            paragraph: "تنفيذ مظلات السيارات والمواقف والمساحات الخارجية بهياكل متينة وتصاميم عملية تناسب مختلف الاستخدامات."
        },

        {
            imageName: "hero-3.jpeg",
            eyebrow: "السواتر والخصوصية",
            h1: ["خصوصية", "وحماية", "بجودة عالية"],
            paragraph: "تصميم وتنفيذ السواتر بمقاسات وخامات متعددة لتوفير الخصوصية والحماية للمنازل والفلل والمنشآت."
        },

        {
            imageName: "hero-4.jpeg",
            eyebrow: "السندوتش بانل",
            h1: ["حلول", "عملية", "للمشاريع"],
            paragraph: "تنفيذ وتركيب السندوتش بانل للمستودعات والغرف والمرافق والمنشآت بتصاميم عملية تناسب الاستخدامات المختلفة."
        },

        {
            imageName: "hero-5.jpeg",
            eyebrow: "الزجاج السيكوريت",
            h1: ["زجاج", "سيكوريت", "بتنفيذ احترافي"],
            paragraph: "تنفيذ وتركيب الزجاج السيكوريت للأبواب والواجهات والفواصل والمساحات الداخلية والخارجية."
        }

    ];


    function renderHero(item) {

        heroContent.classList.remove("hero-animate");

        void heroContent.offsetWidth;

        heroContent.innerHTML = `

            <div class="hero-eyebrow">
                ${item.eyebrow}
            </div>

            <h1 class="hero-title">
                <span>${item.h1[0]}</span>
                <span>${item.h1[1]}</span>
                <strong>${item.h1[2]}</strong>
            </h1>

            <p class="hero-description">
                ${item.paragraph}
            </p>

            <div class="hero-buttons">

                <a href="#contact" class="primary-btn">
                    اطلب عرض سعر
                </a>

                <a href="tel:0534107471" class="secondary-btn">
                    اتصل بنا
                </a>

            </div>
        `;

        heroContent.classList.add("hero-animate");
    }


    function changeHero(index) {

        const item = content[index];

        setHeroImage(item.imageName);


        renderHero(item);


        if (currentSlideSpan) {
            currentSlideSpan.textContent =
                String(index + 1).padStart(2, "0");
        }


        timelineItems.forEach((item, i) => {

            item.classList.toggle(
                "active",
                i === index
            );

        });

    }


    let currentSlide = 0;

    changeHero(currentSlide);


    setInterval(() => {

        currentSlide++;

        if (currentSlide >= content.length) {
            currentSlide = 0;
        }

        changeHero(currentSlide);

    }, 5000);


    /* Timeline click */

    timelineItems.forEach((item, index) => {

        item.addEventListener("click", () => {

            currentSlide = index;

            changeHero(currentSlide);

        });

    });

});

/* =========================================================
   FLOATING ACTIONS
========================================================= */

const scrollTopButton =
    document.querySelector("#scrollTopButton");


function updateScrollTopButton() {

    if (!scrollTopButton) {
        return;
    }

    if (window.scrollY > 500) {

        scrollTopButton.classList.add("show");

    } else {

        scrollTopButton.classList.remove("show");

    }

}


window.addEventListener(
    "scroll",
    updateScrollTopButton, { passive: true }
);


if (scrollTopButton) {

    scrollTopButton.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


updateScrollTopButton();

/* BLOGS:START */
(function () {

    const BLOGS_DATA = "./data/blog.json";
    const BLOGS_LIMIT = 6;
    const BLOGS_ARTICLE_URL = "/blog/";
    const BLOGS_FALLBACK_IMAGES = ["hero-1.jpeg", "hero-2.jpeg", "hero-3.jpeg", "hero-4.jpeg", "hero-5.jpeg"];

    const escapeHTML = (value) =>
        String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));

    function blogCard(post) {

        const image = post.image && post.image.src ? post.image.src : "";
        const alt = post.image && post.image.alt ? post.image.alt : post.title;
        const link = BLOGS_ARTICLE_URL + encodeURIComponent(post.slug) + "/";

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
/* BLOGS:END */

/* CINEMATIC:START */
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
/* CINEMATIC:END */

/* STORY:START */
(function () {

    function init() {
        var root = document.getElementById("story");
        if (!root) return;

        document.documentElement.classList.remove("lx-snap");

        var items = [].slice.call(root.querySelectorAll(".lx-item"));
        var slides = [].slice.call(root.querySelectorAll(".lx-slide"));
        var dots = [].slice.call(root.querySelectorAll(".lx-dot"));
        var track = root.querySelector(".lx-track");
        var list = root.querySelector(".lx-list");
        var cap = root.querySelector(".lx-caption");
        var capT = root.querySelector(".lx-cap-title");
        var capD = root.querySelector(".lx-cap-desc");
        var visual = root.querySelector(".lx-visual");
        var N = items.length;
        var cur = -1;

        function set(i) {
            i = Math.max(0, Math.min(N - 1, i));
            if (i === cur) return;
            var first = cur === -1;
            cur = i;

            track.style.transform = "translateY(" + (-i * 100 / N) + "%)";
            list.style.setProperty("--p", ((i + 1) / N).toFixed(4));

            items.forEach(function (el, k) {
                el.classList.toggle("on", k === i);
                el.setAttribute("aria-selected", k === i ? "true" : "false");
            });
            slides.forEach(function (el, k) { el.classList.toggle("on", k === i); });
            dots.forEach(function (el, k) { el.classList.toggle("on", k === i); });

            capT.textContent = items[i].getAttribute("data-ct");
            capD.textContent = items[i].getAttribute("data-cd");
            cap.classList.remove("in");
            void cap.offsetWidth;
            cap.classList.add("in");

            if (!first) root.classList.add("moved");
        }

        items.forEach(function (el, k) {
            el.addEventListener("mouseenter", function () { set(k); });
            el.addEventListener("focus", function () { set(k); });
            el.addEventListener("click", function () { set(k); });
        });
        dots.forEach(function (el, k) {
            el.addEventListener("mouseenter", function () { set(k); });
            el.addEventListener("click", function () { set(k); });
        });
        root.querySelector(".lx-prev").addEventListener("click", function () { set(cur - 1); });
        root.querySelector(".lx-next").addEventListener("click", function () { set(cur + 1); });

        /* سحب بالإصبع على الموبايل */
        var y0 = 0;
        visual.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; }, { passive: true });
        visual.addEventListener("touchend", function (e) {
            var d = y0 - e.changedTouches[0].clientY;
            if (Math.abs(d) < 45) return;
            set(cur + (d > 0 ? 1 : -1));
        }, { passive: true });

        set(0);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
/* STORY:END */

/* FOOTER-LOAD:START */
(async function loadFooter() {
    async function run() {
        const target = document.getElementById("footer");
        if (!target) return;
        try {
            const r = await fetch("/components/footer/index.html");
            if (!r.ok) throw new Error("HTTP " + r.status);
            let html = await r.text();
            html = html.replace(/^\s*```html\s*/i, "").replace(/\s*```\s*$/, "");
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
/* FOOTER-LOAD:END */
