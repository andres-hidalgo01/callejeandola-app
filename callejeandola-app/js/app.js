import { getAuthToken } from "./services/session.service.js";

import {
    getFavoriteSpots,
    addFavoriteSpot,
    removeFavoriteSpot,
    getSavedEvents,
    addSavedEvent,
    removeSavedEvent,
} from "./api/engagement.api.js";

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

    routeTarget: null,
    isMapOpen: false,
    routePulseTimer: null,

    session: {
        isLoggedIn: false,
        user: null,
    },

    favorites: new Set(loadFavs().map(String)),
    favoriteSpots: [],
    savedEvents: new Set(),
    savedEventsList: [],

    data: {
        spots: [],
        events: [],
        shops: [],
        sponsors: [],
    },
};

let realMap = null;
let realMapMarkersLayer = null;
let userLocation = null;
let userMarker = null;
let activeRouteLine = null;
let activeRouteSpot = null;

let cjRouteSteps = [];
let cjRouteActiveStepIndex = 0;

let cjRouteMode = "idle"; // idle | preview | live
let cjRouteIsLive = false;
let cjRouteIsStarting = false;
let cjRouteFollowUser = true;

let cjRouteHasInitialLiveFocus = false;

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

window.addEventListener("cj:session-changed", async () => {
    await refreshEngagementUi();
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

        await loadEngagementFromApi();

        renderSpots();
        renderEvents();
        renderShops();
        renderSponsors();
        renderFavorites();
        renderSavedEvents();
        updateKpis();
        updateProfileCounts();
    }
}

async function loadEngagementFromApi() {
    const token = getAuthToken();

    if (!token) {
        state.favorites = new Set();
        state.favoriteSpots = [];
        state.savedEvents = new Set();
        state.savedEventsList = [];
        return;
    }

    try {
        const [favoriteSpots, savedEvents] = await Promise.all([
            getFavoriteSpots(),
            getSavedEvents(),
        ]);

        state.favoriteSpots = favoriteSpots;
        state.favorites = new Set(favoriteSpots.map((spot) => String(spot.id)));

        state.savedEventsList = savedEvents;
        state.savedEvents = new Set(savedEvents.map((event) => String(event.id)));
    } catch (error) {
        console.warn("Engagement API fallback:", error);

        state.favoriteSpots = [];
        state.favorites = new Set();
        state.savedEventsList = [];
        state.savedEvents = new Set();
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

    if (state.isMapOpen) {
        const mapView = $("#mapView");

        state.isMapOpen = false;
        document.body.classList.remove("is-map-open");

        if (mapView) {
            mapView.hidden = true;
            mapView.classList.remove("is-open");
        }
    }

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

function hasValidCoords(item) {
    const lat = Number(item?.lat);
    const lng = Number(item?.lng);

    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
}

function getMapItems() {
    const spots = (state.spots || [])
        .filter(hasValidCoords)
        .map((item) => ({
            ...item,
            mapType: "spot",
            mapIcon: "📍",
            mapTitle: item.name,
            mapSubtitle: item.zone || item.city || "Costa Rica",
        }));

    const events = (state.events || [])
        .filter(hasValidCoords)
        .map((item) => ({
            ...item,
            mapType: "event",
            mapIcon: "🏁",
            mapTitle: item.title,
            mapSubtitle: item.location || item.place || item.city || "Evento",
        }));

    const shops = (state.shops || [])
        .filter(hasValidCoords)
        .map((item) => ({
            ...item,
            mapType: "shop",
            mapIcon: "🛹",
            mapTitle: item.name,
            mapSubtitle: item.city || "Skateshop",
        }));

    return [...spots, ...events, ...shops];
}

function createMapIcon(type = "spot", icon = "📍") {
    const className =
        type === "event"
            ? "cj-map-marker cj-map-marker--event"
            : type === "shop"
                ? "cj-map-marker cj-map-marker--shop"
                : "cj-map-marker";

    return L.divIcon({
        html: `<div class="${className}">${icon}</div>`,
        className: "cj-map-marker-wrap",
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
    });
}

function ensureRealMap() {
    const mapElement = document.getElementById("realMap");

    if (!mapElement || !window.L) return null;

    if (realMap) {
        setTimeout(() => realMap.invalidateSize(), 80);
        return realMap;
    }

    realMap = L.map(mapElement, {
        zoomControl: true,
        attributionControl: true,
    }).setView([9.935, -84.09], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
    }).addTo(realMap);

    realMapMarkersLayer = L.layerGroup().addTo(realMap);

    setTimeout(() => realMap.invalidateSize(), 120);

    return realMap;
}

function renderRealMapMarkers() {
    const map = ensureRealMap();

    if (!map || !realMapMarkersLayer) return;

    realMapMarkersLayer.clearLayers();

    const items = getMapItems();

    if (!items.length) {
        map.setView([9.935, -84.09], 10);
        return;
    }

    const bounds = [];

    items.forEach((item) => {
        const lat = Number(item.lat);
        const lng = Number(item.lng);

        bounds.push([lat, lng]);

        const marker = L.marker([lat, lng], {
            icon: createMapIcon(item.mapType, item.mapIcon),
        });

        const safeTitle = escapeHtml(item.mapTitle || "Spot");
        const safeSubtitle = escapeHtml(item.mapSubtitle || "Costa Rica");
        const buttonId = `mapRoute_${item.mapType}_${item.id}`;

        marker.bindPopup(`
      <div class="cj-map-popup">
        <strong>${safeTitle}</strong>
        <span>${safeSubtitle}</span>
        <button type="button" id="${buttonId}">Ruta</button>
      </div>
    `);

        marker.on("popupopen", () => {
            setTimeout(() => {
                document.getElementById(buttonId)?.addEventListener("click", () => {
                    activateRouteFromMap(item);
                });
            }, 0);
        });

        marker.addTo(realMapMarkersLayer);
    });

    if (bounds.length === 1) {
        map.setView(bounds[0], 15);
    } else {
        map.fitBounds(bounds, {
            padding: [28, 28],
            maxZoom: 14,
        });
    }

    setTimeout(() => map.invalidateSize(), 150);
}

function activateRouteFromMap(item) {
    if (!item) return;

    if (typeof activateRouteTarget === "function") {
        activateRouteTarget(item, item.mapType || "spot");
    } else {
        const lat = Number(item.lat);
        const lng = Number(item.lng);
        const title = item.mapTitle || item.name || item.title || "Destino";

        state.routeTarget = {
            type: item.mapType || "spot",
            entity: item,
            route: {
                title,
                lat,
                lng,
                hasCoords: hasValidCoords(item),
                wazeUrl: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
                googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            },
        };

        renderRouteHub?.();
        renderActiveRouteOnMap?.();
    }

    renderActiveRouteOnMap?.();
    renderRouteHub?.();

    const map = ensureRealMap();

    if (map && hasValidCoords(item)) {
        map.setView([Number(item.lat), Number(item.lng)], 16);
    }

    toast?.(`Ruta activa: ${item.mapTitle || item.name || item.title}`);

    renderRouteHud();
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

    $("#btnMapLocateMe")?.addEventListener("click", locateMe);

    $("#btnCloseMap")?.addEventListener("click", () => {
        closeMapView();
    });

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

    document.getElementById("btnMapLocateMe")?.addEventListener("click", locateMe);
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
    renderFavorites();
    renderSavedEvents();
    updateKpis();
    updateProfileCounts();

    bindRouteHub();
    renderRouteHub();

    if (state.isMapOpen) {
        renderRealMapMarkers();
    }
}

/* =========================================
   PRELAUNCH — LIST / GRID VIEW MODE
========================================= */

function cjViewModeStorageKey(scope) {
    return `cj_${scope}_view_mode`;
}

function cjGetViewMode(scope) {
    const saved = localStorage.getItem(cjViewModeStorageKey(scope));
    return saved === "grid" ? "grid" : "list";
}

function cjSetViewMode(scope, mode) {
    localStorage.setItem(cjViewModeStorageKey(scope), mode === "grid" ? "grid" : "list");
}

function cjApplyViewMode(list, scope) {
    if (!list) return;

    const mode = cjGetViewMode(scope);

    list.dataset.viewMode = mode;
    list.classList.toggle("entity-list--grid", mode === "grid");
    list.classList.toggle("entity-list--list", mode === "list");

    document.querySelectorAll(`[data-view-toggle-scope="${scope}"] [data-view-mode]`)
        .forEach((btn) => {
            const active = btn.dataset.viewMode === mode;
            btn.classList.toggle("is-active", active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
        });
}

function cjEnsureViewToggle(scope, list, label, renderFn) {
    if (!list?.parentNode) return;

    const existing = document.querySelector(`[data-view-toggle-scope="${scope}"]`);

    if (existing) {
        cjApplyViewMode(list, scope);
        return;
    }

    const bar = document.createElement("div");
    bar.className = "entity-view-toggle";
    bar.dataset.viewToggleScope = scope;

    bar.innerHTML = `
      <div class="entity-view-toggle__label">${escapeHtml(label)}</div>

      <div class="entity-view-toggle__actions" role="group" aria-label="Cambiar vista">
        <button
          class="entity-view-toggle__btn"
          type="button"
          data-view-mode="list"
          aria-label="Vista lista"
          title="Vista lista"
          aria-pressed="false"
        >
          ☰
        </button>
        
        <button
          class="entity-view-toggle__btn"
          type="button"
          data-view-mode="grid"
          aria-label="Vista grid"
          title="Vista grid"
          aria-pressed="false"
        >
          ▦
        </button>
      </div>
    `;

    list.parentNode.insertBefore(bar, list);

    bar.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-view-mode]");

        if (!btn) return;

        cjSetViewMode(scope, btn.dataset.viewMode);
        renderFn();
    });

    cjApplyViewMode(list, scope);
}

function renderSpots() {
    const list = $("#spotsList");
    const empty = $("#spotsEmpty");
    if (!list) return;

    cjEnsureViewToggle("spots", list, "Spots", renderSpots);
    cjApplyViewMode(list, "spots");

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

    cjEnsureViewToggle("events", list, "Events", renderEvents);
    cjApplyViewMode(list, "events");

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

    $$("[data-save-event]").forEach((button) => {
        button.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            await toggleSavedEvent(button.dataset.saveEvent);
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
    const token = getAuthToken();

    const localFavoriteSpots = (state.data.spots || []).filter((spot) =>
        state.favorites.has(String(spot.id))
    );

    const favs = token ? state.favoriteSpots : localFavoriteSpots;

    $("#kpiFavs") && ($("#kpiFavs").textContent = String(state.favorites.size));
    $("#pFavs") && ($("#pFavs").textContent = String(state.favorites.size));

    if (!box) return;

    if (!token) {
        box.innerHTML = `
      <div class="mini-item">
        <span class="muted">Iniciá sesión para guardar favoritos en tu perfil.</span>
        <span>♡</span>
      </div>
    `;
        return;
    }

    if (!favs.length) {
        box.innerHTML = `
      <div class="mini-item">
        <span class="muted">Aún no tenés spots favoritos.</span>
        <span>♡</span>
      </div>
    `;
        return;
    }

    box.innerHTML = favs
        .map((spot) => {
            return `
        <div class="mini-item">
          <span>
            <strong>${escapeHtml(spot.name || "Spot")}</strong>
            <span class="muted"> · ${escapeHtml(spot.zone || spot.city || "—")}</span>
          </span>

          <button
            class="icon-btn is-active"
            type="button"
            data-unfav="${spot.id}"
            aria-label="Quitar favorito"
          >
            ♥
          </button>
        </div>
      `;
        })
        .join("");

    $$("[data-unfav]").forEach((button) => {
        button.addEventListener("click", () => toggleFav(button.dataset.unfav));
    });
}

function renderSavedEvents() {
    const box = $("#savedEventsList");
    const token = getAuthToken();
    const savedEvents = state.savedEventsList || [];

    $("#pSavedEvents") &&
        ($("#pSavedEvents").textContent = String(savedEvents.length));

    if (!box) return;

    if (!token) {
        box.innerHTML = `
      <div class="mini-item mini-item--empty">
        <span class="muted">Iniciá sesión para guardar eventos.</span>
        <span>＋</span>
      </div>
    `;
        return;
    }

    if (!savedEvents.length) {
        box.innerHTML = `
      <div class="mini-item mini-item--empty">
        <span class="muted">Aún no tenés eventos guardados.</span>
        <span>＋</span>
      </div>
    `;
        return;
    }

    box.innerHTML = savedEvents
        .map((event) => {
            return `
        <div class="mini-item">
          <span>
            <strong>${escapeHtml(event.title || event.name || "Evento")}</strong>
            <span class="muted"> · ${escapeHtml(event.place || event.city || "—")}</span>
          </span>

          <button
            class="icon-btn is-active"
            type="button"
            data-remove-saved-event="${event.id}"
            aria-label="Quitar evento guardado"
          >
            ✓
          </button>
        </div>
      `;
        })
        .join("");

    $$("[data-remove-saved-event]").forEach((button) => {
        button.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            await toggleSavedEvent(button.dataset.removeSavedEvent);
        });
    });
}

async function toggleFav(id) {
    const token = getAuthToken();

    if (!token) {
        toast("Iniciá sesión para guardar favoritos");
        setTab("profile");
        return;
    }

    const cleanId = Number(id);

    if (!Number.isInteger(cleanId)) {
        toast("Este spot demo no se puede guardar todavía");
        return;
    }

    const idKey = String(cleanId);
    const wasFavorite = state.favorites.has(idKey);

    try {
        if (wasFavorite) {
            state.favorites.delete(idKey);
            state.favoriteSpots = state.favoriteSpots.filter(
                (spot) => String(spot.id) !== idKey
            );

            renderSpots();
            renderFavorites();
            updateKpis();

            await removeFavoriteSpot(cleanId);

            toast("Quitado de favoritos");
        } else {
            state.favorites.add(idKey);

            const spot = (state.data.spots || []).find(
                (item) => String(item.id) === idKey
            );

            if (spot) {
                state.favoriteSpots = [spot, ...state.favoriteSpots];
            }

            renderSpots();
            renderFavorites();
            updateKpis();

            await addFavoriteSpot(cleanId);

            toast("Guardado en favoritos");
        }

        await loadEngagementFromApi();

        renderSpots();
        renderFavorites();
        renderSavedEvents();
        updateKpis();
    } catch (error) {
        console.error("Favorite toggle error:", error);

        await loadEngagementFromApi();

        renderSpots();
        renderFavorites();
        renderSavedEvents();
        updateKpis();

        toast(error.message || "Error actualizando favoritos");
    }
}

async function toggleSavedEvent(id) {
    const token = getAuthToken();

    if (!token) {
        toast("Iniciá sesión para guardar eventos");
        setTab("profile");
        return;
    }

    const cleanId = Number(id);

    if (!Number.isInteger(cleanId)) {
        toast("Este evento no se puede guardar todavía");
        return;
    }

    const idKey = String(cleanId);
    const wasSaved = state.savedEvents.has(idKey);

    try {
        if (wasSaved) {
            state.savedEvents.delete(idKey);
            state.savedEventsList = state.savedEventsList.filter(
                (event) => String(event.id) !== idKey
            );

            renderEvents();
            renderSavedEvents();
            updateProfileCounts();

            await removeSavedEvent(cleanId);

            toast("Evento quitado de guardados");
        } else {
            state.savedEvents.add(idKey);

            const eventItem = (state.data.events || []).find(
                (item) => String(item.id) === idKey
            );

            if (eventItem) {
                state.savedEventsList = [eventItem, ...state.savedEventsList];
            }

            renderEvents();
            renderSavedEvents();
            updateProfileCounts();

            await addSavedEvent(cleanId);

            toast("Evento guardado");
        }

        await loadEngagementFromApi();

        renderEvents();
        renderSavedEvents();
        updateProfileCounts();
    } catch (error) {
        console.error("Saved event toggle error:", error);

        await loadEngagementFromApi();

        renderEvents();
        renderSavedEvents();
        updateProfileCounts();

        toast(error.message || "Error actualizando evento guardado");
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
      ${renderMediaBlock(s, "spot")}

      <div class="card__body">
        <h3 class="spot__name">${escapeHtml(s.name)}</h3>

        <div class="entity-row">
          <p class="muted entity-row__location">
            <span class="entity-row__pin">📍</span>
            <span>${escapeHtml(s.zone || s.city || "Costa Rica")}</span>
          </p>

          <div class="entity-row__actions">
            <button
              class="entity-icon-btn"
              id="open_${s.id}"
              type="button"
              aria-label="Ver spot"
              title="Ver spot"
            >
              👁
            </button>

            <button
              class="entity-icon-btn ${fav ? "is-active" : ""}"
              id="fav_${s.id}"
              type="button"
              aria-label="Guardar favorito"
              title="Favorito"
            >
              ${fav ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function eventCard(e) {
    const token = getAuthToken();
    const saved = state.savedEvents.has(String(e.id));

    const saveButton = token
        ? `
          <button
            class="entity-icon-btn ${saved ? "is-active" : ""}"
            type="button"
            data-save-event="${e.id}"
            aria-label="${saved ? "Quitar evento guardado" : "Guardar evento"}"
            title="${saved ? "Quitar guardado" : "Guardar evento"}"
          >
            ${saved ? "✓" : "＋"}
          </button>
        `
        : "";

    return `
    <article class="card event-card">
      ${renderMediaBlock(e, "event")}

      <div class="card__body">
        
        <h3 class="event__title">${escapeHtml(e.title || e.name || "Evento")}</h3>

        <div class="entity-row">
          <div class="entity-row__text">
            <p class="muted entity-row__location">
              <span class="entity-row__pin">📍</span>
              <span>${escapeHtml(e.place || e.city || "Costa Rica")}</span>
            </p>
          </div>

          <div class="entity-row__actions">
            <button
              class="entity-icon-btn"
              type="button"
              data-event="${e.id}"
              aria-label="Ver evento"
              title="Ver evento"
            >
              👁
            </button>

            ${saveButton}
          </div>
        </div>
      </div>
    </article>
  `;
}

function shopCard(shop) {
    return `
    <article class="card shop-card">
      ${renderMediaBlock(shop, "shop")}

      <div class="card__body">
        <div class="card__meta">
          <span class="badge">${escapeHtml(shop.category || "Shop")}</span>
          ${shop.verified ? `<span class="badge badge--soft">Verified</span>` : ""}
          ${shop.promo ? `<span class="badge badge--soft">Promo</span>` : ""}
        </div>

        <h3 class="h3">${escapeHtml(shop.name)}</h3>

        <div class="entity-row">
          <p class="muted entity-row__location">
            <span class="entity-row__pin">📍</span>
            <span>${escapeHtml(shop.city || shop.zone || "Costa Rica")}</span>
          </p>

          <div class="entity-row__actions">
            <button
              class="entity-icon-btn"
              type="button"
              data-shop="${shop.id}"
              aria-label="Ver shop"
              title="Ver shop"
            >
              👁
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/* =========================================
   FAVORITES
========================================= */
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
    dlg.showModal();
}

function closeModal() {
    const dlg = $("#modal");
    if (dlg && dlg.open) dlg.close();
}

/* =========================================
   PRELAUNCH — WAZE-LIKE ROUTE CORE
========================================= */

let cjRouteMap = null;
let cjRouteMapTiles = null;
let cjRouteUserMarker = null;
let cjRouteDestinationMarker = null;
let cjRouteLine = null;
let cjRouteWatchId = null;
let cjRouteOverlayCreated = false;

function cjGetMapInstance() {
    if (cjRouteMap?.invalidateSize) return cjRouteMap;
    return null;
}

function cjFormatRouteDistance(meters) {
    const value = Number(meters || 0);

    if (value >= 1000) return `${(value / 1000).toFixed(1)} km`;
    return `${Math.round(value)} m`;
}

function cjFormatRouteDuration(seconds) {
    const minutes = Math.max(1, Math.round(Number(seconds || 0) / 60));

    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h} h ${m} min`;
    }

    return `${minutes} min`;
}

function cjGetRouteDestination() {
    const entity = state?.routeTarget?.entity;

    if (!entity || typeof getEntityCoords !== "function") return null;

    const coords = getEntityCoords(entity);

    if (!coords?.hasCoords) return null;

    return {
        lat: Number(coords.lat),
        lng: Number(coords.lng),
        title: state?.routeTarget?.route?.title || entity.name || entity.title || "Destino",
        type: state?.routeTarget?.type || "spot",
    };
}

function cjGetSavedUserLocation() {
    try {
        const raw = localStorage.getItem("cj_user_location");
        if (!raw) return null;

        const location = JSON.parse(raw);

        if (!Number.isFinite(Number(location.lat)) || !Number.isFinite(Number(location.lng))) {
            return null;
        }

        return {
            lat: Number(location.lat),
            lng: Number(location.lng),
            accuracy: Number(location.accuracy || 0),
            savedAt: location.savedAt || null,
        };
    } catch {
        return null;
    }
}

function cjRequestUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocalización no soportada"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve(cjSaveUserLocation(position));
            },
            reject,
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 5000,
            }
        );
    });
}

async function cjFetchOsrmRoute(from, to) {
    const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${from.lng},${from.lat};${to.lng},${to.lat}` +
        `?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("No se pudo calcular ruta OSRM");
    }

    const data = await response.json();
    const route = data?.routes?.[0];

    if (!route) {
        throw new Error("OSRM no devolvió ruta");
    }

    return route;
}

function cjRouteInstructionFromStep(step) {
    const maneuver = step?.maneuver?.type || "";
    const modifier = step?.maneuver?.modifier || "";
    const road = step?.name || "la ruta";

    if (maneuver === "depart") return `Salí hacia ${road}.`;
    if (maneuver === "arrive") return "Llegás al destino.";
    if (maneuver === "turn") return `Girás ${modifier ? modifier : ""} hacia ${road}.`;
    if (maneuver === "roundabout") return `Entrás a la rotonda hacia ${road}.`;
    if (maneuver === "merge") return `Incorporate hacia ${road}.`;
    if (maneuver === "continue") return `Continuá por ${road}.`;

    return `Seguí por ${road}.`;
}

function cjEnsureRouteOverlay() {
    let overlay = document.getElementById("cjRouteOverlay");

    if (!overlay) {
        overlay = document.createElement("section");
        overlay.id = "cjRouteOverlay";
        overlay.className = "cj-route-overlay";
        overlay.hidden = true;

        overlay.innerHTML = `
          <div class="cj-route-overlay__top">
            <button class="cj-route-overlay__back" type="button" id="btnCjRouteBack" aria-label="Volver">
              ‹
            </button>

            <div class="cj-route-overlay__title">
              <span>Tu ubicación → destino</span>
              <strong id="cjRouteOverlayTitle">Ruta activa</strong>
            </div>

            <button class="cj-route-overlay__close" type="button" id="btnCjRouteClose" aria-label="Cerrar ruta">
              ×
            </button>
          </div>

          <div class="cj-route-map-host" id="cjRouteMapHost"></div>

       
          <div class="cj-route-sheet" id="cjRouteSheet">
            <div class="cj-route-sheet__handle"></div>

            <div class="cj-route-sheet__main">
              <div>
                <strong id="cjRouteEta">Calculando…</strong>
                <small id="cjRouteDistance">Ruta activa</small>
              </div>

              <span class="cj-route-sheet__badge" id="cjRouteBadge">Preview</span>
            </div>

            <p id="cjRouteInstruction">Preparando ruta hacia el destino.</p>

            <div class="cj-route-sheet__actions">
              <button class="btn btn-secondary" type="button" id="btnCjRouteLater">
                Salir más tarde
              </button>

              <button class="btn btn-primary" type="button" id="btnCjRouteStart">
                Ir ahora
              </button>
            </div>
          </div>

        <div class="cj-route-live-hud" id="cjRouteLiveHud" hidden>
          <div class="cj-route-live-hud__summary">
            <span class="cj-route-live-hud__logo">
              <img
                src="./assets/icons/route-hub.ico"
                alt="Callejeandola"
                onerror="this.hidden=true; this.nextElementSibling.hidden=false;"
              />
              <b hidden>CJ</b>
            </span>
            
            <span class="cj-route-live-hud__text">
              <strong id="cjLiveEta">Ruta activa</strong>
              <small id="cjLiveDistance">Calculando distancia</small>
            </span>
          </div>
            
          <button
            class="cj-route-recenter"
            type="button"
            id="btnCjRouteRecenter"
            aria-label="Centrar mi ubicación"
            title="Re-center"
            hidden
          >
            ◎
            <span>Re-center</span>
          </button>
        </div>
        `;

        document.body.appendChild(overlay);
    }

    if (!cjRouteOverlayCreated) {
        cjRouteOverlayCreated = true;

        document.addEventListener("click", (event) => {
            if (event.target.closest("#btnCjRouteClose") || event.target.closest("#btnCjRouteBack")) {
                cjCloseRouteOverlay();
            }

            if (event.target.closest("#btnCjRouteLater")) {
                cjCloseRouteOverlay();
            }

            if (event.target.closest("#btnCjRouteStart")) {
                cjHandleStartRoute();
            }

            if (event.target.closest("#btnCjRouteRecenter")) {
                cjRecenterLiveRoute();
            }
        });
    }

    return overlay;
}

function cjMountMapIntoRouteOverlay() {
    const overlay = cjEnsureRouteOverlay();
    const host = document.getElementById("cjRouteMapHost");

    if (!host || !window.L) return;

    let routeMapEl = document.getElementById("cjRouteLeafletMap");

    if (!routeMapEl) {
        host.innerHTML = `<div id="cjRouteLeafletMap" class="cj-route-leaflet-map"></div>`;
        routeMapEl = document.getElementById("cjRouteLeafletMap");
    }

    overlay.hidden = false;
    document.body.classList.add("is-cj-route-overlay-open");

    if (!cjRouteMap) {
        cjRouteMap = L.map(routeMapEl, {
            zoomControl: true,
            attributionControl: true,
        }).setView([9.935, -84.09], 10);

        cjRouteMapTiles = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap",
            }
        ).addTo(cjRouteMap);

        cjRouteMap.on("dragstart", () => {
            if (!cjRouteIsLive) return;

            cjRouteFollowUser = false;
        });
    }

    setTimeout(() => cjRouteMap.invalidateSize(), 80);
    setTimeout(() => cjRouteMap.invalidateSize(), 280);
    setTimeout(() => cjRouteMap.invalidateSize(), 700);
}

function cjResetRouteSession({
    closeOverlay = false,
    clearDestination = false,
} = {}) {
    if (cjRouteWatchId !== null) {
        navigator.geolocation.clearWatch(cjRouteWatchId);
        cjRouteWatchId = null;
    }

    cjRouteMode = "idle";
    cjRouteIsLive = false;
    cjRouteIsStarting = false;
    cjRouteFollowUser = true;
    cjRouteHasInitialLiveFocus = false;
    cjRouteSteps = [];
    cjRouteActiveStepIndex = 0;

    document.body.classList.remove("is-cj-live-navigation");

    cjClearRouteLayers?.();

    const startButton = document.getElementById("btnCjRouteStart");

    if (startButton) {
        startButton.disabled = false;
        startButton.classList.remove("is-loading");
        startButton.classList.remove("is-live");
        startButton.textContent = "Ir ahora";
    }

    const recenterButton = document.getElementById(
        "btnCjRouteRecenter"
    );

    if (recenterButton) {
        recenterButton.hidden = true;
    }

    const previewSheet = document.getElementById("cjRouteSheet");

    if (previewSheet) {
        previewSheet.hidden = false;
        previewSheet.classList.remove("is-live");
    }

    const liveHud = document.getElementById("cjRouteLiveHud");

    if (liveHud) {
        liveHud.hidden = true;
    }

    if (clearDestination) {
        state.routeTarget = null;
    }

    if (closeOverlay) {
        const overlay = document.getElementById("cjRouteOverlay");

        if (overlay) {
            overlay.hidden = true;
        }

        document.body.classList.remove(
            "is-cj-route-overlay-open"
        );
    }
}

function cjCloseRouteOverlay() {
    cjResetRouteSession({
        closeOverlay: true,
        clearDestination: false,
    });

    state.isMapOpen = false;

    document.body.classList.remove(
        "is-map-open",
        "is-route-core",
        "is-route-experience"
    );

    const legacyMapView =
        document.getElementById("mapView");

    if (legacyMapView) {
        legacyMapView.hidden = true;
        legacyMapView.classList.remove(
            "is-open"
        );
        legacyMapView.style.display = "none";
    }

    const legacyRoutePanel =
        document.getElementById(
            "mapRoutePanel"
        );

    if (legacyRoutePanel) {
        legacyRoutePanel.hidden = true;
    }

    setTab?.("spots");
    renderSpots?.();
    renderRouteHud?.();

    window.scrollTo({
        top: 0,
        behavior: "instant",
    });
}

function cjUpdateRouteSheet({
    title,
    distance,
    duration,
    instruction,
    mode = "Preview",
}) {
    const titleEl = document.getElementById("cjRouteOverlayTitle");
    const etaEl = document.getElementById("cjRouteEta");
    const distanceEl = document.getElementById("cjRouteDistance");
    const instructionEl = document.getElementById("cjRouteInstruction");
    const badgeEl = document.getElementById("cjRouteBadge");

    const liveEtaEl = document.getElementById("cjLiveEta");
    const liveDistanceEl = document.getElementById("cjLiveDistance");

    const durationLabel = duration
        ? cjFormatRouteDuration(duration)
        : "Ruta activa";

    const distanceLabel = distance
        ? cjFormatRouteDistance(distance)
        : "Distancia calculada";

    if (titleEl && title) {
        titleEl.textContent = title;
    }

    if (etaEl) {
        etaEl.textContent = durationLabel;
    }

    if (distanceEl) {
        distanceEl.textContent = distanceLabel;
    }

    if (instructionEl) {
        instructionEl.textContent =
            instruction || "Seguí la ruta marcada en el mapa.";
    }

    if (badgeEl) {
        badgeEl.textContent = mode;
    }

    if (liveEtaEl) {
        liveEtaEl.textContent = durationLabel;
    }

    if (liveDistanceEl) {
        liveDistanceEl.textContent = distanceLabel;
    }
}

function cjClearRouteLayers() {
    const map = cjGetMapInstance();
    if (!map) return;

    if (cjRouteLine) {
        map.removeLayer(cjRouteLine);
        cjRouteLine = null;
    }

    if (cjRouteUserMarker) {
        map.removeLayer(cjRouteUserMarker);
        cjRouteUserMarker = null;
    }

    if (cjRouteDestinationMarker) {
        map.removeLayer(cjRouteDestinationMarker);
        cjRouteDestinationMarker = null;
    }
}

function cjSetRouteLiveUi(isLive = false) {
    const previewSheet = document.getElementById("cjRouteSheet");
    const liveHud = document.getElementById("cjRouteLiveHud");

    const eta = document.getElementById("cjRouteEta");
    const distance = document.getElementById("cjRouteDistance");

    const liveEta = document.getElementById("cjLiveEta");
    const liveDistance = document.getElementById("cjLiveDistance");

    cjRouteIsLive = isLive;

    document.body.classList.toggle("is-cj-live-navigation", isLive);

    if (previewSheet) {
        previewSheet.hidden = isLive;
        previewSheet.classList.toggle("is-live", isLive);
    }

    if (liveHud) {
        liveHud.hidden = !isLive;
    }

    if (isLive) {
        if (liveEta) {
            liveEta.textContent = eta?.textContent || "Ruta activa";
        }

        if (liveDistance) {
            liveDistance.textContent =
                distance?.textContent || "Distancia calculada";
        }
    }
}

function cjCreateLiveUserIcon() {
    return L.divIcon({
        className: "cj-live-user-marker-wrap",
        html: `
          <div class="cj-live-user-marker">
            <span class="cj-live-user-marker__pulse"></span>

            <img
              class="cj-live-user-marker__image"
              src="./assets/icons/route-hub.ico"
              alt=""
              onerror="
                this.hidden=true;
                this.nextElementSibling.hidden=false;
              "
            />

            <span
              class="cj-live-user-marker__fallback"
              hidden
            >
              CJ
            </span>

            <span class="cj-live-user-marker__arrow">▲</span>
          </div>
        `,
        iconSize: [72, 72],
        iconAnchor: [36, 58],
    });
}

function cjCreateDestinationIcon() {
    return L.divIcon({
        className: "cj-route-destination-marker-wrap",
        html: `
          <div
            class="cj-route-destination-marker"
            aria-label="Destino"
            title="Destino"
          >
            🏁
          </div>
        `,
        iconSize: [46, 46],
        iconAnchor: [23, 42],
        popupAnchor: [0, -40],
    });
}

function cjDrawRoutePreview(userLocation, destination, route = null) {
    const map = cjGetMapInstance();

    if (!map || !window.L || !userLocation || !destination) return;

    cjClearRouteLayers();

    const userLatLng = [userLocation.lat, userLocation.lng];
    const destLatLng = [destination.lat, destination.lng];

    cjRouteUserMarker = L.marker(userLatLng, {
        title: "Tu ubicación",
    }).addTo(map);

    cjRouteDestinationMarker = L.marker(destLatLng, {
        title: destination.title,
        icon: cjCreateDestinationIcon(),
        zIndexOffset: 900,
    }).addTo(map);

    if (route?.geometry?.coordinates?.length) {
        const points = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        cjRouteLine = L.polyline(points, {
            weight: 6,
            opacity: 0.95,
        }).addTo(map);

        map.fitBounds(cjRouteLine.getBounds(), {
            padding: [42, 42],
            maxZoom: 16,
        });

        return;
    }

    cjRouteLine = L.polyline([userLatLng, destLatLng], {
        weight: 5,
        opacity: 0.9,
        dashArray: "10, 8",
    }).addTo(map);

    map.fitBounds([userLatLng, destLatLng], {
        padding: [42, 42],
        maxZoom: 16,
    });
}

async function cjBuildRoutePreview() {
    const destination = cjGetRouteDestination();

    if (!destination) {
        toast?.("Este destino no tiene coordenadas.");
        return;
    }

    let userLocation = cjGetSavedUserLocation();

    if (!userLocation) {
        try {
            userLocation = await cjRequestUserLocation();
        } catch {
            toast?.("No se pudo activar ubicación.");
            return;
        }
    }

    cjRouteMode = "preview";
    cjRouteIsLive = false;
    cjRouteIsStarting = false;
    cjRouteFollowUser = true;

    cjMountMapIntoRouteOverlay();
    cjSetRouteLiveUi(false);

    cjUpdateRouteSheet({
        title: destination.title,
        instruction: "Calculando la mejor ruta disponible…",
        mode: "Calculando",
    });

    try {
        const route = await cjFetchOsrmRoute(userLocation, destination);

        cjRouteSteps = Array.isArray(route?.legs?.[0]?.steps)
            ? route.legs[0].steps
            : [];

        cjRouteActiveStepIndex = 0;

        // const firstStep = route?.legs?.[0]?.steps?.[0];

        const firstStep = cjRouteSteps[0] || null;

        cjDrawRoutePreview(userLocation, destination, route);

        cjUpdateRouteSheet({
            title: destination.title,
            distance: route.distance,
            duration: route.duration,
            instruction: cjRouteInstructionFromStep(firstStep),
            mode: "Ruta",
        });

        toast?.("Ruta calculada.");
    } catch (error) {
        console.error("CJ ROUTE PREVIEW ERROR:", error);

        cjRouteSteps = [];
        cjRouteActiveStepIndex = 0;

        cjDrawRoutePreview(userLocation, destination, null);

        cjUpdateRouteSheet({
            title: destination.title,
            instruction: "Ruta aproximada. No se pudo calcular carretera exacta.",
            mode: "Fallback",
        });

        toast?.("Ruta aproximada activa.");
    }
}

function cjHideLegacyMapView() {
    const mapView = document.getElementById("mapView");

    state.isMapOpen = false;
    document.body.classList.remove("is-map-open");

    if (mapView) {
        mapView.hidden = true;
        mapView.classList.remove("is-open");
    }

    renderRouteHud?.();
}

function cjSetRouteTargetOnly(entity, type = "spot") {
    const route = buildRouteUrls(entity);

    if (!route.hasCoords) {
        showRouteUnavailable(entity, route);
        return false;
    }

    state.routeTarget = {
        type,
        entity,
        route,
    };

    renderRouteHub?.();
    renderRouteHud?.();

    return true;
}

function cjOpenRouteCore(entity, type = "spot") {
    if (!entity) {
        toast?.("No se pudo activar la ruta.");
        return;
    }

    const route = buildRouteUrls(entity);

    if (!route.hasCoords) {
        showRouteUnavailable(entity, route);
        return;
    }

    /*
     * Mata cualquier ruta anterior antes de
     * cargar el nuevo spot/event/shop.
     */
    cjResetRouteSession({
        closeOverlay: false,
        clearDestination: false,
    });

    closeModal?.();

    state.routeTarget = {
        type,
        entity,
        route,
    };

    state.isMapOpen = false;

    document.body.classList.remove("is-map-open");

    const legacyMapView =
        document.getElementById("mapView");

    if (legacyMapView) {
        legacyMapView.hidden = true;
        legacyMapView.classList.remove("is-open");
        legacyMapView.style.display = "none";
    }

    cjRouteMode = "preview";

    window.setTimeout(() => {
        cjBuildRoutePreview();
    }, 120);
}

function cjWait(milliseconds) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });
}

async function cjHandleStartRoute() {
    const button = document.getElementById("btnCjRouteStart");

    if (!button) return;

    if (cjRouteMode !== "preview") { return; }

    if (cjRouteIsStarting || cjRouteIsLive) { return; }

    cjRouteIsStarting = true;

    button.disabled = true;
    button.classList.add("is-loading");
    button.textContent = "Iniciando…";

    try {
        await cjWait(900);

        const started = cjStartLiveRoute();

        if (!started) {
            throw new Error(
                "No se pudo iniciar navegación"
            );
        }
    } catch (error) {
        console.error(
            "CJ START ROUTE ERROR:",
            error
        );

        cjRouteMode = "preview";
        cjRouteIsLive = false;

        button.disabled = false;
        button.classList.remove("is-loading");
        button.textContent = "Ir ahora";

        toast?.("No se pudo iniciar la ruta.");
    } finally {
        cjRouteIsStarting = false;
    }
}

function cjFocusLiveRoute(location, {
    animate = true,
} = {}) {
    const map = cjGetMapInstance();

    if (!location || !map) return false;

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return false;
    }

    window.requestAnimationFrame(() => {
        map.invalidateSize();

        window.setTimeout(() => {
            map.flyTo(
                [lat, lng],
                17,
                {
                    animate,
                    duration: animate ? 0.8 : 0,
                }
            );

            cjRouteHasInitialLiveFocus = true;
        }, 140);
    });

    return true;
}

// function cjRecenterLiveRoute() {
//     const location = cjGetSavedUserLocation();
//     const map = cjGetMapInstance();

//     if (!location || !map) {
//         toast?.("Ubicación no disponible.");
//         return;
//     }

//     cjRouteFollowUser = true;

//     map.setView([location.lat, location.lng], 17, { animate: true, });
// }

function cjRecenterLiveRoute() {
    const location = cjGetSavedUserLocation();

    if (!location) {
        toast?.("Ubicación no disponible.");
        return;
    }

    cjRouteFollowUser = true;

    cjFocusLiveRoute(location, {
        animate: true,
    });
}

function cjStartLiveRoute() {
    const destination =
        cjGetRouteDestination();

    if (!destination) {
        toast?.("No hay destino activo.");
        return false;
    }

    if (!navigator.geolocation) {
        toast?.(
            "Geolocalización no soportada."
        );

        return false;
    }

    if (cjRouteWatchId !== null) {
        navigator.geolocation.clearWatch(
            cjRouteWatchId
        );

        cjRouteWatchId = null;
    }

    cjRouteMode = "live";
    cjRouteIsLive = true;
    cjRouteIsStarting = false;
    cjRouteFollowUser = true;
    cjRouteHasInitialLiveFocus = false;
    document.body.classList.add(
        "is-cj-live-navigation"
    );

    cjUpdateRouteSheet({
        title: destination.title,
        instruction:
            cjRouteInstructionFromStep(
                cjRouteSteps[
                cjRouteActiveStepIndex
                ]
            ),
        mode: "En vivo",
    });

    cjSetRouteLiveUi(true);

    const recenterButton =
        document.getElementById(
            "btnCjRouteRecenter"
        );

    if (recenterButton) {
        recenterButton.hidden = false;
    }

    // const savedLocation =
    //     cjGetSavedUserLocation();

    // const map = cjGetMapInstance();

    // if (savedLocation && map) {
    //     map.flyTo(
    //         [
    //             savedLocation.lat,
    //             savedLocation.lng,
    //         ],
    //         17,
    //         {
    //             animate: true,
    //             duration: 0.8,
    //         }
    //     );
    // }

    const savedLocation = cjGetSavedUserLocation();

    if (savedLocation) {
        cjFocusLiveRoute(savedLocation, {
            animate: true,
        });
    }

    cjRouteWatchId =
        navigator.geolocation.watchPosition(
            (position) => {
                const currentLocation =
                    cjSaveUserLocation(position);

                const liveMap =
                    cjGetMapInstance();

                if (!liveMap || !window.L) {
                    return;
                }

                const userLatLng = [
                    currentLocation.lat,
                    currentLocation.lng,
                ];

                if (cjRouteUserMarker) {
                    cjRouteUserMarker.setLatLng(
                        userLatLng
                    );

                    cjRouteUserMarker.setIcon(
                        cjCreateLiveUserIcon()
                    );
                } else {
                    cjRouteUserMarker = L.marker(
                        userLatLng,
                        {
                            title:
                                "Tu ubicación",
                            icon:
                                cjCreateLiveUserIcon(),
                            zIndexOffset: 1000,
                        }
                    ).addTo(liveMap);
                }

                if (!cjRouteHasInitialLiveFocus) {
                    liveMap.invalidateSize();

                    liveMap.setView(
                        userLatLng,
                        17,
                        {
                            animate: false,
                        }
                    );

                    cjRouteHasInitialLiveFocus = true;
                } else if (cjRouteFollowUser) {
                    liveMap.panTo(
                        userLatLng,
                        {
                            animate: true,
                            duration: 0.6,
                        }
                    );
                }
            },
            (error) => {
                console.error(
                    "CJ LIVE LOCATION ERROR:",
                    error
                );

                toast?.(
                    "No se pudo seguir tu ubicación en vivo."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 3000,
            }
        );

    toast?.("Navegación iniciada.");

    return true;
}

/* =========================================
            MAIN MENU
========================================= */

function openSpot(s) {
    modalInfo(
        s.name,
        `
      <div class="detail-modal">
        <div class="detail-hero">
          ${renderMediaBlock(s, "spot")}
        </div>

        <div class="detail-grid">
          <div><strong>Zona:</strong> ${escapeHtml(s.zone || s.city || "—")}</div>
          <div><strong>Descripción:</strong> ${escapeHtml(s.description || "Sin descripción")}</div>
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary" type="button" id="btnRouteFromModal">
            Ruta
          </button>
        </div>
      </div>
    `
    );

    setTimeout(() => {
        $("#btnRouteFromModal")?.addEventListener("click", () => {
            cjOpenRouteCore(s, "spot");
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
    modalInfo(
        e.title,
        `
      <div class="detail-modal">
        <div class="detail-hero event-detail-hero">          
            ${renderMediaBlock(e, "event")}
        </div>

        <div class="detail-grid">
          <div><strong>Lugar:</strong> ${escapeHtml(e.place || "—")}</div>
          <div><strong>Hora:</strong> ${escapeHtml(e.time || "—")}</div>
          <div><strong>Descripción:</strong> ${escapeHtml(e.description || e.format || "Sin descripción")}</div>
        </div>

        <div class="detail-actions">
          <button class="btn btn-secondary" type="button" id="btnRouteEventFromModal">
            Ruta
          </button>
        </div>
        </div>
      </div>
    `
    );

    setTimeout(() => {
        $("#btnRouteEventFromModal")?.addEventListener("click", () => {
            cjOpenRouteCore(e, "event");
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

    modalInfo(
        shop.name,
        `
      <div class="detail-modal">
        <div class="detail-hero shop-detail-hero">
          ${renderMediaBlock(shop, "shop")}
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

        <button class="btn btn-secondary" type="button" id="btnRouteShopFromModal">
            Ruta
        </button>
        </div>
      </div>
    `
    );

    setTimeout(() => {
        $("#btnRouteShopFromModal")?.addEventListener("click", () => {
            activateRouteTarget(shop, "shop");
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
        updateRouteStatus("Tu navegador no soporta ubicación.");
        toast("Geolocalización no soportada");
        return;
    }

    pulseBusy("Ubicación…", "Obteniendo coordenadas");

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            hideBusy();

            userLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };

            if (realMap && window.L) {
                if (userMarker) {
                    userMarker.setLatLng([userLocation.lat, userLocation.lng]);
                } else {
                    userMarker = L.marker([userLocation.lat, userLocation.lng]).addTo(realMap);
                    userMarker.bindPopup("Tu ubicación");
                }

                realMap.setView([userLocation.lat, userLocation.lng], 14);
            }

            if (activeRouteSpot) {
                drawInternalRoute();

                const spotCoords = getSpotCoords(activeRouteSpot);
                const distance = getDistanceKm(userLocation, spotCoords);

                updateRouteStatus(`Ruta activa · ${formatDistance(distance)} desde tu ubicación.`);
            } else {
                updateRouteStatus("Ubicación activa. Seleccioná un spot para crear ruta.");
            }

            toast("Ubicación activada");
        },
        () => {
            hideBusy();
            updateRouteStatus("No se pudo obtener tu ubicación. El mapa sigue funcionando.");
            toast("No se pudo obtener ubicación");
        },
        {
            enableHighAccuracy: true,
            timeout: 8000,
        }
    );
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

function escapeAttr(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function renderMediaBlock(entity, type = "spot") {
    const image =
        entity.image ||
        entity.imageUrl ||
        entity.photo ||
        entity.photoUrl ||
        "";

    const title =
        entity.name ||
        entity.title ||
        "Callejeandola";

    if (!image) {
        return `
      <div class="entity-media entity-media--${type} is-fallback">
        <div class="entity-media__mark">CJ</div>
        <span>${escapeHtml(title)}</span>
      </div>
    `;
    }

    return `
    <div class="entity-media entity-media--${type}">
      <img
        src="${escapeAttr(image)}"
        alt="${escapeAttr(title)}"
        loading="lazy"
        onerror="this.remove(); this.parentElement.classList.add('is-fallback');"
      >
      <div class="entity-media__mark">CJ</div>
      <span>${escapeHtml(title)}</span>
    </div>
  `;
}

function getEntityCoords(entity) {
    const lat = Number(
        entity.lat ??
        entity.latitude ??
        entity.locationLat ??
        0
    );

    const lng = Number(
        entity.lng ??
        entity.long ??
        entity.longitude ??
        entity.locationLng ??
        0
    );

    const hasCoords =
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        !(lat === 0 && lng === 0);

    return {
        lat,
        lng,
        hasCoords,
    };
}

function getEntityTitle(entity) {
    return (
        entity.name ||
        entity.title ||
        entity.place ||
        "Callejeandola location"
    );
}

function buildRouteUrls(entity) {
    const coords = getEntityCoords(entity);
    const title = getEntityTitle(entity);

    if (!coords.hasCoords) {
        return {
            hasCoords: false,
            title,
            lat: coords.lat,
            lng: coords.lng,
            googleMapsUrl: "",
            wazeUrl: "",
        };
    }

    const destination = `${coords.lat},${coords.lng}`;

    return {
        hasCoords: true,
        title,
        lat: coords.lat,
        lng: coords.lng,
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
        wazeUrl: `https://www.waze.com/ul?ll=${encodeURIComponent(destination)}&navigate=yes`,
    };
}

function openExternalUrl(url) {
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
}

function openRoute(entity) {
    const route = buildRouteUrls(entity);

    if (!route.hasCoords) {
        showRouteUnavailable(entity, route);
        return;
    }

    modalInfo(
        "Cómo llegar",
        `
      <div class="route-modal route-modal--ready">
        <div class="route-modal__mark">CJ</div>

        <h3>${escapeHtml(route.title)}</h3>

        <p class="muted">
          Elegí tu app para llegar al spot.
        </p>

        <div class="route-modal__actions">
          <button class="btn btn-primary" type="button" id="btnRouteWaze">
            Abrir Waze
          </button>

          <button class="btn btn-secondary" type="button" id="btnRouteGoogle">
            Google Maps
          </button>
        </div>
      </div>
    `
    );

    setTimeout(() => {
        $("#btnRouteWaze")?.addEventListener("click", () => {
            openExternalUrl(route.wazeUrl);
        });

        $("#btnRouteGoogle")?.addEventListener("click", () => {
            openExternalUrl(route.googleMapsUrl);
        });
    }, 0);
}

function showRouteUnavailable(entity, route = buildRouteUrls(entity)) {
    modalInfo(
        "Ruta no disponible",
        `
      <div class="route-modal">
        <div class="route-modal__mark">CJ</div>

        <h3>${escapeHtml(route.title || getEntityTitle(entity))}</h3>

        <p class="muted">
          Este lugar todavía no tiene coordenadas válidas.
          Agregá lat/lng desde el Admin para habilitar navegación.
        </p>

        <div class="route-modal__coords">
          <span>Lat: ${escapeHtml(String(route.lat || 0))}</span>
          <span>Lng: ${escapeHtml(String(route.lng || 0))}</span>
        </div>
      </div>
    `
    );
}

function activateRouteTarget(entity, type = "spot") {
    const route = buildRouteUrls(entity);

    if (!route.hasCoords) {
        showRouteUnavailable(entity, route);
        return;
    }

    state.routeTarget = {
        type,
        entity,
        route,
    };

    closeModal();

    if (typeof openMapView === "function") {
        openMapView();
    }

    renderRouteHub();
    renderActiveRouteOnMap();

    const hub = $("#btnRouteHub");

    if (hub) {
        hub.classList.remove("is-pulsing");
        void hub.offsetWidth;
        hub.classList.add("is-pulsing");

        clearTimeout(state.routePulseTimer);

        state.routePulseTimer = setTimeout(() => {
            hub.classList.remove("is-pulsing");
        }, 1400);
    }

    toast(`Ruta lista: ${route.title}`);
    renderRouteHud();
}

function renderActiveRouteOnMap() {
    const panel = $("#mapRoutePanel");
    const target = state.routeTarget;

    if (!panel) return;

    if (!target?.route?.hasCoords) {
        panel.hidden = true;
        renderRouteHud?.();
        return;
    }

    const { route, type } = target;

    panel.hidden = false;

    panel.innerHTML = `
      <div class="route-preview route-preview--internal">
        <div class="route-preview__icon">↗</div>

        <div class="route-preview__content">
          <span class="map-route-panel__label">Ruta activa</span>
          <strong>${escapeHtml(route.title)}</strong>
          <p class="muted">
            ${escapeHtml(type || "spot")} · Callejeandola map
          </p>

          <div class="map-route-status" id="mapRouteStatus">
            <span class="map-route-status__dot"></span>
            <span id="mapRouteStatusText">Ruta activa dentro de Callejeandola.</span>
          </div>

          <div class="map-route-panel__coords" id="mapRouteCoords">
            <span id="mapRouteLat">Lat: ${escapeHtml(String(route.lat))}</span>
            <span id="mapRouteLng">Lng: ${escapeHtml(String(route.lng))}</span>
          </div>
        </div>
      </div>
    `;

    activeRouteSpot = target.entity || null;

    renderRouteHud?.();
    drawInternalRoute?.();
}

function renderRouteHud() {
    const hud = document.getElementById("routeHud");
    const title = document.getElementById("routeHudTitle");

    const route = state.routeTarget?.route;

    if (!hud || !title) return;

    if (!route?.hasCoords) {
        hud.hidden = true;
        return;
    }

    hud.hidden = false;
    title.textContent = route.title || "Spot listo para llegar";
}

function bindRouteHub() {
    const hub = $("#btnRouteHub");

    if (hub) {
        hub.addEventListener("click", () => {
            if (!state.routeTarget?.entity) {
                toast("Busca un spot");
                setTab("spots");
                return;
            }

            showMapView();
            renderRouteHub();
            renderActiveRouteOnMap();

            toast(`Ruta activa: ${state.routeTarget.route.title}`);
        });
    }

    $("#btnMapRouteWaze")?.addEventListener("click", () => {
        const route = state.routeTarget?.route;

        if (!route?.hasCoords) {
            toast("No hay ruta activa");
            return;
        }

        openExternalUrl(route.wazeUrl);
    });

    $("#btnMapRouteGoogle")?.addEventListener("click", () => {
        const route = state.routeTarget?.route;

        if (!route?.hasCoords) {
            toast("No hay ruta activa");
            return;
        }

        openExternalUrl(route.googleMapsUrl);
    });
}

function renderRouteHub() {
    const hub = $("#btnRouteHub");

    if (!hub) return;

    const hasRoute = Boolean(state.routeTarget?.route?.hasCoords);

    hub.classList.toggle("is-ready", hasRoute);

    hub.setAttribute(
        "title",
        hasRoute
            ? `Ruta activa: ${state.routeTarget.route.title}`
            : "Busca spots y patinalos"
    );
}

async function refreshEngagementUi() {
    await loadEngagementFromApi();

    renderSpots();
    renderEvents();
    renderFavorites();
    renderSavedEvents();
    updateKpis();
    updateProfileCounts();
}

function updateRouteStatus(message) {
    const status = document.getElementById("mapRouteStatusText");
    if (status) status.textContent = message;
}

function updateRouteCoords(spot) {
    const coordsBox = document.getElementById("mapRouteCoords");
    const latEl = document.getElementById("mapRouteLat");
    const lngEl = document.getElementById("mapRouteLng");

    const lat = Number(spot?.lat);
    const lng = Number(spot?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        if (coordsBox) coordsBox.hidden = true;
        return;
    }

    if (latEl) latEl.textContent = `Lat: ${lat.toFixed(5)}`;
    if (lngEl) lngEl.textContent = `Lng: ${lng.toFixed(5)}`;
    if (coordsBox) coordsBox.hidden = false;
}

function buildWazeUrl(spot) {
    const lat = Number(spot?.lat);
    const lng = Number(spot?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

function buildGoogleMapsUrl(spot) {
    const lat = Number(spot?.lat);
    const lng = Number(spot?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
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

function cjOpenRouteOverlayFromCurrentTarget() {
    if (!state?.routeTarget?.entity) {
        toast?.("Seleccioná un spot para activar ruta.");
        setTab?.("spots");
        return;
    }

    state.isMapOpen = false;
    document.body.classList.remove("is-map-open");

    const mapView = document.getElementById("mapView");
    if (mapView) {
        mapView.hidden = true;
        mapView.classList.remove("is-open");
        mapView.style.display = "none";
    }

    const routePanel = document.getElementById("mapRoutePanel");
    if (routePanel) {
        routePanel.hidden = true;
    }

    setTimeout(() => {
        cjBuildRoutePreview();
    }, 80);
}

function openMapView() {
    cjOpenRouteOverlayFromCurrentTarget();
}

function showMapView() {
    cjOpenRouteOverlayFromCurrentTarget();
}

function hideMapView() {
    const mapView = $("#mapView");

    state.isMapOpen = false;
    document.body.classList.remove("is-map-open");

    if (mapView) {
        mapView.hidden = true;
    }
}

function closeMapView() {
    state.isMapOpen = false;

    document.body.classList.remove("is-map-open");
    document.body.classList.remove("is-route-core");
    document.body.classList.remove("is-route-experience");

    const mapView = document.getElementById("mapView");
    if (mapView) {
        mapView.hidden = true;
        mapView.classList.remove("is-open");
        mapView.style.display = "none";
    }

    const routePanel = document.getElementById("mapRoutePanel");
    if (routePanel) {
        routePanel.hidden = true;
    }

    setTab?.("spots");
}

function getSpotCoords(spot) {
    const lat = Number(spot?.lat);
    const lng = Number(spot?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return { lat, lng };
}

function getDistanceKm(from, to) {
    if (!from || !to) return null;

    const earthRadiusKm = 6371;

    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLng = ((to.lng - from.lng) * Math.PI) / 180;

    const lat1 = (from.lat * Math.PI) / 180;
    const lat2 = (to.lat * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

function formatDistance(distanceKm) {
    if (!Number.isFinite(distanceKm)) return "Distancia no disponible";

    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m aprox.`;
    }

    return `${distanceKm.toFixed(1)} km aprox.`;
}

function setActiveRouteSpot(spot) {
    const coords = getSpotCoords(spot);

    if (!coords) {
        updateRouteStatus("Este spot no tiene coordenadas todavía.");
        toast("Este spot no tiene coordenadas");
        return;
    }

    activeRouteSpot = spot;

    const hud = document.getElementById("routeHud");
    const title = document.getElementById("routeHudTitle");
    const mapRouteTitle = document.getElementById("mapRouteTitle");
    const mapRouteMeta = document.getElementById("mapRouteMeta");
    const mapRoutePanel = document.getElementById("mapRoutePanel");

    if (hud) hud.hidden = false;
    if (mapRoutePanel) mapRoutePanel.hidden = false;

    if (title) title.textContent = spot.name || "Spot seleccionado";
    if (mapRouteTitle) mapRouteTitle.textContent = spot.name || "Spot seleccionado";

    const baseMeta = `${spot.city || spot.zone || "Costa Rica"} · ${spot.type || "Spot"}`;

    if (mapRouteMeta) {
        mapRouteMeta.textContent = baseMeta;
    }

    updateRouteCoords(spot);

    if (userLocation) {
        const distance = getDistanceKm(userLocation, coords);
        updateRouteStatus(`Ruta activa · ${formatDistance(distance)} desde tu ubicación.`);
    } else {
        updateRouteStatus("Ruta activa. Activá tu ubicación para calcular distancia.");
    }

    drawInternalRoute();

    if (realMap) {
        realMap.setView([coords.lat, coords.lng], 15);
        setTimeout(() => realMap.invalidateSize(), 80);
    }

    toast(`Ruta activa: ${spot.name}`);
}

function drawInternalRoute() {
    if (!realMap || !window.L) return;

    const route = state.routeTarget?.route;

    if (!route?.hasCoords) return;

    const spotCoords = {
        lat: Number(route.lat),
        lng: Number(route.lng),
    };

    if (!Number.isFinite(spotCoords.lat) || !Number.isFinite(spotCoords.lng)) return;

    if (activeRouteLine) {
        realMap.removeLayer(activeRouteLine);
        activeRouteLine = null;
    }

    if (!userLocation) {
        realMap.setView([spotCoords.lat, spotCoords.lng], 15);
        updateRouteStatus?.("Ruta activa. Activá tu ubicación para calcular distancia.");
        return;
    }

    activeRouteLine = L.polyline(
        [
            [userLocation.lat, userLocation.lng],
            [spotCoords.lat, spotCoords.lng],
        ],
        {
            color: "#22d3ee",
            weight: 5,
            opacity: 0.86,
            dashArray: "10 10",
        }
    ).addTo(realMap);

    const distance = getDistanceKm(userLocation, spotCoords);

    updateRouteStatus?.(`Ruta activa · ${formatDistance(distance)} desde tu ubicación.`);

    realMap.fitBounds(activeRouteLine.getBounds(), {
        padding: [42, 42],
        maxZoom: 15,
    });
}

/* =========================================
   MOBILE ENTRY FLOW — QR / SPLASH / LOCATION
========================================= */

function isDesktopEntryDevice() {
    return window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
}

function showDesktopQrGate() {
    const gate = document.getElementById("desktopQrGate");
    if (!gate) return;

    gate.hidden = false;
    document.body.classList.add("is-desktop-qr-mode");
}

function hideMobileSplash() {
    const splash = document.getElementById("mobileSplash");
    if (!splash) return;

    splash.classList.add("is-leaving");

    setTimeout(() => {
        splash.hidden = true;
        splash.classList.remove("is-leaving");
    }, 280);
}

function showMobileSplash() {
    const splash = document.getElementById("mobileSplash");
    if (!splash) return;

    splash.hidden = false;

    setTimeout(() => {
        hideMobileSplash();
        showLocationGateIfNeeded();
    }, 1600);
}

function showLocationGateIfNeeded() {
    const alreadyAsked = localStorage.getItem("cj_location_prompt_seen") === "true";
    const gate = document.getElementById("locationGate");

    if (!gate || alreadyAsked) return;

    gate.hidden = false;
    document.body.classList.add("is-location-gate-open");
}

function closeLocationGate() {
    const gate = document.getElementById("locationGate");
    if (!gate) return;

    gate.hidden = true;
    document.body.classList.remove("is-location-gate-open");
    localStorage.setItem("cj_location_prompt_seen", "true");
}

function cjSaveUserLocation(position) {
    const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        savedAt: new Date().toISOString(),
    };

    localStorage.setItem("cj_user_location", JSON.stringify(location));
    return location;
}

function requestEntryLocation() {
    localStorage.setItem("cj_location_prompt_seen", "true");

    cjRequestUserLocation()
        .then(() => {
            toast?.("Ubicación activada.");
            closeLocationGate();
        })
        .catch(() => {
            toast?.("No se pudo activar ubicación.");
            closeLocationGate();
        });
}

function bindMobileEntryFlow() {
    document.getElementById("btnEnableLocation")?.addEventListener("click", () => {
        requestEntryLocation();
    });

    document.getElementById("btnSkipLocation")?.addEventListener("click", () => {
        closeLocationGate();
    });
}

function initMobileEntryFlow() {
    bindMobileEntryFlow();

    if (isDesktopEntryDevice()) {
        showDesktopQrGate();
        return;
    }

    showMobileSplash();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileEntryFlow);
} else {
    initMobileEntryFlow();
}
