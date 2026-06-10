import { API_BASE_URL } from "../config/config.js";
import { getAuthToken, clearSession } from "../services/session.service.js";

export async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
    });

    const raw = await response.text();

    let result = null;

    if (raw) {
        try {
            result = JSON.parse(raw);
        } catch {
            result = { message: raw };
        }
    }

    if (response.status === 401) {
        clearSession();
    }

    if (!response.ok) {
        throw new Error(result?.error || result?.message || `API Error ${response.status}`);
    }

    return result;
}