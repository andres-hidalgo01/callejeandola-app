import { apiGet, apiRequest } from "./api.js";

export async function getEvents() {
    return apiGet("/events");
}

export async function createEvent(payload) {
    return apiRequest("/events", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateEvent(id, payload) {
    return apiRequest(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteEvent(id) {
    return apiRequest(`/events/${id}`, {
        method: "DELETE",
    });
}