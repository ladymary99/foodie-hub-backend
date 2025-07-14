const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Order CRUD operations
router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/recent", orderController.getRecentOrders);
router.get("/popular-menu-items", orderController.getPopularMenuItems);
router.get("/sales-report", orderController.getSalesReport);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);

// Order filtering operations
router.get("/customer/:customerId", orderController.getOrdersByCustomer);
router.get("/restaurant/:restaurantId", orderController.getOrdersByRestaurant);

module.exports = router;
