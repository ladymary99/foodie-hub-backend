const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// ثبت سفارش جدید
router.post("/", orderController.createOrder);

// دریافت همه سفارش‌ها
router.get("/", orderController.getAllOrders);

// دریافت سفارش‌های یک مشتری خاص
router.get("/customer/:customerId", orderController.getOrdersByCustomer);

// به‌روزرسانی وضعیت سفارش
router.patch("/:id/status", orderController.updateOrderStatus);

// حذف یا کنسل کردن سفارش
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
