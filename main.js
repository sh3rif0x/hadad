document.addEventListener("DOMContentLoaded", () => {

    const home = document.querySelector(".hero");

    if (!home) {
        console.error("Hero element not found.");
        return;
    }


    const heroContent = home.querySelector(".hero-content");
    const timelineItems = home.querySelectorAll(".hero-timeline span");
    const currentSlideSpan = home.querySelector(".hero-counter .current");


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

        home.style.backgroundImage =
            `url("./assets/${item.imageName}")`;


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