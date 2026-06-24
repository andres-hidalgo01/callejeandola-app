const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

window.__ADMIN_API__ = isLocal
    ? "http://localhost:4000/api"
    : "https://api.callejeandola.com/api";

window.CALLEJEANDOLA_ADMIN_CONFIG = {
    API_URL: window.__ADMIN_API__,
};