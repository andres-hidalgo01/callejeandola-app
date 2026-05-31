export function promptForm(title, fields) {

    const values = {};

    for (const field of fields) {

        const value =
            prompt(`${field.label}:`, field.value || "");

        values[field.name] = value;
    }

    return values;
}

const modal =
    document.getElementById("entityModal");

const title =
    document.getElementById("modalTitle");

const fields =
    document.getElementById("formFields");

export function openModal(
    modalTitle,
    html
) {

    title.textContent =
        modalTitle;

    fields.innerHTML =
        html;

    modal.showModal();
}

export function closeModal() {

    modal.close();
}