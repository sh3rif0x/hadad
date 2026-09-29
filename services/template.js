const esc = value =>
    String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const num = i => String(i + 1).padStart(2, "0");

function getImagePath(image) {
    if (!image) return "";
    if (image.startsWith("/")) return image;
    if (/^https?:\/\//.test(image)) return image;
    if (image.startsWith("../")) return "/" + image.replace(/^(\.\.\/)+/, "");
    if (image.startsWith("./")) return "/" + image.substring(2);
    return "/" + image;
}

/* ---------- LIST ---------- */

export function renderList(services) {
    return services.map((service, index) => {
        const slug = encodeURIComponent(service.slug || "");
        const title = esc(service.title);
        const description = esc(service.heroDescription);
        const image = esc(getImagePath(service.image));
        const alt = esc(service.heroAlt || service.title);

        return `
            <a class="service-card" href="/services/${slug}/">
                <div class="service-card-image">
                    <img src="${image}" alt="${alt}" loading="${index < 3 ? "eager" : "lazy"}">
                </div>
                <div class="service-card-content">
                    <span class="service-card-number">${num(index)}</span>
                    <h2>${title}</h2>
                    <p>${description}</p>
                    <span class="service-card-link">عرض الخدمة ←</span>
                </div>
            </a>
        `;
    }).join("");
}

/* ---------- DETAIL ---------- */

export function renderService(service) {
    const article = service.article || {};
    const sections = Array.isArray(article.sections) ? article.sections : [];
    const faq = Array.isArray(article.faq) ? article.faq : [];

    const title = service.title || "";
    const description = service.heroDescription || "";
    const image = getImagePath(service.image);
    const alt = service.heroAlt || title;

    const sectionsHtml = sections.map((section, index) => `
        <section class="article-section">
            <div class="article-number">${num(index)}</div>
            <div class="article-section-content">
                <h3>${esc(section.title)}</h3>
                <p>${esc(section.content)}</p>
            </div>
        </section>
    `).join("");

    const faqHtml = faq.length ? `
        <section class="service-faq">
            <div class="faq-heading">
                <span>الأسئلة الشائعة</span>
                <h2>أسئلة عن ${esc(title)}</h2>
            </div>
            <div class="faq-list">
                ${faq.map((item, index) => `
                    <details class="faq-item">
                        <summary>
                            <span>${num(index)}</span>
                            <strong>${esc(item.question)}</strong>
                        </summary>
                        <p>${esc(item.answer)}</p>
                    </details>
                `).join("")}
            </div>
        </section>
    ` : "";

    return `
        <section class="service-hero">
            <div class="service-hero-image">
                <img src="${esc(image)}" alt="${esc(alt)}">
            </div>
            <div class="service-hero-overlay"></div>
            <div class="service-hero-content">
                <span class="service-eyebrow">خدمات حداد الرياض</span>
                <h1>${esc(title)}</h1>
                <p>${esc(description)}</p>
                <div class="service-buttons">
                    <a href="tel:0534107471" class="service-btn service-btn-primary">اتصل بنا</a>
                    <a href="https://wa.me/966534107471" target="_blank" rel="noopener"
                       class="service-btn service-btn-secondary">مراسلتنا</a>
                </div>
            </div>
        </section>

        <section class="service-content">
            <div class="service-layout">

                <aside class="service-sticky">
                    <div class="service-sticky-image">
                        <img src="${esc(image)}" alt="${esc(alt)}">
                    </div>
                    <div class="service-sticky-caption">
                        <span>خدماتنا</span>
                        <strong>${esc(title)}</strong>
                    </div>
                </aside>

                <article class="service-article">
                    <header class="article-header">
                        <span class="article-label">${esc(title)}</span>
                        <h2>${esc(article.introTitle || title)}</h2>
                        <p>${esc(article.intro || description)}</p>
                    </header>

                    ${sectionsHtml}
                    ${faqHtml}

                    <section class="article-cta">
                        <div>
                            <span>تحتاج هذه الخدمة؟</span>
                            <h2>خلنا نعرف تفاصيل مشروعك.</h2>
                            <p>تواصل معنا وأرسل المقاسات أو صور المكان والتفاصيل التي تحتاجها.</p>
                        </div>
                        <div class="article-cta-buttons">
                            <a href="tel:0534107471" class="service-btn service-btn-primary">اتصل بنا</a>
                            <a href="https://wa.me/966534107471" target="_blank" rel="noopener"
                               class="service-btn service-btn-secondary">مراسلتنا</a>
                        </div>
                    </section>
                </article>

            </div>
        </section>
    `;
}

/* ---------- 404 ---------- */

export function renderNotFound() {
    return `
        <span>404</span>
        <h1>الخدمة غير موجودة</h1>
        <p>الخدمة المطلوبة غير موجودة.</p>
        <a href="/services/">العودة إلى الخدمات</a>
    `;
}