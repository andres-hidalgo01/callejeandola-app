const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");
const { VALID_ROLES } = require("../config/roles");

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

async function registerUser({ name, email, password, role, country }) {
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "").trim();
    const cleanRole = "SKATER";
    const cleanCountry = String(country || "Costa Rica").trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
        const error = new Error("Name, email and password are required");
        error.statusCode = 400;
        throw error;
    }

    if (cleanPassword.length < 6) {
        const error = new Error("Password must have at least 6 characters");
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: cleanEmail,
        },
    });

    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const user = await prisma.user.create({
        data: {
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            role: cleanRole,
            country: cleanCountry,
            active: true,
        },
    });

    const safeUser = sanitizeUser(user);

    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: safeUser,
    };
}

async function loginUser({ email, password }) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "").trim();

    if (!cleanEmail || !cleanPassword) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    const user = await prisma.user.findUnique({
        where: {
            email: cleanEmail,
        },
    });

    if (!user) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    if (!user.active) {
        const error = new Error("User is inactive");
        error.statusCode = 403;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(cleanPassword, user.password);

    if (!passwordMatches) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    const safeUser = sanitizeUser(user);

    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: safeUser,
    };
}

async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: Number(userId),
        },
    });

    return sanitizeUser(user);
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    sanitizeUser,
};