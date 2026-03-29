import { getSpots } from "./api.js";

let allSpots = [];

function renderSpots(spots) {
  const container = document.getElementById("spotsList");
  const count = document.getElementById("spotsCount");

  if (!container || !count) return;

  count.textContent = `Mostrando ${spots.length} spot${spots.length !== 1 ? "s" : ""}`;

  if (!spots.length) {
    container.innerHTML = `
      <article class="spotitem">
        <div class="spotitem-body">
          <div class="spotitem-top">
            <h4>No se encontraron spots</h4>
          </div>
          <p class="spotitem-desc">Prueba otro filtro o revisa la API.</p>
        </div>
      </article>
    `;
    return;
  }

  container.innerHTML = spots.map((spot) => `
    <article class="spotitem">
      <div class="spotitem-media">
        <img src="../images/homepage/about.webp" alt="${spot.name}" loading="lazy" />
      </div>

      <div class="spotitem-body">
        <div class="spotitem-top">
          <h4>${spot.name}</h4>
          <span class="spotitem-badge ${String(spot.type).toLowerCase() === "skatepark" ? "park" : "street"}">
            ${spot.type}
          </span>
        </div>

        <div class="spotitem-loc">
          <i class="fa-solid fa-location-dot"></i> ${spot.city}, ${spot.country}
        </div>

        <p class="spotitem-desc">
          ${spot.description || "Sin descripción."}
        </p>

        <div class="spotitem-meta">
          <span class="spotitem-pill active"><i class="fa-solid fa-circle-check"></i>Activo</span>
          <span class="spotitem-muted">Lat: ${spot.lat} | Lng: ${spot.lng}</span>
        </div>
      </div>

      <div class="spotitem-actions">
        <a class="spotitem-btn" href="../pages/spot-detalle.html?id=${spot.id}">Ver detalles</a>
      </div>
    </article>
  `).join("");
}

function applyFilters() {
  const cityValue = document.getElementById("spotSearchCity")?.value.trim().toLowerCase() || "";
  const typeValue = document.getElementById("spotTypeFilter")?.value.trim().toLowerCase() || "";

  const filtered = allSpots.filter((spot) => {
    const city = String(spot.city || "").toLowerCase();
    const country = String(spot.country || "").toLowerCase();
    const type = String(spot.type || "").toLowerCase();

    const matchesCity =
      !cityValue ||
      city.includes(cityValue) ||
      country.includes(cityValue);

    const matchesType =
      !typeValue || type === typeValue;

    return matchesCity && matchesType;
  });

  renderSpots(filtered);
}

async function loadSpots() {
  const container = document.getElementById("spotsList");

  try {
    allSpots = await getSpots();
    renderSpots(allSpots);

    document.getElementById("spotSearchBtn")?.addEventListener("click", applyFilters);
    document.getElementById("spotTypeFilter")?.addEventListener("change", applyFilters);
    document.getElementById("spotSearchCity")?.addEventListener("input", applyFilters);
  } catch (error) {
    console.error("Error loading spots:", error);

    if (container) {
      container.innerHTML = `
        <article class="spotitem">
          <div class="spotitem-body">
            <div class="spotitem-top">
              <h4>Error cargando spots</h4>
            </div>
            <p class="spotitem-desc">Revisa que el backend esté corriendo en http://localhost:4000</p>
          </div>
        </article>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", loadSpots);