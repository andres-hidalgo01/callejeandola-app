// const express = require("express");
// const router = express.Router();

// const eventsController = require("../controllers/events.controller");

// router.get("/", eventsController.getEvents);
// router.post("/", eventsController.createEvent);

// module.exports = router;

const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events.controller");

router.get("/", eventsController.getEvents);
router.post("/", eventsController.createEvent);

module.exports = router;