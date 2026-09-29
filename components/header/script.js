export function initHeader() {

    const header = document.querySelector(".site-header");
    const servicesItem = document.querySelector(".services-item");
    const servicesToggle = document.querySelector(".services-toggle");
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (!header) return;

    function updateHeader() {
        header.classList.toggle("scrolled", window.scrollY > 40);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (servicesItem && servicesToggle) {
        servicesToggle.addEventListener("click", (event) => {
            event.preventDefault();
            const isOpen = servicesItem.classList.contains("open");
            servicesItem.classList.toggle("open", !isOpen);
            servicesToggle.setAttribute("aria-expanded", String(!isOpen));
        });
    }

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener("click", () => {
            const isOpen = mainNav.classList.contains("mobile-open");
            mainNav.classList.toggle("mobile-open", !isOpen);
            mobileToggle.classList.toggle("active", !isOpen);
            mobileToggle.setAttribute("aria-expanded", String(!isOpen));
        });
    }

    document.querySelectorAll(".main-nav a").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 850 && mainNav && mobileToggle) {
                mainNav.classList.remove("mobile-open");
                mobileToggle.classList.remove("active");
                mobileToggle.setAttribute("aria-expanded", "false");
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (servicesItem && servicesToggle && !servicesItem.contains(event.target)) {
            servicesItem.classList.remove("open");
            servicesToggle.setAttribute("aria-expanded", "false");
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 850 && mainNav && mobileToggle) {
            mainNav.classList.remove("mobile-open");
            mobileToggle.classList.remove("active");
            mobileToggle.setAttribute("aria-expanded", "false");
        }
    });
}

/* AREAS:START */
document.addEventListener("click", (e) => {
    const link = e.target.closest(".nav-item.has-dropdown > a");
    if (link && window.innerWidth <= 900) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
    }
});
/* AREAS:END */
