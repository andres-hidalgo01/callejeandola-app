const modal = document.getElementById("entityModal");
const form = document.getElementById("entityForm");
const modalTitle = document.getElementById("modalTitle");
const formFields = document.getElementById("formFields");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnCancel = document.getElementById("btnCancel");

let currentSubmitHandler = null;

export function openEntityModal({ title, fields, initialData = {}, onSubmit }) {
    if (!modal || !form || !modalTitle || !formFields) return;

    modalTitle.textContent = title;

    formFields.innerHTML = fields.map((field) => {
        const value = initialData[field.name] ?? field.defaultValue ?? "";

        if (field.type === "textarea") {
            return `
        <label class="form-field">
          <span>${field.label}</span>
          <textarea name="${field.name}" rows="4">${value}</textarea>
        </label>
      `;
        }

        if (field.type === "checkbox") {
            const checked = value ? "checked" : "";

            return `
        <label class="form-check">
          <input type="checkbox" name="${field.name}" ${checked}>
          <span>${field.label}</span>
        </label>
      `;
        }

        return `
      <label class="form-field">
        <span>${field.label}</span>
        <input 
          type="${field.type || "text"}" 
          name="${field.name}" 
          value="${value}"
          ${field.required ? "required" : ""}
        >
      </label>
    `;
    }).join("");

    if (currentSubmitHandler) {
        form.removeEventListener("submit", currentSubmitHandler);
    }

    currentSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const payload = {};

        fields.forEach((field) => {
            if (field.type === "checkbox") {
                payload[field.name] = formData.get(field.name) === "on";
            } else if (field.type === "number") {
                const raw = formData.get(field.name);
                payload[field.name] = raw === "" ? null : Number(raw);
            } else if (field.type === "date" || field.type === "datetime-local") {
                payload[field.name] = formData.get(field.name);
            } else {
                payload[field.name] = formData.get(field.name)?.trim() || "";
            }
        });

        await onSubmit(payload);

        closeEntityModal();
    };

    form.addEventListener("submit", currentSubmitHandler);

    modal.showModal();
}

export function closeEntityModal() {
    if (!modal) return;
    modal.close();
}

btnCloseModal?.addEventListener("click", closeEntityModal);
btnCancel?.addEventListener("click", closeEntityModal);