import { state } from "../state/state.js";

import {
    updateUserRole,
    updateUserStatus,
} from "../api/users.api.js";

import {
    openEntityModal,
    closeEntityModal,
} from "../services/modal.service.js";

import { showToast } from "../services/toast.service.js";
import { showView } from "../services/navigation.service.js";

import { escapeHtml, escapeAttr } from "../utils/sanitize.js";
import { getValue, getChecked } from "../utils/form.js";

const AVAILABLE_ROLES = [
    "GUEST",
    "SKATER",
    "JUDGE",
    "LOCAL_ADMIN",
    "GLOBAL_ADMIN",
];

export function renderUsersTable() {
    const table = document.getElementById("usersTable");

    if (!table) return;

    if (!state.users.length) {
        table.innerHTML = `
      <tr>
        <td colspan="6">No hay usuarios registrados o no tenés permisos para verlos.</td>
      </tr>
    `;
        return;
    }

    table.innerHTML = state.users
        .map((user) => {
            const isCurrentUser = Number(user.id) === Number(state.currentUser?.id);

            const statusLabel = user.active
                ? `<span class="badge">Active</span>`
                : `<span class="badge badge-danger">Inactive</span>`;

            return `
        <tr>
          <td>
            <strong>${escapeHtml(user.name || "—")}</strong>
            ${isCurrentUser ? `<span class="badge">You</span>` : ""}
          </td>

          <td>${escapeHtml(user.email || "—")}</td>

          <td>
            <span class="badge">${escapeHtml(user.role || "GUEST")}</span>
          </td>

          <td>${escapeHtml(user.country || "—")}</td>

          <td>${statusLabel}</td>

          <td>
            <div class="table-actions">
              <button
                class="btn btn-secondary"
                type="button"
                data-change-role="${user.id}">
                Cambiar rol
              </button>

              <button
                class="btn ${user.active ? "btn-danger" : "btn-secondary"}"
                type="button"
                data-change-status="${user.id}">
                ${user.active ? "Desactivar" : "Activar"}
              </button>
            </div>
          </td>
        </tr>
      `;
        })
        .join("");
}

export function bindUserTableActions() {
    document.querySelectorAll("[data-change-role]").forEach((button) => {
        button.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();

            const id = Number(button.dataset.changeRole);

            const user = state.users.find((item) => {
                return Number(item.id) === id;
            });

            if (!user) {
                showToast("Usuario no encontrado");
                return;
            }

            openUserRoleModal(user);
        };
    });

    document.querySelectorAll("[data-change-status]").forEach((button) => {
        button.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();

            const id = Number(button.dataset.changeStatus);

            const user = state.users.find((item) => {
                return Number(item.id) === id;
            });

            if (!user) {
                showToast("Usuario no encontrado");
                return;
            }

            openUserStatusModal(user);
        };
    });
}

function openUserRoleModal(user) {
    const roleOptions = AVAILABLE_ROLES
        .map((role) => {
            return `
        <option
          value="${escapeAttr(role)}"
          ${user.role === role ? "selected" : ""}
        >
          ${escapeHtml(role)}
        </option>
      `;
        })
        .join("");

    openEntityModal({
        title: "Cambiar rol",
        submitText: "Actualizar rol",
        mode: "role",
        entity: "user",
        itemId: user.id,
        html: `
      <div class="form-field">
        <label>Usuario</label>
        <input
          type="text"
          value="${escapeAttr(user.email || "")}"
          disabled
        >
      </div>

      <div class="form-field">
        <label for="userRole">Rol</label>
        <select id="userRole" name="role">
          ${roleOptions}
        </select>
      </div>

      <div class="card soft-warning">
        <p class="muted">
          GLOBAL_ADMIN tiene control total. LOCAL_ADMIN administra eventos.
          JUDGE solo visualiza eventos. SKATER y GUEST no acceden al Admin.
        </p>
      </div>
    `,
    });
}

function openUserStatusModal(user) {
    const nextStatus = !user.active;

    openEntityModal({
        title: nextStatus ? "Activar usuario" : "Desactivar usuario",
        submitText: nextStatus ? "Activar" : "Desactivar",
        mode: "status",
        entity: "user",
        itemId: user.id,
        html: `
      <div class="danger-zone">
        <h3>${nextStatus ? "¿Activar usuario?" : "¿Desactivar usuario?"}</h3>
        <p>
          Usuario: <strong>${escapeHtml(user.email || "—")}</strong>
        </p>
        <p class="muted">
          ${nextStatus
                ? "El usuario podrá volver a iniciar sesión."
                : "El usuario no podrá iniciar sesión mientras esté inactivo."
            }
        </p>
      </div>

      <label class="form-check">
        <input
          id="userActive"
          name="active"
          type="checkbox"
          ${nextStatus ? "checked" : ""}
          hidden
        >
        <span hidden>Estado</span>
      </label>
    `,
    });
}

function renderUsersOnly() {
    renderUsersTable();
    bindUserTableActions();
    showView("users");
}

async function handleUpdateUserRole() {
    try {
        const id = Number(state.modalItemId);
        const role = getValue("userRole");

        if (!id) {
            showToast("ID inválido");
            return;
        }

        if (!role) {
            showToast("Rol inválido");
            return;
        }

        const result = await updateUserRole(id, {
            role,
        });

        const updatedUser = result.data || result;

        state.users = state.users.map((user) => {
            return Number(user.id) === id ? updatedUser : user;
        });

        closeEntityModal();
        renderUsersOnly();

        showToast("Rol actualizado correctamente");
    } catch (error) {
        console.error("Error actualizando rol:", error);
        showToast(error.message || "Error actualizando rol");
    }
}

async function handleUpdateUserStatus() {
    try {
        const id = Number(state.modalItemId);
        const active = getChecked("userActive");

        if (!id) {
            showToast("ID inválido");
            return;
        }

        const result = await updateUserStatus(id, {
            active,
        });

        const updatedUser = result.data || result;

        state.users = state.users.map((user) => {
            return Number(user.id) === id ? updatedUser : user;
        });

        closeEntityModal();
        renderUsersOnly();

        showToast("Estado actualizado correctamente");
    } catch (error) {
        console.error("Error actualizando estado:", error);
        showToast(error.message || "Error actualizando estado");
    }
}

export async function handleUserSubmit() {
    if (state.modalMode === "role") {
        await handleUpdateUserRole();
        return;
    }

    if (state.modalMode === "status") {
        await handleUpdateUserStatus();
        return;
    }

    showToast("Acción de usuario no configurada");
}