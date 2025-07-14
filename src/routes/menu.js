const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

// Menu item CRUD operations
router.post("/", menuController.createMenuItem);
router.get("/:id", menuController.getMenuItemById);
router.put("/:id", menuController.updateMenuItem);
router.delete("/:id", menuController.deleteMenuItem);

// Menu item specific operations
router.patch("/:id/toggle-availability", menuController.toggleAvailability);

// Menu browsing and search
router.get("/popular/items", menuController.getPopularMenuItems);
router.get("/search/category", menuController.searchByCategory);

module.exports = router;
