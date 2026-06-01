import {
  getSpots,
  createSpot,
  updateSpot,
  deleteSpot,
} from "./api/spots.api.js";

import {
  getShops,
  createShop,
  updateShop,
  deleteShop,
} from "./api/shops.api.js";

import {
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from "./api/sponsors.api.js";

import { getEvents } from "./api/events.api.js";

import { state } from "./state/state.js";

import {
  initNavigation,
  restoreActiveView,
  showView,
} from "./services/navigation.service.js";

import {
  initModalService,
  openEntityModal,
  closeEntityModal,
} from "./services/modal.service.js";

import { showToast } from "./services/toast.service.js";

import {
  getValue,
  getNumberValue,
  getChecked,
} from "./utils/form.js";

import {
  escapeHtml,
  escapeAttr,
} from "./utils/sanitize.js";

import {
  formatDate,
  formatDateTimeLocal,
} from "./utils/format.js";

import {
  setText,
  renderImage,
} from "./utils/dom.js";


document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
  initNavigation();
  bindRefresh();

  initModalService({
    onSubmit: handleEntitySubmit,
  });

  await loadAllData();

  renderAll();

  restoreActiveView();
}


/* =========================
   LOAD DATA
========================= */
async function loadAllData() {
  try {
    const [spots, events, shops, sponsors] = await Promise.all([
      getSpots(),
      getEvents(),
      getShops(),
      getSponsors(),
    ]);

    state.spots = spots;
    state.events = events;
    state.shops = shops;
    state.sponsors = sponsors;
  } catch (error) {
    console.error("Error loading admin data:", error);
    showToast(error.message || "Error cargando datos desde la API");
  }
}

async function reloadAdmin() {
  await loadAllData();
  renderAll();
}

/* =========================
   NAVIGATION
========================= */
function bindRefresh() {
  const btnRefresh = document.getElementById("btnRefresh");

  if (!btnRefresh) return;

  btnRefresh.addEventListener("click", async () => {
    btnRefresh.disabled = true;
    btnRefresh.textContent = "Loading...";

    await reloadAdmin();

    btnRefresh.disabled = false;
    btnRefresh.textContent = "Refresh";

    showToast("Datos actualizados");
  });
}

/* =========================
   RENDER ALL
========================= */

function renderAll() {
  renderDashboard();
  renderSpotsTable();
  renderEventsTable();
  renderShopsTable();
  renderSponsorsTable();

  bindCreateButtons();
  bindSpotTableActions();
  bindShopTableActions();
  bindSponsorTableActions();
  bindEventTableActions();
}

/* =========================
   DASHBOARD
========================= */

function renderDashboard() {
  setText("kpiSpots", state.spots.length);
  setText("kpiEvents", state.events.length);
  setText("kpiShops", state.shops.length);
  setText("kpiSponsors", state.sponsors.length);
}

/* =========================
   SPOTS TABLE
========================= */

function renderSpotsTable() {
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

function bindSpotTableActions() {
  document.querySelectorAll("[data-edit-spot]").forEach((button) => {
    button.onclick = () => {
      const id = Number(button.dataset.editSpot);
      const spot = state.spots.find((item) => Number(item.id) === id);

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
      const spot = state.spots.find((item) => Number(item.id) === id);

      if (!spot) {
        showToast("Spot no encontrado");
        return;
      }

      openDeleteSpotModal(spot);
    };
  });
}

function bindShopTableActions() {
  document.querySelectorAll("[data-edit-shop]").forEach((button) => {
    button.onclick = () => {
      const id = Number(button.dataset.editShop);

      const shop = state.shops.find((item) => Number(item.id) === id);

      if (!shop) {
        showToast("Shop no encontrado");
        return;
      }

      openShopFormModal("edit", shop);
    };
  });

  document.querySelectorAll("[data-delete-shop]").forEach((button) => {
    button.onclick = () => {
      const id = Number(button.dataset.deleteShop);

      const shop = state.shops.find((item) => Number(item.id) === id);

      if (!shop) {
        showToast("Shop no encontrado");
        return;
      }

      openDeleteShopModal(shop);
    };
  });
}

function bindSponsorTableActions() {
  document.querySelectorAll("[data-edit-sponsor]").forEach((button) => {
    button.onclick = () => {
      const id = Number(button.dataset.editSponsor);

      const sponsor = state.sponsors.find((item) => Number(item.id) === id);

      if (!sponsor) {
        showToast("Sponsor no encontrado");
        return;
      }

      openSponsorFormModal("edit", sponsor);
    };
  });

  document.querySelectorAll("[data-delete-sponsor]").forEach((button) => {
    button.onclick = () => {
      const id = Number(button.dataset.deleteSponsor);

      const sponsor = state.sponsors.find((item) => Number(item.id) === id);

      if (!sponsor) {
        showToast("Sponsor no encontrado");
        return;
      }

      openDeleteSponsorModal(sponsor);
    };
  });
}

function bindEventTableActions() {
  document.querySelectorAll("[data-edit-event]").forEach((button) => {
    button.onclick = () => {
      const id = Number(button.dataset.editEvent);

      const event = state.events.find((item) => Number(item.id) === id);

      if (!event) {
        showToast("Evento no encontrado");
        return;
      }

      openEventFormModal("edit", event);
    };
  });

  document.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.onclick = () => {
      const id = Number(button.dataset.deleteEvent);

      const event = state.events.find((item) => Number(item.id) === id);

      if (!event) {
        showToast("Evento no encontrado");
        return;
      }

      openDeleteEventModal(event);
    };
  });
}

/* =========================
   EVENTS TABLE READ ONLY
========================= */

function renderEventsTable() {
  const table = document.getElementById("eventsTable");

  if (!table) return;

  if (!state.events.length) {
    table.innerHTML = `
      <tr>
        <td colspan="5">No hay eventos registrados.</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = state.events
    .map((event) => {
      return `
        <tr>
          <td>
            <strong>${escapeHtml(event.title || "—")}</strong>
          </td>

          <td>${escapeHtml(event.location || "—")}</td>

          <td>${formatDate(event.date)}</td>

          <td>${renderImage(event.image, event.title)}</td>

          <td>
            <div class="table-actions">
              <button
                class="btn btn-secondary"
                type="button"
                data-edit-event="${event.id}">
                Editar
              </button>

              <button
                class="btn btn-danger"
                type="button"
                data-delete-event="${event.id}">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* =========================
   SHOPS TABLE READ ONLY
========================= */
function renderShopsTable() {
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

/* =========================
   SPONSORS TABLE READ ONLY
========================= */
function renderSponsorsTable() {
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
            ${sponsor.active === false ? `<span class="badge">Inactive</span>` : `<span class="badge">Active</span>`}
          </td>

          <td>${renderImage(sponsor.logo, sponsor.name)}</td>

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

/* =========================
   CREATE BUTTONS
========================= */

function bindCreateButtons() {
  const btnCreateSpot = document.querySelector('[data-open-form="spot"]');

  if (btnCreateSpot) {
    btnCreateSpot.onclick = () => {
      localStorage.setItem("cj_admin_active_view", "spots");
      openSpotFormModal("create");
    };
  }

  const btnCreateShop = document.querySelector('[data-open-form="shop"]');

  if (btnCreateShop) {
    btnCreateShop.onclick = () => {
      localStorage.setItem("cj_admin_active_view", "shops");
      openShopFormModal("create");
    };
  }

  const btnCreateSponsor = document.querySelector('[data-open-form="sponsor"]');

  if (btnCreateSponsor) {
    btnCreateSponsor.onclick = () => {
      localStorage.setItem("cj_admin_active_view", "sponsors");
      openSponsorFormModal("create");
    };
  }

}

/* =========================
   MODAL BASE
========================= */

async function handleEntitySubmit() {
  if (state.modalEntity === "spot" && state.modalMode === "create") {
    await handleCreateSpot();
    return;
  }

  if (state.modalEntity === "spot" && state.modalMode === "edit") {
    await handleUpdateSpot();
    return;
  }

  if (state.modalEntity === "spot" && state.modalMode === "delete") {
    await handleDeleteSpot();
    return;
  }

  if (state.modalEntity === "shop" && state.modalMode === "create") {
    await handleCreateShop();
    return;
  }

  if (state.modalEntity === "shop" && state.modalMode === "edit") {
    await handleUpdateShop();
    return;
  }

  if (state.modalEntity === "shop" && state.modalMode === "delete") {
    await handleDeleteShop();
    return;
  }

  if (state.modalEntity === "sponsor" && state.modalMode === "create") {
    await handleCreateSponsor();
    return;
  }

  if (state.modalEntity === "sponsor" && state.modalMode === "edit") {
    await handleUpdateSponsor();
    return;
  }

  if (state.modalEntity === "sponsor" && state.modalMode === "delete") {
    await handleDeleteSponsor();
    return;
  }

  // if (state.modalEntity === "event" && state.modalMode === "create") {
  //   await handleCreateEvent();
  //   return;
  // }

  // if (state.modalEntity === "event" && state.modalMode === "edit") {
  //   await handleUpdateEvent();
  //   return;
  // }

  // if (state.modalEntity === "event" && state.modalMode === "delete") {
  //   await handleDeleteEvent();
  //   return;
  // }

  showToast("Acción no configurada");
}

/* =========================
   SPOT MODALS
========================= */

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

/* =========================
   SHOP MODALS
========================= */

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

/* =========================
   SPONSOR MODALS
========================= */

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

/* =========================
   SPOT CRUD HANDLERS
========================= */
async function reloadSpotsOnly() {
  try {
    state.spots = await getSpots();

    renderDashboard();
    renderSpotsTable();
    bindSpotTableActions();
  } catch (error) {
    console.error("Error reloading spots:", error);
    showToast(error.message || "Error actualizando spots");
  }
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
    //renderSpotsOnly();

    showToast("Spot eliminado correctamente");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Error eliminando spot");
  }
}

/* =========================
   EVENT MODALS
========================= */

function openEventFormModal(mode, eventItem = {}) {
  const isEdit = mode === "edit";

  openEntityModal({
    title: isEdit ? "Editar Evento" : "Crear Evento",
    submitText: isEdit ? "Actualizar" : "Guardar",
    mode,
    entity: "event",
    itemId: eventItem.id || null,
    html: `
      <div class="form-field">
        <label for="eventTitle">Título *</label>
        <input
          id="eventTitle"
          name="title"
          type="text"
          required
          value="${escapeAttr(eventItem.title || "")}"
          placeholder="Ej: Best Trick Sabana"
        >
      </div>

      <div class="form-field">
        <label for="eventDescription">Descripción</label>
        <textarea
          id="eventDescription"
          name="description"
          rows="4"
          placeholder="Descripción del evento">${escapeHtml(eventItem.description || "")}</textarea>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="eventLocation">Ubicación *</label>
          <input
            id="eventLocation"
            name="location"
            type="text"
            required
            value="${escapeAttr(eventItem.location || "")}"
            placeholder="Ej: La Sabana, San José"
          >
        </div>

        <div class="form-field">
          <label for="eventCountry">País</label>
          <input
            id="eventCountry"
            name="country"
            type="text"
            value="${escapeAttr(eventItem.country || "Costa Rica")}"
          >
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label for="eventDate">Fecha y hora *</label>
          <input
            id="eventDate"
            name="date"
            type="datetime-local"
            required
            value="${formatDateTimeLocal(eventItem.date)}"
          >
        </div>

        <div class="form-field">
          <label for="eventImage">Imagen Cloudinary URL</label>
          <input
            id="eventImage"
            name="image"
            type="url"
            value="${escapeAttr(eventItem.image || "")}"
            placeholder="https://res.cloudinary.com/..."
          >
        </div>
      </div>
    `,
  });
}

function openDeleteEventModal(eventItem) {
  openEntityModal({
    title: "Eliminar Evento",
    submitText: "Eliminar",
    mode: "delete",
    entity: "event",
    itemId: eventItem.id,
    html: `
      <div class="danger-zone">
        <h3>¿Eliminar este evento?</h3>
        <p>
          Vas a eliminar <strong>${escapeHtml(eventItem.title || "este evento")}</strong>.
          Esta acción no se puede deshacer.
        </p>
      </div>
    `,
  });
}

/* =========================
   SHOP CRUD HANDLERS
========================= */

function renderShopsOnly() {
  renderDashboard();
  renderShopsTable();
  bindShopTableActions();
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

/* =========================
   SPONSOR CRUD HANDLERS
========================= */

function renderSponsorsOnly() {
  renderDashboard();
  renderSponsorsTable();
  bindSponsorTableActions();
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

/* =========================
   HELPERS
========================= */

