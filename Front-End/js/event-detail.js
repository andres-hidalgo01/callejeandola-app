import { getEventById } from "./api.js";

function getEventIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function safe(value, fallback = "No disponible") {
  return value ?? fallback;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function renderEventHero(event) {
  const heroTitle = document.getElementById("eventHeroTitle");
  const heroSubtitle = document.getElementById("eventHeroSubtitle");
  const heroChips = document.getElementById("eventHeroChips");

  if (heroTitle) heroTitle.textContent = safe(event.title, "EVENT DETAIL");
  if (heroSubtitle) heroSubtitle.textContent = safe(event.description, "Información del evento.");
  if (heroChips) {
    heroChips.innerHTML = `
      <span class="chip"><i class="fa-solid fa-location-dot"></i> ${safe(event.location, "Ubicación")}</span>
      <span class="chip"><i class="fa-solid fa-calendar-days"></i> ${formatDate(event.date)}</span>
      <span class="chip"><i class="fa-solid fa-medal"></i> Competencia</span>
      <span class="chip chip-status status-active"><i class="fa-solid fa-circle-check"></i> Próximo</span>
    `;
  }
}

function renderEventDetail(event) {
  const card = document.getElementById("eventDetailCard");
  if (!card) return;

  card.innerHTML = `
    <section class="detail-section">
      <h3>Resumen</h3>
      <p>${safe(event.description, "Sin descripción.")}</p>
    </section>

    <hr class="legal-divider" />

    <section class="detail-section">
      <h3>Info rápida</h3>
      <div class="detail-grid">
        <div class="detail-box">
          <div class="detail-box-icon"><i class="fa-solid fa-calendar-check"></i></div>
          <div>
            <strong>Fecha</strong>
            <p>${formatDate(event.date)}</p>
          </div>
        </div>

        <div class="detail-box">
          <div class="detail-box-icon"><i class="fa-solid fa-location-dot"></i></div>
          <div>
            <strong>Ubicación</strong>
            <p>${safe(event.location)}</p>
          </div>
        </div>

        <div class="detail-box">
          <div class="detail-box-icon"><i class="fa-solid fa-flag-checkered"></i></div>
          <div>
            <strong>Tipo</strong>
            <p>Competencia / Evento</p>
          </div>
        </div>

        <div class="detail-box">
          <div class="detail-box-icon"><i class="fa-solid fa-earth-americas"></i></div>
          <div>
            <strong>País</strong>
            <p>${safe(event.country)}</p>
          </div>
        </div>
      </div>
    </section>

    <hr class="legal-divider" />

    <section class="detail-section">
      <h3>Agenda</h3>
      <div class="agenda-list">
        <div class="agenda-item"><strong>1:00 PM</strong><span>Check-in y registro</span></div>
        <div class="agenda-item"><strong>2:00 PM</strong><span>Warm-up / práctica</span></div>
        <div class="agenda-item"><strong>3:00 PM</strong><span>Heat principal</span></div>
        <div class="agenda-item"><strong>5:00 PM</strong><span>Final / premiación</span></div>
      </div>
    </section>

    <hr class="legal-divider" />

    <section class="detail-section">
      <h3>Ubicación</h3>
      <p>Ciudad: <strong>${safe(event.location)}</strong></p>
      <p>País: <strong>${safe(event.country)}</strong></p>
      <p>Mapa: disponible pronto</p>
    </section>

    <div class="cta-bar" style="margin-top:24px;">
      <div class="cta-text">
        <strong>¿Quieres publicar o actualizar un evento?</strong><br />
        Envíanos la info por Contacto para mantener el calendario real.
      </div>
      <a class="cta-btn" href="../pages/contacto.html">Ir a Contacto</a>
    </div>
  `;
}

async function loadEventDetail() {
  const id = getEventIdFromUrl();
  const card = document.getElementById("eventDetailCard");

  if (!id) {
    if (card) card.innerHTML = "<p>No se proporcionó ID de evento.</p>";
    return;
  }

  try {
    const event = await getEventById(id);
    renderEventHero(event);
    renderEventDetail(event);
  } catch (error) {
    console.error("Error loading event detail:", error);
    if (card) card.innerHTML = "<p>Error cargando detalle del evento.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadEventDetail);