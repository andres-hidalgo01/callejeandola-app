const API_URL = "http://localhost:4000/api";

export async function getDashboardData() {
    const [spots, events, shops, sponsors] = await Promise.all([
        fetch(`${API_URL}/spots`).then(r => r.json()),
        fetch(`${API_URL}/events`).then(r => r.json()),
        fetch(`${API_URL}/shops`).then(r => r.json()),
        fetch(`${API_URL}/sponsors`).then(r => r.json())
    ]);

    return {
        spots,
        events,
        shops,
        sponsors
    };
}