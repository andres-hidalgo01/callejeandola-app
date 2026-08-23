export const API_BASE_URL =
    window.__API__ ||
    window.CALLEJEANDOLA_CONFIG?.API_URL ||
    localStorage.getItem("CJ_API_BASE") ||
    "https://callejeandola-api.onrender.com/api";