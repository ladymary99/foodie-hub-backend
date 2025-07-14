const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

router.post("/:restaurantId/menu", menuController.addMenuItem);

router.get("/:restaurantId/menu", menuController.getMenuByRestaurant);

router.put("/menu/:id", menuController.updateMenuItem);

router.delete("/menu/:id", menuController.deleteMenuItem);

router.patch("/menu/:id/availability", menuController.toggleAvailability);

module.exports = router;
