const API_URL = "http://localhost:4000/api";

export async function getSpots() {
    const res = await fetch(`${API_URL}/spots`);
    return await res.json();
}

export async function getEvents() {
    const res = await fetch(`${API_URL}/events`);
    return await res.json();
}

export async function getSponsors() {
    const res = await fetch(`${API_URL}/sponsors`);
    return await res.json();
}