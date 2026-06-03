// const API_URL = "http://localhost:4000/api/shops";

// export async function getShops() {
//     const response = await fetch(API_URL);
//     return response.json();
// }

// export async function createShop(data) {
//     const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//     });

//     return response.json();
// }

// export async function updateShop(id, data) {
//     const response = await fetch(`${API_URL}/${id}`, {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//     });

//     return response.json();
// }

// export async function deleteShop(id) {
//     const response = await fetch(`${API_URL}/${id}`, {
//         method: "DELETE"
//     });

//     return response.json();
// }

import { apiGet, apiRequest } from "./api.js";

export async function getShops() {
    return apiGet("/shops");
}

export async function createShop(payload) {
    return apiRequest("/shops", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateShop(id, payload) {
    return apiRequest(`/shops/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteShop(id) {
    return apiRequest(`/shops/${id}`, {
        method: "DELETE",
    });
}