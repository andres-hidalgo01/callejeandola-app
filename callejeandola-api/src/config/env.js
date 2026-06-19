require("dotenv").config();

const DEFAULT_CLIENT_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",

    "http://127.0.0.1:5510",
    "http://localhost:5510",

    "http://127.0.0.1:5520",
    "http://localhost:5520",
];

function parseOrigins(value) {
    if (!value) return DEFAULT_CLIENT_ORIGINS;

    return value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 4000),
    jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
    clientOrigins: parseOrigins(process.env.CLIENT_ORIGINS),
};

module.exports = { env };