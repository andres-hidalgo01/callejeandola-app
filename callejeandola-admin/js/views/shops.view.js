// import {
//     getShops
// }
//     from "../api/shops.api.js";

// export async function loadShopsView() {

//     const table =
//         document.getElementById("shopsTable");

//     if (!table) return;

//     const shops =
//         await getShops();

//     table.innerHTML = "";

//     shops.forEach(shop => {

//         table.innerHTML += `
//         <tr>

//             <td>${shop.name ?? ""}</td>

//             <td>${shop.city ?? ""}</td>

//             <td>${shop.category ?? ""}</td>

//             <td>
//                 ${shop.image
//                 ?
//                 `<img src="${shop.image}" width="70">`
//                 :
//                 "-"
//             }
//             </td>

//             <td>
//                 Editar | Eliminar
//             </td>

//         </tr>
//         `;
//     });

// }


import { getShops } from "../api/shops.api.js";

export async function loadShopsView() {
    const table = document.getElementById("shopsTable");

    if (!table) return;

    try {
        const shops = await getShops();

        table.innerHTML = "";

        shops.forEach((shop) => {
            table.innerHTML += `
        <tr>
          <td>${shop.name ?? ""}</td>
          <td>${shop.city ?? ""}</td>
          <td>${shop.category ?? ""}</td>
          <td>
            ${shop.image
                    ? `<img src="${shop.image}" width="70" alt="${shop.name ?? "Shop"}">`
                    : "-"
                }
          </td>
          <td>
            <button class="btn btn-secondary" type="button" data-edit-shop="${shop.id}">
              Editar
            </button>
            <button class="btn btn-danger" type="button" data-delete-shop="${shop.id}">
              Eliminar
            </button>
          </td>
        </tr>
      `;
        });
    } catch (error) {
        console.error("Error loading shops:", error);
    }
}