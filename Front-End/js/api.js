const API_BASE = window.__API__ || "https://api.callejeando.com";

export async function getSpots() {
    try {
        const r = await fetch(`${API_BASE}/spots`);
        return await r.json();
    } catch {
        return SPOTS_MOCK; // demo nunca se rompe
    }
}
