const express = require("express");
const router = express.Router();

const { authMiddleware, requireRole } = require("../middlewares/auth.middleware");
const { PERMISSIONS } = require("../config/roles");
const { uploadImage } = require("../middlewares/upload.middleware");
const { uploadImageController } = require("../controllers/upload.controller");

router.post(
    "/image",
    authMiddleware,
    requireRole(PERMISSIONS.GLOBAL_ADMIN_ONLY),
    uploadImage.single("image"),
    uploadImageController
);

module.exports = router;