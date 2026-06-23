const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const crypto = require("crypto");
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
        emailVerified: user.emailVerified,
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

    const emailVerificationCode = generateEmailCode();
    const emailVerificationExpiresAt = getEmailCodeExpiration();

    const user = await prisma.user.create({
        data: {
            name: cleanName,
            email: cleanEmail,
            emailVerified: false,
            emailVerificationCode,
            emailVerificationExpiresAt,
            password: hashedPassword,
            role: cleanRole,
            country: cleanCountry,
            active: true,
        },
    });

    logVerificationCode(user, emailVerificationCode);

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

function generateEmailCode() {
    return String(crypto.randomInt(100000, 999999));
}

function getEmailCodeExpiration() {
    return new Date(Date.now() + 15 * 60 * 1000);
}

function logVerificationCode(user, code) {
    console.log("");
    console.log("====================================");
    console.log("CALLEJEANDOLA EMAIL VERIFICATION");
    console.log(`Email: ${user.email}`);
    console.log(`Code: ${code}`);
    console.log("Expires in: 15 minutes");
    console.log("====================================");
    console.log("");
}

async function verifyEmail({ email, code }) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanCode = String(code || "").trim();

    if (!cleanEmail || !cleanCode) {
        const error = new Error("Email and verification code are required");
        error.statusCode = 400;
        throw error;
    }

    const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.emailVerified) {
        return {
            message: "Email already verified",
            user: sanitizeUser(user),
        };
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpiresAt) {
        const error = new Error("Verification code not available");
        error.statusCode = 400;
        throw error;
    }

    if (new Date() > user.emailVerificationExpiresAt) {
        const error = new Error("Verification code expired");
        error.statusCode = 400;
        throw error;
    }

    if (String(user.emailVerificationCode) !== cleanCode) {
        const error = new Error("Invalid verification code");
        error.statusCode = 400;
        throw error;
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerificationCode: null,
            emailVerificationExpiresAt: null,
        },
    });

    return {
        message: "Email verified successfully",
        user: sanitizeUser(updatedUser),
    };
}

async function resendVerificationCode({ email }) {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
        const error = new Error("Email is required");
        error.statusCode = 400;
        throw error;
    }

    const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.emailVerified) {
        return {
            message: "Email already verified",
            user: sanitizeUser(user),
        };
    }

    const emailVerificationCode = generateEmailCode();
    const emailVerificationExpiresAt = getEmailCodeExpiration();

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationCode,
            emailVerificationExpiresAt,
        },
    });

    logVerificationCode(updatedUser, emailVerificationCode);

    return {
        message: "Verification code sent",
    };
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    sanitizeUser,
    verifyEmail,
    resendVerificationCode,
};