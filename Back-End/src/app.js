const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const spotsRoutes = require("./routes/spots.routes");
const eventsRoutes = require("./routes/events.routes");
const sponsorsRoutes = require("./routes/sponsors.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/spots", spotsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/sponsors", sponsorsRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Callejeandola API running" });
});

module.exports = app;

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(helmet());

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    })
);

const morgan = require("morgan");
app.use(morgan("dev"));

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));