import { api } from "./api.js";

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

/* =========================================
   STATE
========================================= */
let state = {
    tab: "spots",
    theme: loadTheme(),
    mode: "list",
    hydrated: false,

    spotsFilter: "all",
    spotsQuery: "",

    eventsFilter: "all",
    eventsQuery: "",

    shopsFilter: "all",
    shopsQuery: "",

    session: {
        isLoggedIn: false,
        user: null,
    },

    favorites: new Set(loadFavs()),

    data: {
        spots: [],
        events: [],
        shops: [],
        sponsors: [],
    },
};

/* =========================================
   INIT
========================================= */
document.addEventListener("DOMContentLoaded", () => {
    applyTheme(state.theme);
    initLanguageMenu();

    bindTabs();
    bindBottomNav();
    bindTheme();
    bindFilters();
    bindMobileFilters();
    bindSearch();
    bindActions();

    renderAll();
    state.hydrated = true;

    loadDataFromApi();
});

document.querySelector(".brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#main")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTab("spots");
});

/* =========================================
   API LOAD + NORMALIZE
========================================= */
async function loadDataFromApi() {
    pulseBusy("Conectando API…", "Actualizando datos");

    try {
        const [spotsRes, eventsRes, shopsRes, sponsorsRes] = await Promise.all([
            api.getSpots(),
            api.getEvents(),
            api.getShops(),
            api.getSponsors(),
        ]);

        if (spotsRes && !spotsRes.ok && spotsRes.error) {
            console.warn("Spots error:", spotsRes.error);
        } else if (Array.isArray(spotsRes)) {
            state.data.spots = normalizeSpots(spotsRes);
        }

        if (eventsRes && !eventsRes.ok && eventsRes.error) {
            console.warn("Events error:", eventsRes.error);
        } else if (Array.isArray(eventsRes)) {
            state.data.events = normalizeEvents(eventsRes);
        }

        if (shopsRes && !shopsRes.ok && shopsRes.error) {
            console.warn("Shops error:", shopsRes.error);
        } else if (Array.isArray(shopsRes)) {
            state.data.shops = normalizeShops(shopsRes);
        }

        if (sponsorsRes && !sponsorsRes.ok && sponsorsRes.error) {
            console.warn("Sponsors error:", sponsorsRes.error);
        } else if (Array.isArray(sponsorsRes)) {
            state.data.sponsors = normalizeSponsors(sponsorsRes);
        }
    } catch (error) {
        console.warn("API fallback:", error);
        toast("No se pudo conectar con la API");
    } finally {
        hideBusy();
        renderAll();
    }
}

/* =========================================
   NORMALIZERS
========================================= */
function normalizeSpots(spots) {
    return spots.map((s) => ({
        id: String(s.id),
        name: s.name || "Spot",
        zone: s.city || "—",
        city: s.city || "—",
        type: (s.type && String(s.type).trim() !== "" ? String(s.type) : "street").toLowerCase(),
        obstacles: [],
        time: "—",
        rating: 4,
        verified: false,
        safety: "safe",
        description: s.description || "",
        lat: Number(s.lat || 0),
        lng: Number(s.lng || 0),
        image: s.image || "",
        images: Array.isArray(s.images) ? s.images : s.image ? [s.image] : [],
    }));
}

function normalizeEvents(events) {
    return events.map((e) => {
        const date = e.date ? new Date(e.date) : null;
        const isValidDate = date && !isNaN(date);

        return {
            id: String(e.id),
            title: e.title || "Evento",
            description: e.description || "",
            location: e.location || "—",
            place: e.location || "—",
            country: e.country || "Costa Rica",
            date: isValidDate ? date : null,
            month: isValidDate ? date.toLocaleString("en-US", { month: "short" }).toUpperCase() : "—",
            day: isValidDate ? String(date.getDate()).padStart(2, "0") : "—",
            time: isValidDate
                ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                : "—",
            format: e.description || "Sin descripción",
            category: e.category || "event",
            price: Number(e.price || 0),
            lat: Number(e.lat || 0),
            lng: Number(e.lng || 0),
            image: e.image || "",
            images: Array.isArray(e.images) ? e.images : e.image ? [e.image] : [],
        };
    });
}

function normalizeShops(shops) {
    return shops.map((s) => ({
        id: String(s.id),
        name: s.name || "Shop",
        description: s.description || "",
        city: s.city || "—",
        country: s.country || "Costa Rica",
        category: s.category || "Shop",
        verified: Boolean(s.verified),
        promo: Boolean(s.promo),
        website: s.website || "",
        instagram: s.instagram || "",
        address: s.address || "",
        lat: Number(s.lat || 0),
        lng: Number(s.lng || 0),
        image: s.image || "",
        images: Array.isArray(s.images) ? s.images : s.image ? [s.image] : [],
    }));
}

function normalizeSponsors(sponsors) {
    return sponsors.map((s) => ({
        id: String(s.id),
        name: s.name || "Sponsor",
        logo: s.logo || s.image || "./assets/placeholder-logo.svg",
        url: s.url || s.website || "#",
        website: s.website || s.url || "#",
        active: s.active !== false,
    }));
}

/* =========================================
   NAVIGATION
========================================= */
function setTab(tab) {
    state.tab = tab;

    $$(".tab").forEach((b) => {
        const active = b.dataset.tab === tab;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
    });

    $$(".bn").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.tab === tab);
    });

    $$(".view").forEach((v) => {
        v.classList.toggle("is-active", v.dataset.view === tab);
    });

    applyViewMode();


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
            mapSub.textContent = "Spots, shops y eventos cerca de ti.";
        } else if (tab === "events") {
            mapTitle.textContent = "Eventos cercanos";
            mapSub.textContent = "Sesiones, competencias y registro rápido.";
        } else if (tab === "shops") {
            mapTitle.textContent = "Shops cercanas";
            mapSub.textContent = "Tiendas locales, promos y aliados de la escena.";
        } else {
            mapTitle.textContent = "Tu actividad";
            mapSub.textContent = "Favoritos, eventos guardados y actividad local.";
        }
    }

    const sponsorsCard = $("#sponsorsCard");
    if (sponsorsCard) {
        sponsorsCard.hidden = !(tab === "events" || tab === "shops");
    }
}

function bindTabs() {
    $$(".tab").forEach((b) => {
        b.addEventListener("click", () => setTab(b.dataset.tab));
    });
}

function bindBottomNav() {
    $$(".bn").forEach((b) => {
        b.addEventListener("click", () => setTab(b.dataset.tab));
    });
}

function applyViewMode() {
    const shell = document.querySelector(".container.shell");
    const side = document.querySelector(".side");

    if (!shell) return;

    shell.classList.toggle("is-map-mode", state.mode === "map");
    shell.classList.toggle("is-list-mode", state.mode === "list");

    if (side) {
        const hideSideForLockedProfile =
            state.tab === "profile" && !state.session?.isLoggedIn;

        side.hidden = hideSideForLockedProfile;
    }
}

/* =========================================
   THEME
========================================= */
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

function saveTheme(value) {
    localStorage.setItem("cj_theme", value);
}

/* =========================================
   FILTERS
========================================= */
function bindFilters() {
    $$(".chip-btn[data-filter]").forEach((b) => {
        b.addEventListener("click", () => {
            state.spotsFilter = b.dataset.filter;
            $$(".chip-btn[data-filter]").forEach((x) => x.classList.remove("is-active"));
            b.classList.add("is-active");
            renderSpots();
            flash("#spotsList");
        });
    });

    $$(".chip-btn[data-eventfilter]").forEach((b) => {
        b.addEventListener("click", () => {
            state.eventsFilter = b.dataset.eventfilter;
            $$(".chip-btn[data-eventfilter]").forEach((x) => x.classList.remove("is-active"));
            b.classList.add("is-active");
            renderEvents();
            flash("#eventsList");
        });
    });

    $$(".chip-btn[data-shopfilter]").forEach((b) => {
        b.addEventListener("click", () => {
            state.shopsFilter = b.dataset.shopfilter;
            $$(".chip-btn[data-shopfilter]").forEach((x) => x.classList.remove("is-active"));
            b.classList.add("is-active");
            renderShops();
            flash("#shopsList");
        });
    });

    $$(".seg").forEach((b) => {
        b.addEventListener("click", () => {
            state.mode = b.dataset.mode;
            $$(".seg").forEach((x) => x.classList.toggle("is-active", x === b));
            applyViewMode();
            toast(`Modo: ${state.mode.toUpperCase()}`);
        });
    });

}

function bindMobileFilters() {
    $("#spotsFilterMobile")?.addEventListener("change", (e) => {
        state.spotsFilter = e.target.value;
        syncChipState("[data-filter]", state.spotsFilter, "filter");
        renderSpots();
        flash("#spotsList");
    });

    $("#eventsFilterMobile")?.addEventListener("change", (e) => {
        state.eventsFilter = e.target.value;
        syncChipState("[data-eventfilter]", state.eventsFilter, "eventfilter");
        renderEvents();
        flash("#eventsList");
    });

    $("#shopsFilterMobile")?.addEventListener("change", (e) => {
        state.shopsFilter = e.target.value;
        syncChipState("[data-shopfilter]", state.shopsFilter, "shopfilter");
        renderShops();
        flash("#shopsList");
    });
}

function syncChipState(selector, value, dataKey) {
    $$(selector).forEach((chip) => {
        chip.classList.toggle("is-active", chip.dataset[dataKey] === value);
    });
}

/* =========================================
   SEARCH
========================================= */
function bindSearch() {
    $("#qSpots")?.addEventListener("input", (e) => {
        state.spotsQuery = e.target.value.trim().toLowerCase();
        renderSpots();
        flash("#spotsList");
    });

    $("#qEvents")?.addEventListener("input", (e) => {
        state.eventsQuery = e.target.value.trim().toLowerCase();
        renderEvents();
        flash("#eventsList");
    });

    $("#qShops")?.addEventListener("input", (e) => {
        state.shopsQuery = e.target.value.trim().toLowerCase();
        renderShops();
        flash("#shopsList");
    });
}

/* =========================================
   ACTIONS
========================================= */
function bindActions() {
    $("#btnAddSpot")?.addEventListener("click", openAddSpot);
    $("#btnAddSpot2")?.addEventListener("click", openAddSpot);

    $("#btnCreateEvent")?.addEventListener("click", () => {
        modalInfo("Create event", "Conecta aquí el form real (POST /events).");
    });

    $("#btnAddShop")?.addEventListener("click", () => {
        modalInfo("Add shop", "Conecta aquí el form real (POST /shops).");
    });

    $("#btnJoin")?.addEventListener("click", () => toast("Te uniste a la comunidad 🤝"));
    $("#btnRules")?.addEventListener("click", () => {
        modalInfo("Rules", "Mantén la data limpia: spots reales, ubicación clara y reportes útiles.");
    });

    $("#btnLocate")?.addEventListener("click", locateMe);
    $("#btnRoute")?.addEventListener("click", () => toast("Ruta (mock): integra Maps después"));
    $("#btnReport")?.addEventListener("click", openReport);

    $("#btnShare")?.addEventListener("click", shareProfile);
    $("#btnSettings")?.addEventListener("click", () => {
        modalInfo("Settings", "Preferencias, privacidad y notificaciones.");
    });

    $("#btnOpenMap")?.addEventListener("click", openMapView);
    $("#btnCloseMap")?.addEventListener("click", closeMapView);

    $$(".js-open-map").forEach((btn) => {
        btn.addEventListener("click", openMapView);
    });

    //Código para bloquear si no se ha iniciado sesión.
    $("#btnLoginMock")?.addEventListener("click", () => {
        state.session.isLoggedIn = true;
        state.session.user = { id: 1, name: "Andres" };
        toast("Sesión iniciada (demo)");
        renderProfile();
        renderFavorites();
        updateProfileCounts();
    });

    $("#btnLogoutMock")?.addEventListener("click", () => {
        state.session.isLoggedIn = false;
        state.session.user = null;
        toast("Sesión cerrada");
        renderProfile();
        renderFavorites();
        updateProfileCounts();
    });
}

/* =========================================
   RENDER
========================================= */
function renderAll() {
    setTab(state.tab);
    renderSpots();
    renderEvents();
    renderShops();
    renderSponsors();
    renderProfile();
    renderFavorites();
    updateKpis();
    updateProfileCounts();
}

function renderSpots() {
    const list = $("#spotsList");
    const empty = $("#spotsEmpty");
    if (!list) return;

    const filtered = (state.data.spots || [])
        .filter((s) => {
            const f = state.spotsFilter;
            if (f === "all") return true;
            if (["street", "park", "bowl"].includes(f)) return String(s.type).toLowerCase() === f;
            if (f === "verified") return !!s.verified;
            if (f === "safe") return String(s.safety || "").toLowerCase() === "safe";
            return false;
        })
        .filter((s) => {
            if (!state.spotsQuery) return true;
            const hay = `${s.name} ${s.zone || ""} ${s.type}`.toLowerCase();
            return hay.includes(state.spotsQuery);
        });

    const isEmpty = filtered.length === 0;
    if (empty) empty.hidden = !isEmpty;
    list.style.display = isEmpty ? "none" : "grid";
    list.innerHTML = filtered.map(spotCard).join("");

    filtered.forEach((s) => {
        $(`#open_${s.id}`)?.addEventListener("click", () => openSpot(s));
        $(`#fav_${s.id}`)?.addEventListener("click", () => toggleFav(String(s.id)));
    });

    $("#kpiSpots") && ($("#kpiSpots").textContent = String(filtered.length));
    $("#kpiVerified") && ($("#kpiVerified").textContent = String(filtered.filter((s) => s.verified).length));

    const st = $("#spotsStatus");
    if (st) st.textContent = `Mostrando ${filtered.length} spot(s) · Favoritos: ${state.favorites.size}`;
}

function renderEvents() {
    const list = $("#eventsList");
    const empty = $("#eventsEmpty");
    if (!list) return;

    const filtered = (state.data.events || []).filter((e) => {
        const hay = `${e.title} ${e.place} ${e.format}`.toLowerCase();
        const matchesQuery = !state.eventsQuery || hay.includes(state.eventsQuery);

        const title = String(e.title || "").toLowerCase();

        let matchesFilter = true;
        switch (state.eventsFilter) {
            case "all":
                matchesFilter = true;
                break;
            case "upcoming":
                matchesFilter = true;
                break;
            case "contest":
                matchesFilter = title.includes("contest") || title.includes("tampa") || title.includes("best trick");
                break;
            case "jam":
                matchesFilter = title.includes("jam");
                break;
            case "free":
                matchesFilter = Number(e.price || 0) === 0;
                break;
            default:
                matchesFilter = true;
        }

        return matchesQuery && matchesFilter;
    });

    const isEmpty = filtered.length === 0;
    if (empty) empty.hidden = !isEmpty;
    list.style.display = isEmpty ? "none" : "grid";

    list.innerHTML = filtered.map(eventCard).join("");

    $$("[data-event]").forEach((b) => {
        b.addEventListener("click", () => {
            const ev = filtered.find((x) => String(x.id) === String(b.dataset.event));
            if (!ev) return;
            openEvent(ev);
        });
    });

    $$("[data-cal]").forEach((b) => {
        b.addEventListener("click", () => toast("Calendario (mock)"));
    });

    $("#kpiEvents") && ($("#kpiEvents").textContent = String(filtered.length));
    $("#kpiUpcoming") && ($("#kpiUpcoming").textContent = String(filtered.length));
    $("#kpiRegistrations") && ($("#kpiRegistrations").textContent = "—");
}

function renderShops() {
    const list = $("#shopsList");
    const empty = $("#shopsEmpty");
    if (!list) return;

    const filtered = (state.data.shops || []).filter((shop) => {
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
                matchesFilter =
                    category.includes("board") ||
                    category.includes("skateshop") ||
                    category.includes("shop");
                break;
            default:
                matchesFilter = true;
        }

        return matchesQuery && matchesFilter;
    });

    const isEmpty = filtered.length === 0;
    if (empty) empty.hidden = !isEmpty;
    list.style.display = isEmpty ? "none" : "grid";

    list.innerHTML = filtered.map(shopCard).join("");

    $$("[data-shop]").forEach((b) => {
        b.addEventListener("click", () => {
            const shop = filtered.find((x) => String(x.id) === String(b.dataset.shop));
            if (!shop) return;
            openShop(shop);
        });
    });

    $("#kpiShops") && ($("#kpiShops").textContent = String(filtered.length));
    $("#kpiVerifiedShops") && ($("#kpiVerifiedShops").textContent = String(filtered.filter((s) => s.verified).length));
    $("#kpiPromos") && ($("#kpiPromos").textContent = String(filtered.filter((s) => s.promo).length));
}

function renderSponsors() {
    const sponsors = state.data.sponsors || [];

    const track = $("#sponsorsMarquee");
    if (track) {
        const loop = sponsors.concat(sponsors);
        track.innerHTML = loop.map((s) => `<span class="sponsor">${escapeHtml(s.name)}</span>`).join("");
    }

    const grid = $("#sponsorsGrid");
    if (grid) {
        grid.innerHTML = sponsors
            .map(
                (s) => `
        <a class="sponsor-tile" href="${s.url || "#"}" target="_blank" rel="noopener">
          <img src="${s.logo || "./assets/placeholder-logo.svg"}" alt="${escapeHtml(s.name)}" loading="lazy">
          <span>${escapeHtml(s.name)}</span>
        </a>
      `
            )
            .join("");
    }
}

function renderProfile() {
    const locked = $("#profileLocked");
    const privateBox = $("#profilePrivate");

    if (!locked || !privateBox) return;

    if (state.session.isLoggedIn) {
        locked.hidden = true;
        privateBox.hidden = false;
    } else {
        locked.hidden = false;
        privateBox.hidden = true;
    }
    applyViewMode();
}

function renderFavorites() {
    const box = $("#favoritesList");
    if (!box) return;

    const spots = state.data.spots || [];
    const favs = spots.filter((s) => state.favorites.has(String(s.id)));

    $("#kpiFavs") && ($("#kpiFavs").textContent = String(state.favorites.size));
    $("#pFavs") && ($("#pFavs").textContent = String(state.favorites.size));

    if (favs.length === 0) {
        box.innerHTML = `<div class="mini-item"><span class="muted">Aún no tienes favoritos</span><span>♡</span></div>`;
    } else {
        box.innerHTML = favs
            .map(
                (s) => `
        <div class="mini-item">
          <span><strong>${escapeHtml(s.name)}</strong><span class="muted"> · ${escapeHtml(s.zone || "—")}</span></span>
          <button class="icon-btn" type="button" data-unfav="${s.id}" aria-label="Quitar favorito">♥</button>
        </div>
      `
            )
            .join("");
    }

    $$("[data-unfav]").forEach((b) => {
        b.addEventListener("click", () => toggleFav(String(b.dataset.unfav)));
    });

    const profileEventsList = $("#profileEventsList");
    if (profileEventsList) {
        const events = state.data.events || [];
        if (!events.length) {
            profileEventsList.innerHTML = `<div class="mini-item"><span class="muted">Aún no hay eventos disponibles</span><span>🏁</span></div>`;
        } else {
            profileEventsList.innerHTML = events
                .slice(0, 3)
                .map(
                    (e) => `
          <div class="mini-item">
            <span><strong>${escapeHtml(e.title)}</strong><span class="muted"> · ${escapeHtml(e.place || "—")}</span></span>
            <span>🏁</span>
          </div>
        `
                )
                .join("");
        }
    }
}

function updateKpis() {
    $("#kpiFavs") && ($("#kpiFavs").textContent = String(state.favorites.size));
    $("#kpiVerified") && ($("#kpiVerified").textContent = String((state.data.spots || []).filter((s) => s.verified).length));
}

function updateProfileCounts() {
    $("#pFavs") && ($("#pFavs").textContent = String(state.favorites.size));
    $("#pEvents") && ($("#pEvents").textContent = String((state.data.events || []).length));
    $("#pShops") && ($("#pShops").textContent = String((state.data.shops || []).length));
}

/* =========================================
   TEMPLATES
========================================= */
function spotCard(s) {
    const fav = state.favorites.has(String(s.id));

    return `
    <article class="card spot-card">
      <div class="card__image">
        <img src="${s.image || "./assets/default-spot.jpg"}" alt="${escapeHtml(s.name)}" loading="lazy">
      </div>

      <div class="card__body">
        <div class="card__meta">
          <span class="badge">${escapeHtml(cap(String(s.type || "Street")))}</span>
          <span class="badge ${s.verified ? "badge--soft" : ""}">
            ${s.verified ? "Verified" : "Unverified"}
          </span>
        </div>

        <h3 class="spot__name">${escapeHtml(s.name)}</h3>

        <p class="muted">📍 ${escapeHtml(s.zone || s.city || "—")}</p>

        <p class="muted micro">
          ${escapeHtml(s.description || "Spot disponible para explorar.")}
        </p>

        <div class="card__actions">
          <button class="btn btn-secondary" id="open_${s.id}" type="button">
            Ver detalle
          </button>

          <button class="icon-btn" id="fav_${s.id}" type="button" aria-label="Favorito">
            ${fav ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function eventCard(e) {
    const img = e.image || "./assets/default-event.jpg";

    return `
    <article class="card event-card">
      <div class="card__image">
        <img src="${img}" alt="${escapeHtml(e.title)}" loading="lazy">
      </div>

      <div class="card__body">
        <div class="card__meta">
          <span class="badge">${escapeHtml(e.month || "—")} ${escapeHtml(e.day || "")}</span>
          <span class="badge badge--soft">${Number(e.price || 0) === 0 ? "Free" : "Paid"}</span>
        </div>

        <h3 class="event__title">${escapeHtml(e.title)}</h3>

        <p class="muted">📍 ${escapeHtml(e.place || "—")}</p>
        <p class="muted micro">🕒 ${escapeHtml(e.time || "—")}</p>

        <div class="card__actions">
          <button class="btn btn-primary" type="button" data-event="${e.id}">
            Detalles
          </button>
        </div>
      </div>
    </article>
  `;
}

function shopCard(shop) {
    const img = shop.image || "./assets/default-shop.jpg";

    return `
    <article class="card shop-card">
      <div class="card__image">
        <img src="${img}" alt="${escapeHtml(shop.name)}" loading="lazy">
      </div>

      <div class="card__body">
        <div class="card__meta">
          <span class="badge">${escapeHtml(shop.category || "Shop")}</span>
          ${shop.verified ? `<span class="badge badge--soft">Verified</span>` : ""}
          ${shop.promo ? `<span class="badge badge--soft">Promo</span>` : ""}
        </div>

        <h3 class="h3">${escapeHtml(shop.name)}</h3>

        <p class="muted">📍 ${escapeHtml(shop.city || "—")}</p>

        <div class="card__actions">
          <button class="btn btn-primary" type="button" data-shop="${shop.id}">
            Ver shop
          </button>
        </div>
      </div>
    </article>
  `;
}

/* =========================================
   FAVORITES
========================================= */
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
    updateProfileCounts();
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

/* =========================================
   MODAL / ACTIONS
========================================= */
function modalInfo(title, html) {
    const dlg = $("#modal");
    if (!dlg) return;

    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = html;
    $("#modalPrimary").textContent = "Ok";
    dlg.showModal();
}

function closeModal() {
    const dlg = $("#modal");
    if (dlg && dlg.open) dlg.close();
}

function openSpot(s) {
    const images = s.images?.length
        ? s.images
        : s.image
            ? [s.image]
            : ["./assets/default-spot.jpg"];

    modalInfo(
        s.name,
        `
      <div class="detail-modal">
        <div class="detail-hero">
          <img src="${images[0]}" alt="${escapeHtml(s.name)}" loading="lazy">
        </div>

        <div class="detail-meta">
          <span class="badge">${escapeHtml(cap(String(s.type || "Street")))}</span>
          <span class="badge ${s.verified ? "badge--soft" : ""}">
            ${s.verified ? "Verified" : "Unverified"}
          </span>
          <span class="badge">${escapeHtml(s.safety || "safe")}</span>
        </div>

        <div class="detail-grid">
          <div><strong>Zona:</strong> ${escapeHtml(s.zone || s.city || "—")}</div>
          <div><strong>Descripción:</strong> ${escapeHtml(s.description || "Sin descripción")}</div>
          <div><strong>Rating:</strong> ${Number(s.rating || 0).toFixed(1)} ${starText(Number(s.rating || 0))}</div>
          <div><strong>Coordenadas:</strong> ${s.lat || 0}, ${s.lng || 0}</div>
        </div>

        <div class="detail-gallery">
          ${images.map((img) => `
            <button class="detail-thumb" type="button" data-img="${img}">
              <img src="${img}" alt="${escapeHtml(s.name)}" loading="lazy">
            </button>
          `).join("")}
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary" type="button" id="btnRouteFromModal">
            Route
          </button>
        </div>
      </div>
    `
    );

    setTimeout(() => {
        $("#btnRouteFromModal")?.addEventListener("click", () => {
            closeModal();
            openRoute(s);
            openMapView();
        });

        $$(".detail-thumb").forEach((btn) => {
            btn.addEventListener("click", () => {
                const img = btn.dataset.img;
                const hero = document.querySelector(".detail-hero img");
                if (hero && img) hero.src = img;
            });
        });
    }, 0);
}

function openEvent(e) {
    const images = e.images?.length
        ? e.images
        : e.image
            ? [e.image]
            : ["./assets/default-event.jpg"];

    modalInfo(
        e.title,
        `
      <div class="detail-modal">
        <div class="detail-hero event-detail-hero">
          <img src="${images[0]}" alt="${escapeHtml(e.title)}" loading="lazy">
        </div>

        <div class="detail-meta">
          <span class="badge">${escapeHtml(e.month || "—")} ${escapeHtml(e.day || "")}</span>
          <span class="badge badge--soft">${Number(e.price || 0) === 0 ? "Free" : "Paid"}</span>
          <span class="badge">${escapeHtml(e.category || "Event")}</span>
        </div>

        <div class="detail-grid">
          <div><strong>Lugar:</strong> ${escapeHtml(e.place || "—")}</div>
          <div><strong>Hora:</strong> ${escapeHtml(e.time || "—")}</div>
          <div><strong>Descripción:</strong> ${escapeHtml(e.description || e.format || "Sin descripción")}</div>
          <div><strong>Coordenadas:</strong> ${e.lat || 0}, ${e.lng || 0}</div>
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary" type="button" id="btnRouteFromModal">
            Route
          </button>
        </div>
      </div>
    `
    );

    setTimeout(() => {
        $("#btnRouteFromModal")?.addEventListener("click", () => {
            closeModal();
            openRoute(e);
            openMapView();
        });

        $$(".detail-thumb").forEach((btn) => {
            btn.addEventListener("click", () => {
                const img = btn.dataset.img;
                const hero = document.querySelector(".detail-hero img");
                if (hero && img) hero.src = img;
            });
        });
    }, 0);
}

function openShop(shop) {
    const img = shop.image || "./assets/default-shop.jpg";

    modalInfo(
        shop.name,
        `
      <div class="detail-modal">
        <div class="detail-hero shop-detail-hero">
          <img src="${img}" alt="${escapeHtml(shop.name)}" loading="lazy">
        </div>

        <div class="detail-meta">
          <span class="badge">${escapeHtml(shop.category || "Shop")}</span>
          ${shop.verified ? `<span class="badge badge--soft">Verified</span>` : ""}
          ${shop.promo ? `<span class="badge badge--soft">Promo</span>` : ""}
        </div>

        <div class="detail-grid">
          <div><strong>Ciudad:</strong> ${escapeHtml(shop.city || "—")}</div>
          <div><strong>Descripción:</strong> ${escapeHtml(shop.description || "Sin descripción")}</div>
          <div><strong>Dirección:</strong> ${escapeHtml(shop.address || "—")}</div>
        </div>

        <div class="detail-actions detail-actions--icons">
          ${shop.website
            ? `<a class="icon-btn" href="${shop.website}" target="_blank" rel="noopener" title="Website">🌐</a>`
            : ""
        }

          ${shop.instagram
            ? `<a class="icon-btn" href="${shop.instagram}" target="_blank" rel="noopener" title="Instagram">📷</a>`
            : ""
        }

          <button class="icon-btn" type="button" id="btnRouteFromModal" title="Route">
            ◎
          </button>
        </div>
      </div>
    `
    );

    setTimeout(() => {
        $("#btnRouteFromModal")?.addEventListener("click", () => {
            closeModal();
            openRoute(shop);
            openMapView();
        });
    }, 0);
}

function openAddSpot() {
    modalInfo("Add spot", "Conecta aquí un formulario real para crear spots.");
}

function openReport() {
    modalInfo("Report", "Envía un reporte sobre seguridad, obras o piso malo.");
}

function locateMe() {
    if (!navigator.geolocation) {
        toast("Geolocalización no soportada");
        return;
    }

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

// function openRoute(item) {
//     const lat = Number(item.lat || 0);
//     const lng = Number(item.lng || 0);

//     if (!lat || !lng) {
//         toast("Este lugar aún no tiene coordenadas reales");
//         return;
//     }

//     const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
//     window.open(url, "_blank", "noopener");
// }

function openRoute(item) {
    const lat = Number(item.lat || 0);
    const lng = Number(item.lng || 0);

    if (!lat || !lng) {
        toast("Este lugar aún no tiene coordenadas reales");
        return;
    }

    toast(`Ruta lista para: ${item.name || item.title || "ubicación"}`);
}

async function shareProfile() {
    const url = location.href.split("#")[0];

    try {
        if (navigator.share) {
            await navigator.share({
                title: "Callejeandola",
                text: "Mira mi perfil en Callejeandola",
                url,
            });
            toast("Compartido ✅");
        } else {
            await navigator.clipboard.writeText(url);
            toast("Link copiado ✅");
        }
    } catch {
        toast("No se pudo compartir");
    }
}

/* =========================================
   TOAST / BUSY
========================================= */
let toastTimer = null;

function toast(msg) {
    const t = $("#toast");
    if (!t) return;

    $("#toastMsg").textContent = msg;
    t.hidden = false;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        t.hidden = true;
    }, 1600);
}

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

    pulseBusy._timer = setTimeout(() => hideBusy(), 400);
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

/* =========================================
   HELPERS
========================================= */
function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function starText(r) {
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const stars = "★★★★★".split("").map((_, i) => (i < full ? "★" : "☆"));
    if (half && full < 5) stars[full] = "★";
    return stars.join("");
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    }[m]));
}

function flash(sel) {
    const el = document.querySelector(sel);
    if (!el) return;

    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");

    clearTimeout(flash._t);
    flash._t = setTimeout(() => el.classList.remove("flash"), 450);
}

/* =========================================
   LANGUAGE MENU
========================================= */
function initLanguageMenu() {
    const btnLanguage = document.getElementById("btnLanguage");
    const langMenu = document.getElementById("langMenu");

    if (!btnLanguage || !langMenu) return;

    btnLanguage.addEventListener("click", (e) => {
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

    document.addEventListener("click", (e) => {
        if (!langMenu.contains(e.target) && !btnLanguage.contains(e.target)) {
            langMenu.setAttribute("hidden", "");
            btnLanguage.setAttribute("aria-expanded", "false");
        }
    });

    langMenu.querySelectorAll("[data-lang]").forEach((button) => {
        button.addEventListener("click", () => {
            langMenu.setAttribute("hidden", "");
            btnLanguage.setAttribute("aria-expanded", "false");
        });
    });
}

/* =========================================
   MAP VIEW
========================================= */

function openMapView() {
    document.body.classList.add("is-map-open");
}

function closeMapView() {
    document.body.classList.remove("is-map-open");
}