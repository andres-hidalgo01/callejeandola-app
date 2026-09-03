const IS_LOCAL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

export const API_BASE_URL =
    window.__ADMIN_API__ ||
    window.CALLEJEANDOLA_ADMIN_CONFIG?.API_URL ||
    (
        IS_LOCAL
            ? "http://localhost:4000/api"
            : "https://callejeandola-api.onrender.com/api"
    );