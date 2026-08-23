function getAllowedOrigins() {
    return String(process.env.CORS_ORIGIN || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

function corsOptions(req, callback) {
    const origin = req.header("Origin");

    const allowedOrigins = getAllowedOrigins();

    const commonOptions = {
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    };

    if (!origin) {
        return callback(null, {
            ...commonOptions,
            origin: true,
        });
    }

    if (allowedOrigins.includes(origin)) {
        return callback(null, {
            ...commonOptions,
            origin: true,
        });
    }

    console.error("CORS blocked origin:", origin);
    return callback(new Error(`CORS blocked origin: ${origin}`));
}

module.exports = { corsOptions };