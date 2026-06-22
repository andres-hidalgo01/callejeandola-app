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
        <button type="button" id="${buttonId}">Route</button>
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
        activateRouteTarget(item.mapType || "spot", item);
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

    // $("#btnCloseMap")?.addEventListener("click", closeMapView);

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

        <button class="icon-btn ${fav ? "is-active" : ""}" id="fav_${s.id}" type="button" aria-label="Favorito">
          ${fav ? "♥" : "♡"}
        </button>
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
        class="btn btn-secondary ${saved ? "is-saved" : ""}"
        type="button"
        data-save-event="${e.id}"
      >
        ${saved ? "Quitar" : "Guardar"}
        </button>
    `
        : "";

    return `
    <article class="card event-card">
      ${renderMediaBlock(e, "event")}

      <div class="card__body">
        <div class="card__meta">
          <span class="badge">${escapeHtml(e.month || "JUN")} ${escapeHtml(e.day || "20")}</span>
          <span class="badge badge--soft">${Number(e.price || 0) === 0 ? "Free" : "Paid"}</span>
        </div>

        <h3 class="event__title">${escapeHtml(e.title || e.name || "Evento")}</h3>

        <p class="muted">📍 ${escapeHtml(e.place || e.city || "-")}</p>
        <p class="muted micro">⏱ ${escapeHtml(e.time || "-")}</p>

        <div class="card__actions">
          <button class="btn btn-primary" type="button" data-event="${e.id}">
            Detalles
          </button>

          ${saveButton}
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
    modalInfo(
        s.name,
        `
      <div class="detail-modal">
        <div class="detail-hero">
          ${renderMediaBlock(s, "spot")}
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
            activateRouteTarget(s, "spot");
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

        <div class="detail-meta">
          <span class="badge">${escapeHtml(e.month || "—")} ${escapeHtml(e.day || "")}</span>
          <span class="badge badge--soft">${Number(e.price || 0) === 0 ? "Free" : "Paid"}</span>
          <span class="badge">${escapeHtml(e.category || "Event")}</span>
        </div>

        <div class="detail-grid">
          <div><strong>Lugar:</strong> ${escapeHtml(e.place || "—")}</div>
          <div><strong>Hora:</strong> ${escapeHtml(e.time || "—")}</div>
          <div><strong>Descripción:</strong> ${escapeHtml(e.description || e.format || "Sin descripción")}</div>
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary" type="button" id="btnSaveEventFromModal">
            Guardar
          </button>

          <button class="btn btn-secondary" type="button" id="btnRouteEventFromModal">
            Route
          </button>
        </div>
        </div>
      </div>
    `
    );

    setTimeout(() => {
        $("#btnRouteEventFromModal")?.addEventListener("click", () => {
            activateRouteTarget(e, "event");
        });

        setTimeout(() => {
            $("#btnRouteEventFromModal")?.addEventListener("click", () => {
                openRoute(e);
            });
        }, 0);

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

        <button class="btn btn-secondary" type="button" id="btnRouteShopFromModal">
            Route
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

    if (!panel) return;

    const target = state.routeTarget;

    if (!target?.route?.hasCoords) {
        panel.hidden = true;
        panel.innerHTML = "";
        return;
    }

    const { route, type } = target;

    panel.hidden = false;

    panel.innerHTML = `
    <div class="route-preview">

      <div class="route-preview__content">
        <span class="map-route-panel__label">Ruta activa</span>

        <strong>${escapeHtml(route.title)}</strong>

        <div class="route-app-actions">
          <button class="route-app-btn route-app-btn--waze" type="button" id="btnMapRouteWaze">
            <span class="route-app-btn__icon">↗</span>
            <span>Waze</span>
          </button>

          <button class="route-app-btn route-app-btn--maps" type="button" id="btnMapRouteGoogle">
            <span class="route-app-btn__icon">⌖</span>
            <span>Maps</span>
          </button>
        </div>
      </div>
    </div>
  `;

    $("#btnMapRouteWaze")?.addEventListener("click", () => {
        openExternalUrl(route.wazeUrl);
    });

    $("#btnMapRouteGoogle")?.addEventListener("click", () => {
        openExternalUrl(route.googleMapsUrl);
    });

    $("#mapRoutePanel")?.setAttribute("hidden", "");
    renderRouteHud?.();
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
    showMapView();

    setTimeout(() => {
        renderRealMapMarkers();
    }, 120);
}

function showMapView() {
    const mapView = $("#mapView");

    state.isMapOpen = true;
    document.body.classList.add("is-map-open");

    if (mapView) {
        mapView.hidden = false;
    }

    renderActiveRouteOnMap();
    renderRouteHud();

    setTimeout(() => {
        renderRealMapMarkers();
    }, 120);

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
    const mapView = $("#mapView");

    state.isMapOpen = false;

    document.body.classList.remove("is-map-open");

    if (mapView) {
        mapView.hidden = true;
        mapView.classList.remove("is-open");
    }

    setTab(state.currentTab || "spots");
}