import { getSpots } from "./api/spots.api.js";
import { getShops } from "./api/shops.api.js";
import { getSponsors } from "./api/sponsors.api.js";
import { getEvents } from "./api/events.api.js";

import { state } from "./state/state.js";

import { initDebugService } from "./services/debug.service.js";

import {
  initNavigation,
  restoreActiveView,
} from "./services/navigation.service.js";

import { initModalService } from "./services/modal.service.js";
import { showToast } from "./services/toast.service.js";
import { renderDashboard } from "./views/dashboard.view.js";

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
  renderImage,
} from "./utils/dom.js";

import {
  renderEventsTable,
  bindEventCreateButton,
  bindEventTableActions,
  handleEventSubmit,
} from "./views/events.view.js";

import {
  renderSpotsTable,
  bindSpotTableActions,
  bindSpotCreateButton,
  handleSpotSubmit,
} from "./views/spots.view.js";


import {
  renderShopsTable,
  bindShopTableActions,
  bindShopCreateButton,
  handleShopSubmit,
} from "./views/shops.view.js";

import {
  renderSponsorsTable,
  bindSponsorTableActions,
  bindSponsorCreateButton,
  handleSponsorSubmit,
} from "./views/sponsors.view.js";


document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
  initDebugService?.();

  initNavigation();


  initModalService({
    onSubmit: handleEntitySubmit,
  });

  bindRefresh();

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
  renderShopsTable();
  renderSponsorsTable();
  renderEventsTable();

  bindSpotCreateButton();
  bindShopCreateButton();
  bindSponsorCreateButton();
  bindEventCreateButton();

  bindSpotTableActions();
  bindShopTableActions();
  bindSponsorTableActions();
  bindEventTableActions();
}

/* =========================
   CREATE BUTTONS
========================= */
// function bindCreateButtons() {
//   //
// }


/* =========================
   MODAL BASE
========================= */
async function handleEntitySubmit() {
  if (state.modalEntity === "spot") {
    await handleSpotSubmit();
    return;
  }

  if (state.modalEntity === "shop") {
    await handleShopSubmit();
    return;
  }

  if (state.modalEntity === "sponsor") {
    await handleSponsorSubmit();
    return;
  }

  if (state.modalEntity === "event") {
    await handleEventSubmit();
    return;
  }

  showToast("Acción no configurada");
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
