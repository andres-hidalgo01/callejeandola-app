// const express = require("express");
// const router = express.Router();

// const sponsorsController = require("../controllers/sponsors.controller");

// router.get("/", sponsorsController.getSponsors);

// module.exports = router;

const express = require("express");
const router = express.Router();
const sponsorsController = require("../controllers/sponsors.controller");

router.get("/", sponsorsController.getSponsors);
router.post("/", sponsorsController.createSponsor);

module.exports = router;