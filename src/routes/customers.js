const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// Customer CRUD operations
router.post("/", customerController.createCustomer);
router.get("/", customerController.getAllCustomers);

router.get("/search", customerController.searchCustomers);
router.get("/phone/:phone", customerController.getCustomerByPhone);

router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

router.get("/:id/orders", customerController.getCustomerOrders);
router.get("/:id/order-history", customerController.getCustomerOrderHistory);

module.exports = router;
