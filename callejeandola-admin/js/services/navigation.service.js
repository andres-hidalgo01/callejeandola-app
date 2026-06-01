// export function initNavigation() {

//     const buttons =
//         document.querySelectorAll("[data-view]");

//     const panels =
//         document.querySelectorAll("[data-view-panel]");

//     buttons.forEach(button => {

//         button.addEventListener("click", () => {

//             const target =
//                 button.dataset.view;

//             buttons.forEach(b =>
//                 b.classList.remove("is-active")
//             );

//             panels.forEach(panel =>
//                 panel.classList.remove("is-active")
//             );

//             button.classList.add("is-active");

//             document
//                 .querySelector(
//                     `[data-view-panel="${target}"]`
//                 )
//                 ?.classList.add("is-active");
//         });
//     });
// }

// export function initNavigation() {
//     const buttons = document.querySelectorAll(".nav__item[data-view]");
//     const panels = document.querySelectorAll(".view[data-view-panel]");
//     const pageTitle = document.getElementById("pageTitle");

//     buttons.forEach((button) => {
//         button.addEventListener("click", () => {
//             const target = button.dataset.view;

//             buttons.forEach((btn) => btn.classList.remove("is-active"));
//             panels.forEach((panel) => panel.classList.remove("is-active"));

//             button.classList.add("is-active");

//             const panel = document.querySelector(`[data-view-panel="${target}"]`);
//             if (panel) panel.classList.add("is-active");

//             if (pageTitle) {
//                 pageTitle.textContent = button.textContent.trim();
//             }
//         });
//     });
// }

const VALID_VIEWS = [
    "dashboard",
    "spots",
    "events",
    "shops",
    "sponsors",
    "users",
];

const ACTIVE_VIEW_KEY = "cj_admin_active_view";

export function getSavedView() {
    const savedView = localStorage.getItem(ACTIVE_VIEW_KEY);

    if (VALID_VIEWS.includes(savedView)) {
        return savedView;
    }

    return "dashboard";
}

export function showView(viewName) {
    const safeView = VALID_VIEWS.includes(viewName)
        ? viewName
        : "dashboard";

    const navButtons = document.querySelectorAll(".nav__item[data-view]");
    const panels = document.querySelectorAll(".view[data-view-panel]");
    const pageTitle = document.getElementById("pageTitle");

    const activeButton = document.querySelector(
        `.nav__item[data-view="${safeView}"]`
    );

    const activePanel = document.querySelector(
        `.view[data-view-panel="${safeView}"]`
    );

    if (!activeButton || !activePanel) {
        console.warn("Vista inválida o no encontrada:", safeView);
        return;
    }

    navButtons.forEach((button) => {
        button.classList.remove("is-active");
    });

    panels.forEach((panel) => {
        panel.classList.remove("is-active");
    });

    activeButton.classList.add("is-active");
    activePanel.classList.add("is-active");

    if (pageTitle) {
        pageTitle.textContent = activeButton.textContent.trim();
    }

    localStorage.setItem(ACTIVE_VIEW_KEY, safeView);
}

export function restoreActiveView() {
    showView(getSavedView());
}

export function initNavigation() {
    const navButtons = document.querySelectorAll(".nav__item[data-view]");

    navButtons.forEach((button) => {
        button.addEventListener("click", () => {
            showView(button.dataset.view);
        });
    });
}