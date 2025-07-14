const pool = require("../db/db");

exports.createOrder = async (req, res) => {
  const { customer_id, restaurant_id, items } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      "INSERT INTO orders (customer_id, restaurant_id, status) VALUES ($1, $2, $3) RETURNING *",
      [customer_id, restaurant_id, "pending"]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES ($1, $2, $3)",
        [orderId, item.menu_item_id, item.quantity]
      );
    }

    await client.query("COMMIT");
    res
      .status(201)
      .json({ message: "Order placed", order: orderResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrdersByCustomer = async (req, res) => {
  const { customerId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE customer_id = $1 ORDER BY id DESC",
      [customerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تغییر وضعیت سفارش
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM orders WHERE id = $1", [id]);
    res.json({ message: "Order deleted or cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
