const pool = require("../config/database");

class OrderItem {
  static async create(orderItemData) {
    const { orderId, menuItemId, quantity, unitPrice, specialRequests } =
      orderItemData;

    const query = `
      INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, special_requests)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [orderId, menuItemId, quantity, unitPrice, specialRequests];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByOrder(orderId) {
    const query = `
      SELECT
        oi.*,
        mi.name as menu_item_name,
        mi.description as menu_item_description,
        mi.category as menu_item_category,
        mi.image_url as menu_item_image
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      ORDER BY mi.category, mi.name
    `;

    const result = await pool.query(query, [orderId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT
        oi.*,
        mi.name as menu_item_name,
        mi.description as menu_item_description,
        mi.category as menu_item_category,
        o.status as order_status
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, orderItemData) {
    const { quantity, specialRequests } = orderItemData;

    const query = `
      UPDATE order_items
      SET quantity = $1, special_requests = $2
      WHERE id = $3
      RETURNING *
    `;

    const values = [quantity, specialRequests, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM order_items WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getPopularItems(limit = 10) {
    const query = `
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.category,
        r.name as restaurant_name,
        SUM(oi.quantity) as total_ordered,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN restaurants r ON mi.restaurant_id = r.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelled') AND mi.is_available = true
      GROUP BY mi.id, mi.name, mi.description, mi.price, mi.category, r.name
      ORDER BY total_ordered DESC, order_count DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async getMostOrderedByRestaurant(restaurantId, limit = 5) {
    const query = `
      SELECT
        mi.*,
        SUM(oi.quantity) as total_ordered,
        COUNT(DISTINCT oi.order_id) as order_count,
        AVG(oi.unit_price) as avg_price
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE mi.restaurant_id = $1 AND o.status NOT IN ('cancelled')
      GROUP BY mi.id
      ORDER BY total_ordered DESC, order_count DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [restaurantId, limit]);
    return result.rows;
  }

  static async getSalesReport(startDate = null, endDate = null) {
    let query = `
      SELECT
        mi.name as menu_item_name,
        mi.category,
        r.name as restaurant_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue,
        COUNT(DISTINCT oi.order_id) as unique_orders,
        AVG(oi.unit_price) as avg_unit_price
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN restaurants r ON mi.restaurant_id = r.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelled')
    `;

    const values = [];

    if (startDate) {
      query += " AND o.created_at >= $1";
      values.push(startDate);
    }

    if (endDate) {
      query += ` AND o.created_at <= $${values.length + 1}`;
      values.push(endDate);
    }

    query += `
      GROUP BY mi.id, mi.name, mi.category, r.name
      ORDER BY total_revenue DESC, total_quantity DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = OrderItem;
