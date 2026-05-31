

import {
  getSpots,
  createSpot,
  deleteSpot
}
  from "../api/spots.api.js";

import {
  promptForm
}
  from "../services/modal.service.js";

export async function loadSpotsView() {

  const table =
    document.getElementById("spotsTable");

  if (!table) return;

  const spots =
    await getSpots();

  table.innerHTML = "";

  spots.forEach((spot) => {

    table.innerHTML += `
      <tr>
        <td>${spot.name}</td>
        <td>${spot.city}</td>
        <td>${spot.type}</td>

        <td>
          ${spot.image
        ?
        `<img src="${spot.image}" width="80">`
        :
        "-"
      }
        </td>

        <td>

          <button
            class="btn btn-secondary"
            data-edit="${spot.id}">
            Editar
          </button>

          <button
            class="btn btn-danger"
            data-delete="${spot.id}">
            Eliminar
          </button>

        </td>
      </tr>
    `;
  });

  bindDelete();
}

function bindDelete() {

  document
    .querySelectorAll("[data-delete]")
    .forEach(button => {

      button.addEventListener("click", async () => {

        const id =
          button.dataset.delete;

        const confirmed =
          confirm("Eliminar spot?");

        if (!confirmed) return;

        await deleteSpot(id);

        location.reload();
      });

    });
}