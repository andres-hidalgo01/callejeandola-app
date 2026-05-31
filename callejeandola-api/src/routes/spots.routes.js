const express = require("express");
const router = express.Router();
const spotsController = require("../controllers/spots.controller");

router.get("/", spotsController.getSpots);

router.get("/:id", spotsController.getSpotById);

router.post("/", spotsController.createSpot);

router.put("/:id", spotsController.updateSpot);

router.delete("/:id", spotsController.deleteSpot);

module.exports = router;