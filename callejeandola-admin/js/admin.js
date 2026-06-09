import { getSpots } from "./api/spots.api.js";
import { getShops } from "./api/shops.api.js";
import { getSponsors } from "./api/sponsors.api.js";
import { getEvents } from "./api/events.api.js";

import { state } from "./state/state.js";

import { initDebugService } from "./services/debug.service.js";

import {
  initNavigation,
  restoreActiveView,
} from "./services/navigation.service.js";

import { initModalService } from "./services/modal.service.js";
import { showToast } from "./services/toast.service.js";
import { renderDashboard } from "./views/dashboard.view.js";

import {
  getValue,
  getNumberValue,
  getChecked,
} from "./utils/form.js";

import {
  escapeHtml,
  escapeAttr,
} from "./utils/sanitize.js";

import {
  formatDate,
  formatDateTimeLocal,
} from "./utils/format.js";

import {
  renderImage,
} from "./utils/dom.js";

import {
  renderSpotsTable,
  bindSpotTableActions,
  bindSpotCreateButton,
  handleSpotSubmit,
} from "./views/spots.view.js";

import {
  renderShopsTable,
  bindShopTableActions,
  bindShopCreateButton,
  handleShopSubmit,
} from "./views/shops.view.js";

import {
  renderSponsorsTable,
  bindSponsorTableActions,
  bindSponsorCreateButton,
  handleSponsorSubmit,
} from "./views/sponsors.view.js";

import {
  renderEventsTable,
  bindEventCreateButton,
  bindEventTableActions,
  handleEventSubmit,
} from "./views/events.view.js";

import {
  login,
  getMe,
} from "./api/auth.api.js";

import {
  setSession,
  clearSession,
  hasSession,
  getStoredUser,
} from "./services/session.service.js";

import { getUsers } from "./api/users.api.js";

import {
  renderUsersTable,
  bindUserTableActions,
  handleUserSubmit,
} from "./views/users.view.js";

document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
  initNavigation();

  initModalService({
    onSubmit: handleEntitySubmit,
  });

  bindAuthActions();
  bindRefresh();

  const isAuthenticated = await bootstrapSession();

  if (!isAuthenticated) {
    showLoginView();
    return;
  }

  showAdminView();

  await loadAllData();
  renderAll();

  restoreActiveView();
}

function bindAuthActions() {
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");

  if (btnLogin) {
    btnLogin.onclick = async (event) => {
      event.preventDefault();
      event.stopPropagation();

      await handleLogin();
    };
  }

  if (btnLogout) {
    btnLogout.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      handleLogout();
    };
  } else {
    console.warn("btnLogout no encontrado en el DOM");
  }
}

async function bootstrapSession() {
  if (!hasSession()) {
    return false;
  }

  const storedUser = getStoredUser();

  if (storedUser) {
    state.currentUser = storedUser;
    updateSessionUI(storedUser);
  }

  try {
    const result = await getMe();

    state.currentUser = result.user;
    updateSessionUI(result.user);

    return true;
  } catch (error) {
    console.error("Session bootstrap error:", error);

    clearSession();
    state.currentUser = null;

    return false;
  }
}

async function handleLogin() {
  try {
    const email = document.getElementById("loginEmail")?.value?.trim();
    const password = document.getElementById("loginPassword")?.value?.trim();

    if (!email || !password) {
      showToast("Email y password son obligatorios");
      return;
    }

    const result = await login({
      email,
      password,
    });

    setSession(result.token, result.user);

    state.currentUser = result.user;

    updateSessionUI(result.user);
    showAdminView();

    await loadAllData();
    renderAll();
    restoreActiveView();

    showToast("Sesión iniciada correctamente");
  } catch (error) {
    console.error("Login admin error:", error);
    showToast(error.message || "Error iniciando sesión");
  }
}

function handleLogout() {
  clearSession();

  state.currentUser = null;

  localStorage.removeItem("cj_admin_active_view");

  showLoginView();

  showToast("Sesión cerrada");
}

function updateSessionUI(user) {
  const role = document.getElementById("sessionRole");
  const sessionUser = document.getElementById("sessionUser");

  if (role) {
    role.textContent = user?.role || "NO_ROLE";
  } else {
    console.warn("sessionRole no encontrado en el DOM");
  }

  if (sessionUser) {
    sessionUser.textContent = user?.email || "Sin sesión";
  } else {
    console.warn("sessionUser no encontrado en el DOM");
  }

  applyRoleAccess(user);
}

function applyRoleAccess(user) {
  const role = user?.role || "USER";
  const navItems = document.querySelectorAll(".nav__item[data-roles]");

  navItems.forEach((item) => {
    const allowedRoles = item.dataset.roles
      .split(",")
      .map((itemRole) => itemRole.trim());

    const isAllowed = allowedRoles.includes(role);

    item.hidden = !isAllowed;
    item.disabled = !isAllowed;
  });

  const activeItem = document.querySelector(".nav__item.is-active");

  if (activeItem?.hidden) {
    localStorage.setItem("cj_admin_active_view", "dashboard");
  }
}

function showLoginView() {
  const loginView = document.getElementById("loginView");
  const adminApp = document.getElementById("adminApp");

  if (loginView) {
    loginView.hidden = false;
  }

  if (adminApp) {
    adminApp.hidden = true;
  }
}

function showAdminView() {
  const loginView = document.getElementById("loginView");
  const adminApp = document.getElementById("adminApp");

  if (loginView) {
    loginView.hidden = true;
  }

  if (adminApp) {
    adminApp.hidden = false;
  }
}

/* =========================
   LOAD DATA
========================= */
async function loadAllData() {
  try {
    const [spots, shops, sponsors, events] = await Promise.all([
      getSpots(),
      getShops(),
      getSponsors(),
      getEvents(),
    ]);

    state.spots = spots;
    state.shops = shops;
    state.sponsors = sponsors;
    state.events = events;

    if (state.currentUser?.role === "GLOBAL_ADMIN") {
      state.users = await getUsers();
    } else {
      state.users = [];
    }
  } catch (error) {
    console.error("Error loading admin data:", error);
    showToast(error.message || "Error cargando datos desde la API");
  }
}

async function reloadAdmin() {
  await loadAllData();
  renderAll();
}
/* =========================
   NAVIGATION
========================= */
function bindRefresh() {
  const btnRefresh = document.getElementById("btnRefresh");

  if (!btnRefresh) return;

  btnRefresh.addEventListener("click", async () => {
    btnRefresh.disabled = true;
    btnRefresh.textContent = "Loading...";

    await reloadAdmin();

    btnRefresh.disabled = false;
    btnRefresh.textContent = "Refresh";

    showToast("Datos actualizados");
  });
}
/* =========================
   RENDER ALL
========================= */
function renderAll() {
  renderDashboard();

  renderSpotsTable();
  renderShopsTable();
  renderSponsorsTable();
  renderEventsTable();
  renderUsersTable();

  bindSpotCreateButton();
  bindShopCreateButton();
  bindSponsorCreateButton();
  bindEventCreateButton();

  bindSpotTableActions();
  bindShopTableActions();
  bindSponsorTableActions();
  bindEventTableActions();
  bindUserTableActions();
}

/* =========================
   MODAL BASE
========================= */
async function handleEntitySubmit() {
  if (state.modalEntity === "spot") {
    await handleSpotSubmit();
    return;
  }

  if (state.modalEntity === "shop") {
    await handleShopSubmit();
    return;
  }

  if (state.modalEntity === "sponsor") {
    await handleSponsorSubmit();
    return;
  }

  if (state.modalEntity === "event") {
    await handleEventSubmit();
    return;
  }

  if (state.modalEntity === "user") {
    await handleUserSubmit();
    return;
  }

  showToast("Acción no configurada");
}

