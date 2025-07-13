const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");

router.get("/", restaurantController.getAllRestaurants);
router.post("/", restaurantController.addRestaurant);

module.exports = router;
