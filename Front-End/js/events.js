import { getEvents } from "./api.js";

let allEvents = [];

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function renderEvents(events) {
  const container = document.getElementById("eventsList");
  const count = document.getElementById("eventsCount");

  if (!container || !count) return;

  count.textContent = `Mostrando ${events.length} evento${events.length !== 1 ? "s" : ""}`;

  if (!events.length) {
    container.innerHTML = `
      <article class="list-item">
        <div class="list-body">
          <div class="list-title">No se encontraron eventos</div>
          <p class="list-desc">Prueba otro filtro o crea eventos desde la API.</p>
        </div>
      </article>
    `;
    return;
  }

  container.innerHTML = events.map((event) => `
    <article class="list-item">
      <img class="list-thumb" src="../images/homepage/events.webp" alt="${event.title}" />

      <div class="list-body">
        <div class="list-title">${event.title}</div>

        <div class="detail-chips">
          <span class="chip">
            <i class="fa-solid fa-location-dot"></i> ${event.location || "Sin ubicación"}
          </span>
          <span class="chip">
            <i class="fa-solid fa-calendar-days"></i> ${formatDate(event.date)}
          </span>
          <span class="chip">
            <i class="fa-solid fa-trophy"></i> Evento
          </span>
          <span class="chip chip-status status-active">
            <i class="fa-solid fa-circle-check"></i> Próximo
          </span>
        </div>

        <p class="list-desc">
          ${event.description || "Sin descripción."}
        </p>

        <div class="detail-actions">
          <a class="btn-primary" href="../pages/evento-detalle.html?id=${event.id}">
            <i class="fa-solid fa-eye"></i> Ver detalles
          </a>
          <a class="btn-secondary" href="../pages/contacto.html">
            <i class="fa-solid fa-flag"></i> Reportar cambio
          </a>
        </div>
      </div>
    </article>
  `).join("");
}

function applyEventFilters() {
  const cityValue = document.getElementById("eventSearchCity")?.value.trim().toLowerCase() || "";

  const filtered = allEvents.filter((event) => {
    const location = String(event.location || "").toLowerCase();
    const country = String(event.country || "").toLowerCase();

    return (
      !cityValue ||
      location.includes(cityValue) ||
      country.includes(cityValue)
    );
  });

  renderEvents(filtered);
}

async function loadEvents() {
  const container = document.getElementById("eventsList");

  try {
    allEvents = await getEvents();
    renderEvents(allEvents);

    document.getElementById("eventSearchBtn")?.addEventListener("click", applyEventFilters);
    document.getElementById("eventSearchCity")?.addEventListener("input", applyEventFilters);
  } catch (error) {
    console.error("Error loading events:", error);

    if (container) {
      container.innerHTML = `
        <article class="list-item">
          <div class="list-body">
            <div class="list-title">Error cargando eventos</div>
            <p class="list-desc">Revisa que el backend esté corriendo en http://localhost:4000</p>
          </div>
        </article>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", loadEvents);