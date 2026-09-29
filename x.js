// palette.js  →  node palette.js   (من جذر المشروع)
const fs = require("fs");

const FILES = [
  "main.css",
  "components/header/style.css",
  "components/footer/style.css",
  "blog/style.css",
  "contact/style.css",
  "projects/style.css",
  "services/style.css"
];

const HEX = {
  "#176d91": "#dd9a3b", "#115a78": "#c4842a", "#106b91": "#c4842a",
  "#16729b": "#c4842a", "#0b6388": "#c4842a", "#115c7b": "#c4842a",
  "#2b89ad": "#e0a04a",
  "#12384b": "#1b2645", "#173f51": "#1b2645", "#17465b": "#1b2645",
  "#0a2634": "#1b2645", "#0d2f40": "#1b2645", "#294f60": "#1b2645",
  "#0d2b3a": "#222d4f", "#071c28": "#141c36", "#061821": "#101730",
  "#040b11": "#0f1530", "#0f3242": "#1b2645", "#0b2530": "#141c36",
  "#4f7181": "#5b6479", "#527382": "#5b6479",
  "#7893a0": "#8a92a3", "#7d969f": "#8a92a3", "#6e8b98": "#8a92a3", "#8aa0a9": "#8a92a3",
  "#aee4f5": "#f2c98a", "#b9e8f7": "#f2c98a", "#b9e8ff": "#f2c98a", "#d6f2fb": "#f6d9a8",
  "#dff3fb": "#fbecd3", "#e8f6fc": "#faf1e0", "#e8f8ff": "#faf1e0",
  "#e7f4f9": "#faf1e0", "#d8edf5": "#f5e4c4", "#dbeef5": "#f3f1ec",
  "#f2faff": "#fdf8ef", "#f4fbfe": "#fdf8ef", "#e6eef3": "#faf1e0",
  "#edf8fc": "#f3f1ec", "#eef8fc": "#f3f1ec", "#f8fcfe": "#faf9f6", "#f5fbfd": "#faf9f6",
  "#d6e8ef": "#e6e3dc", "#d6eef7": "#f5e4c4", "#b9dfed": "#eed3a3",
  "#e1edf2": "#ece9e2", "#e9f1f5": "#ece9e2",
  "#d0a444": "#dd9a3b"
};

const RGB = [
  [[6, 28, 40], "20, 28, 54"], [[7, 35, 48], "20, 28, 54"], [[7, 25, 35], "20, 28, 54"],
  [[8, 35, 47], "20, 28, 54"], [[9, 42, 57], "20, 28, 54"], [[10, 35, 47], "20, 28, 54"],
  [[4, 18, 26], "16, 23, 48"], [[18, 56, 75], "27, 38, 69"], [[23, 63, 81], "27, 38, 69"],
  [[23, 82, 105], "27, 38, 69"], [[20, 70, 90], "27, 38, 69"], [[20, 90, 120], "27, 38, 69"],
  [[20, 100, 130], "27, 38, 69"], [[40, 80, 100], "27, 38, 69"], [[80, 150, 180], "27, 38, 69"],
  [[190, 224, 240], "255, 255, 255"],
  [[23, 109, 145], "221, 154, 59"], [[43, 137, 173], "224, 160, 74"],
  [[174, 228, 245], "242, 201, 138"], [[185, 232, 247], "242, 201, 138"]
];

const ROOT_VARS = {
  "--color-primary": "#dd9a3b",
  "--color-primary-dark": "#c4842a",
  "--color-primary-light": "#fbecd3",
  "--color-blue-50": "#fdf8ef",
  "--color-blue-100": "#faf1e0",
  "--color-blue-200": "#f5e4c4",
  "--color-blue-300": "#eed3a3",
  "--color-bg": "#faf9f6",
  "--color-bg-soft": "#f3f1ec",
  "--color-bg-white": "#ffffff",
  "--color-bg-dark": "#1b2645",
  "--color-text": "#1b2645",
  "--color-text-dark": "#141c36",
  "--color-text-medium": "#5b6479",
  "--color-text-light": "#8a92a3",
  "--color-border": "#e6e3dc",
  "--color-accent": "#e0a04a",
  "--color-accent-light": "#f2c98a"
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

let total = 0;

for (const f of FILES) {
  if (!fs.existsSync(f)) { console.warn("• تخطّي (مش موجود): " + f); continue; }
  if (!fs.existsSync(f + ".pal.bak")) fs.copyFileSync(f, f + ".pal.bak");

  let t = fs.readFileSync(f, "utf8");
  const before = t;

  for (const [from, to] of Object.entries(HEX)) {
    t = t.replace(new RegExp(esc(from), "gi"), to);
  }

  for (const [[r, g, b], to] of RGB) {
    t = t.replace(
      new RegExp("rgba\\(\\s*" + r + "\\s*,\\s*" + g + "\\s*,\\s*" + b + "\\s*,", "g"),
      "rgba(" + to + ","
    );
  }

  if (f === "main.css") {
    t = t.replace(/:root\s*\{[\s\S]*?\n\}/, (blk) => {
      let out = blk;
      for (const [name, val] of Object.entries(ROOT_VARS)) {
        const re = new RegExp("(" + esc(name) + "\\s*:\\s*)[^;]+;");
        if (re.test(out)) out = out.replace(re, "$1" + val + ";");
      }
      return out;
    });
    t = t.replace(/linear-gradient\(135deg,\s*#e0a04a,\s*#dd9a3b\)/g, "linear-gradient(135deg, #e8ac55, #dd9a3b)");
  }

  if (t !== before) { fs.writeFileSync(f, t); total++; console.log("✔ " + f); }
}

/* ---------- لمسات إضافية (قابلة للتكرار) ---------- */
const S = "/* PALETTE:START */", E = "/* PALETTE:END */";
const extra = `${S}
:root { color-scheme: light; }

body { background: #faf9f6; color: #1b2645; }

.site-header.scrolled { background: #ffffff !important; }
.site-header.scrolled .header-cta { background: #dd9a3b; color: #fff; }
.site-header.scrolled .header-cta:hover { background: #c4842a; }
.header-cta { color: #1b2645; }

.primary-btn { background: #dd9a3b; border-color: #dd9a3b; color: #fff; }
.primary-btn:hover { background: #c4842a; border-color: #c4842a; }
.secondary-btn:hover { background: rgba(221, 154, 59, .85); border-color: #f2c98a; }
.hero-call i { background: linear-gradient(135deg, #e8ac55, #dd9a3b); }
.hero-call:hover { color: #1b2645; }
.hero-arrow:hover { color: #1b2645; }

@keyframes heroPulse {
    0%   { box-shadow: 0 0 0 0 rgba(221, 154, 59, .65); }
    70%  { box-shadow: 0 0 0 16px rgba(221, 154, 59, 0); }
    100% { box-shadow: 0 0 0 0 rgba(221, 154, 59, 0); }
}

.hero-bg::after {
    background:
        linear-gradient(180deg, rgba(20, 28, 54, .78) 0%, rgba(20, 28, 54, .40) 38%, rgba(20, 28, 54, .48) 65%, rgba(20, 28, 54, .92) 100%) !important;
}

.service-card, .project-card, .blog-card, .faq-item { border-color: #e6e3dc; }
.service-card:hover { background: #1b2645; border-color: #1b2645; }
.service-card:hover a { color: #f2c98a; }
.service-icon { background: #faf1e0; color: #dd9a3b; }

.site-footer { background: #101730; }
.contact, .projects-cta, .ct-steps { background: #1b2645; }
.lx-stage {
    background:
        radial-gradient(circle at 12% 15%, rgba(221, 154, 59, .16), transparent 38%),
        radial-gradient(circle at 90% 95%, rgba(242, 201, 138, .06), transparent 40%),
        linear-gradient(160deg, #1b2645 0%, #101730 100%);
}
.lx-list::after { background: linear-gradient(180deg, #f6d9a8, #dd9a3b); box-shadow: 0 0 18px rgba(242, 201, 138, .5); }

.floating-whatsapp, .whatsapp-btn, .ct-btn-wa { background: #25d366; }
.floating-top { background: #1b2645; }

::selection { background: #dd9a3b; color: #fff; }
${E}`;

if (fs.existsSync("main.css")) {
  let css = fs.readFileSync("main.css", "utf8");
  css = css.replace(new RegExp("\\n*" + esc(S) + "[\\s\\S]*?" + esc(E) + "\\n*", "g"), "\n");
  fs.writeFileSync("main.css", css.replace(/\s*$/, "\n") + "\n" + extra + "\n");
}

console.log("\n✔ تم تطبيق الباليت على " + total + " ملف (نسخ احتياطية: *.pal.bak)");
console.log("اعمل Ctrl+Shift+R في المتصفح.");