const pool = require("../config/database");

class MenuItem {
  static async create(menuItemData) {
    const {
      restaurantId,
      name,
      description,
      price,
      category,
      preparationTime,
      imageUrl,
    } = menuItemData;

    const query = `
      INSERT INTO menu_items (restaurant_id, name, description, price, category, preparation_time, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      restaurantId,
      name,
      description,
      price,
      category,
      preparationTime,
      imageUrl,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByRestaurant(restaurantId, includeUnavailable = false) {
    let query = `
      SELECT mi.*, r.name as restaurant_name
      FROM menu_items mi
      JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE mi.restaurant_id = $1
    `;

    if (!includeUnavailable) {
      query += " AND mi.is_available = true";
    }

    query += " ORDER BY mi.category, mi.name";

    const result = await pool.query(query, [restaurantId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT mi.*, r.name as restaurant_name
      FROM menu_items mi
      JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE mi.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, menuItemData) {
    const {
      name,
      description,
      price,
      category,
      preparationTime,
      imageUrl,
      isAvailable,
    } = menuItemData;

    const query = `
      UPDATE menu_items
      SET name = $1, description = $2, price = $3, category = $4,
          preparation_time = $5, image_url = $6, is_available = $7
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      name,
      description,
      price,
      category,
      preparationTime,
      imageUrl,
      isAvailable,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM menu_items WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async toggleAvailability(id) {
    const query = `
      UPDATE menu_items
      SET is_available = NOT is_available
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getPopularItems(limit = 10) {
    const query = `
      SELECT
        mi.*,
        r.name as restaurant_name,
        COALESCE(SUM(oi.quantity), 0) as total_ordered
      FROM menu_items mi
      JOIN restaurants r ON mi.restaurant_id = r.id
      LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE mi.is_available = true
        AND (o.status IS NULL OR o.status NOT IN ('cancelled'))
      GROUP BY mi.id, r.name
      ORDER BY total_ordered DESC, mi.name
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async searchByCategory(category) {
    const query = `
      SELECT mi.*, r.name as restaurant_name
      FROM menu_items mi
      JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE mi.category ILIKE $1 AND mi.is_available = true
      ORDER BY r.name, mi.name
    `;
    const result = await pool.query(query, [`%${category}%`]);
    return result.rows;
  }
}

module.exports = MenuItem;
