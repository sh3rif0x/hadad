import fs from "node:fs";

const PAGES = ["index.html","blog/index.html","contact/index.html","projects/index.html","services/index.html"];
const S = "<!-- BRAND:START -->", E = "<!-- BRAND:END -->";
const strip = (t) => t.replace(new RegExp("\\n?" + S + "[\\s\\S]*?" + E + "\\n?"), "\n");

if (process.argv.includes("--remove")) {
  for (const f of PAGES) if (fs.existsSync(f)) fs.writeFileSync(f, strip(fs.readFileSync(f, "utf8")));
  fs.rmSync("brand.css", { force: true });
  console.log("✔ brand removed"); process.exit(0);
}

const css = `/* =========================================================
   BRAND SYSTEM
   Primary   = steel blue   (trust, main UI)
   Secondary = deep navy    (dark sections, footer, headings)
   Accent    = forge copper (CTAs and highlights ONLY)
   Neutrals  = cool greys
========================================================= */
:root{
  --brand-primary:#176d91;
  --brand-primary-dark:#0f5170;
  --brand-secondary:#0b2a3a;
  --brand-secondary-soft:#12384b;
  --brand-accent:#d9782d;
  --brand-accent-dark:#b85f1c;
  --brand-accent-light:#f3b27a;
  --brand-bg:#f5f8fa;
  --brand-bg-soft:#eaf1f5;
  --brand-text:#12303d;
  --brand-text-medium:#46606e;
  --brand-text-muted:#5a7686;
  --brand-border:#d5e0e6;

  /* map onto the variables the site already uses */
  --color-primary:var(--brand-primary);
  --color-primary-dark:var(--brand-primary-dark);
  --color-primary-light:#dcecf3;
  --color-bg:var(--brand-bg);
  --color-bg-soft:var(--brand-bg-soft);
  --color-bg-dark:var(--brand-secondary);
  --color-text:var(--brand-text);
  --color-text-dark:var(--brand-secondary);
  --color-text-medium:var(--brand-text-medium);
  --color-text-light:var(--brand-text-muted);
  --color-border:var(--brand-border);
  --color-accent:var(--brand-accent);
  --color-accent-light:var(--brand-accent-light);
  --radius-sm:4px; --radius-md:6px; --radius-lg:10px;
  --shadow-sm:0 4px 14px rgba(11,42,58,.08);
  --shadow-md:0 10px 30px rgba(11,42,58,.13);
  --shadow-lg:0 18px 50px rgba(11,42,58,.18);
}

/* typography */
body,button,input,textarea,select{font-family:"Cairo",Tahoma,Arial,sans-serif !important}
h1,h2,h3{letter-spacing:0 !important}

/* CTAs = accent color */
.primary-btn,.faq-cta,.project-intro-btn,.blog-btn-primary,.service-btn-primary,
.site-header.scrolled .header-cta{
  background:var(--brand-accent) !important;border-color:var(--brand-accent) !important;color:#fff !important;
}
.primary-btn:hover,.faq-cta:hover,.project-intro-btn:hover,.blog-btn-primary:hover,.service-btn-primary:hover,
.site-header.scrolled .header-cta:hover{
  background:var(--brand-accent-dark) !important;border-color:var(--brand-accent-dark) !important;
}
.hero-call i{background:linear-gradient(135deg,var(--brand-accent),var(--brand-accent-dark)) !important}
.floating-phone{background:var(--brand-accent) !important}

/* accent highlights (small touches only) */
.hero h1::after{background:linear-gradient(90deg,transparent,var(--brand-accent),transparent) !important}
.section-heading>span,.about-content>span,.contact-content>span,.faq-eyebrow,
.blogs-heading>span,.blog-eyebrow,.projects-eyebrow,.service-eyebrow{color:var(--brand-accent) !important}
.contact .contact-content>span,.blog-hero .blog-eyebrow,.projects-hero .projects-eyebrow{color:var(--brand-accent-light) !important}
.hero-timeline span.active{background:var(--brand-accent) !important}

/* footer: same brand, no more random gold */
.site-footer{background:var(--brand-secondary) !important}
.footer-links a:hover,a.footer-contact-item:hover{color:var(--brand-accent-light) !important}
.footer-contact-item strong{color:var(--brand-accent) !important}
.footer-description,.footer-links a{color:#9db3bf !important}

/* readable body text on the services pages */
.services-list-header p,.service-card-content p,.article-header p,
.article-section-content p,.faq-item p{color:var(--brand-text-medium) !important}

/* sharper, more industrial cards */
.service-card,.project-card,.blog-card,.faq-item,.contact-item,.ct-card{border-radius:var(--radius-md) !important}
.service-card-centered{border-radius:var(--radius-lg) !important}
`;
fs.writeFileSync("brand.css", css);

const head = `${S}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap">
<link rel="stylesheet" href="/brand.css">
${E}`;

for (const f of PAGES) {
  if (!fs.existsSync(f)) { console.warn("skip (not found): " + f); continue; }
  let t = strip(fs.readFileSync(f, "utf8"));
  if (!/<\/head>/i.test(t)) { console.warn("no </head>: " + f); continue; }
  fs.writeFileSync(f, t.replace(/<\/head>/i, head + "\n</head>"));
  console.log("✔ " + f);
}
console.log("\nDone. Hard refresh (Ctrl+Shift+R). Undo anytime: node brand.mjs --remove");
