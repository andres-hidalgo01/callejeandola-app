const express = require("express");
const cors = require("cors");

const spotsRoutes = require("./routes/spots.routes");
const eventsRoutes = require("./routes/events.routes");
const sponsorsRoutes = require("./routes/sponsors.routes");
const shopsRoutes = require("./routes/shops.routes");
const authRoutes = require("./routes/auth.routes");

const usersRoutes = require("./routes/users.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

const engagementRoutes = require("./routes/engagement.routes");

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",

  "http://127.0.0.1:5510",
  "http://localhost:5510",

  "http://127.0.0.1:5520",
  "http://localhost:5520",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/me", engagementRoutes);

app.use("/api/spots", spotsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/sponsors", sponsorsRoutes);
app.use("/api/shops", shopsRoutes);
app.use("/api/users", usersRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Callejeandola API running",
    });
});

module.exports = app;