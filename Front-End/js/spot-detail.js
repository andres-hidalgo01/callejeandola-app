import { getSpotById } from "./api.js";

function getSpotIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function safe(value, fallback = "No disponible") {
  return value ?? fallback;
}

function renderSpotHero(spot) {
  const heroTitle = document.getElementById("spotHeroTitle");
  const heroSubtitle = document.getElementById("spotHeroSubtitle");
  const heroChips = document.getElementById("spotHeroChips");

  if (heroTitle) heroTitle.textContent = safe(spot.name, "SPOT DETAIL");
  if (heroSubtitle) heroSubtitle.textContent = safe(spot.description, "Información del spot.");
  if (heroChips) {
    heroChips.innerHTML = `
      <span class="chip"><i class="fa-solid fa-road"></i> ${safe(spot.type, "Spot")}</span>
      <span class="chip"><i class="fa-solid fa-location-dot"></i> ${safe(spot.city, "Ciudad")}</span>
      <span class="chip chip-status status-active"><i class="fa-solid fa-circle-check"></i> Activo</span>
    `;
  }
}

function renderSpotDetail(spot) {
  const card = document.getElementById("spotDetailCard");
  if (!card) return;

  card.innerHTML = `
    <section class="detail-section">
      <h3>Resumen</h3>
      <p>${safe(spot.description, "Sin descripción.")}</p>
    </section>

    <hr class="legal-divider" />

    <section class="detail-section">
      <h3>Info rápida</h3>
      <div class="detail-grid">
        <div class="detail-box">
          <div class="detail-box-icon"><i class="fa-solid fa-map-location-dot"></i></div>
          <div>
            <strong>País</strong>
            <p>${safe(spot.country)}</p>
          </div>
        </div>

        <div class="detail-box">
          <div class="detail-box-icon"><i class="fa-solid fa-city"></i></div>
          <div>
            <strong>Ciudad</strong>
            <p>${safe(spot.city)}</p>
          </div>
        </div>

        <div class="detail-box">
          <div class="detail-box-icon"><i class="fa-solid fa-layer-group"></i></div>
          <div>
            <strong>Tipo</strong>
            <p>${safe(spot.type)}</p>
          </div>
        </div>

        <div class="detail-box">
          <div class="detail-box-icon"><i class="fa-solid fa-compass"></i></div>
          <div>
            <strong>Coordenadas</strong>
            <p>${safe(spot.lat, "-")}, ${safe(spot.lng, "-")}</p>
          </div>
        </div>
      </div>
    </section>

    <hr class="legal-divider" />

    <section class="detail-section">
      <h3>Fotos</h3>
      <div class="detail-photo-grid">
        <img src="../images/homepage/about.webp" alt="${safe(spot.name)}">
        <img src="../images/homepage/about.webp" alt="${safe(spot.name)}">
        <img src="../images/homepage/about.webp" alt="${safe(spot.name)}">
      </div>
      <p class="detail-note">Tip: cuando tengas fotos reales, esta sección hace que la página se sienta más completa.</p>
    </section>

    <hr class="legal-divider" />

    <section class="detail-section">
      <h3>Estado y actualización</h3>
      <div class="detail-grid">
        <div class="detail-box">
          <strong>Estado actual</strong>
          <p><span class="chip chip-status status-active"><i class="fa-solid fa-circle-check"></i> Activo</span></p>
        </div>

        <div class="detail-box">
          <strong>Última actualización</strong>
          <p>Catálogo vivo</p>
        </div>

        <div class="detail-box">
          <strong>¿Cambió algo?</strong>
          <p>Repórtalo para mantener la info real.</p>
        </div>
      </div>
    </section>

    <div class="cta-bar" style="margin-top:24px;">
      <div class="cta-text">
        <strong>¿Este spot cambió o ya no existe?</strong><br />
        Usa el formulario y selecciona “Reportar cambio de spot”.
      </div>
      <a class="cta-btn" href="../pages/contacto.html">Ir a Contacto</a>
    </div>
  `;
}

async function loadSpotDetail() {
  const id = getSpotIdFromUrl();
  const card = document.getElementById("spotDetailCard");

  if (!id) {
    if (card) card.innerHTML = "<p>No se proporcionó ID de spot.</p>";
    return;
  }

  try {
    const spot = await getSpotById(id);
    renderSpotHero(spot);
    renderSpotDetail(spot);
  } catch (error) {
    console.error("Error loading spot detail:", error);
    if (card) card.innerHTML = "<p>Error cargando detalle del spot.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadSpotDetail);