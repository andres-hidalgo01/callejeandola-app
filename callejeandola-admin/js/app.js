import { state } from "./state/state.js";

import { getSpots } from "./api/spots.api.js";

import { renderSpotsView } from "./views/spots.view.js";

import { openSpotModal } from "./modals/spot.modal.js";

import { $, $$ } from "./utils/dom.js";

export async function loadSpots() {

    try { 

        state.spots = await getSpots();

        render();

    } catch (error) {

        console.error(error);
    }
}

function render() {

    const container = $("#viewContainer");

    if (state.currentView === "spots") {
        renderSpotsView(container);
    }
}

function bindEvents() {

    $("#btnCreate").addEventListener("click", () => {

        if (state.currentView === "spots") {
            openSpotModal();
        }
    });

    $$(".nav-btn").forEach((btn) => {

        btn.addEventListener("click", async () => {

            state.currentView = btn.dataset.view;

            $$(".nav-btn").forEach((b) => {
                b.classList.remove("active");
            });

            btn.classList.add("active");

            $("#viewTitle").innerText = btn.dataset.view;

            render();
        });
    });
}

async function init() {

    bindEvents();

    await loadSpots();
}

init();