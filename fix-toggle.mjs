import fs from "node:fs";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
function inject(file, start, end, block) {
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(new RegExp("\\n*" + esc(start) + "[\\s\\S]*?" + esc(end) + "\\n*", "g"), "\n");
  fs.writeFileSync(file, t.replace(/\s*$/, "\n") + "\n" + start + "\n" + block.trim() + "\n" + end + "\n");
}

const JS = "components/header/script.js";
const CSS = "components/header/style.css";
for (const f of [JS, CSS]) if (!fs.existsSync(f)) { console.error("✖ لم أجد: " + f); process.exit(1); }

/* 1) شيل لسنر services القديم من initHeader */
let js = fs.readFileSync(JS, "utf8");
js = js.replace(
  /\n[ \t]*if \(servicesItem && servicesToggle\) \{\s*servicesToggle\.addEventListener\("click"[\s\S]*?\n    \}\n/,
  "\n"
);
fs.writeFileSync(JS, js);

/* 2) بلوك AREAS الجديد */
inject(JS, "/* AREAS:START */", "/* AREAS:END */", `
document.addEventListener("click", function (e) {
    var toggle = e.target.closest(".services-toggle");
    var region = e.target.closest(".areas-region");

    if (toggle) {
        var item = toggle.closest(".nav-item");
        var panel = item.querySelector(".services-dropdown, .areas-panel");
        var visible =
            panel.offsetHeight > 0 &&
            getComputedStyle(panel).visibility === "visible" &&
            !item.classList.contains("shut");

        document.querySelectorAll(".nav-item.open, .nav-item.shut").forEach(function (n) {
            if (n !== item) n.classList.remove("open", "shut");
        });

        if (visible) {
            item.classList.remove("open");
            item.classList.add("shut");
        } else {
            item.classList.remove("shut");
            item.classList.add("open");
        }
        toggle.setAttribute("aria-expanded", String(!visible));
        return;
    }

    if (region) {
        var group = region.parentElement;
        var willOpen = !group.classList.contains("open");
        region.closest(".areas-panel").querySelectorAll(".areas-group").forEach(function (g) {
            g.classList.remove("open");
            g.querySelector(".areas-region").setAttribute("aria-expanded", "false");
        });
        if (willOpen) {
            group.classList.add("open");
            region.setAttribute("aria-expanded", "true");
        }
        return;
    }

    if (!e.target.closest(".nav-item")) {
        document.querySelectorAll(".nav-item.open, .nav-item.shut").forEach(function (n) {
            n.classList.remove("open", "shut");
        });
        document.querySelectorAll(".areas-group.open").forEach(function (g) {
            g.classList.remove("open");
        });
    }
});

document.addEventListener("mouseout", function (e) {
    var item = e.target.closest && e.target.closest(".nav-item");
    if (item && !item.contains(e.relatedTarget)) item.classList.remove("shut");
});
`);

/* 3) CSS */
inject(CSS, "/* SHUT:START */", "/* SHUT:END */", `
.nav-item.shut > .areas-panel,
.nav-item.shut > .services-dropdown {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
}

.nav-item.shut .dropdown-arrow {
    transform: none !important;
}
`);

console.log("✔ تم: الضغط على الأب المفتوح بيقفله");
