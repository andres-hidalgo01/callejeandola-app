/* ================================
   Callejeandola v2 — Front-end JS
   (Mantiene tu base original + FIX API + sponsors + no freeze)
   ================================ */

import { api } from "./api.js";

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

/* ---------- Mock data (fallback) ---------- */
const SPOTS_MOCK = [
  { id: "s1", name: "Banco del Centro", zone: "Centro", type: "street", obstacles: ["ledge", "manual"], time: "10–20 min", rating: 4.3, verified: true },
  { id: "s2", name: "Skatepark Norte", zone: "Norte", type: "park", obstacles: ["rail", "quarter"], time: "20–35 min", rating: 4.8, verified: true },
  { id: "s3", name: "Bowl Viejo", zone: "Occidente", type: "bowl", obstacles: ["bowl"], time: "25–40 min", rating: 3.9, verified: false },
  { id: "s4", name: "Stairs 6 + Hubba", zone: "Sur", type: "street", obstacles: ["stairs", "ledge"], time: "30–50 min", rating: 4.1, verified: false },
];

const EVENTS_MOCK = [
  { id: "e1", month: "MAR", day: "22", title: "Street Jam — Centro", time: "2:00 PM", place: "Punto por confirmar", format: "Best trick + líneas" },
  { id: "e2", month: "APR", day: "06", title: "Park Contest — Clasificatorio", time: "10:00 AM", place: "Skatepark", format: "Rondas + cupos" },
];

const SHOPS_MOCK = [
  { id: "sh1", name: "Local Shop", city: "San José", verified: true, category: "Boards", promo: true },
  { id: "sh2", name: "Skate House", city: "Heredia", verified: false, category: "Parts", promo: false },
  { id: "sh3", name: "Concrete Supply", city: "Cartago", verified: true, category: "Shoes", promo: true },
];

const SPONSORS_MOCK = [
  { id: "sp1", name: "VANS", logo: "./assets/placeholder-logo.svg", url: "https://www.vans.com" },
  { id: "sp2", name: "NIKE SB", logo: "./assets/placeholder-logo.svg", url: "https://www.nike.com" },
  { id: "sp3", name: "RED BULL", logo: "./assets/placeholder-logo.svg", url: "https://www.redbull.com" },
  { id: "sp4", name: "LOCAL SHOP", logo: "./assets/placeholder-logo.svg", url: "#" },
];

/* ---------- State ---------- */
let state = {
  tab: "spots",
  spotsFilter: "all",
  spotsQuery: "",
  eventsFilter: "all",
  eventsQuery: "",
  shopsFilter: "all",
  shopsQuery: "",
  favorites: new Set(loadFavs()),
  theme: loadTheme(),
  mode: "list",
  hydrated: false,

  data: {
    spots: SPOTS_MOCK,
    events: EVENTS_MOCK,
    shops: SHOPS_MOCK,
    sponsors: SPONSORS_MOCK,
  },
};


/* ---------- Init (NO bloquea UI) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(state.theme);
  initLanguageMenu();

  bindTabs();
  bindBottomNav();
  bindTheme();
  bindFilters();
  bindSearch();
  bindActions();

  renderAll();       // UI inmediata (mocks)
  state.hydrated = true;

  // API en background (no freeze)
  loadDataFromApi();
});

/* ---------- API load (fallback) ---------- */
async function loadDataFromApi() {
  pulseBusy("Conectando API…", "Actualizando datos (sin bloquear)");

  try {
    const [spots, events, shops, sponsors] = await Promise.all([
      api.getSpots(),
      api.getEvents(),
      api.getShops(),
      api.getSponsors(),
    ]);

    if (Array.isArray(spots)) state.data.spots = spots;
    if (Array.isArray(events)) state.data.events = events;
    if (Array.isArray(shops)) state.data.shops = shops;
    if (Array.isArray(sponsors)) state.data.sponsors = sponsors;

  } catch (e) {
    console.warn("API fallback:", e);
  } finally {
    hideBusy();
    renderSpots();
    renderEvents();
    renderShops();
    renderSponsors();
    renderFavorites();
    updateKpis();
    updateProfileCounts();
  }
}

/* ---------- Brand goes home ---------- */
document.querySelector(".brand")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("#main")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTab("spots");
  pulseBusy("Home", "Volviendo al inicio");
});

/* ---------- Tabs (FIX: sincroniza todo como antes) ---------- */
function setTab(tab) {
  state.tab = tab;

  // top tabs
  $$(".tab").forEach((b) => {
    const active = b.dataset.tab === tab;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-selected", String(active));
  });

  // bottom nav
  $$(".bn").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));

  // views
  $$(".view").forEach((v) => {
    v.classList.toggle("is-active", v.dataset.view === tab);
  });

  if (state.hydrated) {
    pulseBusy(
      tab === "spots" ? "Spots" :
        tab === "events" ? "Events" :
          tab === "shops" ? "Shops" : "Profile",
      "Cambiando sección"
    );
  }

  const mapTitle = document.querySelector(".map__head .h3");
  const mapSub = document.querySelector(".map__head .micro");

  if (mapTitle && mapSub) {
    if (tab === "spots") {
      mapTitle.textContent = "Mapa";
      mapSub.textContent = "Mock de mapa (pines). Luego integras mapa real.";
    } else if (tab === "events") {
      mapTitle.textContent = "Eventos cerca";
      mapSub.textContent = "Sponsors, ubicación y registro rápido.";
    } else if (tab === "shops") {
      mapTitle.textContent = "Shops cercanas";
      mapSub.textContent = "Tiendas locales, promos y aliados de la escena.";
    } else {
      mapTitle.textContent = "Tu actividad";
      mapSub.textContent = "Favoritos, eventos guardados y actividad reciente.";
    }
  }

  const mapCard = document.getElementById("mapCard");
  const sponsorsCard = document.getElementById("sponsorsCard");

  if (mapCard && sponsorsCard) {
    const showSponsors = tab === "events" || tab === "shops";
    mapCard.hidden = false;
    sponsorsCard.hidden = !showSponsors;
  }

  document.querySelector(".panel")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function bindTabs() {
  $$(".tab").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
}

function bindBottomNav() {
  $$(".bn").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
}

/* ---------- Theme ---------- */
function bindTheme() {
  $("#btnTheme")?.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(state.theme);
    saveTheme(state.theme);
    toast(`Tema: ${state.theme}`);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
}

function loadTheme() {
  return localStorage.getItem("cj_theme") || "dark";
}

function saveTheme(t) {
  localStorage.setItem("cj_theme", t);
}

/* ---------- Filters / search ---------- */
function bindFilters() {
  // spots chips
  $$(".chip-btn[data-filter]").forEach((b) => {
    b.addEventListener("click", () => {
      state.spotsFilter = b.dataset.filter;
      $$(".chip-btn[data-filter]").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      renderSpots();
      flash("#spotsList");
    });
  });

  // events chips
  $$(".chip-btn[data-eventfilter]").forEach((b) => {
    b.addEventListener("click", () => {
      state.eventsFilter = b.dataset.eventfilter;
      $$(".chip-btn[data-eventfilter]").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      renderEvents();
      flash("#eventsList");
    });
  });

  // shops chips
  $$(".chip-btn[data-shopfilter]").forEach((b) => {
    b.addEventListener("click", () => {
      state.shopsFilter = b.dataset.shopfilter;
      $$(".chip-btn[data-shopfilter]").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      renderShops();
      flash("#shopsList");
    });
  });

  // segmented mode
  $$(".seg").forEach((b) => {
    b.addEventListener("click", () => {
      state.mode = b.dataset.mode;
      $$(".seg").forEach((x) => x.classList.toggle("is-active", x === b));
      toast(`Modo: ${state.mode.toUpperCase()}`);
    });
  });
}

function bindSearch() {
  $("#qSpots")?.addEventListener("input", (e) => {
    state.spotsQuery = e.target.value.trim().toLowerCase();
    pulseBusy("Buscando…", "Actualizando resultados");
    renderSpots();
    flash("#spotsList");
  });

  $("#qEvents")?.addEventListener("input", (e) => {
    state.eventsQuery = e.target.value.trim().toLowerCase();
    pulseBusy("Buscando…", "Actualizando eventos");
    renderEvents();
    flash("#eventsList");
  });

  $("#qShops")?.addEventListener("input", (e) => {
    state.shopsQuery = e.target.value.trim().toLowerCase();
    pulseBusy("Buscando…", "Actualizando shops");
    renderShops();
    flash("#shopsList");
  });
}

/* ---------- Actions (CTAs vivos) ---------- */
function bindActions() {
  $("#btnAddSpot")?.addEventListener("click", openAddSpot);
  $("#btnAddSpot2")?.addEventListener("click", openAddSpot);

  $("#btnCreateEvent")?.addEventListener("click", () =>
    modalInfo("Create event", "Conecta aquí el form real (POST /events).")
  );

  $("#btnAddShop")?.addEventListener("click", () =>
    modalInfo("Add shop", "Conecta aquí el form real (POST /shops).")
  );

  $("#btnJoin")?.addEventListener("click", () => toast("Te uniste a la comunidad 🤝"));
  $("#btnRules")?.addEventListener("click", () =>
    modalInfo("Reglas", "Mantén la data limpia: spots reales, ubicación clara, y reportes útiles.")
  );

  $("#btnLocate")?.addEventListener("click", locateMe);
  $("#btnRoute")?.addEventListener("click", () => toast("Ruta (mock): luego integra Maps Directions"));
  $("#btnReport")?.addEventListener("click", () => openReport());

  $("#btnSponsors")?.addEventListener("click", () =>
    modalInfo("Paquetes sponsors", "Demo: Bronze/Silver/Gold + métricas de clicks.")
  );
  $("#btnSponsorContact")?.addEventListener("click", () =>
    modalInfo("Contacto sponsors", "Demo: form / mail / WhatsApp.")
  );

  $("#btnShare")?.addEventListener("click", shareProfile);
  $("#btnSettings")?.addEventListener("click", () =>
    modalInfo("Settings", "Preferencias, privacidad, notificaciones.")
  );
}

/* ---------- Render ---------- */
function renderAll() {
  setTab(state.tab);
  renderSpots();
  renderEvents();
  renderShops();
  renderSponsors();
  renderFavorites();
  updateKpis();
  updateProfileCounts();
}

function renderSpots() {
  const list = $("#spotsList");
  const empty = $("#spotsEmpty");
  const spots = state.data.spots || [];

  const filtered = spots
    .filter((s) => {
      const f = state.spotsFilter;

      if (f === "all") return true;
      if (["street", "park", "bowl"].includes(f)) return s.type === f;
      if (f === "verified") return !!s.verified;
      if (f === "safe") return String(s.safety || "").toLowerCase() === "safe";

      return (s.obstacles || []).map(x => String(x).toLowerCase()).includes(f);
    })
    .filter((s) => {
      if (!state.spotsQuery) return true;
      const hay = `${s.name} ${s.zone} ${s.type} ${(s.obstacles || []).join(" ")}`.toLowerCase();
      return hay.includes(state.spotsQuery);
    });

  const isEmpty = filtered.length === 0;
  if (empty) empty.hidden = !isEmpty;
  if (list) list.style.display = isEmpty ? "none" : "grid";

  if (list) list.innerHTML = filtered.map(spotCard).join("");

  filtered.forEach((s) => {
    $(`#open_${s.id}`)?.addEventListener("click", () => openSpot(s));
    $(`#fav_${s.id}`)?.addEventListener("click", () => toggleFav(s.id));
  });

  $("#kpiSpots") && ($("#kpiSpots").textContent = String(filtered.length));
  updateKpis();

  const st = $("#spotsStatus");
  if (st) st.textContent = `Mostrando ${filtered.length} spot(s) · Favoritos: ${state.favorites.size}`;

  // Si está filtrando/buscando, trae resultados a vista
  if (state.spotsQuery || state.spotsFilter !== "all") {
    const listEl = $("#spotsList");
    if (listEl) {
      const rect = listEl.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.65) {
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }
}

function spotCard(s) {
  const fav = state.favorites.has(s.id);
  const stars = starText(Number(s.rating || 0));
  const verified = s.verified
    ? `<span class="badge badge--soft">Verified</span>`
    : `<span class="badge">Unverified</span>`;

  return `
    <article class="card spot">
      <div class="spot__top">
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <span class="chip">${cap(s.type)}</span>
          ${verified}
        </div>
        <div class="muted micro" title="rating">${stars} <span style="opacity:.8">(${Number(s.rating || 0).toFixed(1)})</span></div>
      </div>

      <h3 class="spot__name">${escapeHtml(s.name)}</h3>
      <div class="spot__meta">
        <span>📍 ${escapeHtml(s.zone || "—")}</span>
        <span>⏱ ${escapeHtml(s.time || "—")}</span>
        <span>🧱 ${escapeHtml((s.obstacles || []).join(", "))}</span>
      </div>

      <div class="spot__actions">
        <button class="btn btn-secondary" id="open_${s.id}" type="button">Ver detalle</button>
        <button class="icon-btn" id="fav_${s.id}" type="button" aria-label="Favorito">
          ${fav ? "♥" : "♡"}
        </button>
      </div>
    </article>
  `;
}


function renderEvents() {
  const list = $("#eventsList");
  if (!list) return;

  const events = state.data.events || [];

  const filtered = events.filter((e) => {
    const hay = `${e.title} ${e.place} ${e.format}`.toLowerCase();
    const matchesQuery = !state.eventsQuery || hay.includes(state.eventsQuery);

    const format = String(e.format || "").toLowerCase();
    const title = String(e.title || "").toLowerCase();

    let matchesFilter = true;

    switch (state.eventsFilter) {
      case "all":
        matchesFilter = true;
        break;
      case "upcoming":
        matchesFilter = true; // mock: todos son próximos
        break;
      case "contest":
        matchesFilter = format.includes("cupos") || title.includes("contest") || title.includes("clasificatorio");
        break;
      case "jam":
        matchesFilter = title.includes("jam");
        break;
      case "free":
        matchesFilter = !format.includes("pago") && !format.includes("fee");
        break;
      default:
        matchesFilter = true;
    }

    return matchesQuery && matchesFilter;
  });

  list.innerHTML = filtered.map((e) => `
    <article class="card event">
      <div class="event__date">
        <div class="event__month">${escapeHtml(e.month)}</div>
        <div class="event__day">${escapeHtml(e.day)}</div>
      </div>
      <div>
        <h3 class="event__title">${escapeHtml(e.title)}</h3>
        <div class="muted">${escapeHtml(e.format)}</div>
        <div class="event__meta">
          <span>🕒 ${escapeHtml(e.time)}</span>
          <span>📍 ${escapeHtml(e.place)}</span>
        </div>
        <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn btn-primary" type="button" data-event="${e.id}">Detalles</button>
          <button class="btn btn-ghost" type="button" data-cal="${e.id}">Añadir calendario</button>
        </div>
      </div>
    </article>
  `).join("");

  $$("[data-event]").forEach((b) =>
    b.addEventListener("click", () => {
      const ev = filtered.find((x) => x.id === b.dataset.event);
      if (!ev) return;
      modalInfo(
        ev.title,
        `Hora: ${escapeHtml(ev.time)}<br/>Lugar: ${escapeHtml(ev.place)}<br/>Formato: ${escapeHtml(ev.format)}`
      );
    })
  );

  $$("[data-cal]").forEach((b) =>
    b.addEventListener("click", () => toast("Calendario (mock)"))
  );

  $("#kpiEvents") && ($("#kpiEvents").textContent = String(filtered.length));
  $("#kpiUpcoming") && ($("#kpiUpcoming").textContent = String(filtered.length));
  $("#kpiRegistrations") && ($("#kpiRegistrations").textContent = "—");
}

function renderShops() {
  const list = $("#shopsList");
  if (!list) return;

  const shops = state.data.shops || [];

  const filtered = shops.filter((shop) => {
    const hay = `${shop.name} ${shop.city} ${shop.category}`.toLowerCase();
    const matchesQuery = !state.shopsQuery || hay.includes(state.shopsQuery);

    const category = String(shop.category || "").toLowerCase();

    let matchesFilter = true;

    switch (state.shopsFilter) {
      case "all":
        matchesFilter = true;
        break;
      case "verified":
        matchesFilter = !!shop.verified;
        break;
      case "promo":
        matchesFilter = !!shop.promo;
        break;
      case "parts":
        matchesFilter = category.includes("parts");
        break;
      case "boards":
        matchesFilter = category.includes("boards");
        break;
      default:
        matchesFilter = true;
    }

    return matchesQuery && matchesFilter;
  });

  list.innerHTML = filtered.map((shop) => `
    <article class="card shop">
      <div class="badge-row">
        <span class="badge">${escapeHtml(shop.category)}</span>
        ${shop.verified ? `<span class="badge badge--soft">Verified</span>` : ""}
      </div>
      <h3 class="h3">${escapeHtml(shop.name)}</h3>
      <p class="muted">${escapeHtml(shop.city)}</p>
      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
        <button class="btn btn-primary" type="button" data-shop="${shop.id}">Ver shop</button>
        <button class="btn btn-secondary" type="button">Cómo llegar</button>
      </div>
    </article>
  `).join("");

  $$("[data-shop]").forEach((b) =>
    b.addEventListener("click", () => {
      const shop = filtered.find((x) => x.id === b.dataset.shop);
      if (!shop) return;
      modalInfo(
        shop.name,
        `Ciudad: ${escapeHtml(shop.city)}<br/>Categoría: ${escapeHtml(shop.category)}<br/>Verificada: ${shop.verified ? "Sí" : "No"}`
      );
    })
  );

  const verifiedCount = filtered.filter((s) => s.verified).length;
  const promoCount = filtered.filter((s) => s.promo).length;

  $("#kpiShops") && ($("#kpiShops").textContent = String(filtered.length));
  $("#kpiVerifiedShops") && ($("#kpiVerifiedShops").textContent = String(verifiedCount));
  $("#kpiPromos") && ($("#kpiPromos").textContent = String(promoCount));
}

function renderSponsors() {
  // Cintillo
  const track = $("#sponsorsMarquee");
  const sponsors = state.data.sponsors || [];

  if (track) {
    const loop = sponsors.concat(sponsors);
    track.innerHTML = loop.map(s => `<span class="sponsor">${escapeHtml(s.name)}</span>`).join("");
  }

  // Grid (card en Events)
  const grid = $("#sponsorsGrid");
  if (grid) {
    grid.innerHTML = sponsors.map(s => `
      <a class="sponsor-tile" href="${s.url || "#"}" target="_blank" rel="noopener">
        <img src="${s.logo || "./assets/placeholder-logo.svg"}" alt="${escapeHtml(s.name)}" loading="lazy">
        <span>${escapeHtml(s.name)}</span>
      </a>
    `).join("");
  }
}

function renderFavorites() {
  const box = $("#favoritesList");
  const spots = state.data.spots || [];
  const favs = spots.filter((s) => state.favorites.has(s.id));

  $("#kpiFavs") && ($("#kpiFavs").textContent = String(state.favorites.size));
  $("#pFavs") && ($("#pFavs").textContent = String(state.favorites.size));

  if (!box) return;

  if (favs.length === 0) {
    box.innerHTML = `<div class="mini-item"><span class="muted">Aún no tienes favoritos</span><span>♡</span></div>`;
    return;
  }

  box.innerHTML = favs.map((s) => `
    <div class="mini-item">
      <span><strong>${escapeHtml(s.name)}</strong><span class="muted"> · ${escapeHtml(s.zone || "—")}</span></span>
      <button class="icon-btn" type="button" data-unfav="${s.id}" aria-label="Quitar favorito">♥</button>
    </div>
  `).join("");

  $$("[data-unfav]").forEach((b) => b.addEventListener("click", () => toggleFav(String(b.dataset.unfav))));
}

function updateKpis() {
  $("#kpiFavs") && ($("#kpiFavs").textContent = String(state.favorites.size));

  $("#kpiVerified") &&
    ($("#kpiVerified").textContent = String(
      (state.data.spots || []).filter((s) => s.verified).length
    ));
}

function updateProfileCounts() {
  $("#pEvents") && ($("#pEvents").textContent = String((state.data.events || []).length));
  $("#pShops") && ($("#pShops").textContent = String((state.data.shops || []).length));
}

/* ---------- Favorites storage ---------- */
function toggleFav(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    toast("Quitado de favoritos");
  } else {
    state.favorites.add(id);
    toast("Guardado en favoritos");
  }
  saveFavs([...state.favorites]);
  renderSpots();
  renderFavorites();
}

function loadFavs() {
  try {
    const raw = localStorage.getItem("cj_favs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavs(arr) {
  localStorage.setItem("cj_favs", JSON.stringify(arr));
}

/* ---------- Modal ---------- */
function modalInfo(title, html) {
  const dlg = $("#modal");
  if (!dlg) return;
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  $("#modalPrimary").textContent = "Ok";
  dlg.showModal();
}

function openSpot(s) {
  modalInfo(
    s.name,
    `
      <div style="display:grid; gap:10px;">
        <div><strong>Zona:</strong> ${escapeHtml(s.zone || "—")}</div>
        <div><strong>Tipo:</strong> ${escapeHtml(cap(s.type))}</div>
        <div><strong>Obstáculos:</strong> ${escapeHtml((s.obstacles || []).join(", "))}</div>
        <div><strong>Rating:</strong> ${Number(s.rating || 0).toFixed(1)} ${starText(Number(s.rating || 0))}</div>
        <div class="muted">Tip UI: aquí puedes meter fotos, mapa real, reportes y “check-in”.</div>
      </div>
    `
  );
}

function openAddSpot() {
  modalInfo(
    "Add spot (mock)",
    `
      <div style="display:grid; gap:10px;">
        <div class="muted">Demo: aquí conectas un form real (POST /spots).</div>
        <button class="btn btn-primary" type="button" id="btnCreateSpotNow">Crear spot demo</button>
      </div>
    `
  );

  setTimeout(() => {
    $("#btnCreateSpotNow")?.addEventListener("click", createSpotDemo);
  }, 0);
}

async function createSpotDemo() {
  pulseBusy("Creando spot…", "Guardando");

  const payload = {
    name: "Spot nuevo (API)",
    zone: "Centro",
    type: "street",
    obstacles: ["ledge"],
    time: "5–15 min",
    rating: 4.0,
    verified: false,
  };

  try {
    const r = await api.createSpot(payload);
    if (r && r.ok === false) {
      toast("API no disponible → demo local");
      state.data.spots = [{ id: "local_" + Date.now(), ...payload }, ...(state.data.spots || [])];
    } else {
      toast("Spot creado ✅");
      state.data.spots = [r, ...(state.data.spots || [])];
    }
  } catch {
    toast("Error creando spot");
  } finally {
    hideBusy();
    renderSpots();
    renderFavorites();
  }
}

function openReport() {
  modalInfo(
    "Report",
    `
      <div style="display:grid; gap:10px;">
        <div class="muted">Demo: envía <code>POST /spots/:id/report</code>.</div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-secondary" type="button" data-rep="security">Seguridad</button>
          <button class="btn btn-secondary" type="button" data-rep="works">Obras</button>
          <button class="btn btn-secondary" type="button" data-rep="floor">Piso malo</button>
        </div>
      </div>
    `
  );

  setTimeout(() => {
    $$("[data-rep]").forEach(btn => btn.addEventListener("click", () => submitReport(btn.dataset.rep)));
  }, 0);
}

async function submitReport(type) {
  pulseBusy("Enviando reporte…", "Gracias por ayudar");
  const spotId = (state.data.spots?.[0]?.id) || "s1";

  try {
    const r = await api.reportSpot(spotId, { type, comment: "Reporte desde demo" });
    if (r && r.ok === false) toast("Reporte enviado (demo)");
    else toast("Reporte enviado ✅");
  } catch {
    toast("Error enviando reporte");
  } finally {
    hideBusy();
  }
}


/* ---------- Geolocalización ---------- */
function locateMe() {
  if (!navigator.geolocation) return toast("Geolocalización no soportada");

  pulseBusy("Ubicación…", "Obteniendo coordenadas");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      hideBusy();
      toast(`📍 ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
    },
    () => {
      hideBusy();
      toast("No se pudo obtener ubicación");
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

/* ---------- Share ---------- */
async function shareProfile() {
  const url = location.href.split("#")[0];
  try {
    if (navigator.share) {
      await navigator.share({ title: "Callejeandola", text: "Mira mi perfil en Callejeandola", url });
      toast("Compartido ✅");
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copiado ✅");
    }
  } catch {
    toast("No se pudo compartir");
  }
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  $("#toastMsg").textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 1600);
}

/* ---------- Busy overlay (NO se pega) ---------- */
function pulseBusy(title, sub) {
  const b = $("#busy");
  if (!b) return;

  const t = $("#busyTitle");
  const s = $("#busySub");
  if (t) t.textContent = title || "Cargando…";
  if (s) s.textContent = sub || "Actualizando contenido";

  b.hidden = false;

  clearTimeout(pulseBusy._timer);
  clearTimeout(pulseBusy._failsafe);

  pulseBusy._timer = setTimeout(() => hideBusy(), 380);
  pulseBusy._failsafe = setTimeout(() => hideBusy(), 1200);
}

function hideBusy() {
  const b = $("#busy");
  if (!b) return;
  b.hidden = true;
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) hideBusy();
});

/* ---------- Helpers ---------- */
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

function starText(r) {
  const full = Math.floor(r);
  const half = (r - full) >= 0.5;
  const stars = "★★★★★".split("").map((_, i) => (i < full ? "★" : "☆"));
  if (half && full < 5) stars[full] = "★";
  return stars.join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

/* ---------- Small UX flash helper ---------- */
function flash(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
  clearTimeout(flash._t);
  flash._t = setTimeout(() => el.classList.remove("flash"), 450);
}

function initLanguageMenu() {
  const btnLanguage = document.getElementById("btnLanguage");
  const langMenu = document.getElementById("langMenu");

  if (!btnLanguage || !langMenu) return;

  btnLanguage.addEventListener("click", function (e) {
    e.stopPropagation();

    const isHidden = langMenu.hasAttribute("hidden");

    if (isHidden) {
      langMenu.removeAttribute("hidden");
      btnLanguage.setAttribute("aria-expanded", "true");
    } else {
      langMenu.setAttribute("hidden", "");
      btnLanguage.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("click", function (e) {
    if (!langMenu.contains(e.target) && !btnLanguage.contains(e.target)) {
      langMenu.setAttribute("hidden", "");
      btnLanguage.setAttribute("aria-expanded", "false");
    }
  });

  langMenu.querySelectorAll("[data-lang]").forEach(function (button) {
    button.addEventListener("click", function () {
      langMenu.setAttribute("hidden", "");
      btnLanguage.setAttribute("aria-expanded", "false");
    });
  });
}