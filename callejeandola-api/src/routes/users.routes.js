const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");

const {
    authMiddleware,
    requireRole,
} = require("../middlewares/auth.middleware");

const { PERMISSIONS } = require("../config/roles");

router.use(authMiddleware);
router.use(requireRole(PERMISSIONS.GLOBAL_ADMIN_ONLY));

router.get("/", usersController.getUsers);
router.get("/:id", usersController.getUserById);
router.put("/:id/role", usersController.updateUserRole);
router.put("/:id/status", usersController.updateUserStatus);

module.exports = router;