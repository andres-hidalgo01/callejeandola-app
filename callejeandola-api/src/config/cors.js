const { env } = require("./env");

function corsOptions(req, callback) {
    const origin = req.header("Origin");

    if (!origin) {
        return callback(null, {
            origin: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        });
    }

    const isAllowed = env.clientOrigins.includes(origin);

    if (!isAllowed) {
        return callback(new Error(`CORS blocked origin: ${origin}`));
    }

    return callback(null, {
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
}

module.exports = { corsOptions };