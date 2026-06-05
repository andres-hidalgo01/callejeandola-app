const express = require("express");
const router = express.Router();

const eventsController = require("../controllers/events.controller");

const {
    authMiddleware,
    requireRole,
} = require("../middlewares/auth.middleware");

const EVENT_MANAGERS = ["GLOBAL_ADMIN", "LOCAL_ADMIN"];

router.get("/", eventsController.getEvents);
router.get("/:id", eventsController.getEventById);

router.post(
    "/",
    authMiddleware,
    requireRole(EVENT_MANAGERS),
    eventsController.createEvent
);

router.put(
    "/:id",
    authMiddleware,
    requireRole(EVENT_MANAGERS),
    eventsController.updateEvent
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole(EVENT_MANAGERS),
    eventsController.deleteEvent
);

module.exports = router;