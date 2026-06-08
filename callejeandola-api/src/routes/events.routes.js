const express = require("express");
const router = express.Router();

const eventsController = require("../controllers/events.controller");

const {
    authMiddleware,
    requireRole,
} = require("../middlewares/auth.middleware");

const { PERMISSIONS } = require("../config/roles");

router.get("/", eventsController.getEvents);

if (eventsController.getEventById) {
    router.get("/:id", eventsController.getEventById);
}

router.post(
    "/",
    authMiddleware,
    requireRole(PERMISSIONS.EVENT_MANAGERS),
    eventsController.createEvent
);

router.put(
    "/:id",
    authMiddleware,
    requireRole(PERMISSIONS.EVENT_MANAGERS),
    eventsController.updateEvent
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole(PERMISSIONS.EVENT_MANAGERS),
    eventsController.deleteEvent
);

module.exports = router;