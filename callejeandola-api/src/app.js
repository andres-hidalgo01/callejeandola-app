const express = require("express");
const cors = require("cors");

const spotsRoutes = require("./routes/spots.routes");
const eventsRoutes = require("./routes/events.routes");
const sponsorsRoutes = require("./routes/sponsors.routes");
const shopsRoutes = require("./routes/shops.routes");

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.use("/api/spots", spotsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/shops", shopsRoutes);
app.use("/api/sponsors", sponsorsRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "Callejeandola API running"
    });
});

module.exports = app;