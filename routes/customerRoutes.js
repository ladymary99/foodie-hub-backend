const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.post("/", customerController.addCustomer); // اضافه کردن مشتری
router.get("/", customerController.getAllCustomers); // دریافت همه مشتری‌ها
router.put("/:id", customerController.updateCustomer); // ویرایش مشتری
router.delete("/:id", customerController.deleteCustomer); // حذف مشتری

module.exports = router;
