import { apiGet, apiRequest } from "./api.js";

export async function getSpots() {
    return apiGet("/spots");
}

export async function createSpot(payload) {
    return apiRequest("/spots", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateSpot(id, payload) {
    return apiRequest(`/spots/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteSpot(id) {
    return apiRequest(`/spots/${id}`, {
        method: "DELETE",
    });
}