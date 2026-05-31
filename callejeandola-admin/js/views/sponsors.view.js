// import {
//     getSponsors
// }
//     from "../api/sponsors.api.js";

// export async function loadSponsorsView() {

//     const table =
//         document.getElementById("sponsorsTable");

//     if (!table) return;

//     const sponsors =
//         await getSponsors();

//     table.innerHTML = "";

//     sponsors.forEach(sponsor => {

//         table.innerHTML += `
//         <tr>

//             <td>${sponsor.name ?? ""}</td>

//             <td>
//                 <img
//                     src="${sponsor.logo}"
//                     width="80"
//                 >
//             </td>

//             <td>
//                 ${sponsor.website ?? ""}
//             </td>

//             <td>
//                 Editar | Eliminar
//             </td>

//         </tr>
//         `;
//     });

// }

import { getSponsors } from "../api/sponsors.api.js";

export async function loadSponsorsView() {
    const table = document.getElementById("sponsorsTable");

    if (!table) return;

    try {
        const sponsors = await getSponsors();

        table.innerHTML = "";

        sponsors.forEach((sponsor) => {
            table.innerHTML += `
        <tr>
          <td>${sponsor.name ?? ""}</td>
          <td>
            ${sponsor.logo
                    ? `<img src="${sponsor.logo}" width="80" alt="${sponsor.name ?? "Sponsor"}">`
                    : "-"
                }
          </td>
          <td>${sponsor.website ?? ""}</td>
          <td>
            <button class="btn btn-secondary" type="button" data-edit-sponsor="${sponsor.id}">
              Editar
            </button>
            <button class="btn btn-danger" type="button" data-delete-sponsor="${sponsor.id}">
              Eliminar
            </button>
          </td>
        </tr>
      `;
        });
    } catch (error) {
        console.error("Error loading sponsors:", error);
    }
}