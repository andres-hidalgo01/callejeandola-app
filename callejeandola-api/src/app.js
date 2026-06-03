const express = require("express");
const cors = require("cors");

const spotsRoutes = require("./routes/spots.routes");
const eventsRoutes = require("./routes/events.routes");
const sponsorsRoutes = require("./routes/sponsors.routes");
const shopsRoutes = require("./routes/shops.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5510",
        "http://localhost:5500",
        "http://localhost:5510",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/spots", spotsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/sponsors", sponsorsRoutes);
app.use("/api/shops", shopsRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Callejeandola API running",
    });
});

module.exports = app;