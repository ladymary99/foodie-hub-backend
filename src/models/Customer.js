const pool = require("../config/database");

class Customer {
  static async create(customerData) {
    const { name, phone, email, address } = customerData;

    const query = `
      INSERT INTO customers (name, phone, email, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [name, phone, email, address];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM customers
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = "SELECT COUNT(*) FROM customers";

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery),
    ]);

    return {
      customers: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  }

  static async findById(id) {
    const query = "SELECT * FROM customers WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByPhone(phone) {
    const query = "SELECT * FROM customers WHERE phone = $1";
    const result = await pool.query(query, [phone]);
    return result.rows[0];
  }

  static async update(id, customerData) {
    const { name, phone, email, address } = customerData;

    const query = `
      UPDATE customers
      SET name = $1, phone = $2, email = $3, address = $4
      WHERE id = $5
      RETURNING *
    `;

    const values = [name, phone, email, address, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM customers WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getOrders(customerId, status = null) {
    let query = `
      SELECT o.*, r.name as restaurant_name, r.phone as restaurant_phone
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.customer_id = $1
    `;
    const values = [customerId];

    if (status) {
      query += " AND o.status = $2";
      values.push(status);
    }

    query += " ORDER BY o.created_at DESC";

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getOrderHistory(customerId) {
    const query = `
      SELECT
        o.*,
        r.name as restaurant_name,
        r.cuisine_type,
        COUNT(oi.id) as total_items,
        SUM(oi.quantity) as total_quantity
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = $1
      GROUP BY o.id, r.name, r.cuisine_type
      ORDER BY o.created_at DESC
    `;

    const result = await pool.query(query, [customerId]);
    return result.rows;
  }

  static async searchByName(name) {
    const query = `
      SELECT * FROM customers
      WHERE name ILIKE $1
      ORDER BY name
    `;
    const result = await pool.query(query, [`%${name}%`]);
    return result.rows;
  }
}

module.exports = Customer;
