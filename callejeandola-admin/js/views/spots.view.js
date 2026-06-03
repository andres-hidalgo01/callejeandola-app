// import { state } from "../state/state.js";

// import {
//   createShop,
//   updateShop,
//   deleteShop,
// } from "../api/shops.api.js";

// import {
//   openEntityModal,
//   closeEntityModal,
// } from "../services/modal.service.js";

// import { showToast } from "../services/toast.service.js";

// import {
//   getValue,
//   getNumberValue,
//   getChecked,
// } from "../utils/form.js";

// import {
//   escapeHtml,
//   escapeAttr,
// } from "../utils/sanitize.js";

// import { renderImage } from "../utils/dom.js";

// import { renderDashboard } from "./dashboard.view.js";

// export function renderShopsTable() {
//   const table = document.getElementById("shopsTable");

//   if (!table) return;

//   if (!state.shops.length) {
//     table.innerHTML = `
//       <tr>
//         <td colspan="5">No hay shops registrados.</td>
//       </tr>
//     `;
//     return;
//   }

//   table.innerHTML = state.shops
//     .map((shop) => {
//       return `
//         <tr>
//           <td>
//             <strong>${escapeHtml(shop.name || "—")}</strong>
//             ${shop.verified ? `<span class="badge">Verified</span>` : ""}
//             ${shop.promo ? `<span class="badge">Promo</span>` : ""}
//           </td>

//           <td>${escapeHtml(shop.city || "—")}</td>

//           <td>
//             <span class="badge">${escapeHtml(shop.category || "—")}</span>
//           </td>

//           <td>${renderImage(shop.image, shop.name)}</td>

//           <td>
//             <div class="table-actions">
//               <button
//                 class="btn btn-secondary"
//                 type="button"
//                 data-edit-shop="${shop.id}">
//                 Editar
//               </button>

//               <button
//                 class="btn btn-danger"
//                 type="button"
//                 data-delete-shop="${shop.id}">
//                 Eliminar
//               </button>
//             </div>
//           </td>
//         </tr>
//       `;
//     })
//     .join("");
// }

// export function bindShopTableActions() {
//   document.querySelectorAll("[data-edit-shop]").forEach((button) => {
//     button.onclick = () => {
//       const id = Number(button.dataset.editShop);

//       const shop = state.shops.find((item) => {
//         return Number(item.id) === id;
//       });

//       if (!shop) {
//         showToast("Shop no encontrado");
//         return;
//       }

//       openShopFormModal("edit", shop);
//     };
//   });

//   document.querySelectorAll("[data-delete-shop]").forEach((button) => {
//     button.onclick = () => {
//       const id = Number(button.dataset.deleteShop);

//       const shop = state.shops.find((item) => {
//         return Number(item.id) === id;
//       });

//       if (!shop) {
//         showToast("Shop no encontrado");
//         return;
//       }

//       openDeleteShopModal(shop);
//     };
//   });
// }

// export function bindShopCreateButton() {
//   const btnCreateShop = document.querySelector('[data-open-form="shop"]');

//   if (!btnCreateShop) {
//     console.warn("Botón Crear Shop no encontrado");
//     return;
//   }

//   btnCreateShop.onclick = (event) => {
//     event.preventDefault();
//     event.stopPropagation();

//     localStorage.setItem("cj_admin_active_view", "shops");

//     openShopFormModal("create");
//   };
// }

// function openShopFormModal(mode, shop = {}) {
//   const isEdit = mode === "edit";

//   openEntityModal({
//     title: isEdit ? "Editar Shop" : "Crear Shop",
//     submitText: isEdit ? "Actualizar" : "Guardar",
//     mode,
//     entity: "shop",
//     itemId: shop.id || null,
//     html: `
//       <div class="form-field">
//         <label for="shopName">Nombre *</label>
//         <input
//           id="shopName"
//           name="name"
//           type="text"
//           required
//           value="${escapeAttr(shop.name || "")}"
//           placeholder="Ej: Ride and Slide"
//         >
//       </div>

//       <div class="form-field">
//         <label for="shopDescription">Descripción</label>
//         <textarea
//           id="shopDescription"
//           name="description"
//           rows="4"
//           placeholder="Descripción breve del shop">${escapeHtml(shop.description || "")}</textarea>
//       </div>

//       <div class="form-grid-2">
//         <div class="form-field">
//           <label for="shopCountry">País</label>
//           <input
//             id="shopCountry"
//             name="country"
//             type="text"
//             value="${escapeAttr(shop.country || "Costa Rica")}"
//           >
//         </div>

//         <div class="form-field">
//           <label for="shopCity">Ciudad/Zona *</label>
//           <input
//             id="shopCity"
//             name="city"
//             type="text"
//             required
//             value="${escapeAttr(shop.city || "")}"
//             placeholder="Ej: Heredia"
//           >
//         </div>
//       </div>

//       <div class="form-grid-2">
//         <div class="form-field">
//           <label for="shopCategory">Categoría</label>
//           <input
//             id="shopCategory"
//             name="category"
//             type="text"
//             value="${escapeAttr(shop.category || "Skateshop")}"
//             placeholder="Skateshop, Brand, Local shop"
//           >
//         </div>

//         <div class="form-field">
//           <label for="shopImage">Imagen Cloudinary URL</label>
//           <input
//             id="shopImage"
//             name="image"
//             type="url"
//             value="${escapeAttr(shop.image || "")}"
//             placeholder="https://res.cloudinary.com/..."
//           >
//         </div>
//       </div>

//       <div class="form-grid-2">
//         <div class="form-field">
//           <label for="shopWebsite">Website</label>
//           <input
//             id="shopWebsite"
//             name="website"
//             type="url"
//             value="${escapeAttr(shop.website || "")}"
//             placeholder="https://..."
//           >
//         </div>

//         <div class="form-field">
//           <label for="shopInstagram">Instagram</label>
//           <input
//             id="shopInstagram"
//             name="instagram"
//             type="url"
//             value="${escapeAttr(shop.instagram || "")}"
//             placeholder="https://instagram.com/..."
//           >
//         </div>
//       </div>

//       <div class="form-field">
//         <label for="shopAddress">Dirección</label>
//         <input
//           id="shopAddress"
//           name="address"
//           type="text"
//           value="${escapeAttr(shop.address || "")}"
//           placeholder="Dirección física o referencia"
//         >
//       </div>

//       <div class="form-grid-2">
//         <div class="form-field">
//           <label for="shopLat">Latitud</label>
//           <input
//             id="shopLat"
//             name="lat"
//             type="number"
//             step="any"
//             value="${shop.lat ?? 0}"
//           >
//         </div>

//         <div class="form-field">
//           <label for="shopLng">Longitud</label>
//           <input
//             id="shopLng"
//             name="lng"
//             type="number"
//             step="any"
//             value="${shop.lng ?? 0}"
//           >
//         </div>
//       </div>

//       <div class="form-grid-2">
//         <label class="form-check">
//           <input
//             id="shopVerified"
//             name="verified"
//             type="checkbox"
//             ${shop.verified ? "checked" : ""}
//           >
//           <span>Shop verificado</span>
//         </label>

//         <label class="form-check">
//           <input
//             id="shopPromo"
//             name="promo"
//             type="checkbox"
//             ${shop.promo ? "checked" : ""}
//           >
//           <span>Promoción activa</span>
//         </label>
//       </div>
//     `,
//   });
// }

// function openDeleteShopModal(shop) {
//   openEntityModal({
//     title: "Eliminar Shop",
//     submitText: "Eliminar",
//     mode: "delete",
//     entity: "shop",
//     itemId: shop.id,
//     html: `
//       <div class="danger-zone">
//         <h3>¿Eliminar este shop?</h3>
//         <p>
//           Vas a eliminar <strong>${escapeHtml(shop.name || "este shop")}</strong>.
//           Esta acción no se puede deshacer.
//         </p>
//       </div>
//     `,
//   });
// }

// function renderShopsOnly() {
//   renderDashboard();
//   renderShopsTable();
//   bindShopTableActions();
// }

// function getShopPayloadFromForm() {
//   return {
//     name: getValue("shopName"),
//     description: getValue("shopDescription"),
//     country: getValue("shopCountry") || "Costa Rica",
//     city: getValue("shopCity"),
//     category: getValue("shopCategory") || "Skateshop",
//     website: getValue("shopWebsite"),
//     instagram: getValue("shopInstagram"),
//     address: getValue("shopAddress"),
//     lat: getNumberValue("shopLat"),
//     lng: getNumberValue("shopLng"),
//     image: getValue("shopImage"),
//     verified: getChecked("shopVerified"),
//     promo: getChecked("shopPromo"),
//   };
// }

// async function handleCreateShop() {
//   try {
//     const payload = getShopPayloadFromForm();

//     if (!payload.name || !payload.city) {
//       showToast("Nombre y ciudad son obligatorios");
//       return;
//     }

//     const createdShop = await createShop(payload);

//     state.shops = [
//       createdShop,
//       ...state.shops,
//     ];

//     closeEntityModal();
//     renderShopsOnly();

//     showToast("Shop creado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error creando shop");
//   }
// }

// async function handleUpdateShop() {
//   try {
//     const id = Number(state.modalItemId);
//     const payload = getShopPayloadFromForm();

//     if (!id) {
//       showToast("ID inválido");
//       return;
//     }

//     if (!payload.name || !payload.city) {
//       showToast("Nombre y ciudad son obligatorios");
//       return;
//     }

//     const updatedShop = await updateShop(id, payload);

//     state.shops = state.shops.map((shop) => {
//       return Number(shop.id) === id ? updatedShop : shop;
//     });

//     closeEntityModal();
//     renderShopsOnly();

//     showToast("Shop actualizado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error actualizando shop");
//   }
// }

// async function handleDeleteShop() {
//   try {
//     const id = Number(state.modalItemId);

//     if (!id) {
//       showToast("ID inválido");
//       return;
//     }

//     await deleteShop(id);

//     state.shops = state.shops.filter((shop) => {
//       return Number(shop.id) !== id;
//     });

//     closeEntityModal();
//     renderShopsOnly();

//     showToast("Shop eliminado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error eliminando shop");
//   }
// }

// export async function handleShopSubmit() {
//   if (state.modalMode === "create") {
//     await handleCreateShop();
//     return;
//   }

//   if (state.modalMode === "edit") {
//     await handleUpdateShop();
//     return;
//   }

//   if (state.modalMode === "delete") {
//     await handleDeleteShop();
//     return;
//   }

//   showToast("Acción de Shop no configurada");
// }

// export function bindSpotCreateButton() {
//   const btnCreateSpot = document.querySelector('[data-open-form="spot"]');

//   if (!btnCreateSpot) {
//     console.warn("Botón Crear Spot no encontrado");
//     return;
//   }

//   btnCreateSpot.onclick = (event) => {
//     event.preventDefault();
//     event.stopPropagation();

//     localStorage.setItem("cj_admin_active_view", "spots");

//     openSpotFormModal("create");
//   };
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

  table.innerHTML = state.spots
    .map((spot) => {
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

          <td>
            <div class="table-actions">
              <button
                class="btn btn-secondary"
                type="button"
                data-edit-spot="${spot.id}">
                Editar
              </button>

              <button
                class="btn btn-danger"
                type="button"
                data-delete-spot="${spot.id}">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

export function bindSpotTableActions() {
  document.querySelectorAll("[data-edit-spot]").forEach((button) => {
    button.onclick = () => {
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
    button.onclick = () => {
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

  btnCreateSpot.onclick = () => {
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
          placeholder="Describe el spot">${escapeHtml(spot.description || "")}</textarea>
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