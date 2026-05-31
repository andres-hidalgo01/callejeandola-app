// import { API_URL } from "../config/config.js";

// export async function getSpots() {

//     const response = await fetch(`${API_URL}/spots`);

//     if (!response.ok) {
//         throw new Error("Error loading spots");
//     }

//     return response.json();
// }

// export async function createSpot(payload) {

//     const response = await fetch(`${API_URL}/spots`, {
//         method: "POST",

//         headers: {
//             "Content-Type": "application/json",
//         },

//         body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//         throw new Error("Error creating spot");
//     }

//     return response.json();
// }




// const API_URL = "http://localhost:4000/api/spots";

// export async function getSpots() {
//     const response = await fetch(API_URL);
//     return response.json();
// }

// export async function createSpot(data) {
//     const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//     });

//     return response.json();
// }

// export async function updateSpot(id, data) {
//     const response = await fetch(`${API_URL}/${id}`, {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//     });

//     return response.json();
// }

// export async function deleteSpot(id) {
//     const response = await fetch(`${API_URL}/${id}`, {
//         method: "DELETE"
//     });

//     return response.json();
// }



const API_URL = "http://localhost:4000/api/spots";

export async function getSpots() {
    const response = await fetch(API_URL);
    return response.json();
}

export async function createSpot(data) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return response.json();
}

export async function updateSpot(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return response.json();
}

export async function deleteSpot(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    return response.json();
}