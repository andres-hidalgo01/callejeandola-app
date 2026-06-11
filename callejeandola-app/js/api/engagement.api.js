import { apiRequest } from "./api.js";

export async function getFavoriteSpots() {
    const result = await apiRequest("/me/favorites/spots");
    return Array.isArray(result?.data) ? result.data : [];
}

export async function addFavoriteSpot(spotId) {
    return apiRequest(`/me/favorites/spots/${spotId}`, {
        method: "POST",
    });
}

export async function removeFavoriteSpot(spotId) {
    return apiRequest(`/me/favorites/spots/${spotId}`, {
        method: "DELETE",
    });
}

export async function getSavedEvents() {
    const result = await apiRequest("/me/saved-events");
    return Array.isArray(result?.data) ? result.data : [];
}

export async function addSavedEvent(eventId) {
    return apiRequest(`/me/saved-events/${eventId}`, {
        method: "POST",
    });
}

export async function removeSavedEvent(eventId) {
    return apiRequest(`/me/saved-events/${eventId}`, {
        method: "DELETE",
    });
}