// const express = require("express");
// const router = express.Router();

// const spotsController = require("../controllers/spots.controller");

// router.get("/", spotsController.getSpots);
// router.post("/", spotsController.createSpot);

// module.exports = router;

const express = require("express");
const router = express.Router();
const spotsController = require("../controllers/spots.controller");

router.get("/", spotsController.getSpots);
router.get("/:id", spotsController.getSpotById);
router.post("/", spotsController.createSpot);
router.put("/:id", spotsController.updateSpot);
router.delete("/:id", spotsController.deleteSpot);

module.exports = router;

/**
 * @swagger
 * /api/spots:
 *   get:
 *     summary: Get all skate spots
 *     responses:
 *       200:
 *         description: List of spots
 */
router.get("/", spotsController.getSpots);