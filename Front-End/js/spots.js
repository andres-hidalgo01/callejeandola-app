import { getSpots } from "./api.js";

async function loadSpots() {
    const spots = await getSpots();

    const container = document.querySelector("#spots-container");

    container.innerHTML = spots
        .map(
            (spot) => `
      <div class="spot-card">
        <h3>${spot.name}</h3>
        <p>${spot.description}</p>
      </div>
    `
        )
        .join("");
}

loadSpots();