const jwt = require("jsonwebtoken");

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return secret;
}

function generateToken(payload) {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
}

function verifyToken(token) {
    return jwt.verify(token, getJwtSecret());
}

module.exports = {
    generateToken,
    verifyToken,
};