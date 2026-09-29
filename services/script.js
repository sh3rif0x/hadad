import { initHeader } from "/components/header/script.js";
import { renderList, renderService, renderNotFound } from "/services/template.js";

const DEBUG = new URLSearchParams(location.search).has("debug") || localStorage.getItem("debug") === "1";
const log = (...a) => DEBUG && console.log("%c[services]", "color:#e67e22", ...a);
const $ = s => document.querySelector(s);

const servicesList = $("#servicesList");
const servicesGrid = $("#servicesGrid");
const serviceDetail = $("#serviceDetail");
const serviceNotFound = $("#serviceNotFound");

async function loadComponent(selector, url) {
    const target = $(selector);
    if (!target) return;
    const r = await fetch(url);
    log("component", url, r.status);
    if (!r.ok) throw new Error("Failed to load " + url + " (" + r.status + ")");
    target.innerHTML = await r.text();
}

async function loadServices() {
    const url = "/data/services.json";
    const r = await fetch(url);
    log("fetch", url, r.status);
    if (!r.ok) throw new Error("Failed to load " + url + " (" + r.status + ")");
    const data = await r.json();
    const services = Array.isArray(data) ? data : data.services;
    if (!Array.isArray(services)) throw new Error("services.json must be an array");
    log("services:", services.map(s => s.slug));
    return services;
}

function getServiceSlug() {
    const parts = location.pathname.split("/").filter(Boolean);
    const i = parts.indexOf("services");
    const slug = i === -1 ? null : parts[i + 1] || null;
    log("pathname:", location.pathname, "| slug:", slug);
    return slug ? decodeURIComponent(slug) : null;
}

function findService(services, slug) {
    if (!slug) return null;
    const w = slug.trim().toLowerCase();
    return services.find(s => String(s.slug).trim().toLowerCase() === w) || null;
}

function show(section) {
    if (servicesList) servicesList.hidden = section !== "list";
    if (serviceDetail) serviceDetail.hidden = section !== "detail";
    if (serviceNotFound) serviceNotFound.hidden = section !== "404";
}

function showServicesList(services) {
    show("list");
    if (servicesGrid) servicesGrid.innerHTML = renderList(services);
    document.title = "الخدمات | حداد الرياض";
}

function showServiceDetail(service) {
    show("detail");
    if (serviceDetail) serviceDetail.innerHTML = renderService(service);
    document.title = (service.title || "الخدمة") + " | حداد الرياض";
}

function showNotFound() {
    show("404");
    if (serviceNotFound) serviceNotFound.innerHTML = renderNotFound();
    document.title = "404 | حداد الرياض";
}

async function init() {
    try {
        log("page:", location.href, "| has #servicesList:", !!servicesList);
        await loadComponent("#header", "/components/header/index.html");
        initHeader();
        await loadComponent("#footer", "/components/footer/index.html");

        const services = await loadServices();
        const slug = getServiceSlug();

        if (!slug) return showServicesList(services);

        const service = findService(services, slug);
        log("route: DETAIL", slug, service ? "FOUND" : "NOT FOUND");
        if (!service) return showNotFound();
        showServiceDetail(service);
    } catch (error) {
        console.error("Services initialization failed:", error);
        showNotFound();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
