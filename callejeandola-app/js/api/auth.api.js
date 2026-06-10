import { apiRequest } from "./api.js";

export async function login(payload) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getMe() {
    return apiRequest("/auth/me");
}