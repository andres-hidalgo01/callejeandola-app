const API_URL = "http://localhost:4000/api/events";

export async function getEvents() {
    const response = await fetch(API_URL);
    return response.json();
}

export async function createEvent(data) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return response.json();
}

export async function updateEvent(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return response.json();
}

export async function deleteEvent(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    return response.json();
}