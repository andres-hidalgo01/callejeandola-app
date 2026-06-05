const express = require("express");
const router = express.Router();

const spotsController = require("../controllers/spots.controller");

const {
    authMiddleware,
    requireRole,
} = require("../middlewares/auth.middleware");

const GLOBAL_ADMIN_ONLY = ["GLOBAL_ADMIN"];

router.get("/", spotsController.getSpots);
router.get("/:id", spotsController.getSpotById);

router.post(
    "/",
    authMiddleware,
    requireRole(GLOBAL_ADMIN_ONLY),
    spotsController.createSpot
);

router.put(
    "/:id",
    authMiddleware,
    requireRole(GLOBAL_ADMIN_ONLY),
    spotsController.updateSpot
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole(GLOBAL_ADMIN_ONLY),
    spotsController.deleteSpot
);

module.exports = router;