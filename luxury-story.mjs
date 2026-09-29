import fs from "node:fs";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

for (const f of ["index.html", "main.css", "main.js"]) {
  if (!fs.existsSync(f)) { console.error("✖ لم أجد: " + f); process.exit(1); }
}

/* ---------------- البيانات ---------------- */
const items = [
  { t: "خبرة في أعمال الحدادة", d: "ننفذ الأعمال والهياكل الحديدية وفق طبيعة المشروع واحتياجه.", ct: "أعمال الحدادة", cd: "تنفيذ أعمال وهياكل حديدية بتفاصيل مناسبة للمشروع.", img: "image-1790545454628.jpg" },
  { t: "مظلات تحمي المساحة", d: "حلول للمواقف والمساحات الخارجية بتصاميم عملية ومتينة.", ct: "مظلات السيارات", cd: "حلول عملية ومتينة للمواقف والمساحات الخارجية.", img: "hero-1.jpeg" },
  { t: "خصوصية مع السواتر", d: "سواتر للمنازل والفلل والمنشآت مع التركيز على الاستخدام.", ct: "السواتر", cd: "حلول توفر الخصوصية والحماية للمنازل والمنشآت.", img: "hero-3.jpeg" },
  { t: "حلول السندوتش بانل", d: "غرف ومجالس ومستودعات وحلول خارجية بمقاسات مختلفة.", ct: "السندوتش بانل", cd: "تنفيذ غرف ومستودعات ومجالس بمقاسات مختلفة.", img: "hero-2.webp" },
  { t: "غرف ومجالس جاهزة", d: "تقسيم داخلي وتجهيز حسب المساحة والاستخدام.", ct: "غرف ومجالس", cd: "حلول خارجية مناسبة للاستخدام السكني والتجاري.", img: "غرف-ساندوتش-بانل-14.jpeg" },
  { t: "زجاج وواجهات", d: "أبواب زجاجية وواجهات للمداخل والمساحات المختلفة.", ct: "الزجاج والواجهات", cd: "تنفيذ واجهات وأبواب زجاجية بتفاصيل تناسب المكان.", img: "facades-6.jpg" },
  { t: "اهتمام بالتفاصيل", d: "جودة الخامات ودقة المقاسات ونظافة التشطيب النهائي.", ct: "تنفيذ متكامل", cd: "من الحديد والمظلات إلى السواتر والسندوتش بانل.", img: "مجالس-ساندوتش-بانل-مؤسسة-مظلات-وسواتر-اركان-التميز.jpg" }
];
const N = items.length;

/* ---------------- HTML ---------------- */
const chevUp = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
const chevDown = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

const html = `<!-- STORY:START -->
        <section class="lx" id="story" style="--n:${N}">
            <div class="lx-stage">

                <div class="lx-content">
                    <span class="lx-eyebrow">لماذا حداد الرياض؟</span>
                    <h2 class="lx-title">شغلنا يبدأ من <strong>التفاصيل.</strong></h2>
                    <p class="lx-lead">من أعمال الحديد إلى المظلات والسواتر والسندوتش بانل والزجاج، نركز على تنفيذ الحل المناسب للمكان والاستخدام.</p>

                    <div class="lx-list" role="tablist" aria-label="خدماتنا">
${items.map((it, i) => `                        <button type="button" class="lx-item${i === 0 ? " on" : ""}" role="tab" data-ct="${attr(it.ct)}" data-cd="${attr(it.cd)}">
                            <h3>${it.t}</h3>
                            <div class="lx-item-body"><p>${it.d}</p></div>
                        </button>`).join("\n")}
                    </div>
                </div>

                <div class="lx-visual">
                    <div class="lx-frame">
                        <div class="lx-track">
${items.map((it, i) => `                            <div class="lx-slide${i === 0 ? " on" : ""}"><img src="./assets/${it.img}" alt="${attr(it.ct)}" loading="${i < 2 ? "eager" : "lazy"}"></div>`).join("\n")}
                        </div>
                    </div>

                    <div class="lx-hint"><i></i>مرّر للاستكشاف</div>

                    <div class="lx-dots">
${items.map((_, i) => `                        <button type="button" class="lx-dot${i === 0 ? " on" : ""}" aria-label="الشريحة ${i + 1}"></button>`).join("\n")}
                    </div>

                    <div class="lx-caption in">
                        <h3 class="lx-cap-title">${items[0].ct}</h3>
                        <p class="lx-cap-desc">${items[0].cd}</p>
                        <a class="lx-cap-link" href="#contact">اطلب هذه الخدمة ←</a>
                    </div>

                    <div class="lx-arrows">
                        <button type="button" class="lx-arrow lx-prev" aria-label="السابق">${chevUp}</button>
                        <button type="button" class="lx-arrow lx-next" aria-label="التالي">${chevDown}</button>
                    </div>
                </div>

            </div>

            <div class="lx-steps" aria-hidden="true">
${items.map((_, i) => `                <div class="lx-step" style="--i:${i}"></div>`).join("\n")}
            </div>
        </section>
        <!-- STORY:END -->`;

let idx = fs.readFileSync("index.html", "utf8");
const re = /<!-- STORY:START -->[\s\S]*?<!-- STORY:END -->/;
if (re.test(idx)) idx = idx.replace(re, () => html);
else if (idx.includes("<!-- ABOUT -->")) idx = idx.replace("<!-- ABOUT -->", () => html + "\n\n        <!-- ABOUT -->");
else if (idx.includes("<!-- PROJECTS -->")) idx = idx.replace("<!-- PROJECTS -->", () => html + "\n\n        <!-- PROJECTS -->");
else idx = idx.replace("</main>", () => html + "\n    </main>");
fs.writeFileSync("index.html", idx);

/* ---------------- CSS ---------------- */
inject("main.css", "/* STORY:START */", "/* STORY:END */", `
/* =========================================================
   LUXURY STORY (scroll-driven + snap)
========================================================= */

.lx {
    --h: 75vh;
    --lx-ease: cubic-bezier(.22, .61, .36, 1);
    --lx-line: rgba(174, 228, 245, .16);
    position: relative;
    background: #071c28;
    color: #fff;
}

/* يفعّل الـ snap فقط أثناء وجود السكشن في الشاشة */
html.lx-snap { scroll-snap-type: y proximity; }

.lx-stage {
    position: sticky;
    top: 0;
    z-index: 1;
    height: 100vh;
    height: 100svh;
    display: grid;
    grid-template-columns: minmax(340px, .85fr) minmax(0, 1.15fr);
    direction: rtl;
    align-items: center;
    gap: clamp(40px, 6vw, 110px);
    padding: 110px clamp(24px, 7vw, 120px) 50px;
    overflow: hidden;
    background:
        radial-gradient(circle at 12% 15%, rgba(43, 137, 173, .22), transparent 38%),
        radial-gradient(circle at 90% 95%, rgba(174, 228, 245, .07), transparent 40%),
        linear-gradient(160deg, #0a2634 0%, #061821 100%);
}

/* ---------- الكتابة (يمين) ---------- */

.lx-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    color: var(--color-accent-light);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .16em;
}

.lx-eyebrow::before {
    content: "";
    width: 42px;
    height: 1px;
    background: currentColor;
}

.lx-title {
    margin-top: 18px;
    font-size: clamp(34px, 4.4vw, 64px);
    font-weight: 300;
    line-height: 1.15;
    letter-spacing: -1px;
}

.lx-title strong {
    display: block;
    font-weight: 900;
    color: var(--color-accent-light);
}

.lx-lead {
    max-width: 480px;
    margin-top: 18px;
    color: rgba(255, 255, 255, .58);
    font-size: 16px;
    line-height: 2;
}

/* ---------- القائمة + خط التقدم ---------- */

.lx-list {
    --p: 0;
    position: relative;
    margin-top: 32px;
    padding-inline-start: 30px;
}

.lx-list::before,
.lx-list::after {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    width: 1px;
    border-radius: 2px;
}

.lx-list::before {
    height: 100%;
    background: rgba(255, 255, 255, .12);
}

.lx-list::after {
    width: 3px;
    margin-inline-start: -1px;
    height: calc(var(--p) * 100%);
    background: linear-gradient(180deg, #d6f2fb, var(--color-accent));
    box-shadow: 0 0 18px rgba(174, 228, 245, .55);
}

.lx-item {
    display: block;
    width: 100%;
    padding: 13px 0;
    border: 0;
    border-bottom: 1px solid rgba(255, 255, 255, .07);
    background: transparent;
    color: rgba(255, 255, 255, .45);
    text-align: start;
    cursor: pointer;
    transition: color .5s var(--lx-ease), transform .5s var(--lx-ease);
}

.lx-item:last-child { border-bottom: 0; }

.lx-item h3 {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
}

.lx-item:hover { color: rgba(255, 255, 255, .8); }

.lx-item.on {
    color: #fff;
    transform: translateX(-8px);
}

.lx-item.on h3 { color: var(--color-accent-light); }

.lx-item-body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .55s var(--lx-ease);
}

.lx-item.on .lx-item-body { grid-template-rows: 1fr; }

.lx-item-body p {
    min-height: 0;
    overflow: hidden;
    max-width: 420px;
    color: rgba(255, 255, 255, .62);
    font-size: 14px;
    line-height: 1.9;
}

.lx-item.on .lx-item-body p { margin-top: 6px; }

/* ---------- الصور (يسار) ---------- */

.lx-visual {
    position: relative;
    height: min(78vh, 700px);
    border-radius: 28px;
    overflow: hidden;
    background: #0d2b3a;
    border: 1px solid var(--lx-line);
    box-shadow: 0 40px 90px rgba(0, 0, 0, .5), 0 0 0 8px rgba(255, 255, 255, .02);
}

.lx-frame { position: absolute; inset: 0; overflow: hidden; }

.lx-frame::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(4, 18, 26, .15) 0%, transparent 35%, rgba(4, 18, 26, .82) 100%);
}

.lx-track {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(var(--n) * 100%);
    will-change: transform;
    transition: transform 1.1s var(--lx-ease);
}

.lx-slide {
    width: 100%;
    height: calc(100% / var(--n));
    overflow: hidden;
}

.lx-slide img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transform: scale(1.18);
    transition: transform 2.2s var(--lx-ease);
}

.lx-slide.on img { transform: scale(1); }

/* تلميح السكرول */
.lx-hint {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 6;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 16px;
    border: 1px solid rgba(255, 255, 255, .22);
    border-radius: 40px;
    background: rgba(255, 255, 255, .07);
    backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, .85);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .08em;
    transition: opacity .5s ease;
}

.lx-hint i {
    position: relative;
    width: 14px;
    height: 22px;
    border: 1.5px solid currentColor;
    border-radius: 10px;
}

.lx-hint i::after {
    content: "";
    position: absolute;
    top: 4px;
    left: 50%;
    width: 2px;
    height: 5px;
    margin-left: -1px;
    border-radius: 2px;
    background: currentColor;
    animation: lxWheel 1.6s ease-in-out infinite;
}

.lx.moved .lx-hint { opacity: 0; pointer-events: none; }

@keyframes lxWheel {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(8px); }
}

/* نقاط التنقل */
.lx-dots {
    position: absolute;
    left: 24px;
    top: 50%;
    z-index: 6;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transform: translateY(-50%);
}

.lx-dot {
    width: 5px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: rgba(255, 255, 255, .3);
    cursor: pointer;
    transition: height .45s var(--lx-ease), background .3s ease;
}

.lx-dot:hover { background: rgba(255, 255, 255, .65); }
.lx-dot.on { height: 52px; background: #fff; }

/* الكابشن */
.lx-caption {
    position: absolute;
    right: 34px;
    bottom: 32px;
    z-index: 6;
    max-width: min(520px, 70%);
}

.lx-caption.in { animation: lxUp .8s var(--lx-ease) both; }

@keyframes lxUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: none; }
}

.lx-cap-title {
    font-size: clamp(26px, 2.8vw, 42px);
    font-weight: 900;
    line-height: 1.15;
}

.lx-cap-desc {
    margin-top: 10px;
    color: rgba(255, 255, 255, .78);
    font-size: 15px;
    line-height: 1.8;
}

.lx-cap-link {
    display: inline-block;
    margin-top: 16px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--color-accent-light);
    color: var(--color-accent-light);
    font-size: 14px;
    font-weight: 800;
    transition: color .3s ease, letter-spacing .3s ease;
}

.lx-cap-link:hover { color: #fff; letter-spacing: .04em; }

/* الأسهم */
.lx-arrows {
    position: absolute;
    left: 24px;
    bottom: 28px;
    z-index: 6;
    display: flex;
    gap: 10px;
}

.lx-arrow {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, .28);
    border-radius: 50%;
    background: rgba(255, 255, 255, .07);
    backdrop-filter: blur(10px);
    color: #fff;
    cursor: pointer;
    transition: background .3s ease, color .3s ease, transform .3s ease;
}

.lx-arrow svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.lx-arrow:hover { background: #fff; color: #0a2634; transform: scale(1.06); }

/* نقاط الـ snap (غير مرئية) */
.lx-steps {
    position: relative;
    margin-top: -100vh;
    height: calc(100vh + (var(--n) - 1) * var(--h));
    pointer-events: none;
}

.lx-step {
    position: absolute;
    left: 0;
    width: 100%;
    top: calc(var(--i) * var(--h));
    height: var(--h);
    scroll-snap-align: start;
}

/* ---------- Responsive ---------- */

@media (max-height: 780px) {
    .lx-lead { display: none; }
}

@media (max-width: 900px) {
    .lx { --h: 60vh; }
    .lx-stage {
        grid-template-columns: 1fr;
        grid-template-rows: auto minmax(0, 1fr);
        align-items: start;
        gap: 22px;
        padding: 92px 22px 26px;
    }
    .lx-content { order: 1; }
    .lx-visual { order: 2; height: 100%; min-height: 0; border-radius: 22px; }
    .lx-list, .lx-lead { display: none; }
    .lx-title { font-size: 34px; }
    .lx-caption { right: 22px; bottom: 24px; max-width: 72%; }
    .lx-cap-desc { font-size: 13px; }
    .lx-arrows { left: 16px; bottom: 20px; }
    .lx-arrow { width: 42px; height: 42px; }
    .lx-dots { left: 16px; top: 22px; transform: none; }
    .lx-hint { top: 16px; right: 16px; }
}

@media (prefers-reduced-motion: reduce) {
    .lx-track, .lx-slide img, .lx-item, .lx-item-body { transition: none; }
    .lx-caption.in, .lx-hint i::after { animation: none; }
}
`);

/* ---------------- JS ---------------- */
inject("main.js", "/* STORY:START */", "/* STORY:END */", `
(function () {

    /* غيّرها لـ false لو عايز تلغي الـ snap */
    var SNAP = true;

    function init() {
        var root = document.getElementById("story");
        if (!root) return;

        var items = [].slice.call(root.querySelectorAll(".lx-item"));
        var slides = [].slice.call(root.querySelectorAll(".lx-slide"));
        var dots = [].slice.call(root.querySelectorAll(".lx-dot"));
        var track = root.querySelector(".lx-track");
        var list = root.querySelector(".lx-list");
        var cap = root.querySelector(".lx-caption");
        var capT = root.querySelector(".lx-cap-title");
        var capD = root.querySelector(".lx-cap-desc");
        var N = items.length;
        var cur = -1;
        var ticking = false;

        function set(i) {
            if (i === cur) return;
            cur = i;

            track.style.transform = "translateY(" + (-i * 100 / N) + "%)";

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
        }

        function update() {
            ticking = false;
            var r = root.getBoundingClientRect();
            var range = Math.max(1, root.offsetHeight - window.innerHeight);
            var p = Math.min(1, Math.max(0, -r.top / range));

            list.style.setProperty("--p", p.toFixed(4));
            root.classList.toggle("moved", p > 0.02);
            set(Math.round(p * (N - 1)));
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }

        function goTo(i) {
            i = Math.max(0, Math.min(N - 1, i));
            var range = Math.max(1, root.offsetHeight - window.innerHeight);
            var top = root.getBoundingClientRect().top + window.scrollY + (i / (N - 1)) * range;
            window.scrollTo({ top: top, behavior: "smooth" });
        }

        items.forEach(function (el, k) { el.addEventListener("click", function () { goTo(k); }); });
        dots.forEach(function (el, k) { el.addEventListener("click", function () { goTo(k); }); });
        root.querySelector(".lx-prev").addEventListener("click", function () { goTo(cur - 1); });
        root.querySelector(".lx-next").addEventListener("click", function () { goTo(cur + 1); });

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        /* snap فقط طول ما السكشن ظاهر */
        if (SNAP && "IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                document.documentElement.classList.toggle("lx-snap", entries[0].isIntersecting);
            }).observe(root);
        }

        update();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
`);

console.log("✔ تم: index.html + main.css + main.js");
