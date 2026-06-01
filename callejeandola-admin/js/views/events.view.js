import { getEvents } from "../api/events.api.js";

export async function loadEventsView() {
  const table = document.getElementById("eventsTable");

  if (!table) return;

  try {
    const events = await getEvents();

    table.innerHTML = "";

    events.forEach((event) => {
      const date = event.date ? new Date(event.date).toLocaleDateString() : "-";

      table.innerHTML += `
        <tr>
          <td>${event.title ?? ""}</td>
          <td>${event.location ?? ""}</td>
          <td>${date}</td>
          <td>
            ${event.image
          ? `<img src="${event.image}" width="70" alt="${event.title ?? "Event"}">`
          : "-"
        }
          </td>
          <td>
            <button class="btn btn-secondary" type="button" data-edit-event="${event.id}">
              Editar
            </button>
            <button class="btn btn-danger" type="button" data-delete-event="${event.id}">
              Eliminar
            </button>
          </td>
        </tr>
        `;
    });
    } catch (error) {
    console.error("Error loading events:", error);
  }
}
