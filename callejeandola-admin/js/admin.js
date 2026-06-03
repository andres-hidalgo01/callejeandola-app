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

import {
  renderEventsTable,
  bindEventCreateButton,
  bindEventTableActions,
  handleEventSubmit,
} from "./views/events.view.js";

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