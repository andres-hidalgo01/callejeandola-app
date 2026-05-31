// import { getDashboardData } from "../api/dashboard.api.js";

// export async function loadDashboard() {

//     try {

//         const data = await getDashboardData();

//         document.getElementById("kpiSpots").textContent =
//             data.spots.length;

//         document.getElementById("kpiEvents").textContent =
//             data.events.length;

//         document.getElementById("kpiShops").textContent =
//             data.shops.length;

//         document.getElementById("kpiSponsors").textContent =
//             data.sponsors.length;

//     }
//     catch (error) {

//         console.error(error);

//     }
// }

// import { loadKPIs } from "../services/dashboard.service.js";

// export async function loadDashboard() {

//     await loadKPIs();
// }

import { getSpots } from "../api/spots.api.js";
import { getEvents } from "../api/events.api.js";
import { getShops } from "../api/shops.api.js";
import { getSponsors } from "../api/sponsors.api.js";

export async function loadDashboard() {
    try {
        const [spots, events, shops, sponsors] = await Promise.all([
            getSpots(),
            getEvents(),
            getShops(),
            getSponsors()
        ]);

        document.getElementById("kpiSpots").textContent = spots.length;
        document.getElementById("kpiEvents").textContent = events.length;
        document.getElementById("kpiShops").textContent = shops.length;
        document.getElementById("kpiSponsors").textContent = sponsors.length;
    } catch (error) {
        console.error("Error loading dashboard:", error);
    }
}