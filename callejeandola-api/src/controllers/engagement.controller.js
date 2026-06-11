const engagementService = require("../services/engagement.service");

exports.getFavoriteSpots = async (req, res) => {
    try {
        const spots = await engagementService.getFavoriteSpots(req.user.id);

        res.json({
            data: spots,
        });
    } catch (error) {
        console.error("Get favorite spots error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error fetching favorite spots",
        });
    }
};

exports.addFavoriteSpot = async (req, res) => {
    try {
        const favorite = await engagementService.addFavoriteSpot(
            req.user.id,
            req.params.spotId
        );

        res.status(201).json({
            data: favorite,
        });
    } catch (error) {
        console.error("Add favorite spot error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error adding favorite spot",
        });
    }
};

exports.removeFavoriteSpot = async (req, res) => {
    try {
        const removed = await engagementService.removeFavoriteSpot(
            req.user.id,
            req.params.spotId
        );

        res.json({
            data: removed,
            message: removed ? "Favorite spot removed" : "Favorite spot was not saved",
        });
    } catch (error) {
        console.error("Remove favorite spot error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error removing favorite spot",
        });
    }
};

exports.getSavedEvents = async (req, res) => {
    try {
        const events = await engagementService.getSavedEvents(req.user.id);

        res.json({
            data: events,
        });
    } catch (error) {
        console.error("Get saved events error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error fetching saved events",
        });
    }
};

exports.addSavedEvent = async (req, res) => {
    try {
        const savedEvent = await engagementService.addSavedEvent(
            req.user.id,
            req.params.eventId
        );

        res.status(201).json({
            data: savedEvent,
        });
    } catch (error) {
        console.error("Add saved event error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error adding saved event",
        });
    }
};

exports.removeSavedEvent = async (req, res) => {
    try {
        const removed = await engagementService.removeSavedEvent(
            req.user.id,
            req.params.eventId
        );

        res.json({
            data: removed,
            message: removed ? "Saved event removed" : "Event was not saved",
        });
    } catch (error) {
        console.error("Remove saved event error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error removing saved event",
        });
    }
};