import { API_URL } from "../config.js";

async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error("API Error");
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

/* =========================
   SPOTS
========================= */

export async function getSpots() {
    return await request("/spots");
}

export async function createSpot(data) {
    return await request("/spots", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateSpot(id, data) {
    return await request(`/spots/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteSpot(id) {
    return await request(`/spots/${id}`, {
        method: "DELETE",
    });
}

/* =========================
   EVENTS
========================= */

export async function getEvents() {
    return await request("/events");
}

export async function createEvent(data) {
    return await request("/events", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateEvent(id, data) {
    return await request(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteEvent(id) {
    return await request(`/events/${id}`, {
        method: "DELETE",
    });
}

/* =========================
   SHOPS
========================= */

export async function getShops() {
    return await request("/shops");
}

export async function createShop(data) {
    return await request("/shops", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateShop(id, data) {
    return await request(`/shops/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteShop(id) {
    return await request(`/shops/${id}`, {
        method: "DELETE",
    });
}

/* =========================
   SPONSORS
========================= */

export async function getSponsors() {
    return await request("/sponsors");
}

export async function createSponsor(data) {
    return await request("/sponsors", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateSponsor(id, data) {
    return await request(`/sponsors/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteSponsor(id) {
    return await request(`/sponsors/${id}`, {
        method: "DELETE",
    });
}