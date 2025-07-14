const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");

// Restaurant CRUD operations
router.post("/", restaurantController.createRestaurant);
router.get("/", restaurantController.getAllRestaurants);
router.get("/:id", restaurantController.getRestaurantById);
router.put("/:id", restaurantController.updateRestaurant);
router.delete("/:id", restaurantController.deleteRestaurant);

// Restaurant-specific operations
router.get("/:id/menu", restaurantController.getRestaurantMenu);
router.get("/:id/orders", restaurantController.getRestaurantOrders);

module.exports = router;
