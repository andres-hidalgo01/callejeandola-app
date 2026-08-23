export const API_BASE_URL =
    window.__ADMIN_API__ ||
    window.CALLEJEANDOLA_ADMIN_CONFIG?.API_URL ||
    localStorage.getItem("CJ_ADMIN_API_BASE") ||
    "https://callejeandola-api.onrender.com/api";