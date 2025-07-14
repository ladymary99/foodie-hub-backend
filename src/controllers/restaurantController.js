const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

const restaurantController = {
  // Create a new restaurant
  async createRestaurant(req, res) {
    try {
      const {
        name,
        description,
        address,
        phone,
        email,
        cuisineType,
        openingHours,
      } = req.body;

      // Validation
      if (!name || !address || !phone) {
        return res.status(400).json({
          error: "Name, address, and phone are required fields",
        });
      }

      const restaurant = await Restaurant.create({
        name,
        description,
        address,
        phone,
        email,
        cuisineType,
        openingHours,
      });

      res.status(201).json({
        success: true,
        message: "Restaurant created successfully",
        data: restaurant,
      });
    } catch (error) {
      console.error("Error creating restaurant:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get all restaurants with pagination
  async getAllRestaurants(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Restaurant.findAll(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get restaurant by ID
  async getRestaurantById(req, res) {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
        return res.status(404).json({
          error: "Restaurant not found",
        });
      }

      res.json({
        success: true,
        data: restaurant,
      });
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Update restaurant
  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        address,
        phone,
        email,
        cuisineType,
        openingHours,
      } = req.body;

      // Check if restaurant exists
      const existingRestaurant = await Restaurant.findById(id);
      if (!existingRestaurant) {
        return res.status(404).json({
          error: "Restaurant not found",
        });
      }

      const updatedRestaurant = await Restaurant.update(id, {
        name,
        description,
        address,
        phone,
        email,
        cuisineType,
        openingHours,
      });

      res.json({
        success: true,
        message: "Restaurant updated successfully",
        data: updatedRestaurant,
      });
    } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Delete restaurant (soft delete)
  async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;

      const deletedRestaurant = await Restaurant.delete(id);

      if (!deletedRestaurant) {
        return res.status(404).json({
          error: "Restaurant not found",
        });
      }

      res.json({
        success: true,
        message: "Restaurant deleted successfully",
        data: deletedRestaurant,
      });
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get restaurant menu items
  async getRestaurantMenu(req, res) {
    try {
      const { id } = req.params;
      const includeUnavailable = req.query.include_unavailable === "true";

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return res.status(404).json({
          error: "Restaurant not found",
        });
      }

      const menuItems = await MenuItem.findByRestaurant(id, includeUnavailable);

      res.json({
        success: true,
        data: {
          restaurant: restaurant.name,
          menuItems,
        },
      });
    } catch (error) {
      console.error("Error fetching restaurant menu:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get restaurant orders
  async getRestaurantOrders(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return res.status(404).json({
          error: "Restaurant not found",
        });
      }

      const orders = await Restaurant.getOrders(id, status);

      res.json({
        success: true,
        data: {
          restaurant: restaurant.name,
          orders,
        },
      });
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },
};

module.exports = restaurantController;
