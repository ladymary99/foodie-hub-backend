const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Import routes
const restaurantRoutes = require("./routes/restaurants");
const menuRoutes = require("./routes/menu");
const customerRoutes = require("./routes/customers");
const orderRoutes = require("./routes/orders");

// Import database connection
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await pool.query("SELECT 1");
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message,
    });
  }
});

// API routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

// Root endpoint with API documentation
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Foodie Hub API",
    version: "1.0.0",
    documentation: {
      restaurants: {
        "POST /api/restaurants": "Create a new restaurant",
        "GET /api/restaurants": "Get all restaurants (with pagination)",
        "GET /api/restaurants/:id": "Get restaurant by ID",
        "PUT /api/restaurants/:id": "Update restaurant",
        "DELETE /api/restaurants/:id": "Delete restaurant",
        "GET /api/restaurants/:id/menu": "Get restaurant menu",
        "GET /api/restaurants/:id/orders": "Get restaurant orders",
      },
      menu: {
        "POST /api/menu": "Create a new menu item",
        "GET /api/menu/:id": "Get menu item by ID",
        "PUT /api/menu/:id": "Update menu item",
        "DELETE /api/menu/:id": "Delete menu item",
        "PATCH /api/menu/:id/toggle-availability":
          "Toggle menu item availability",
        "GET /api/menu/popular/items": "Get popular menu items",
        "GET /api/menu/search/category?category=":
          "Search menu items by category",
      },
      customers: {
        "POST /api/customers": "Create a new customer",
        "GET /api/customers": "Get all customers (with pagination)",
        "GET /api/customers/:id": "Get customer by ID",
        "GET /api/customers/phone/:phone": "Get customer by phone",
        "PUT /api/customers/:id": "Update customer",
        "DELETE /api/customers/:id": "Delete customer",
        "GET /api/customers/:id/orders": "Get customer orders",
        "GET /api/customers/:id/order-history": "Get customer order history",
        "GET /api/customers/search?name=": "Search customers by name",
      },
      orders: {
        "POST /api/orders": "Create a new order",
        "GET /api/orders": "Get all orders (with pagination and filtering)",
        "GET /api/orders/:id": "Get order by ID",
        "PATCH /api/orders/:id/status": "Update order status",
        "DELETE /api/orders/:id": "Delete order",
        "GET /api/orders/customer/:customerId": "Get orders by customer",
        "GET /api/orders/restaurant/:restaurantId": "Get orders by restaurant",
        "GET /api/orders/recent": "Get recent orders",
        "GET /api/orders/popular-menu-items": "Get popular menu items",
        "GET /api/orders/sales-report": "Get sales report",
      },
    },
    queryParameters: {
      pagination: "page (default: 1), limit (default: 10)",
      filtering: "status for orders, include_unavailable for menu items",
      search: "name for customers, category for menu items",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested route ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Foodie Hub API server is running on port ${PORT}`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}/`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;
