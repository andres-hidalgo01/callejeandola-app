import { state } from "../state/state.js";
import { setText } from "../utils/dom.js";

export function renderDashboard() {
    setText("kpiSpots", state.spots.length);
    setText("kpiEvents", state.events.length);
    setText("kpiShops", state.shops.length);
    setText("kpiSponsors", state.sponsors.length);
}