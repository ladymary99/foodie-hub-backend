const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

// افزودن آیتم به منوی یک رستوران
router.post("/:restaurantId/menu", menuController.addMenuItem);

// دریافت همه آیتم‌های منوی یک رستوران
router.get("/:restaurantId/menu", menuController.getMenuByRestaurant);

// ویرایش آیتم منو
router.put("/menu/:id", menuController.updateMenuItem);

// حذف آیتم منو
router.delete("/menu/:id", menuController.deleteMenuItem);

// تغییر وضعیت موجود بودن آیتم
router.patch("/menu/:id/availability", menuController.toggleAvailability);

module.exports = router;
