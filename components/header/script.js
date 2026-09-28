document.addEventListener("DOMContentLoaded", () => {

    const header = document.getElementById("siteHeader");

    const servicesItem = document.querySelector(".services-item");
    const servicesToggle = document.querySelector(".services-toggle");

    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    const mainNav = document.querySelector(".main-nav");


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    function updateHeader() {

        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    }

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });


    /* =====================================================
       SERVICES DROPDOWN
    ===================================================== */

    if (servicesItem && servicesToggle) {

        servicesToggle.addEventListener("click", (event) => {

            event.preventDefault();

            const isOpen =
                servicesItem.classList.contains("open");

            servicesItem.classList.toggle("open", !isOpen);

            servicesToggle.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        });

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (mobileToggle && mainNav) {

        mobileToggle.addEventListener("click", () => {

            const isOpen =
                mainNav.classList.contains("mobile-open");

            mainNav.classList.toggle(
                "mobile-open", !isOpen
            );

            mobileToggle.classList.toggle(
                "active", !isOpen
            );

            mobileToggle.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        });

    }


    /* =====================================================
       CLOSE MOBILE MENU WHEN CLICKING NORMAL LINK
    ===================================================== */

    document.querySelectorAll(
        ".main-nav a"
    ).forEach((link) => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 850) {

                mainNav.classList.remove(
                    "mobile-open"
                );

                mobileToggle.classList.remove(
                    "active"
                );

                mobileToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    });


    /* =====================================================
       CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    ===================================================== */

    document.addEventListener("click", (event) => {

        if (
            servicesItem &&
            !servicesItem.contains(event.target)
        ) {

            servicesItem.classList.remove("open");

            servicesToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    /* =====================================================
       RESET MOBILE STATE WHEN RESIZING
    ===================================================== */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 850) {

            mainNav.classList.remove(
                "mobile-open"
            );

            mobileToggle.classList.remove(
                "active"
            );

            mobileToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

});