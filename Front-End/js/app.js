/* ================================
   Callejeando v2 — Front-end JS
   Tabs + render mock data + filtros
   ================================ */

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

/* ---------- Mock data (conecta tu API después) ---------- */
const SPOTS = [
  { id: "s1", name: "Banco del Centro", zone: "Centro", type: "street", obstacles: ["ledge", "manual"], time: "10–20 min", rating: 4.3, verified: true },
  { id: "s2", name: "Skatepark Norte", zone: "Norte", type: "park", obstacles: ["rail", "quarter"], time: "20–35 min", rating: 4.8, verified: true },
  { id: "s3", name: "Bowl Viejo", zone: "Occidente", type: "bowl", obstacles: ["bowl"], time: "25–40 min", rating: 3.9, verified: false },
  { id: "s4", name: "Stairs 6 + Hubba", zone: "Sur", type: "street", obstacles: ["stairs", "ledge"], time: "30–50 min", rating: 4.1, verified: false },
];

const CLIPS = [
  { id: "c1", title: "Switch flip en el banco", skater: "Dani", tag: "trick", spot: "Banco del Centro", likes: 128 },
  { id: "c2", title: "Line rápida (3 trucos)", skater: "Vale", tag: "line", spot: "Skatepark Norte", likes: 312 },
  { id: "c3", title: "Bowl bail (por poco)", skater: "Santi", tag: "bail", spot: "Bowl Viejo", likes: 96 },
  { id: "c4", title: "Nollie frontside en hubba", skater: "CJ", tag: "trick", spot: "Stairs 6 + Hubba", likes: 204 },
];

const EVENTS = [
  { id: "e1", month: "MAR", day: "22", title: "Street Jam — Centro", time: "2:00 PM", place: "Punto por confirmar", format: "Best trick + líneas" },
  { id: "e2", month: "APR", day: "06", title: "Park Contest — Clasificatorio", time: "10:00 AM", place: "Skatepark", format: "Rondas + cupos" },
];

/* ---------- State ---------- */
let state = {
  tab: "spots",
  spotsFilter: "all",
  spotsQuery: "",
  clipsFilter: "all",
  clipsQuery: "",
  favorites: new Set(loadFavs()),
  theme: loadTheme(),
  mode: "list", // list | map (UI only)
};

/* ---------- Init ---------- */
applyTheme(state.theme);
bindTabs();
bindBottomNav();
bindTheme();
bindFilters();
bindSearch();
bindActions();
renderAll();

/* ---------- Tabs ---------- */
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
  $$(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === tab));
}

function bindTabs() {
  $$(".tab").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
}

function bindBottomNav() {
  $$(".bn").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
}

/* ---------- Theme ---------- */
function bindTheme() {
  const btn = $("#btnTheme");
  btn?.addEventListener("click", () => {
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
    });
  });

  // clips chips
  $$(".chip-btn[data-clipfilter]").forEach((b) => {
    b.addEventListener("click", () => {
      state.clipsFilter = b.dataset.clipfilter;
      $$(".chip-btn[data-clipfilter]").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      renderClips();
    });
  });

  // segmented mode (UI only)
  $$(".seg").forEach((b) => {
    b.addEventListener("click", () => {
      state.mode = b.dataset.mode;
      $$(".seg").forEach((x) => x.classList.toggle("is-active", x === b));
      toast(`Modo: ${state.mode.toUpperCase()}`);
    });
  });
}

function bindSearch() {
  const qSpots = $("#qSpots");
  qSpots?.addEventListener("input", () => {
    state.spotsQuery = qSpots.value.trim().toLowerCase();
    renderSpots();
  });

  const qClips = $("#qClips");
  qClips?.addEventListener("input", () => {
    state.clipsQuery = qClips.value.trim().toLowerCase();
    renderClips();
  });
}

/* ---------- Actions ---------- */
function bindActions() {
  $("#btnAddSpot")?.addEventListener("click", openAddSpot);
  $("#btnAddSpot2")?.addEventListener("click", openAddSpot);

  $("#btnUpload")?.addEventListener("click", () => modalInfo("Upload clip", "Conecta aquí tu flow de subida (S3, Cloudinary, etc.)."));
  $("#btnJoin")?.addEventListener("click", () => toast("Te uniste a la comunidad 🤝"));
  $("#btnRules")?.addEventListener("click", () => modalInfo("Reglas", "Mantén la data limpia: spots reales, ubicación clara, y reportes útiles."));
  $("#btnLocate")?.addEventListener("click", () => toast("Ubicación: (mock) centrada"));
  $("#btnRoute")?.addEventListener("click", () => toast("Ruta: (mock) abierta"));
  $("#btnReport")?.addEventListener("click", () => modalInfo("Report", "Agrega reportes: seguridad, obras, vigilancia, piso, etc."));

  $("#btnShare")?.addEventListener("click", () => toast("Link de perfil copiado (mock)"));
  $("#btnSettings")?.addEventListener("click", () => modalInfo("Settings", "Conecta preferencias: idioma, privacidad, notificaciones."));
}

/* ---------- Render ---------- */
function renderAll() {
  setTab(state.tab);
  renderSpots();
  renderClips();
  renderEvents();
  renderFavorites();
  updateKpis();
}

function renderSpots() {
  const list = $("#spotsList");
  const empty = $("#spotsEmpty");

  const filtered = SPOTS
    .filter((s) => {
      const f = state.spotsFilter;
      if (f === "all") return true;
      // type filters
      if (["street", "park", "bowl"].includes(f)) return s.type === f;
      // obstacle filters
      return s.obstacles.includes(f);
    })
    .filter((s) => {
      if (!state.spotsQuery) return true;
      const hay = `${s.name} ${s.zone} ${s.type} ${s.obstacles.join(" ")}`.toLowerCase();
      return hay.includes(state.spotsQuery);
    });

  // empty state
  const isEmpty = filtered.length === 0;
  empty.hidden = !isEmpty;
  list.style.display = isEmpty ? "none" : "grid";

  list.innerHTML = filtered.map(spotCard).join("");

  // bind card buttons
  filtered.forEach((s) => {
    $(`#open_${s.id}`)?.addEventListener("click", () => openSpot(s));
    $(`#fav_${s.id}`)?.addEventListener("click", () => toggleFav(s.id));
  });

  $("#kpiSpots").textContent = String(filtered.length);
  updateKpis();
  renderFavorites();
}

function spotCard(s) {
  const fav = state.favorites.has(s.id);
  const stars = starText(s.rating);
  const verified = s.verified ? `<span class="badge badge--soft">Verified</span>` : `<span class="badge">Unverified</span>`;

  return `
    <article class="card spot">
      <div class="spot__top">
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <span class="chip">${cap(s.type)}</span>
          ${verified}
        </div>
        <div class="muted micro" title="rating">${stars} <span style="opacity:.8">(${s.rating.toFixed(1)})</span></div>
      </div>

      <h3 class="spot__name">${escapeHtml(s.name)}</h3>
      <div class="spot__meta">
        <span>📍 ${escapeHtml(s.zone)}</span>
        <span>⏱ ${escapeHtml(s.time)}</span>
        <span>🧱 ${escapeHtml(s.obstacles.join(", "))}</span>
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

function renderClips() {
  const grid = $("#clipsGrid");
  const filtered = CLIPS
    .filter((c) => (state.clipsFilter === "all" ? true : c.tag === state.clipsFilter))
    .filter((c) => {
      if (!state.clipsQuery) return true;
      const hay = `${c.title} ${c.skater} ${c.spot} ${c.tag}`.toLowerCase();
      return hay.includes(state.clipsQuery);
    });

  grid.innerHTML = filtered.map((c) => `
    <article class="card clip">
      <div class="clip__thumb" role="img" aria-label="Preview clip"></div>
      <h3 class="clip__title">${escapeHtml(c.title)}</h3>
      <div class="clip__meta">
        <span>👤 ${escapeHtml(c.skater)}</span>
        <span>📍 ${escapeHtml(c.spot)}</span>
        <span>❤️ ${c.likes}</span>
      </div>
      <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
        <button class="btn btn-primary" type="button" data-play="${c.id}">Play</button>
        <button class="btn btn-ghost" type="button" data-like="${c.id}">Like</button>
      </div>
    </article>
  `).join("");

  $$("[data-play]").forEach((b) => b.addEventListener("click", () => toast("Play (mock)")));
  $$("[data-like]").forEach((b) => b.addEventListener("click", () => toast("Like (mock)")));
}

function renderEvents() {
  const list = $("#eventsList");
  list.innerHTML = EVENTS.map((e) => `
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

  $$("[data-event]").forEach((b) => b.addEventListener("click", () => {
    const e = EVENTS.find(x => x.id === b.dataset.event);
    modalInfo(e.title, `Hora: ${e.time}<br/>Lugar: ${e.place}<br/>Formato: ${e.format}`);
  }));
  $$("[data-cal]").forEach((b) => b.addEventListener("click", () => toast("Calendario (mock)")));
}

function renderFavorites() {
  const box = $("#favoritesList");
  const favs = SPOTS.filter((s) => state.favorites.has(s.id));

  $("#kpiFavs").textContent = String(favs.length);
  $("#pFavs").textContent = String(favs.length);

  if (!box) return;
  if (favs.length === 0) {
    box.innerHTML = `<div class="mini-item"><span class="muted">Aún no tienes favoritos</span><span>♡</span></div>`;
    return;
  }

  box.innerHTML = favs.map((s) => `
    <div class="mini-item">
      <span><strong>${escapeHtml(s.name)}</strong><span class="muted"> · ${escapeHtml(s.zone)}</span></span>
      <button class="icon-btn" type="button" data-unfav="${s.id}" aria-label="Quitar favorito">♥</button>
    </div>
  `).join("");

  $$("[data-unfav]").forEach((b) => b.addEventListener("click", () => toggleFav(b.dataset.unfav)));
}

function updateKpis() {
  $("#kpiFavs").textContent = String(state.favorites.size);
  $("#pFavs").textContent = String(state.favorites.size);
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
  renderSpots(); // rerender to update icons
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
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  $("#modalPrimary").textContent = "Ok";
  dlg?.showModal();
}

function openSpot(s) {
  modalInfo(
    s.name,
    `
      <div style="display:grid; gap:10px;">
        <div><strong>Zona:</strong> ${escapeHtml(s.zone)}</div>
        <div><strong>Tipo:</strong> ${escapeHtml(cap(s.type))}</div>
        <div><strong>Obstáculos:</strong> ${escapeHtml(s.obstacles.join(", "))}</div>
        <div><strong>Rating:</strong> ${s.rating.toFixed(1)} ${starText(s.rating)}</div>
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
        <div class="muted">Crea un form real (nombre, ubicación, tipo, obstáculos, fotos).</div>
        <div class="muted">Sugerencia: verificación comunitaria + reportes (seguridad/obras).</div>
      </div>
    `
  );
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  $("#toastMsg").textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 1600);
}

/* ---------- Helpers ---------- */
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function starText(r) {
  const full = Math.floor(r);
  const half = (r - full) >= 0.5;
  const stars = "★★★★★".split("").map((_, i) => (i < full ? "★" : "☆"));
  if (half && full < 5) stars[full] = "★"; // simple (no half-star char)
  return stars.join("");
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}
