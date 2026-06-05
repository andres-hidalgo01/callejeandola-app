const express = require("express");
const router = express.Router();

const sponsorsController = require("../controllers/sponsors.controller");

const {
    authMiddleware,
    requireRole,
} = require("../middlewares/auth.middleware");

const GLOBAL_ADMIN_ONLY = ["GLOBAL_ADMIN"];

router.get("/", sponsorsController.getSponsors);
router.get("/:id", sponsorsController.getSponsorById);

router.post(
    "/",
    authMiddleware,
    requireRole(GLOBAL_ADMIN_ONLY),
    sponsorsController.createSponsor
);

router.put(
    "/:id",
    authMiddleware,
    requireRole(GLOBAL_ADMIN_ONLY),
    sponsorsController.updateSponsor
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole(GLOBAL_ADMIN_ONLY),
    sponsorsController.deleteSponsor
);

module.exports = router;