const IS_LOCAL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

export const API_BASE =
    window.__API__ ||
    (
        IS_LOCAL
            ? "http://localhost:4000/api"
            : "https://callejeandola-api.onrender.com/api"
    );

async function safeFetch(path, { method = "GET", body, headers = {} } = {}) {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        return {
            ok: false,
            error: String(err),
        };
    }
}

export const api = {
    getSpots: () => safeFetch("/spots"),
    getEvents: () => safeFetch("/events"),
    getShops: () => safeFetch("/shops"),
    getSponsors: () => safeFetch("/sponsors"),

    createSpot: (payload) =>
        safeFetch("/spots", {
            method: "POST",
            body: payload,
        }),

    createEvent: (payload) =>
        safeFetch("/events", {
            method: "POST",
            body: payload,
        }),

    createShop: (payload) =>
        safeFetch("/shops", {
            method: "POST",
            body: payload,
        }),
};

