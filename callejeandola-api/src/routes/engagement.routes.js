const express = require("express");
const router = express.Router();

const engagementController = require("../controllers/engagement.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/favorites/spots", engagementController.getFavoriteSpots);
router.post("/favorites/spots/:spotId", engagementController.addFavoriteSpot);
router.delete("/favorites/spots/:spotId", engagementController.removeFavoriteSpot);

router.get("/saved-events", engagementController.getSavedEvents);
router.post("/saved-events/:eventId", engagementController.addSavedEvent);
router.delete("/saved-events/:eventId", engagementController.removeSavedEvent);

module.exports = router;