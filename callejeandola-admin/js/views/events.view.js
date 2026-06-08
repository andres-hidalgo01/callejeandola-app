import { state } from "../state/state.js";

import {
  createEvent,
  updateEvent,
  deleteEvent,
} from "../api/events.api.js";

import {
  openEntityModal,
  closeEntityModal,
} from "../services/modal.service.js";

import { showToast } from "../services/toast.service.js";
import { showView } from "../services/navigation.service.js";

import { getValue } from "../utils/form.js";

import {
  escapeHtml,
  escapeAttr,
} from "../utils/sanitize.js";

import {
  formatDate,
  formatDateTimeLocal,
} from "../utils/format.js";

import { renderImage } from "../utils/dom.js";
import { renderDashboard } from "./dashboard.view.js";

import { canManageEntity } from "../services/permissions.service.js";

// export function renderEventsTable() {
//   const table = document.getElementById("eventsTable");

//   if (!table) return;

//   if (!state.events.length) {
//     table.innerHTML = `
//       <tr>
//         <td colspan="5">No hay eventos registrados.</td>
//       </tr>
//     `;
//     return;
//   }

//   table.innerHTML = state.events
//     .map((eventItem) => {
//       return `
//         <tr>
//           <td>
//             <strong>${escapeHtml(eventItem.title || "—")}</strong>
//           </td>

//           <td>${escapeHtml(eventItem.location || "—")}</td>

//           <td>${formatDate(eventItem.date)}</td>

//           <td>${renderImage(eventItem.image, eventItem.title)}</td>

//           <td>
//             <div class="table-actions">
//               <button
//                 class="btn btn-secondary"
//                 type="button"
//                 data-edit-event="${eventItem.id}">
//                 Editar
//               </button>

//               <button
//                 class="btn btn-danger"
//                 type="button"
//                 data-delete-event="${eventItem.id}">
//                 Eliminar
//               </button>
//             </div>
//           </td>
//         </tr>
//       `;
//     })
//     .join("");
// }

export function renderEventsTable() {
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

  const canUpdate = canManageEntity("events", "update");
  const canDelete = canManageEntity("events", "delete");
  const hasActions = canUpdate || canDelete;

  table.innerHTML = state.events
    .map((eventItem) => {
      const actionsHtml = hasActions
        ? `
          <div class="table-actions">
            ${canUpdate
          ? `
                  <button
                    class="btn btn-secondary"
                    type="button"
                    data-edit-event="${eventItem.id}">
                    Editar
                  </button>
                `
          : ""
        }

            ${canDelete
          ? `
                  <button
                    class="btn btn-danger"
                    type="button"
                    data-delete-event="${eventItem.id}">
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
            <strong>${escapeHtml(eventItem.title || "—")}</strong>
          </td>

          <td>${escapeHtml(eventItem.location || "—")}</td>

          <td>${formatDate(eventItem.date)}</td>

          <td>${renderImage(eventItem.image, eventItem.title)}</td>

          <td>${actionsHtml}</td>
        </tr>
      `;
    })
    .join("");
}

export function bindEventTableActions() {
  document.querySelectorAll("[data-edit-event]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const id = Number(button.dataset.editEvent);

      const eventItem = state.events.find((item) => {
        return Number(item.id) === id;
      });

      if (!eventItem) {
        showToast("Evento no encontrado");
        return;
      }

      openEventFormModal("edit", eventItem);
    };
  });

  document.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const id = Number(button.dataset.deleteEvent);

      const eventItem = state.events.find((item) => {
        return Number(item.id) === id;
      });

      if (!eventItem) {
        showToast("Evento no encontrado");
        return;
      }

      openDeleteEventModal(eventItem);
    };
  });
}

// export function bindEventCreateButton() {
//   const btnCreateEvent = document.querySelector('[data-open-form="event"]');

//   if (!btnCreateEvent) {
//     console.warn("Botón Crear Evento no encontrado");
//     return;
//   }

//   btnCreateEvent.onclick = (event) => {
//     event.preventDefault();
//     event.stopPropagation();

//     localStorage.setItem("cj_admin_active_view", "events");

//     openEventFormModal("create");
//   };
// }

export function bindEventCreateButton() {
  const btnCreateEvent = document.querySelector('[data-open-form="event"]');

  if (!btnCreateEvent) return;

  const canCreate = canManageEntity("events", "create");

  btnCreateEvent.hidden = !canCreate;
  btnCreateEvent.disabled = !canCreate;

  btnCreateEvent.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canManageEntity("events", "create")) {
      showToast("No tenés permisos para crear eventos");
      return;
    }

    localStorage.setItem("cj_admin_active_view", "events");

    openEventFormModal("create");
  };
}

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

function renderEventsOnly() {
  renderDashboard();
  renderEventsTable();
  bindEventTableActions();
  showView("events");
}

function getEventPayloadFromForm() {
  const rawDate = getValue("eventDate");

  return {
    title: getValue("eventTitle"),
    description: getValue("eventDescription"),
    date: rawDate ? new Date(rawDate).toISOString() : "",
    location: getValue("eventLocation"),
    country: getValue("eventCountry") || "Costa Rica",
    image: getValue("eventImage"),
  };
}

async function handleCreateEvent() {
  try {
    const payload = getEventPayloadFromForm();

    if (!payload.title || !payload.location || !payload.date) {
      showToast("Título, ubicación y fecha son obligatorios");
      return;
    }

    const createdEvent = await createEvent(payload);

    state.events = [
      createdEvent,
      ...state.events,
    ];

    closeEntityModal();
    renderEventsOnly();

    showToast("Evento creado correctamente");
  } catch (error) {
    console.error("Error creando evento:", error);
    showToast(error.message || "Error creando evento");
  }
}

async function handleUpdateEvent() {
  try {
    const id = Number(state.modalItemId);
    const payload = getEventPayloadFromForm();

    if (!id) {
      showToast("ID inválido");
      return;
    }

    if (!payload.title || !payload.location || !payload.date) {
      showToast("Título, ubicación y fecha son obligatorios");
      return;
    }

    const updatedEvent = await updateEvent(id, payload);

    state.events = state.events.map((eventItem) => {
      return Number(eventItem.id) === id ? updatedEvent : eventItem;
    });

    closeEntityModal();
    renderEventsOnly();

    showToast("Evento actualizado correctamente");
  } catch (error) {
    console.error("Error actualizando evento:", error);
    showToast(error.message || "Error actualizando evento");
  }
}

async function handleDeleteEvent() {
  try {
    const id = Number(state.modalItemId);

    if (!id) {
      showToast("ID inválido");
      return;
    }

    await deleteEvent(id);

    state.events = state.events.filter((eventItem) => {
      return Number(eventItem.id) !== id;
    });

    closeEntityModal();
    renderEventsOnly();

    showToast("Evento eliminado correctamente");
  } catch (error) {
    console.error("Error eliminando evento:", error);
    showToast(error.message || "Error eliminando evento");
  }
}

export async function handleEventSubmit() {
  if (state.modalMode === "create") {
    await handleCreateEvent();
    return;
  }

  if (state.modalMode === "edit") {
    await handleUpdateEvent();
    return;
  }

  if (state.modalMode === "delete") {
    await handleDeleteEvent();
    return;
  }

  showToast("Acción de Evento no configurada");
}