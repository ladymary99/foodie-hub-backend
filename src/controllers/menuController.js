const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

const menuController = {
  // Add menu item to restaurant
  async createMenuItem(req, res) {
    try {
      const {
        restaurantId,
        name,
        description,
        price,
        category,
        preparationTime,
        imageUrl,
      } = req.body;

      // Validation
      if (!restaurantId || !name || !price) {
        return res.status(400).json({
          error: "Restaurant ID, name, and price are required fields",
        });
      }

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          error: "Restaurant not found",
        });
      }

      const menuItem = await MenuItem.create({
        restaurantId,
        name,
        description,
        price,
        category,
        preparationTime,
        imageUrl,
      });

      res.status(201).json({
        success: true,
        message: "Menu item created successfully",
        data: menuItem,
      });
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get menu item by ID
  async getMenuItemById(req, res) {
    try {
      const { id } = req.params;

      const menuItem = await MenuItem.findById(id);

      if (!menuItem) {
        return res.status(404).json({
          error: "Menu item not found",
        });
      }

      res.json({
        success: true,
        data: menuItem,
      });
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Update menu item
  async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        category,
        preparationTime,
        imageUrl,
        isAvailable,
      } = req.body;

      // Check if menu item exists
      const existingMenuItem = await MenuItem.findById(id);
      if (!existingMenuItem) {
        return res.status(404).json({
          error: "Menu item not found",
        });
      }

      const updatedMenuItem = await MenuItem.update(id, {
        name,
        description,
        price,
        category,
        preparationTime,
        imageUrl,
        isAvailable,
      });

      res.json({
        success: true,
        message: "Menu item updated successfully",
        data: updatedMenuItem,
      });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Delete menu item
  async deleteMenuItem(req, res) {
    try {
      const { id } = req.params;

      const deletedMenuItem = await MenuItem.delete(id);

      if (!deletedMenuItem) {
        return res.status(404).json({
          error: "Menu item not found",
        });
      }

      res.json({
        success: true,
        message: "Menu item deleted successfully",
        data: deletedMenuItem,
      });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Toggle menu item availability
  async toggleAvailability(req, res) {
    try {
      const { id } = req.params;

      const updatedMenuItem = await MenuItem.toggleAvailability(id);

      if (!updatedMenuItem) {
        return res.status(404).json({
          error: "Menu item not found",
        });
      }

      res.json({
        success: true,
        message: `Menu item ${
          updatedMenuItem.is_available ? "enabled" : "disabled"
        } successfully`,
        data: updatedMenuItem,
      });
    } catch (error) {
      console.error("Error toggling menu item availability:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get popular menu items
  async getPopularMenuItems(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const popularItems = await MenuItem.getPopularItems(limit);

      res.json({
        success: true,
        data: popularItems,
      });
    } catch (error) {
      console.error("Error fetching popular menu items:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Search menu items by category
  async searchByCategory(req, res) {
    try {
      const { category } = req.query;

      if (!category) {
        return res.status(400).json({
          error: "Category parameter is required",
        });
      }

      const menuItems = await MenuItem.searchByCategory(category);

      res.json({
        success: true,
        data: menuItems,
      });
    } catch (error) {
      console.error("Error searching menu items by category:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },
};

module.exports = menuController;
