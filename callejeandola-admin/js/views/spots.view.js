//   const canUpdate = canManageEntity("spots", "update");
//   const canDelete = canManageEntity("spots", "delete");
//   const hasActions = canUpdate || canDelete;

//   table.innerHTML = state.spots
//     .map((spot) => {
//       const actionsHtml = hasActions
//         ? `
//     <div class="table-actions">
//       ${canUpdate
//           ? `
//             <button
//               class="btn btn-secondary"
//               type="button"
//               data-edit-spot="${spot.id}">
//               Editar
//             </button>
//           `
//           : ""
//         }

//       ${canDelete
//           ? `
//             <button
//               class="btn btn-danger"
//               type="button"
//               data-delete-spot="${spot.id}">
//               Eliminar
//             </button>
//           `
//           : ""
//         }
//     </div>
//   `
//         : `<span class="muted">Solo lectura</span>`;
//       return `
//         <tr>
//           <td>
//             <strong>${escapeHtml(spot.name || "—")}</strong>
//           </td>

//           <td>${escapeHtml(spot.city || "—")}</td>

//           <td>
//             <span class="badge">${escapeHtml(spot.type || "—")}</span>
//           </td>

//           <td>${renderImage(spot.image, spot.name)}</td>

//           <td>
//             <div class="table-actions">
//               <button
//                 class="btn btn-secondary"
//                 type="button"
//                 data-edit-spot="${spot.id}">
//                 Editar
//               </button>

//               <button
//                 class="btn btn-danger"
//                 type="button"
//                 data-delete-spot="${spot.id}">
//                 Eliminar
//               </button>
//             </div>
//           </td>
//         </tr>
//       `;
//     })
//     .join("");
// }

// export function bindSpotTableActions() {
//   document.querySelectorAll("[data-edit-spot]").forEach((button) => {
//     button.onclick = () => {
//       const id = Number(button.dataset.editSpot);

//       const spot = state.spots.find((item) => {
//         return Number(item.id) === id;
//       });

//       if (!spot) {
//         showToast("Spot no encontrado");
//         return;
//       }

//       openSpotFormModal("edit", spot);
//     };
//   });

//   document.querySelectorAll("[data-delete-spot]").forEach((button) => {
//     button.onclick = () => {
//       const id = Number(button.dataset.deleteSpot);

//       const spot = state.spots.find((item) => {
//         return Number(item.id) === id;
//       });

//       if (!spot) {
//         showToast("Spot no encontrado");
//         return;
//       }

//       openDeleteSpotModal(spot);
//     };
//   });
// }

// // export function bindSpotCreateButton() {
// //   const btnCreateSpot = document.querySelector('[data-open-form="spot"]');

// //   if (!btnCreateSpot) return;

// //   btnCreateSpot.onclick = () => {
// //     localStorage.setItem("cj_admin_active_view", "spots");
// //     openSpotFormModal("create");
// //   };
// // }

// export function bindSpotCreateButton() {
//   const btnCreateSpot = document.querySelector('[data-open-form="spot"]');

//   if (!btnCreateSpot) return;

//   const canCreate = canManageEntity("spots", "create");

//   btnCreateSpot.hidden = !canCreate;
//   btnCreateSpot.disabled = !canCreate;

//   btnCreateSpot.onclick = (event) => {
//     event.preventDefault();
//     event.stopPropagation();

//     if (!canManageEntity("spots", "create")) {
//       showToast("No tenés permisos para crear spots");
//       return;
//     }

//     localStorage.setItem("cj_admin_active_view", "spots");

//     openSpotFormModal("create");
//   };
// }

// function openSpotFormModal(mode, spot = {}) {
//   const isEdit = mode === "edit";

//   openEntityModal({
//     title: isEdit ? "Editar Spot" : "Crear Spot",
//     submitText: isEdit ? "Actualizar" : "Guardar",
//     mode,
//     entity: "spot",
//     itemId: spot.id || null,
//     html: `
//       <div class="form-field">
//         <label for="spotName">Nombre *</label>
//         <input
//           id="spotName"
//           name="name"
//           type="text"
//           required
//           value="${escapeAttr(spot.name || "")}"
//           placeholder="Ej: Bel-Air Skatepark"
//         >
//       </div>

//       <div class="form-field">
//         <label for="spotDescription">Descripción</label>
//         <textarea
//           id="spotDescription"
//           name="description"
//           rows="4"
//           placeholder="Describe el spot">${escapeHtml(spot.description || "")}</textarea>
//       </div>

//       <div class="form-grid-2">
//         <div class="form-field">
//           <label for="spotCountry">País</label>
//           <input
//             id="spotCountry"
//             name="country"
//             type="text"
//             value="${escapeAttr(spot.country || "Costa Rica")}"
//           >
//         </div>

//         <div class="form-field">
//           <label for="spotCity">Ciudad/Zona *</label>
//           <input
//             id="spotCity"
//             name="city"
//             type="text"
//             required
//             value="${escapeAttr(spot.city || "")}"
//             placeholder="Ej: Heredia"
//           >
//         </div>
//       </div>

//       <div class="form-grid-2">
//         <div class="form-field">
//           <label for="spotType">Tipo</label>
//           <input
//             id="spotType"
//             name="type"
//             type="text"
//             value="${escapeAttr(spot.type || "Street")}"
//             placeholder="Street, Park, Bowl"
//           >
//         </div>

//         <div class="form-field">
//           <label for="spotImage">Imagen Cloudinary URL</label>
//           <input
//             id="spotImage"
//             name="image"
//             type="url"
//             value="${escapeAttr(spot.image || "")}"
//             placeholder="https://res.cloudinary.com/..."
//           >
//         </div>
//       </div>

//       <div class="form-grid-2">
//         <div class="form-field">
//           <label for="spotLat">Latitud</label>
//           <input
//             id="spotLat"
//             name="lat"
//             type="number"
//             step="any"
//             value="${spot.lat ?? 0}"
//           >
//         </div>

//         <div class="form-field">
//           <label for="spotLng">Longitud</label>
//           <input
//             id="spotLng"
//             name="lng"
//             type="number"
//             step="any"
//             value="${spot.lng ?? 0}"
//           >
//         </div>
//       </div>
//     `,
//   });
// }

// function openDeleteSpotModal(spot) {
//   openEntityModal({
//     title: "Eliminar Spot",
//     submitText: "Eliminar",
//     mode: "delete",
//     entity: "spot",
//     itemId: spot.id,
//     html: `
//       <div class="danger-zone">
//         <h3>¿Eliminar este spot?</h3>
//         <p>
//           Vas a eliminar <strong>${escapeHtml(spot.name || "este spot")}</strong>.
//           Esta acción no se puede deshacer.
//         </p>
//       </div>
//     `,
//   });
// }

// function renderSpotsOnly() {
//   renderDashboard();
//   renderSpotsTable();
//   bindSpotTableActions();
// }

// function getSpotPayloadFromForm() {
//   return {
//     name: getValue("spotName"),
//     description: getValue("spotDescription"),
//     country: getValue("spotCountry") || "Costa Rica",
//     city: getValue("spotCity"),
//     lat: getNumberValue("spotLat"),
//     lng: getNumberValue("spotLng"),
//     type: getValue("spotType") || "Street",
//     image: getValue("spotImage"),
//   };
// }

// async function handleCreateSpot() {
//   try {
//     const payload = getSpotPayloadFromForm();

//     if (!payload.name || !payload.city) {
//       showToast("Nombre y ciudad son obligatorios");
//       return;
//     }

//     const createdSpot = await createSpot(payload);

//     state.spots = [
//       createdSpot,
//       ...state.spots,
//     ];

//     closeEntityModal();
//     renderSpotsOnly();

//     showToast("Spot creado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error creando spot");
//   }
// }

// async function handleUpdateSpot() {
//   try {
//     const id = Number(state.modalItemId);
//     const payload = getSpotPayloadFromForm();

//     if (!id) {
//       showToast("ID inválido");
//       return;
//     }

//     if (!payload.name || !payload.city) {
//       showToast("Nombre y ciudad son obligatorios");
//       return;
//     }

//     const updatedSpot = await updateSpot(id, payload);

//     state.spots = state.spots.map((spot) => {
//       return Number(spot.id) === id ? updatedSpot : spot;
//     });

//     closeEntityModal();
//     renderSpotsOnly();

//     showToast("Spot actualizado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error actualizando spot");
//   }
// }

// async function handleDeleteSpot() {
//   try {
//     const id = Number(state.modalItemId);

//     if (!id) {
//       showToast("ID inválido");
//       return;
//     }

//     await deleteSpot(id);

//     state.spots = state.spots.filter((spot) => {
//       return Number(spot.id) !== id;
//     });

//     closeEntityModal();
//     renderSpotsOnly();

//     showToast("Spot eliminado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error eliminando spot");
//   }
// }

// export async function handleSpotSubmit() {
//   if (state.modalMode === "create") {
//     await handleCreateSpot();
//     return;
//   }

//   if (state.modalMode === "edit") {
//     await handleUpdateSpot();
//     return;
//   }

//   if (state.modalMode === "delete") {
//     await handleDeleteSpot();
//     return;
//   }

//   showToast("Acción de Spot no configurada");
// }

import { state } from "../state/state.js";

import {
  createSpot,
  updateSpot,
  deleteSpot,
} from "../api/spots.api.js";

import {
  openEntityModal,
  closeEntityModal,
} from "../services/modal.service.js";

import { showToast } from "../services/toast.service.js";
import { showView } from "../services/navigation.service.js";

import {
  getValue,
  getNumberValue,
} from "../utils/form.js";

import {
  escapeHtml,
  escapeAttr,
} from "../utils/sanitize.js";

import { renderImage } from "../utils/dom.js";
import { renderDashboard } from "./dashboard.view.js";

import { canManageEntity } from "../services/permissions.service.js";

export function renderSpotsTable() {
  const table = document.getElementById("spotsTable");

  if (!table) return;

  if (!state.spots.length) {
    table.innerHTML = `
      <tr>
        <td colspan="5">No hay spots registrados.</td>
      </tr>
    `;
    return;
  }

  const canUpdate = canManageEntity("spots", "update");
  const canDelete = canManageEntity("spots", "delete");
  const hasActions = canUpdate || canDelete;

  table.innerHTML = state.spots
    .map((spot) => {
      const actionsHtml = hasActions
        ? `
          <div class="table-actions">
            ${
              canUpdate
                ? `
                  <button
                    class="btn btn-secondary"
                    type="button"
                    data-edit-spot="${spot.id}">
                    Editar
                  </button>
                `
                : ""
            }

            ${
              canDelete
                ? `
                  <button
                    class="btn btn-danger"
                    type="button"
                    data-delete-spot="${spot.id}">
                    Eliminar
                  </button>
                `
                : ""
            }
          </div>
        `
        : `<span class="muted">Solo lectura</span>`;

      return `
        <tr>
          <td>
            <strong>${escapeHtml(spot.name || "—")}</strong>
          </td>

          <td>${escapeHtml(spot.city || "—")}</td>

          <td>
            <span class="badge">${escapeHtml(spot.type || "—")}</span>
          </td>

          <td>${renderImage(spot.image, spot.name)}</td>

          <td>${actionsHtml}</td>
        </tr>
      `;
    })
    .join("");
}

export function bindSpotTableActions() {
  document.querySelectorAll("[data-edit-spot]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!canManageEntity("spots", "update")) {
        showToast("No tenés permisos para editar spots");
        return;
      }

      const id = Number(button.dataset.editSpot);

      const spot = state.spots.find((item) => {
        return Number(item.id) === id;
      });

      if (!spot) {
        showToast("Spot no encontrado");
        return;
      }

      openSpotFormModal("edit", spot);
    };
  });

  document.querySelectorAll("[data-delete-spot]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!canManageEntity("spots", "delete")) {
        showToast("No tenés permisos para eliminar spots");
        return;
      }

      const id = Number(button.dataset.deleteSpot);

      const spot = state.spots.find((item) => {
        return Number(item.id) === id;
      });

      if (!spot) {
        showToast("Spot no encontrado");
        return;
      }

      openDeleteSpotModal(spot);
    };
  });
}

export function bindSpotCreateButton() {
  const btnCreateSpot = document.querySelector('[data-open-form="spot"]');

  if (!btnCreateSpot) return;

  const canCreate = canManageEntity("spots", "create");

  btnCreateSpot.hidden = !canCreate;
  btnCreateSpot.disabled = !canCreate;

  btnCreateSpot.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canManageEntity("spots", "create")) {
      showToast("No tenés permisos para crear spots");
      return;
    }

    localStorage.setItem("cj_admin_active_view", "spots");

    openSpotFormModal("create");
  };
}

function openSpotFormModal(mode, spot = {}) {
  const isEdit = mode === "edit";

  openEntityModal({
    title: isEdit ? "Editar Spot" : "Crear Spot",
    submitText: isEdit ? "Actualizar" : "Guardar",
    mode,
    entity: "spot",
    itemId: spot.id || null,
    html: `
      <div class="form-field">
        <label for="spotName">Nombre *</label>
        <input
          id="spotName"
          name="name"
          type="text"
          required
          value="${escapeAttr(spot.name || "")}"
          placeholder="Ej: Bel-Air Skatepark"
        >
      </div>

      <div class="form-field">
        <label for="spotDescription">Descripción</label>
        <textarea
          id="spotDescription"
          name="description"
          rows="4"
          placeholder="Describe el spot, obstáculos, ambiente o estado">${escapeHtml(spot.description || "")}</textarea>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="spotCountry">País</label>
          <input
            id="spotCountry"
            name="country"
            type="text"
            value="${escapeAttr(spot.country || "Costa Rica")}"
          >
        </div>

        <div class="form-field">
          <label for="spotCity">Ciudad/Zona *</label>
          <input
            id="spotCity"
            name="city"
            type="text"
            required
            value="${escapeAttr(spot.city || "")}"
            placeholder="Ej: Heredia"
          >
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="spotType">Tipo</label>
          <input
            id="spotType"
            name="type"
            type="text"
            value="${escapeAttr(spot.type || "Street")}"
            placeholder="Street, Park, Bowl"
          >
        </div>

        <div class="form-field">
          <label for="spotImage">Imagen Cloudinary URL</label>
          <input
            id="spotImage"
            name="image"
            type="url"
            value="${escapeAttr(spot.image || "")}"
            placeholder="https://res.cloudinary.com/..."
          >
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="spotLat">Latitud</label>
          <input
            id="spotLat"
            name="lat"
            type="number"
            step="any"
            value="${spot.lat ?? 0}"
          >
        </div>

        <div class="form-field">
          <label for="spotLng">Longitud</label>
          <input
            id="spotLng"
            name="lng"
            type="number"
            step="any"
            value="${spot.lng ?? 0}"
          >
        </div>
      </div>
    `,
  });
}

function openDeleteSpotModal(spot) {
  openEntityModal({
    title: "Eliminar Spot",
    submitText: "Eliminar",
    mode: "delete",
    entity: "spot",
    itemId: spot.id,
    html: `
      <div class="danger-zone">
        <h3>¿Eliminar este spot?</h3>
        <p>
          Vas a eliminar <strong>${escapeHtml(spot.name || "este spot")}</strong>.
          Esta acción no se puede deshacer.
        </p>
      </div>
    `,
  });
}

function renderSpotsOnly() {
  renderDashboard();
  renderSpotsTable();
  bindSpotTableActions();
  bindSpotCreateButton();
  showView("spots");
}

function getSpotPayloadFromForm() {
  return {
    name: getValue("spotName"),
    description: getValue("spotDescription"),
    country: getValue("spotCountry") || "Costa Rica",
    city: getValue("spotCity"),
    lat: getNumberValue("spotLat"),
    lng: getNumberValue("spotLng"),
    type: getValue("spotType") || "Street",
    image: getValue("spotImage"),
  };
}

async function handleCreateSpot() {
  try {
    if (!canManageEntity("spots", "create")) {
      showToast("No tenés permisos para crear spots");
      return;
    }

    const payload = getSpotPayloadFromForm();

    if (!payload.name || !payload.city) {
      showToast("Nombre y ciudad son obligatorios");
      return;
    }

    const createdSpot = await createSpot(payload);

    state.spots = [
      createdSpot,
      ...state.spots,
    ];

    closeEntityModal();
    renderSpotsOnly();

    showToast("Spot creado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error creando spot");
  }
}

async function handleUpdateSpot() {
  try {
    if (!canManageEntity("spots", "update")) {
      showToast("No tenés permisos para actualizar spots");
      return;
    }

    const id = Number(state.modalItemId);
    const payload = getSpotPayloadFromForm();

    if (!id) {
      showToast("ID inválido");
      return;
    }

    if (!payload.name || !payload.city) {
      showToast("Nombre y ciudad son obligatorios");
      return;
    }

    const updatedSpot = await updateSpot(id, payload);

    state.spots = state.spots.map((spot) => {
      return Number(spot.id) === id ? updatedSpot : spot;
    });

    closeEntityModal();
    renderSpotsOnly();

    showToast("Spot actualizado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error actualizando spot");
  }
}

async function handleDeleteSpot() {
  try {
    if (!canManageEntity("spots", "delete")) {
      showToast("No tenés permisos para eliminar spots");
      return;
    }

    const id = Number(state.modalItemId);

    if (!id) {
      showToast("ID inválido");
      return;
    }

    await deleteSpot(id);

    state.spots = state.spots.filter((spot) => {
      return Number(spot.id) !== id;
    });

    closeEntityModal();
    renderSpotsOnly();

    showToast("Spot eliminado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error eliminando spot");
  }
}

export async function handleSpotSubmit() {
  if (state.modalMode === "create") {
    await handleCreateSpot();
    return;
  }

  if (state.modalMode === "edit") {
    await handleUpdateSpot();
    return;
  }

  if (state.modalMode === "delete") {
    await handleDeleteSpot();
    return;
  }

  showToast("Acción de Spot no configurada");
}