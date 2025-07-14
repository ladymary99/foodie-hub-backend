const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.post("/", customerController.addCustomer);
router.get("/", customerController.getAllCustomers);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
