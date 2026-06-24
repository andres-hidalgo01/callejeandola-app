const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

window.__API__ = isLocal
    ? "http://localhost:4000/api"
    : "https://api.callejeandola.com/api";

window.CALLEJEANDOLA_CONFIG = {
    API_URL: window.__API__,
};