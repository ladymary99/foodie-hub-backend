const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);

router.get("/", orderController.getAllOrders);

router.get("/customer/:customerId", orderController.getOrdersByCustomer);

router.patch("/:id/status", orderController.updateOrderStatus);

router.delete("/:id", orderController.deleteOrder);

module.exports = router;
