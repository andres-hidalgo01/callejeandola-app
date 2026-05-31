const express = require("express");

const router = express.Router();

const shopsController = require("../controllers/shops.controller");

router.get("/", shopsController.getShops);

router.get("/:id", shopsController.getShopById);

router.post("/", shopsController.createShop);

router.put("/:id", shopsController.updateShop);

router.delete("/:id", shopsController.deleteShop);

module.exports = router;