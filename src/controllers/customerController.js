const Customer = require("../models/Customer");

const customerController = {
  // Create a new customer
  async createCustomer(req, res) {
    try {
      const { name, phone, email, address } = req.body;

      // Validation
      if (!name || !phone) {
        return res.status(400).json({
          error: "Name and phone are required fields",
        });
      }

      // Check if phone already exists
      const existingCustomer = await Customer.findByPhone(phone);
      if (existingCustomer) {
        return res.status(409).json({
          error: "Customer with this phone number already exists",
          data: existingCustomer,
        });
      }

      const customer = await Customer.create({
        name,
        phone,
        email,
        address,
      });

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Error creating customer:", error);

      // Handle unique constraint violation
      if (
        error.code === "23505" &&
        error.constraint === "customers_phone_key"
      ) {
        return res.status(409).json({
          error: "Customer with this phone number already exists",
        });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get all customers with pagination
  async getAllCustomers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Customer.findAll(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get customer by ID
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          error: "Customer not found",
        });
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get customer by phone
  async getCustomerByPhone(req, res) {
    try {
      const { phone } = req.params;

      const customer = await Customer.findByPhone(phone);

      if (!customer) {
        return res.status(404).json({
          error: "Customer not found",
        });
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error("Error fetching customer by phone:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Update customer
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, email, address } = req.body;

      // Check if customer exists
      const existingCustomer = await Customer.findById(id);
      if (!existingCustomer) {
        return res.status(404).json({
          error: "Customer not found",
        });
      }

      // Check if phone is being changed and if new phone already exists
      if (phone && phone !== existingCustomer.phone) {
        const phoneExists = await Customer.findByPhone(phone);
        if (phoneExists) {
          return res.status(409).json({
            error: "Another customer with this phone number already exists",
          });
        }
      }

      const updatedCustomer = await Customer.update(id, {
        name,
        phone,
        email,
        address,
      });

      res.json({
        success: true,
        message: "Customer updated successfully",
        data: updatedCustomer,
      });
    } catch (error) {
      console.error("Error updating customer:", error);

      // Handle unique constraint violation
      if (
        error.code === "23505" &&
        error.constraint === "customers_phone_key"
      ) {
        return res.status(409).json({
          error: "Another customer with this phone number already exists",
        });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Delete customer
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;

      const deletedCustomer = await Customer.delete(id);

      if (!deletedCustomer) {
        return res.status(404).json({
          error: "Customer not found",
        });
      }

      res.json({
        success: true,
        message: "Customer deleted successfully",
        data: deletedCustomer,
      });
    } catch (error) {
      console.error("Error deleting customer:", error);

      // Handle foreign key constraint violation
      if (error.code === "23503") {
        return res.status(409).json({
          error:
            "Cannot delete customer with existing orders. Please cancel or delete orders first.",
        });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get customer orders
  async getCustomerOrders(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      // Check if customer exists
      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          error: "Customer not found",
        });
      }

      const orders = await Customer.getOrders(id, status);

      res.json({
        success: true,
        data: {
          customer: customer.name,
          orders,
        },
      });
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get customer order history
  async getCustomerOrderHistory(req, res) {
    try {
      const { id } = req.params;

      // Check if customer exists
      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          error: "Customer not found",
        });
      }

      const orderHistory = await Customer.getOrderHistory(id);

      res.json({
        success: true,
        data: {
          customer: customer.name,
          orderHistory,
        },
      });
    } catch (error) {
      console.error("Error fetching customer order history:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Search customers by name
  async searchCustomers(req, res) {
    try {
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({
          error: "Name parameter is required",
        });
      }

      const customers = await Customer.searchByName(name);

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      console.error("Error searching customers:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },
};

module.exports = customerController;
