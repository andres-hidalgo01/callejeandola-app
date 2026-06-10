import { apiRequest } from "./api.js";

export async function getMyProfile() {
    return apiRequest("/profile/me");
}

export async function updateMyProfile(payload) {
    return apiRequest("/profile/me", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}