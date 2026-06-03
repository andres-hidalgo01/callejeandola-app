// import { API_BASE_URL } from "../config/config.js";

// export async function apiRequest(endpoint, options = {}) {
//     const url = `${API_BASE_URL}${endpoint}`;

//     const response = await fetch(url, {
//         headers: {
//             "Content-Type": "application/json",
//             ...(options.headers || {}),
//         },
//         ...options,
//     });

//     const rawResponse = await response.text();

//     let result = null;

//     if (rawResponse) {
//         try {
//             result = JSON.parse(rawResponse);
//         } catch {
//             result = {
//                 message: rawResponse,
//             };
//         }
//     }

//     if (!response.ok) {
//         const message =
//             result?.error ||
//             result?.message ||
//             `API Error ${response.status}`;

//         throw new Error(message);
//     }

//     return result;
// }

// export async function apiGet(endpoint) {
//     const result = await apiRequest(endpoint);

//     if (Array.isArray(result)) return result;
//     if (Array.isArray(result?.data)) return result.data;

//     return [];
// }


import { API_BASE_URL } from "../config/config.js";

import {
    getAuthToken,
    clearSession,
} from "../services/session.service.js";

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(url, {
        headers,
        ...options,
    });

    const rawResponse = await response.text();

    let result = null;

    if (rawResponse) {
        try {
            result = JSON.parse(rawResponse);
        } catch {
            result = {
                message: rawResponse,
            };
        }
    }

    if (response.status === 401) {
        clearSession();
    }

    if (!response.ok) {
        const message =
            result?.error ||
            result?.message ||
            `API Error ${response.status}`;

        throw new Error(message);
    }

    return result;
}

export async function apiGet(endpoint) {
    const result = await apiRequest(endpoint);

    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;

    return [];
}