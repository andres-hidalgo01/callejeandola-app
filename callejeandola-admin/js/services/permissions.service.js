import { state } from "../state/state.js";

const ROLE_PERMISSIONS = {
    GLOBAL_ADMIN: {
        modules: ["dashboard", "spots", "events", "shops", "sponsors", "users"],
        manage: {
            spots: ["create", "update", "delete"],
            events: ["create", "update", "delete"],
            shops: ["create", "update", "delete"],
            sponsors: ["create", "update", "delete"],
            users: ["create", "update", "delete"],
        },
    },

    LOCAL_ADMIN: {
        modules: ["dashboard", "events"],
        manage: {
            events: ["create", "update", "delete"],
        },
    },

    JUDGE: {
        modules: ["dashboard", "events"],
        manage: {},
    },

    SKATER: {
        modules: [],
        manage: {},
    },

    GUEST: {
        modules: [],
        manage: {},
    },
};

export function getCurrentRole() {
    return state.currentUser?.role || "GUEST";
}

export function canViewModule(moduleName) {
    const role = getCurrentRole();
    const permissions = ROLE_PERMISSIONS[role];

    if (!permissions) return false;

    return permissions.modules.includes(moduleName);
}

export function canManageEntity(entityName, actionName) {
    const role = getCurrentRole();
    const permissions = ROLE_PERMISSIONS[role];

    if (!permissions) return false;

    const allowedActions = permissions.manage[entityName] || [];

    return allowedActions.includes(actionName);
}

export function canAccessAdmin() {
    const role = getCurrentRole();

    return ["GLOBAL_ADMIN", "LOCAL_ADMIN", "JUDGE"].includes(role);
}