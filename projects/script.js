import { initHeader } from "../components/header/script.js";


/* =========================================================
   ELEMENTS
========================================================= */

const projectsGrid =
    document.querySelector("#projectsGrid");

const projectsFilters =
    document.querySelector("#projectsFilters");


/* =========================================================
   LOAD PROJECTS
========================================================= */

async function loadProjects() {

    const response =
        await fetch("../data/projects.json");

    if (!response.ok) {
        throw new Error("Failed to load projects");
    }

    return await response.json();
}


/* =========================================================
   CATEGORIES
========================================================= */

function getCategories(projects) {

    return [
        "الكل",
        ...new Set(
            projects.map(project => project.category)
        )
    ];

}


/* =========================================================
   RENDER FILTERS
========================================================= */

function renderFilters(categories) {

    projectsFilters.innerHTML =
        categories
        .map((category, index) => {

            return `
                    <button
                        class="project-filter ${index === 0 ? "active" : ""}"
                        type="button"
                        data-category="${category}">
                        ${category}
                    </button>
                `;

        })
        .join("");

}


/* =========================================================
   RENDER PROJECTS
========================================================= */

function renderProjects(
    projects,
    category = "الكل"
) {

    const filteredProjects =
        category === "الكل" ?
        projects :
        projects.filter(
            project =>
            project.category === category
        );


    if (!filteredProjects.length) {

        projectsGrid.innerHTML = `
            <div class="projects-empty">
                لا توجد مشاريع في هذا التصنيف.
            </div>
        `;

        return;
    }


    projectsGrid.innerHTML =
        filteredProjects
        .map((project, index) => {

            const number =
                String(index + 1).padStart(2, "0");


            return `
                    <article class="project-card">

                        <div class="project-card-image">

                            <img
                                src="${project.image}"
                                alt="${project.title}"
                                loading="lazy">

                            <span class="project-category">
                                ${project.category}
                            </span>

                        </div>


                        <div class="project-card-content">

                            <span class="project-number">
                                ${number}
                            </span>

                            <h3>
                                ${project.title}
                            </h3>

                            <p>
                                ${project.description}
                            </p>

                        </div>

                    </article>
                `;

        })
        .join("");
}


/* =========================================================
   FILTER EVENTS
========================================================= */

function initFilters(projects) {

    projectsFilters.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(".project-filter");

            if (!button) {
                return;
            }


            const category =
                button.dataset.category;


            document
                .querySelectorAll(".project-filter")
                .forEach(filter => {

                    filter.classList.toggle(
                        "active",
                        filter === button
                    );

                });


            renderProjects(
                projects,
                category
            );

        }
    );

}


/* =========================================================
   LOAD HEADER
========================================================= */

async function loadHeader() {

    const header =
        document.querySelector("#header");

    if (!header) {
        return;
    }


    const response =
        await fetch("../components/header/index.html");


    if (!response.ok) {
        throw new Error("Failed to load header");
    }


    header.innerHTML =
        await response.text();


    initHeader();

}


/* =========================================================
   LOAD FOOTER
========================================================= */

async function loadFooter() {

    const footer =
        document.querySelector("#footer");

    if (!footer) {
        return;
    }


    const response =
        await fetch("../components/footer/index.html");


    if (!response.ok) {
        throw new Error("Failed to load footer");
    }


    footer.innerHTML =
        await response.text();

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async() => {

        try {

            const projects =
                await loadProjects();


            await loadHeader();

            await loadFooter();


            const categories =
                getCategories(projects);


            renderFilters(categories);

            renderProjects(projects);

            initFilters(projects);


        } catch (error) {

            console.error(
                "Projects page initialization failed:",
                error
            );

        }

    }
);