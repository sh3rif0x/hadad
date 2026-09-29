import { initHeader } from "/components/header/script.js";

const PHONE = "0534107471";
const WA = "966534107471";

const TOPICS = [
    { label: "أعمال الحدادة", text: "السلام عليكم حداد الرياض، أريد الاستفسار عن أعمال الحدادة." },
    { label: "مظلات السيارات", text: "السلام عليكم حداد الرياض، أريد عرض سعر لمظلة سيارات." },
    { label: "السواتر", text: "السلام عليكم حداد الرياض، أريد عرض سعر لتركيب سواتر." },
    { label: "ساندوتش بانل", text: "السلام عليكم حداد الرياض، أريد الاستفسار عن ساندوتش بانل." },
    { label: "غرف ومجالس", text: "السلام عليكم حداد الرياض، أريد تنفيذ غرفة أو مجلس ساندوتش بانل." },
    { label: "الزجاج السيكوريت", text: "السلام عليكم حداد الرياض، أريد الاستفسار عن الزجاج السيكوريت." },
    { label: "الواجهات", text: "السلام عليكم حداد الرياض، أريد الاستفسار عن تنفيذ واجهة." },
    { label: "صيانة وإصلاح", text: "السلام عليكم حداد الرياض، أحتاج صيانة أو إصلاح لعمل حديدي." }
];

const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.25.7-1.4 1.3-1.95 1.35-.5.05-1.1.07-1.75-.12a15 15 0 0 1-1.6-.6c-2.8-1.2-4.6-4-4.75-4.2-.13-.2-1.1-1.45-1.1-2.8s.7-2 .95-2.25c.25-.27.55-.33.73-.33h.52c.17 0 .4-.05.62.47.25.6.85 2.05.92 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.32.38-.45.5-.15.15-.3.3-.13.6.17.3.75 1.25 1.6 2 1.1.98 2.02 1.28 2.32 1.43.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.8 2.02.95.3.15.5.22.57.35.07.12.07.72-.18 1.4z"/></svg>';

const $ = (s) => document.querySelector(s);

const waLink = (text) => "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);

async function loadComponent(selector, url) {
    const target = $(selector);
    if (!target) return;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Failed to load " + url + " (" + r.status + ")");
    target.innerHTML = await r.text();
}

/* ---------- WhatsApp topic chips ---------- */

function renderChips() {
    const box = $("#ctChips");
    if (!box) return;

    box.innerHTML = TOPICS.map((t) =>
        '<a class="ct-chip" href="' + waLink(t.text) + '" target="_blank" rel="noopener">' +
        WA_ICON + "<span>" + t.label + "</span></a>"
    ).join("");

    const main = $("#waMain");
    if (main) main.href = waLink("السلام عليكم حداد الرياض، أريد الاستفسار عن خدماتكم.");
}

/* ---------- Copy number ---------- */

let toastTimer;

function toast(message) {
    const el = $("#ctToast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
    }
    toast("تم نسخ الرقم " + text);
}

function initCopy() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-copy]");
        if (btn) copyText(btn.getAttribute("data-copy") || PHONE);
    });
}

/* ---------- Init ---------- */

async function init() {
    renderChips();
    initCopy();

    try {
        await loadComponent("#header", "/components/header/index.html");
        initHeader();
        await loadComponent("#footer", "/components/footer/index.html");
    } catch (error) {
        console.error("Contact page init failed:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
