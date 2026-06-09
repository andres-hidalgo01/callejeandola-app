const prisma = require("../config/prisma");
const { VALID_ROLES, ROLES } = require("../config/roles");

function sanitizeUser(user) {
    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        country: user.country,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

async function getUsers() {
    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return users.map(sanitizeUser);
}

async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: {
            id: Number(id),
        },
    });

    return sanitizeUser(user);
}

async function updateUserRole({ targetUserId, newRole, currentUserId }) {
    const id = Number(targetUserId);

    if (!id) {
        const error = new Error("Invalid user id");
        error.statusCode = 400;
        throw error;
    }

    if (!VALID_ROLES.includes(newRole)) {
        const error = new Error("Invalid role");
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!targetUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (Number(currentUserId) === id && newRole !== ROLES.GLOBAL_ADMIN) {
        const error = new Error("You cannot remove your own GLOBAL_ADMIN role");
        error.statusCode = 400;
        throw error;
    }

    const updatedUser = await prisma.user.update({
        where: {
            id,
        },
        data: {
            role: newRole,
        },
    });

    return sanitizeUser(updatedUser);
}

async function updateUserStatus({ targetUserId, active, currentUserId }) {
    const id = Number(targetUserId);

    if (!id) {
        const error = new Error("Invalid user id");
        error.statusCode = 400;
        throw error;
    }

    if (typeof active !== "boolean") {
        const error = new Error("Active must be boolean");
        error.statusCode = 400;
        throw error;
    }

    if (Number(currentUserId) === id && active === false) {
        const error = new Error("You cannot deactivate your own user");
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!targetUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const updatedUser = await prisma.user.update({
        where: {
            id,
        },
        data: {
            active,
        },
    });

    return sanitizeUser(updatedUser);
}

module.exports = {
    getUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
};