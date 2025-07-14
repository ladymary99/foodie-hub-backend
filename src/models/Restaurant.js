const pool = require("../config/database");

class Restaurant {
  static async create(restaurantData) {
    const {
      name,
      description,
      address,
      phone,
      email,
      cuisineType,
      openingHours,
    } = restaurantData;

    const query = `
      INSERT INTO restaurants (name, description, address, phone, email, cuisine_type, opening_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      name,
      description,
      address,
      phone,
      email,
      cuisineType,
      openingHours,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM restaurants
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery =
      "SELECT COUNT(*) FROM restaurants WHERE is_active = true";

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery),
    ]);

    return {
      restaurants: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  }

  static async findById(id) {
    const query =
      "SELECT * FROM restaurants WHERE id = $1 AND is_active = true";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, restaurantData) {
    const {
      name,
      description,
      address,
      phone,
      email,
      cuisineType,
      openingHours,
    } = restaurantData;

    const query = `
      UPDATE restaurants
      SET name = $1, description = $2, address = $3, phone = $4,
          email = $5, cuisine_type = $6, opening_hours = $7
      WHERE id = $8 AND is_active = true
      RETURNING *
    `;

    const values = [
      name,
      description,
      address,
      phone,
      email,
      cuisineType,
      openingHours,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query =
      "UPDATE restaurants SET is_active = false WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getMenuItems(restaurantId) {
    const query = `
      SELECT * FROM menu_items
      WHERE restaurant_id = $1
      ORDER BY category, name
    `;
    const result = await pool.query(query, [restaurantId]);
    return result.rows;
  }

  static async getOrders(restaurantId, status = null) {
    let query = `
      SELECT o.*, c.name as customer_name, c.phone as customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.restaurant_id = $1
    `;
    const values = [restaurantId];

    if (status) {
      query += " AND o.status = $2";
      values.push(status);
    }

    query += " ORDER BY o.created_at DESC";

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Restaurant;
