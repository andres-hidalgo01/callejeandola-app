export const API_BASE =
    window.__API__ ||
    localStorage.getItem("CJ_API_BASE") ||
    "http://localhost:3001/api";

async function safeFetch(path, { method = "GET", body, headers } = {}) {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(headers || {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

export const api = {
    getSpots: () => safeFetch("/spots"),
    getClips: () => safeFetch("/clips"),
    getEvents: () => safeFetch("/events"),
    getSponsors: () => safeFetch("/sponsors"),

    createSpot: (payload) => safeFetch("/spots", { method: "POST", body: payload }),
    createEvent: (payload) => safeFetch("/events", { method: "POST", body: payload }),
    reportSpot: (spotId, payload) => safeFetch(`/spots/${spotId}/report`, { method: "POST", body: payload }),
    likeClip: (clipId) => safeFetch(`/clips/${clipId}/like`, { method: "POST" }),
};
