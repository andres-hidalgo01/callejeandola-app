import { getSpots } from "../api/spots.api.js";
import { getEvents } from "../api/events.api.js";
import { getShops } from "../api/shops.api.js";
import { getSponsors } from "../api/sponsors.api.js";

export async function loadKPIs() {

    const spots =
        await getSpots();

    const events =
        await getEvents();

    const shops =
        await getShops();

    const sponsors =
        await getSponsors();

    document.getElementById("kpiSpots")
        .textContent = spots.length;

    document.getElementById("kpiEvents")
        .textContent = events.length;

    document.getElementById("kpiShops")
        .textContent = shops.length;

    document.getElementById("kpiSponsors")
        .textContent = sponsors.length;
}