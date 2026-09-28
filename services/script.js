import {
    initHeader
} from "/components/header/script.js";


/* =========================================================
   ELEMENTS
========================================================= */

const servicesList =
    document.querySelector("#servicesList");

const servicesGrid =
    document.querySelector("#servicesGrid");

const serviceDetail =
    document.querySelector("#serviceDetail");

const serviceNotFound =
    document.querySelector("#serviceNotFound");

const serviceTitle =
    document.querySelector("#serviceTitle");

const serviceDescription =
    document.querySelector("#serviceDescription");

const serviceImage =
    document.querySelector("#serviceImage");

const serviceStickyImage =
    document.querySelector("#serviceStickyImage");

const serviceStickyTitle =
    document.querySelector("#serviceStickyTitle");

const serviceArticle =
    document.querySelector("#serviceArticle");


/* =========================================================
   HEADER
========================================================= */

async function loadHeader() {

    const header =
        document.querySelector("#header");

    if (!header) {
        return;
    }

    const response =
        await fetch(
            "/components/header/index.html"
        );

    if (!response.ok) {
        throw new Error("Failed to load header");
    }

    header.innerHTML =
        await response.text();

    initHeader();
}


/* =========================================================
   FOOTER
========================================================= */

async function loadFooter() {

    const footer =
        document.querySelector("#footer");

    if (!footer) {
        return;
    }

    const response =
        await fetch(
            "/components/footer/index.html"
        );

    if (!response.ok) {
        throw new Error("Failed to load footer");
    }

    footer.innerHTML =
        await response.text();
}


/* =========================================================
   LOAD SERVICES
========================================================= */

async function loadServices() {

    const response =
        await fetch(
            "/services/services.json"
        );

    if (!response.ok) {
        throw new Error(
            "Failed to load /services/services.json"
        );
    }

    return await response.json();
}


/* =========================================================
   GET SERVICE SLUG
========================================================= */

function getServiceSlug() {

    const path =
        window.location.pathname
            .replace(/\/+$/, "");

    const parts =
        path
            .split("/")
            .filter(Boolean);

    /*
        /services/
            => null

        /services/sandwich-panel/
            => sandwich-panel
    */

    if (
        parts.length < 2 ||
        parts[0] !== "services"
    ) {
        return null;
    }

    return parts[1];
}


/* =========================================================
   IMAGE PATH
========================================================= */

function getImagePath(image) {

    if (!image) {
        return "";
    }

    if (image.startsWith("/")) {
        return image;
    }

    if (image.startsWith("../")) {
        return "/" + image.replace(/^(\.\.\/)+/, "");
    }

    if (image.startsWith("./")) {
        return "/services/" + image.substring(2);
    }

    return "/" + image;
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   RENDER ALL SERVICES
========================================================= */

function renderServices(services) {

    servicesList.hidden = false;
    serviceDetail.hidden = true;
    serviceNotFound.hidden = true;

    servicesGrid.innerHTML = "";


    services.forEach((service, index) => {

        const slug =
            escapeHTML(service.slug);

        const title =
            escapeHTML(service.title);

        const description =
            escapeHTML(
                service.heroDescription || ""
            );

        const image =
            getImagePath(service.image);


        const card = document.createElement("a");

        card.className =
            "service-card";

        card.href =
            `/services/${slug}/`;


        card.innerHTML = `

            <div class="service-card-image">

                <img
                    src="${image}"
                    alt="${escapeHTML(service.heroAlt || title)}"
                    loading="${index < 3 ? "eager" : "lazy"}">

            </div>


            <div class="service-card-content">

                <span class="service-card-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <h2>
                    ${title}
                </h2>

                <p>
                    ${description}
                </p>

                <span class="service-card-link">
                    عرض الخدمة ←
                </span>

            </div>

        `;


        servicesGrid.appendChild(card);

    });


    document.title =
        "الخدمات | حداد الرياض";
}


/* =========================================================
   FIND SERVICE
========================================================= */

function findService(
    services,
    slug
) {

    return services.find(
        service =>
            service.slug === slug
    );
}


/* =========================================================
   RENDER SERVICE DETAIL
========================================================= */

function renderService(service) {

    servicesList.hidden = true;
    serviceDetail.hidden = false;
    serviceNotFound.hidden = true;


    const title =
        service.title || "";

    const description =
        service.heroDescription || "";

    const image =
        getImagePath(service.image);


    serviceTitle.textContent =
        title;

    serviceDescription.textContent =
        description;


    serviceImage.src =
        image;

    serviceImage.alt =
        service.heroAlt || title;


    serviceStickyImage.src =
        image;

    serviceStickyImage.alt =
        service.heroAlt || title;


    serviceStickyTitle.textContent =
        title;


    document.title =
        `${title} | حداد الرياض`;


    const article =
        service.article || {};


    let html = `

        <header class="article-header">

            <span class="article-label">
                ${escapeHTML(title)}
            </span>

            <h2>
                ${escapeHTML(
                    article.introTitle || title
                )}
            </h2>

            <p>
                ${escapeHTML(
                    article.intro || description
                )}
            </p>

        </header>

    `;


    /* =====================================================
       ARTICLE SECTIONS
    ===================================================== */

    if (
        Array.isArray(article.sections)
    ) {

        article.sections.forEach(
            (section, index) => {

                html += `

                    <section class="article-section">

                        <div class="article-number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>

                        <div class="article-section-content">

                            <h3>
                                ${escapeHTML(
                                    section.title || ""
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    section.content || ""
                                )}
                            </p>

                        </div>

                    </section>

                `;

            }
        );

    }


    /* =====================================================
       FAQ
    ===================================================== */

    if (
        Array.isArray(article.faq) &&
        article.faq.length
    ) {

        html += `

            <section class="service-faq">

                <div class="faq-heading">

                    <span>
                        الأسئلة الشائعة
                    </span>

                    <h2>
                        أسئلة عن ${escapeHTML(title)}
                    </h2>

                </div>

                <div class="faq-list">

        `;


        article.faq.forEach(
            (item, index) => {

                html += `

                    <details class="faq-item">

                        <summary>

                            <span>
                                ${String(index + 1).padStart(2, "0")}
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item.question || ""
                                )}
                            </strong>

                        </summary>

                        <p>
                            ${escapeHTML(
                                item.answer || ""
                            )}
                        </p>

                    </details>

                `;

            }
        );


        html += `

                </div>

            </section>

        `;

    }


    /* =====================================================
       CTA
    ===================================================== */

    html += `

        <section class="article-cta">

            <div>

                <span>
                    تحتاج هذه الخدمة؟
                </span>

                <h2>
                    خلنا نعرف تفاصيل مشروعك.
                </h2>

                <p>
                    تواصل معنا وأرسل المقاسات
                    أو صور المكان والتفاصيل
                    التي تحتاجها.
                </p>

            </div>


            <div class="article-cta-buttons">

                <a
                    href="tel:0534107471"
                    class="service-btn service-btn-primary">

                    اتصل بنا

                </a>


                <a
                    href="https://wa.me/966534107471"
                    target="_blank"
                    rel="noopener"
                    class="service-btn service-btn-secondary">

                    مراسلتنا

                </a>

            </div>

        </section>

    `;


    serviceArticle.innerHTML =
        html;
}


/* =========================================================
   NOT FOUND
========================================================= */

function renderNotFound() {

    servicesList.hidden = true;
    serviceDetail.hidden = true;
    serviceNotFound.hidden = false;

    document.title =
        "404 | حداد الرياض";
}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await loadHeader();

            await loadFooter();


            const services =
                await loadServices();


            const slug =
                getServiceSlug();


            /*
                /services/
                => SHOW ALL SERVICES
            */

            if (!slug) {

                renderServices(
                    services
                );

                return;
            }


            /*
                /services/service-name/
                => SHOW DETAIL
            */

            const service =
                findService(
                    services,
                    slug
                );


            if (!service) {

                renderNotFound();

                return;
            }


            renderService(
                service
            );


        } catch (error) {

            console.error(
                "Services initialization failed:",
                error
            );

        }

    }
);
