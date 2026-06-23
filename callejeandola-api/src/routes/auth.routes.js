const express = require("express");
const router = express.Router();


const authController = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);

router.post("/verify-email", authController.verifyEmailController);
router.post("/resend-verification-code", authController.resendVerificationCodeController);

module.exports = router;