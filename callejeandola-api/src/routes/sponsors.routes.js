
const express = require("express");

const router = express.Router();

const sponsorsController = require("../controllers/sponsors.controller");

router.get("/", sponsorsController.getSponsors);

router.get("/:id", sponsorsController.getSponsorById);

router.post("/", sponsorsController.createSponsor);

router.put("/:id", sponsorsController.updateSponsor);

router.delete("/:id", sponsorsController.deleteSponsor);

module.exports = router;