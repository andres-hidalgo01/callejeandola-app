import { state } from "../state/state.js";

import {
  createShop,
  updateShop,
  deleteShop,
} from "../api/shops.api.js";

import {
  openEntityModal,
  closeEntityModal,
} from "../services/modal.service.js";

import { showToast } from "../services/toast.service.js";
import { showView } from "../services/navigation.service.js";

import {
  getValue,
  getNumberValue,
  getChecked,
} from "../utils/form.js";

import {
  escapeHtml,
  escapeAttr,
} from "../utils/sanitize.js";

import { renderImage } from "../utils/dom.js";
import { renderDashboard } from "./dashboard.view.js";

import { canManageEntity } from "../services/permissions.service.js";

export function renderShopsTable() {
  const table = document.getElementById("shopsTable");

  if (!table) return;

  if (!state.shops.length) {
    table.innerHTML = `
      <tr>
        <td colspan="5">No hay shops registrados.</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = state.shops
    .map((shop) => {
      return `
        <tr>
          <td>
            <strong>${escapeHtml(shop.name || "—")}</strong>
            ${shop.verified ? `<span class="badge">Verified</span>` : ""}
            ${shop.promo ? `<span class="badge">Promo</span>` : ""}
          </td>

          <td>${escapeHtml(shop.city || "—")}</td>

          <td>
            <span class="badge">${escapeHtml(shop.category || "—")}</span>
          </td>

          <td>${renderImage(shop.image, shop.name)}</td>

          <td>
            <div class="table-actions">
              <button
                class="btn btn-secondary"
                type="button"
                data-edit-shop="${shop.id}">
                Editar
              </button>

              <button
                class="btn btn-danger"
                type="button"
                data-delete-shop="${shop.id}">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

export function bindShopTableActions() {
  document.querySelectorAll("[data-edit-shop]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const id = Number(button.dataset.editShop);

      const shop = state.shops.find((item) => {
        return Number(item.id) === id;
      });

      if (!shop) {
        showToast("Shop no encontrado");
        return;
      }

      openShopFormModal("edit", shop);
    };
  });

  document.querySelectorAll("[data-delete-shop]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const id = Number(button.dataset.deleteShop);

      const shop = state.shops.find((item) => {
        return Number(item.id) === id;
      });

      if (!shop) {
        showToast("Shop no encontrado");
        return;
      }

      openDeleteShopModal(shop);
    };
  });
}

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

export function bindShopCreateButton() {
  const btnCreateShop = document.querySelector('[data-open-form="shop"]');

  if (!btnCreateShop) return;

  const canCreate = canManageEntity("shops", "create");

  btnCreateShop.hidden = !canCreate;
  btnCreateShop.disabled = !canCreate;

  btnCreateShop.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canManageEntity("shops", "create")) {
      showToast("No tenés permisos para crear shops");
      return;
    }

    localStorage.setItem("cj_admin_active_view", "shops");

    openShopFormModal("create");
  };
}

function openShopFormModal(mode, shop = {}) {
  const isEdit = mode === "edit";

  openEntityModal({
    title: isEdit ? "Editar Shop" : "Crear Shop",
    submitText: isEdit ? "Actualizar" : "Guardar",
    mode,
    entity: "shop",
    itemId: shop.id || null,
    html: `
      <div class="form-field">
        <label for="shopName">Nombre *</label>
        <input
          id="shopName"
          name="name"
          type="text"
          required
          value="${escapeAttr(shop.name || "")}"
          placeholder="Ej: Ride and Slide"
        >
      </div>

      <div class="form-field">
        <label for="shopDescription">Descripción</label>
        <textarea
          id="shopDescription"
          name="description"
          rows="4"
          placeholder="Descripción breve del shop">${escapeHtml(shop.description || "")}</textarea>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="shopCountry">País</label>
          <input
            id="shopCountry"
            name="country"
            type="text"
            value="${escapeAttr(shop.country || "Costa Rica")}"
          >
        </div>

        <div class="form-field">
          <label for="shopCity">Ciudad/Zona *</label>
          <input
            id="shopCity"
            name="city"
            type="text"
            required
            value="${escapeAttr(shop.city || "")}"
            placeholder="Ej: Heredia"
          >
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="shopCategory">Categoría</label>
          <input
            id="shopCategory"
            name="category"
            type="text"
            value="${escapeAttr(shop.category || "Skateshop")}"
            placeholder="Skateshop, Brand, Local shop"
          >
        </div>

        <div class="form-field">
          <label for="shopImage">Imagen Cloudinary URL</label>
          <input
            id="shopImage"
            name="image"
            type="url"
            value="${escapeAttr(shop.image || "")}"
            placeholder="https://res.cloudinary.com/..."
          >
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="shopWebsite">Website</label>
          <input
            id="shopWebsite"
            name="website"
            type="url"
            value="${escapeAttr(shop.website || "")}"
            placeholder="https://..."
          >
        </div>

        <div class="form-field">
          <label for="shopInstagram">Instagram</label>
          <input
            id="shopInstagram"
            name="instagram"
            type="url"
            value="${escapeAttr(shop.instagram || "")}"
            placeholder="https://instagram.com/..."
          >
        </div>
      </div>

      <div class="form-field">
        <label for="shopAddress">Dirección</label>
        <input
          id="shopAddress"
          name="address"
          type="text"
          value="${escapeAttr(shop.address || "")}"
          placeholder="Dirección física o referencia"
        >
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="shopLat">Latitud</label>
          <input
            id="shopLat"
            name="lat"
            type="number"
            step="any"
            value="${shop.lat ?? 0}"
          >
        </div>

        <div class="form-field">
          <label for="shopLng">Longitud</label>
          <input
            id="shopLng"
            name="lng"
            type="number"
            step="any"
            value="${shop.lng ?? 0}"
          >
        </div>
      </div>

      <div class="form-grid-2">
        <label class="form-check">
          <input
            id="shopVerified"
            name="verified"
            type="checkbox"
            ${shop.verified ? "checked" : ""}
          >
          <span>Shop verificado</span>
        </label>

        <label class="form-check">
          <input
            id="shopPromo"
            name="promo"
            type="checkbox"
            ${shop.promo ? "checked" : ""}
          >
          <span>Promoción activa</span>
        </label>
      </div>
    `,
  });
}

function openDeleteShopModal(shop) {
  openEntityModal({
    title: "Eliminar Shop",
    submitText: "Eliminar",
    mode: "delete",
    entity: "shop",
    itemId: shop.id,
    html: `
      <div class="danger-zone">
        <h3>¿Eliminar este shop?</h3>
        <p>
          Vas a eliminar <strong>${escapeHtml(shop.name || "este shop")}</strong>.
          Esta acción no se puede deshacer.
        </p>
      </div>
    `,
  });
}

function renderShopsOnly() {
  renderDashboard();
  renderShopsTable();
  bindShopTableActions();
  showView("shops");
}

function getShopPayloadFromForm() {
  return {
    name: getValue("shopName"),
    description: getValue("shopDescription"),
    country: getValue("shopCountry") || "Costa Rica",
    city: getValue("shopCity"),
    category: getValue("shopCategory") || "Skateshop",
    website: getValue("shopWebsite"),
    instagram: getValue("shopInstagram"),
    address: getValue("shopAddress"),
    lat: getNumberValue("shopLat"),
    lng: getNumberValue("shopLng"),
    image: getValue("shopImage"),
    verified: getChecked("shopVerified"),
    promo: getChecked("shopPromo"),
  };
}

async function handleCreateShop() {
  try {
    const payload = getShopPayloadFromForm();

    if (!payload.name || !payload.city) {
      showToast("Nombre y ciudad son obligatorios");
      return;
    }

    const createdShop = await createShop(payload);

    state.shops = [
      createdShop,
      ...state.shops,
    ];

    closeEntityModal();
    renderShopsOnly();

    showToast("Shop creado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error creando shop");
  }
}

async function handleUpdateShop() {
  try {
    const id = Number(state.modalItemId);
    const payload = getShopPayloadFromForm();

    if (!id) {
      showToast("ID inválido");
      return;
    }

    if (!payload.name || !payload.city) {
      showToast("Nombre y ciudad son obligatorios");
      return;
    }

    const updatedShop = await updateShop(id, payload);

    state.shops = state.shops.map((shop) => {
      return Number(shop.id) === id ? updatedShop : shop;
    });

    closeEntityModal();
    renderShopsOnly();

    showToast("Shop actualizado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error actualizando shop");
  }
}

async function handleDeleteShop() {
  try {
    const id = Number(state.modalItemId);

    if (!id) {
      showToast("ID inválido");
      return;
    }

    await deleteShop(id);

    state.shops = state.shops.filter((shop) => {
      return Number(shop.id) !== id;
    });

    closeEntityModal();
    renderShopsOnly();

    showToast("Shop eliminado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error eliminando shop");
  }
}

export async function handleShopSubmit() {
  if (state.modalMode === "create") {
    await handleCreateShop();
    return;
  }

  if (state.modalMode === "edit") {
    await handleUpdateShop();
    return;
  }

  if (state.modalMode === "delete") {
    await handleDeleteShop();
    return;
  }

  showToast("Acción de Shop no configurada");
}

