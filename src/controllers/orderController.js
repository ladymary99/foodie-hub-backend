const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const OrderItem = require("../models/OrderItem");

const orderController = {
  // Create a new order
  async createOrder(req, res) {
    try {
      const {
        customerId,
        restaurantId,
        items,
        deliveryAddress,
        specialInstructions,
      } = req.body;

      // Validation
      if (
        !customerId ||
        !restaurantId ||
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          error: "Customer ID, restaurant ID, and items array are required",
        });
      }

      // Validate each item
      for (const item of items) {
        if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            error:
              "Each item must have a valid menu item ID and quantity greater than 0",
          });
        }
      }

      // Check if customer exists
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          error: "Customer not found",
        });
      }

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          error: "Restaurant not found",
        });
      }

      // Validate all menu items exist and are available
      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) {
          return res.status(404).json({
            error: `Menu item ${item.menuItemId} not found`,
          });
        }
        if (!menuItem.is_available) {
          return res.status(400).json({
            error: `Menu item "${menuItem.name}" is currently unavailable`,
          });
        }
        if (menuItem.restaurant_id !== restaurantId) {
          return res.status(400).json({
            error: `Menu item "${menuItem.name}" does not belong to the selected restaurant`,
          });
        }
      }

      const order = await Order.create({
        customerId,
        restaurantId,
        items,
        deliveryAddress,
        specialInstructions,
      });

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get all orders with pagination and filtering
  async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const result = await Order.findAll(page, limit, status);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get order by ID with full details
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }

      // Check if order exists
      const existingOrder = await Order.findById(id);
      if (!existingOrder) {
        return res.status(404).json({
          error: "Order not found",
        });
      }

      const updatedOrder = await Order.updateStatus(id, status);

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Cancel/Delete order
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;

      // Check if order exists and get current status
      const existingOrder = await Order.findById(id);
      if (!existingOrder) {
        return res.status(404).json({
          error: "Order not found",
        });
      }

      // Check if order can be cancelled
      if (["delivered", "cancelled"].includes(existingOrder.status)) {
        return res.status(400).json({
          error: `Cannot delete order with status: ${existingOrder.status}`,
        });
      }

      const deletedOrder = await Order.delete(id);

      res.json({
        success: true,
        message: "Order deleted successfully",
        data: deletedOrder,
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get orders by customer
  async getOrdersByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const { status } = req.query;

      // Check if customer exists
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          error: "Customer not found",
        });
      }

      const orders = await Order.getByCustomer(customerId, status);

      res.json({
        success: true,
        data: {
          customer: customer.name,
          orders,
        },
      });
    } catch (error) {
      console.error("Error fetching orders by customer:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get orders by restaurant
  async getOrdersByRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;
      const { status } = req.query;

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          error: "Restaurant not found",
        });
      }

      const orders = await Order.getByRestaurant(restaurantId, status);

      res.json({
        success: true,
        data: {
          restaurant: restaurant.name,
          orders,
        },
      });
    } catch (error) {
      console.error("Error fetching orders by restaurant:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get recent orders
  async getRecentOrders(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const orders = await Order.getRecentOrders(limit);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get popular menu items across all orders
  async getPopularMenuItems(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const popularItems = await OrderItem.getPopularItems(limit);

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

  // Get sales report
  async getSalesReport(req, res) {
    try {
      const { start_date, end_date } = req.query;

      const salesReport = await OrderItem.getSalesReport(start_date, end_date);

      res.json({
        success: true,
        data: {
          period: {
            start_date: start_date || "All time",
            end_date: end_date || "All time",
          },
          report: salesReport,
        },
      });
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },
};

module.exports = orderController;
