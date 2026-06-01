// import { initNavigation } from "./services/navigation.service.js";
// import { loadDashboard } from "./views/dashboard.view.js";
// import { loadSpotsView } from "./views/spots.view.js";
// import { loadEventsView } from "./views/events.view.js";
// import { loadShopsView } from "./views/shops.view.js";
// import { loadSponsorsView } from "./views/sponsors.view.js";

// async function loadAll() {
//     await loadDashboard();
//     await loadSpotsView();
//     await loadEventsView();
//     await loadShopsView();
//     await loadSponsorsView();
// }

// async function initAdmin() {
//     initNavigation();

//     await loadAll();

//     const btnRefresh = document.getElementById("btnRefresh");

//     if (btnRefresh) {
//         btnRefresh.addEventListener("click", async () => {
//             await loadAll();
//         });
//     }
// }

// initAdmin();


const API_BASE_URL = "http://localhost:4000/api";

const state = {
  spots: [],
  events: [],
  shops: [],
  sponsors: [],
  modalMode: null,
  modalEntity: null,
  modalItemId: null,
};

document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
  bindNavigation();
  bindRefresh();
  bindModalBaseActions();

  await loadAllData();
  renderAll();
  restoreActiveView();
}

/* =========================
   API BASE
========================= */

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    const message = result?.error || result?.message || `API Error ${response.status}`;
    throw new Error(message);
  }

  return result;
}

async function apiGet(endpoint) {
  const result = await apiRequest(endpoint);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;

  return [];
}

/* =========================
   API: SPOTS CRUD
========================= */

async function getSpots() {
  return apiGet("/spots");
}

async function createSpot(payload) {
  return apiRequest("/spots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateSpot(id, payload) {
  return apiRequest(`/spots/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function deleteSpot(id) {
  return apiRequest(`/spots/${id}`, {
    method: "DELETE",
  });
}

/* =========================
   LOAD DATA
========================= */

async function loadAllData() {
  try {
    const [spots, events, shops, sponsors] = await Promise.all([
      apiGet("/spots"),
      apiGet("/events"),
      apiGet("/shops"),
      apiGet("/sponsors"),
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

// function bindNavigation() {
//   const navButtons = document.querySelectorAll(".nav__item[data-view]");
//   const panels = document.querySelectorAll(".view[data-view-panel]");
//   const pageTitle = document.getElementById("pageTitle");

//   navButtons.forEach((button) => {
//     button.addEventListener("click", () => {
//       const target = button.dataset.view;

//       navButtons.forEach((btn) => btn.classList.remove("is-active"));
//       panels.forEach((panel) => panel.classList.remove("is-active"));

//       button.classList.add("is-active");

//       const panel = document.querySelector(`.view[data-view-panel="${target}"]`);
//       if (panel) panel.classList.add("is-active");

//       if (pageTitle) {
//         pageTitle.textContent = button.textContent.trim();
//       }
//     });
//   });
// }

function bindNavigation() {
  const navButtons = document.querySelectorAll(".nav__item[data-view]");
  const panels = document.querySelectorAll(".view[data-view-panel]");
  const pageTitle = document.getElementById("pageTitle");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.view;

      localStorage.setItem("cj_admin_active_view", target);

      navButtons.forEach((btn) => btn.classList.remove("is-active"));
      panels.forEach((panel) => panel.classList.remove("is-active"));

      button.classList.add("is-active");

      const panel = document.querySelector(`.view[data-view-panel="${target}"]`);

      if (panel) {
        panel.classList.add("is-active");
      }

      if (pageTitle) {
        pageTitle.textContent = button.textContent.trim();
      }
    });
  });
}




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
          <td>${escapeHtml(event.title || "—")}</td>
          <td>${escapeHtml(event.location || "—")}</td>
          <td>${formatDate(event.date)}</td>
          <td>${renderImage(event.image, event.title)}</td>
          <td>
            <span class="muted">Pendiente V1.1</span>
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
          <td>${escapeHtml(shop.name || "—")}</td>
          <td>${escapeHtml(shop.city || "—")}</td>
          <td>${escapeHtml(shop.category || "—")}</td>
          <td>${renderImage(shop.image, shop.name)}</td>
          <td>
            <span class="muted">Pendiente V1.1</span>
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
          <td>${escapeHtml(sponsor.name || "—")}</td>
          <td>${renderImage(sponsor.logo, sponsor.name)}</td>
          <td>
            ${sponsor.website
          ? `<a href="${escapeAttr(sponsor.website)}" target="_blank" rel="noopener">Website</a>`
          : "—"
        }
          </td>
          <td>
            <span class="muted">Pendiente V1.1</span>
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

  document.querySelector('[data-open-form="event"]')?.addEventListener("click", () => {
    showToast("CRUD Events entra después de validar Spots");
  });

  document.querySelector('[data-open-form="shop"]')?.addEventListener("click", () => {
    showToast("CRUD Shops entra después de validar Spots");
  });

  document.querySelector('[data-open-form="sponsor"]')?.addEventListener("click", () => {
    showToast("CRUD Sponsors entra después de validar Spots");
  });
}

/* =========================
   MODAL BASE
========================= */
function bindModalBaseActions() {
  const btnClose = document.getElementById("btnCloseModal");
  const btnCancel = document.getElementById("btnCancel");
  const btnSubmit = document.getElementById("btnSubmitEntity");
  const form = document.getElementById("entityForm");

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

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  });

  btnSubmit?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("CLICK GUARDAR", state.modalEntity, state.modalMode);
    await handleEntitySubmit();
  });
}

// async function handleEntitySubmit() {
//     if (state.modalEntity === "spot" && state.modalMode === "create") {
//         await handleCreateSpot();
//         return;
//     }

//     if (state.modalEntity === "spot" && state.modalMode === "edit") {
//         await handleUpdateSpot();
//         return;
//     }

//     if (state.modalEntity === "spot" && state.modalMode === "delete") {
//         await handleDeleteSpot();
//         return;
//     }
// }

async function handleEntitySubmit() {
  console.log("CLICK GUARDAR", state.modalEntity, state.modalMode);

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

  showToast("Acción no configurada");
}

function openEntityModal({ title, html, submitText = "Guardar", mode, entity, itemId = null }) {
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

function closeEntityModal() {
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

// async function handleCreateSpot() {
//   try {
//     const payload = getSpotPayloadFromForm();

//     if (!payload.name || !payload.city) {
//       showToast("Nombre y ciudad son obligatorios");
//       return;
//     }

//     await createSpot(payload);

//     closeEntityModal();

//     await reloadSpotsOnly();

//     // localStorage.setItem("cj_admin_active_view", "spots");
//     // restoreActiveView();

//     showToast("Spot creado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error creando spot");
//   }
// }

// async function handleUpdateSpot() {
//   try {
//     const id = state.modalItemId;
//     const payload = getSpotPayloadFromForm();

//     if (!id) {
//       showToast("ID inválido");
//       return;
//     }

//     if (!payload.name || !payload.city) {
//       showToast("Nombre y ciudad son obligatorios");
//       return;
//     }

//     await updateSpot(id, payload);

//     closeEntityModal();

//     await reloadSpotsOnly();

//     // localStorage.setItem("cj_admin_active_view", "spots");
//     // restoreActiveView();

//     showToast("Spot actualizado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error actualizando spot");
//   }
// }

// async function handleDeleteSpot() {
//   try {
//     const id = state.modalItemId;

//     if (!id) {
//       showToast("ID inválido");
//       return;
//     }

//     await deleteSpot(id);

//     closeEntityModal();
//     await reloadSpotsOnly();

//     // localStorage.setItem("cj_admin_active_view", "spots");
//     // restoreActiveView();

//     showToast("Spot eliminado correctamente");
//   } catch (error) {
//     console.error(error);
//     showToast(error.message || "Error eliminando spot");
//   }
// }

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
   HELPERS
========================= */

function getValue(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function getNumberValue(id) {
  const value = document.getElementById(id)?.value;

  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = String(value);
  }
}

function renderImage(src, alt) {
  if (!src) {
    return `<span class="muted">Sin imagen</span>`;
  }

  return `
    <img
      src="${escapeAttr(src)}"
      alt="${escapeAttr(alt || "Image")}"
      width="70"
      loading="lazy"
      onerror="this.remove();"
    >
  `;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-active");

  window.clearTimeout(showToast.timeout);

  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("is-active");
    toast.hidden = true;
  }, 2500);
}

function restoreActiveView() {
  const savedView = localStorage.getItem("cj_admin_active_view") || "dashboard";

  const navButtons = document.querySelectorAll(".nav__item[data-view]");
  const panels = document.querySelectorAll(".view[data-view-panel]");
  const pageTitle = document.getElementById("pageTitle");

  navButtons.forEach((btn) => btn.classList.remove("is-active"));
  panels.forEach((panel) => panel.classList.remove("is-active"));

  const activeButton = document.querySelector(`.nav__item[data-view="${savedView}"]`);
  const activePanel = document.querySelector(`.view[data-view-panel="${savedView}"]`);

  activeButton?.classList.add("is-active");
  activePanel?.classList.add("is-active");

  if (pageTitle && activeButton) {
    pageTitle.textContent = activeButton.textContent.trim();
  }
}

