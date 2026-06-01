export function initNavigation() {

    const buttons =
        document.querySelectorAll("[data-view]");

    const panels =
        document.querySelectorAll("[data-view-panel]");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const target =
                button.dataset.view;

            buttons.forEach(b =>
                b.classList.remove("is-active")
            );

            panels.forEach(panel =>
                panel.classList.remove("is-active")
            );

            button.classList.add("is-active");

            document
                .querySelector(
                    `[data-view-panel="${target}"]`
                )
                ?.classList.add("is-active");
        });
    });
}

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