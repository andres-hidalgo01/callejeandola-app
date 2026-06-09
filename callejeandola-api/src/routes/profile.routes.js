const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/me", authMiddleware, profileController.getMyProfile);
router.put("/me", authMiddleware, profileController.updateMyProfile);

module.exports = router;