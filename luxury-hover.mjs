import fs from "node:fs";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

for (const f of ["index.html", "main.css", "main.js"]) {
  if (!fs.existsSync(f)) { console.error("✖ لم أجد: " + f); process.exit(1); }
}

/* 1) index.html: شيل نقاط الـ snap وغيّر نص التلميح */
let h = fs.readFileSync("index.html", "utf8");
h = h.replace(/\s*<div class="lx-steps"[\s\S]*?<\/div>\s*(?=<\/section>\s*<!-- STORY:END -->)/, "\n");
h = h.replace("مرّر للاستكشاف", "مرّر على العناصر");
fs.writeFileSync("index.html", h);

/* 2) CSS: بدون sticky وبدون snap */
inject("main.css", "/* STORY-HOVER:START */", "/* STORY-HOVER:END */", `
html.lx-snap { scroll-snap-type: none !important; }

.lx-stage {
    position: relative;
    top: auto;
    height: auto;
    min-height: 100vh;
}

.lx-visual { height: min(78vh, 700px); }
.lx-steps { display: none !important; }

@media (max-width: 900px) {
    .lx-stage {
        min-height: 0;
        grid-template-rows: auto auto;
    }
    .lx-visual { height: 68vh; }
}
`);

/* 3) JS: hover بدل السكرول */
inject("main.js", "/* STORY:START */", "/* STORY:END */", `
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
`);

console.log("✔ تم: بدون snap وبدون سكرول إجباري، والصور بتتغير بالـ hover");
