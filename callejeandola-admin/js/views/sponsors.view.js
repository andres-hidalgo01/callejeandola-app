// import { state } from "../state/state.js";

// import {
//   createSponsor,
//   updateSponsor,
//   deleteSponsor,
// } from "../api/sponsors.api.js";

// import {
//   openEntityModal,
//   closeEntityModal,
// } from "../services/modal.service.js";

// import { showToast } from "../services/toast.service.js";

// import {
//   getValue,
//   getChecked,
// } from "../utils/form.js";

// import {
//   escapeHtml,
//   escapeAttr,
// } from "../utils/sanitize.js";

// import { renderImage } from "../utils/dom.js";

// import { renderDashboard } from "./dashboard.view.js";

// export function renderSponsorsTable() {
//   const table = document.getElementById("sponsorsTable");

//   if (!table) return;

//   if (!state.sponsors.length) {
//     table.innerHTML = `
//       <tr>
//         <td colspan="4">No hay sponsors registrados.</td>
//       </tr>
//     `;
//     return;
//   }

//   table.innerHTML = state.sponsors
//     .map((sponsor) => {
//       return `
//         <tr>
//           <td>
//             <strong>${escapeHtml(sponsor.name || "—")}</strong>
//             ${sponsor.active === false
//           ? `<span class="badge">Inactive</span>`
//           : `<span class="badge">Active</span>`
//         }
//           </td>

//           <td>
//             ${renderImage(sponsor.logo, sponsor.name)}
//           </td>

//           <td>
//             ${sponsor.website
//           ? `<a href="${escapeAttr(sponsor.website)}" target="_blank" rel="noopener">Website</a>`
//           : "—"
//         }
//           </td>

//           <td>
//             <div class="table-actions">
//               <button
//                 class="btn btn-secondary"
//                 type="button"
//                 data-edit-sponsor="${sponsor.id}">
//                 Editar
//               </button>

//               <button
//                 class="btn btn-danger"
//                 type="button"
//                 data-delete-sponsor="${sponsor.id}">
//                 Eliminar
//               </button>
//             </div>
//           </td>
//         </tr>
//       `;
//     })
//     .join("");
// }

// export function bindSponsorTableActions() {
//   document.querySelectorAll("[data-edit-sponsor]").forEach((button) => {
//     button.onclick = () => {
//       const id = Number(button.dataset.editSponsor);

//       const sponsor = state.sponsors.find((item) => {
//         return Number(item.id) === id;
//       });

//       if (!sponsor) {
//         showToast("Sponsor no encontrado");
//         return;
//       }

//       openSponsorFormModal("edit", sponsor);
//     };
//   });

//   document.querySelectorAll("[data-delete-sponsor]").forEach((button) => {
//     button.onclick = () => {
//       const id = Number(button.dataset.deleteSponsor);

//       const sponsor = state.sponsors.find((item) => {
//         return Number(item.id) === id;
//       });

//       if (!sponsor) {
//         showToast("Sponsor no encontrado");
//         return;
//       }

//       openDeleteSponsorModal(sponsor);
//     };
//   });
// }

// export function bindSponsorCreateButton() {
//   const btnCreateSponsor = document.querySelector('[data-open-form="sponsor"]');

//   if (!btnCreateSponsor) {
//     console.warn("Botón Crear Sponsor no encontrado");
//     return;
//   }

//   btnCreateSponsor.onclick = (event) => {
//     event.preventDefault();
//     event.stopPropagation();

//     localStorage.setItem("cj_admin_active_view", "sponsors");

//     openSponsorFormModal("create");
//   };
// }

// function openSponsorFormModal(mode, sponsor = {}) {
//   const isEdit = mode === "edit";

//   openEntityModal({
//     title: isEdit ? "Editar Sponsor" : "Crear Sponsor",
//     submitText: isEdit ? "Actualizar" : "Guardar",
//     mode,
//     entity: "sponsor",
//     itemId: sponsor.id || null,
//     html: `
//       <div class="form-field">
//         <label for="sponsorName">Nombre *</label>
//         <input
//           id="sponsorName"
//           name="name"
//           type="text"
//           required
//           value="${escapeAttr(sponsor.name || "")}"
//           placeholder="Ej: Monster Energy"
//         >
//       </div>

//       <div class="form-field">
//         <label for="sponsorLogo">Logo Cloudinary URL</label>
//         <input
//           id="sponsorLogo"
//           name="logo"
//           type="url"
//           value="${escapeAttr(sponsor.logo || "")}"
//           placeholder="https://res.cloudinary.com/..."
//         >
//       </div>

//       <div class="form-field">
//         <label for="sponsorWebsite">Website</label>
//         <input
//           id="sponsorWebsite"
//           name="website"
//           type="url"
//           value="${escapeAttr(sponsor.website || "")}"
//           placeholder="https://..."
//         >
//       </div>

//       <label class="form-check">
//         <input
//           id="sponsorActive"
//           name="active"
//           type="checkbox"
//           ${sponsor.active === false ? "" : "checked"}
//         >
//         <span>Sponsor activo</span>
//       </label>
//     `,
//   });
// }

// function openDeleteSponsorModal(sponsor) {
//   openEntityModal({
//     title: "Eliminar Sponsor",
//     submitText: "Eliminar",
//     mode: "delete",
//     entity: "sponsor",
//     itemId: sponsor.id,
//     html: `
//       <div class="danger-zone">
//         <h3>¿Eliminar este sponsor?</h3>
//         <p>
//           Vas a eliminar <strong>${escapeHtml(sponsor.name || "este sponsor")}</strong>.
//           Esta acción no se puede deshacer.
//         </p>
//       </div>
//     `,
//   });
// }

// function renderSponsorsOnly() {
//   renderDashboard();
//   renderSponsorsTable();
//   bindSponsorTableActions();
// }

// function getSponsorPayloadFromForm() {
//   return {
//     name: getValue("sponsorName"),
//     logo: getValue("sponsorLogo"),
//     website: getValue("sponsorWebsite"),
//     active: getChecked("sponsorActive"),
//   };
// }

// async function handleCreateSponsor() {
//   try {
//     const payload = getSponsorPayloadFromForm();

//     if (!payload.name) {
//       showToast("Nombre es obligatorio");
//       return;
//     }

//     const createdSponsor = await createSponsor(payload);

//     state.sponsors = [
//       createdSponsor,
//       ...state.sponsors,
//     ];

//     closeEntityModal();
//     renderSponsorsOnly();

//     showToast("Sponsor creado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error creando sponsor");
//   }
// }

// async function handleUpdateSponsor() {
//   try {
//     const id = Number(state.modalItemId);
//     const payload = getSponsorPayloadFromForm();

//     if (!id) {
//       showToast("ID inválido");
//       return;
//     }

//     if (!payload.name) {
//       showToast("Nombre es obligatorio");
//       return;
//     }

//     const updatedSponsor = await updateSponsor(id, payload);

//     state.sponsors = state.sponsors.map((sponsor) => {
//       return Number(sponsor.id) === id ? updatedSponsor : sponsor;
//     });

//     closeEntityModal();
//     renderSponsorsOnly();

//     showToast("Sponsor actualizado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error actualizando sponsor");
//   }
// }

// async function handleDeleteSponsor() {
//   try {
//     const id = Number(state.modalItemId);

//     if (!id) {
//       showToast("ID inválido");
//       return;
//     }

//     await deleteSponsor(id);

//     state.sponsors = state.sponsors.filter((sponsor) => {
//       return Number(sponsor.id) !== id;
//     });

//     closeEntityModal();
//     renderSponsorsOnly();

//     showToast("Sponsor eliminado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error eliminando sponsor");
//   }
// }

// export async function handleSponsorSubmit() {
//   if (state.modalMode === "create") {
//     await handleCreateSponsor();
//     return;
//   }

//   if (state.modalMode === "edit") {
//     await handleUpdateSponsor();
//     return;
//   }

//   if (state.modalMode === "delete") {
//     await handleDeleteSponsor();
//     return;
//   }

//   showToast("Acción de Sponsor no configurada");
// }

import { state } from "../state/state.js";

import {
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from "../api/sponsors.api.js";

import {
  openEntityModal,
  closeEntityModal,
} from "../services/modal.service.js";

import { showToast } from "../services/toast.service.js";
import { showView } from "../services/navigation.service.js";

import {
  getValue,
  getChecked,
} from "../utils/form.js";

import {
  escapeHtml,
  escapeAttr,
} from "../utils/sanitize.js";

import { renderImage } from "../utils/dom.js";
import { renderDashboard } from "./dashboard.view.js";

export function renderSponsorsTable() {
  const table = document.getElementById("sponsorsTable");

  if (!table) return;

  if (!state.sponsors.length) {
    table.innerHTML = `
      <tr>
        <td colspan="4">No hay sponsors registrados.</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = state.sponsors
    .map((sponsor) => {
      return `
        <tr>
          <td>
            <strong>${escapeHtml(sponsor.name || "—")}</strong>
            ${sponsor.active === false
          ? `<span class="badge">Inactive</span>`
          : `<span class="badge">Active</span>`
        }
          </td>

          <td>
            ${renderImage(sponsor.logo, sponsor.name)}
          </td>

          <td>
            ${sponsor.website
          ? `<a href="${escapeAttr(sponsor.website)}" target="_blank" rel="noopener">Website</a>`
          : "—"
        }
          </td>

          <td>
            <div class="table-actions">
              <button
                class="btn btn-secondary"
                type="button"
                data-edit-sponsor="${sponsor.id}">
                Editar
              </button>

              <button
                class="btn btn-danger"
                type="button"
                data-delete-sponsor="${sponsor.id}">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

export function bindSponsorTableActions() {
  document.querySelectorAll("[data-edit-sponsor]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const id = Number(button.dataset.editSponsor);

      const sponsor = state.sponsors.find((item) => {
        return Number(item.id) === id;
      });

      if (!sponsor) {
        showToast("Sponsor no encontrado");
        return;
      }

      openSponsorFormModal("edit", sponsor);
    };
  });

  document.querySelectorAll("[data-delete-sponsor]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const id = Number(button.dataset.deleteSponsor);

      const sponsor = state.sponsors.find((item) => {
        return Number(item.id) === id;
      });

      if (!sponsor) {
        showToast("Sponsor no encontrado");
        return;
      }

      openDeleteSponsorModal(sponsor);
    };
  });
}

export function bindSponsorCreateButton() {
  const btnCreateSponsor = document.querySelector('[data-open-form="sponsor"]');

  if (!btnCreateSponsor) {
    console.warn("Botón Crear Sponsor no encontrado");
    return;
  }

  btnCreateSponsor.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    localStorage.setItem("cj_admin_active_view", "sponsors");

    openSponsorFormModal("create");
  };
}

function openSponsorFormModal(mode, sponsor = {}) {
  const isEdit = mode === "edit";

  openEntityModal({
    title: isEdit ? "Editar Sponsor" : "Crear Sponsor",
    submitText: isEdit ? "Actualizar" : "Guardar",
    mode,
    entity: "sponsor",
    itemId: sponsor.id || null,
    html: `
      <div class="form-field">
        <label for="sponsorName">Nombre *</label>
        <input
          id="sponsorName"
          name="name"
          type="text"
          required
          value="${escapeAttr(sponsor.name || "")}"
          placeholder="Ej: Monster Energy"
        >
      </div>

      <div class="form-field">
        <label for="sponsorLogo">Logo Cloudinary URL</label>
        <input
          id="sponsorLogo"
          name="logo"
          type="url"
          value="${escapeAttr(sponsor.logo || "")}"
          placeholder="https://res.cloudinary.com/..."
        >
      </div>

      <div class="form-field">
        <label for="sponsorWebsite">Website</label>
        <input
          id="sponsorWebsite"
          name="website"
          type="url"
          value="${escapeAttr(sponsor.website || "")}"
          placeholder="https://..."
        >
      </div>

      <label class="form-check">
        <input
          id="sponsorActive"
          name="active"
          type="checkbox"
          ${sponsor.active === false ? "" : "checked"}
        >
        <span>Sponsor activo</span>
      </label>
    `,
  });
}

function openDeleteSponsorModal(sponsor) {
  openEntityModal({
    title: "Eliminar Sponsor",
    submitText: "Eliminar",
    mode: "delete",
    entity: "sponsor",
    itemId: sponsor.id,
    html: `
      <div class="danger-zone">
        <h3>¿Eliminar este sponsor?</h3>
        <p>
          Vas a eliminar <strong>${escapeHtml(sponsor.name || "este sponsor")}</strong>.
          Esta acción no se puede deshacer.
        </p>
      </div>
    `,
  });
}

function renderSponsorsOnly() {
  renderDashboard();
  renderSponsorsTable();
  bindSponsorTableActions();
  showView("sponsors");
}

function getSponsorPayloadFromForm() {
  return {
    name: getValue("sponsorName"),
    logo: getValue("sponsorLogo"),
    website: getValue("sponsorWebsite"),
    active: getChecked("sponsorActive"),
  };
}

async function handleCreateSponsor() {
  try {
    const payload = getSponsorPayloadFromForm();

    if (!payload.name) {
      showToast("Nombre es obligatorio");
      return;
    }

    const createdSponsor = await createSponsor(payload);

    state.sponsors = [
      createdSponsor,
      ...state.sponsors,
    ];

    closeEntityModal();
    renderSponsorsOnly();

    showToast("Sponsor creado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error creando sponsor");
  }
}

async function handleUpdateSponsor() {
  try {
    const id = Number(state.modalItemId);
    const payload = getSponsorPayloadFromForm();

    if (!id) {
      showToast("ID inválido");
      return;
    }

    if (!payload.name) {
      showToast("Nombre es obligatorio");
      return;
    }

    const updatedSponsor = await updateSponsor(id, payload);

    state.sponsors = state.sponsors.map((sponsor) => {
      return Number(sponsor.id) === id ? updatedSponsor : sponsor;
    });

    closeEntityModal();
    renderSponsorsOnly();

    showToast("Sponsor actualizado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error actualizando sponsor");
  }
}

async function handleDeleteSponsor() {
  try {
    const id = Number(state.modalItemId);

    if (!id) {
      showToast("ID inválido");
      return;
    }

    await deleteSponsor(id);

    state.sponsors = state.sponsors.filter((sponsor) => {
      return Number(sponsor.id) !== id;
    });

    closeEntityModal();
    renderSponsorsOnly();

    showToast("Sponsor eliminado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error eliminando sponsor");
  }
}

export async function handleSponsorSubmit() {
  if (state.modalMode === "create") {
    await handleCreateSponsor();
    return;
  }

  if (state.modalMode === "edit") {
    await handleUpdateSponsor();
    return;
  }

  if (state.modalMode === "delete") {
    await handleDeleteSponsor();
    return;
  }

  showToast("Acción de Sponsor no configurada");
}
