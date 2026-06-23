const express = require("express");
const cors = require("cors");
const { corsOptions } = require("./config/cors");

const uploadRoutes = require("./routes/upload.routes");
const spotsRoutes = require("./routes/spots.routes");
const eventsRoutes = require("./routes/events.routes");
const sponsorsRoutes = require("./routes/sponsors.routes");
const shopsRoutes = require("./routes/shops.routes");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const profileRoutes = require("./routes/profile.routes");
const engagementRoutes = require("./routes/engagement.routes");

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "callejeandola-api",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/me", engagementRoutes);
app.use("/api/uploads", uploadRoutes);
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

app.use((err, req, res, next) => {
  console.error("API error:", err);

  if (err.message) {
    return res.status(400).json({
      error: err.message,
    });
  }

  return res.status(500).json({
    error: "Internal server error",
  });
});

module.exports = app;