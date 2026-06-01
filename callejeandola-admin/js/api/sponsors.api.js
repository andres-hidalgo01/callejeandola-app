import { apiGet, apiRequest } from "./api.js";

export async function getSponsors() {
    return apiGet("/sponsors");
}

export async function createSponsor(payload) {
    return apiRequest("/sponsors", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateSponsor(id, payload) {
    return apiRequest(`/sponsors/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteSponsor(id) {
    return apiRequest(`/sponsors/${id}`, {
        method: "DELETE",
    });
}