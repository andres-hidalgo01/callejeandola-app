// export function promptForm(title, fields) {

//     const values = {};

//     for (const field of fields) {

//         const value =
//             prompt(`${field.label}:`, field.value || "");

//         values[field.name] = value;
//     }

//     return values;
// }

// const modal =
//     document.getElementById("entityModal");

// const title =
//     document.getElementById("modalTitle");

// const fields =
//     document.getElementById("formFields");

// export function openModal(
//     modalTitle,
//     html
// ) {

//     title.textContent =
//         modalTitle;

//     fields.innerHTML =
//         html;

//     modal.showModal();
// }

// export function closeModal() {

//     modal.close();
// }

import { state } from "../state/state.js";

let submitHandler = null;
let initialized = false;

export function initModalService({ onSubmit }) {
    if (initialized) return;

    const btnClose = document.getElementById("btnCloseModal");
    const btnCancel = document.getElementById("btnCancel");
    const btnSubmit = document.getElementById("btnSubmitEntity");
    const form = document.getElementById("entityForm");

    submitHandler = onSubmit;

    if (form) {
        form.onsubmit = (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
    }

    btnClose?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeEntityModal();
    });

    btnCancel?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeEntityModal();
    });

    btnSubmit?.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (typeof submitHandler === "function") {
            await submitHandler();
        }
    });

    initialized = true;
}

export function openEntityModal({
    title,
    html,
    submitText = "Guardar",
    mode,
    entity,
    itemId = null,
}) {
    const modal = document.getElementById("entityModal");
    const modalTitle = document.getElementById("modalTitle");
    const formFields = document.getElementById("formFields");
    const submitButton = document.getElementById("btnSubmitEntity");

    if (!modal || !modalTitle || !formFields) return;

    state.modalMode = mode;
    state.modalEntity = entity;
    state.modalItemId = itemId;

    modalTitle.textContent = title;
    formFields.innerHTML = html;

    if (submitButton) {
        submitButton.textContent = submitText;
        submitButton.classList.toggle("btn-danger", mode === "delete");
        submitButton.classList.toggle("btn-primary", mode !== "delete");
    }

    modal.showModal();
}

export function closeEntityModal() {
    const modal = document.getElementById("entityModal");
    const formFields = document.getElementById("formFields");
    const submitButton = document.getElementById("btnSubmitEntity");

    if (modal?.open) {
        modal.close();
    }

    if (formFields) {
        formFields.innerHTML = "";
    }

    if (submitButton) {
        submitButton.textContent = "Guardar";
        submitButton.classList.remove("btn-danger");
        submitButton.classList.add("btn-primary");
    }

    state.modalMode = null;
    state.modalEntity = null;
    state.modalItemId = null;
}