// const express = require("express");
// const router = express.Router();

// const shopsController = require("../controllers/shops.controller");

// const {
//     authMiddleware,
//     requireRole,
// } = require("../middlewares/auth.middleware");

// const GLOBAL_ADMIN_ONLY = ["GLOBAL_ADMIN"];

// router.get("/", shopsController.getShops);
// router.get("/:id", shopsController.getShopById);

// router.post(
//     "/",
//     authMiddleware,
//     requireRole(GLOBAL_ADMIN_ONLY),
//     shopsController.createShop
// );

// router.put(
//     "/:id",
//     authMiddleware,
//     requireRole(GLOBAL_ADMIN_ONLY),
//     shopsController.updateShop
// );

// router.delete(
//     "/:id",
//     authMiddleware,
//     requireRole(GLOBAL_ADMIN_ONLY),
//     shopsController.deleteShop
// );

// module.exports = router;

const express = require("express");
const router = express.Router();

const shopsController = require("../controllers/shops.controller");

const {
    authMiddleware,
    requireRole,
} = require("../middlewares/auth.middleware");

const { PERMISSIONS } = require("../config/roles");

router.get("/", shopsController.getShops);

if (shopsController.getShopById) {
    router.get("/:id", shopsController.getShopById);
}

router.post(
    "/",
    authMiddleware,
    requireRole(PERMISSIONS.GLOBAL_ADMIN_ONLY),
    shopsController.createShop
);

router.put(
    "/:id",
    authMiddleware,
    requireRole(PERMISSIONS.GLOBAL_ADMIN_ONLY),
    shopsController.updateShop
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole(PERMISSIONS.GLOBAL_ADMIN_ONLY),
    shopsController.deleteShop
);

module.exports = router;