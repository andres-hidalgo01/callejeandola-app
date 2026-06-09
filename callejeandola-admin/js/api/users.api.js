import { apiGet, apiRequest } from "./api.js";

export async function getUsers() {
    return apiGet("/users");
}

export async function updateUserRole(id, payload) {
    return apiRequest(`/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function updateUserStatus(id, payload) {
    return apiRequest(`/users/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}