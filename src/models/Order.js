const pool = require("../config/database");

class Order {
  static async create(orderData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const {
        customerId,
        restaurantId,
        items,
        deliveryAddress,
        specialInstructions,
      } = orderData;

      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        const menuItemQuery =
          "SELECT price FROM menu_items WHERE id = $1 AND is_available = true";
        const menuItemResult = await client.query(menuItemQuery, [
          item.menuItemId,
        ]);

        if (!menuItemResult.rows[0]) {
          throw new Error(
            `Menu item ${item.menuItemId} not found or unavailable`
          );
        }

        totalAmount += menuItemResult.rows[0].price * item.quantity;
      }

      // Create order
      const orderQuery = `
        INSERT INTO orders (customer_id, restaurant_id, total_amount, delivery_address, special_instructions)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const orderValues = [
        customerId,
        restaurantId,
        totalAmount,
        deliveryAddress,
        specialInstructions,
      ];
      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // Create order items
      const orderItems = [];
      for (const item of items) {
        const menuItemQuery = "SELECT price FROM menu_items WHERE id = $1";
        const menuItemResult = await client.query(menuItemQuery, [
          item.menuItemId,
        ]);
        const unitPrice = menuItemResult.rows[0].price;

        const orderItemQuery = `
          INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, special_requests)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;

        const orderItemValues = [
          order.id,
          item.menuItemId,
          item.quantity,
          unitPrice,
          item.specialRequests,
        ];

        const orderItemResult = await client.query(
          orderItemQuery,
          orderItemValues
        );
        orderItems.push(orderItemResult.rows[0]);
      }

      await client.query("COMMIT");

      return {
        ...order,
        items: orderItems,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async findAll(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        r.name as restaurant_name,
        r.phone as restaurant_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN restaurants r ON o.restaurant_id = r.id
    `;

    const values = [limit, offset];
    let whereClause = "";

    if (status) {
      whereClause = " WHERE o.status = $3";
      values.push(status);
    }

    query += whereClause + " ORDER BY o.created_at DESC LIMIT $1 OFFSET $2";

    const countQuery = "SELECT COUNT(*) FROM orders o" + whereClause;
    const countValues = status ? [status] : [];

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, countValues),
    ]);

    return {
      orders: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  }

  static async findById(id) {
    const orderQuery = `
      SELECT
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address,
        r.name as restaurant_name,
        r.phone as restaurant_phone,
        r.address as restaurant_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = $1
    `;

    const itemsQuery = `
      SELECT
        oi.*,
        mi.name as menu_item_name,
        mi.description as menu_item_description,
        mi.category as menu_item_category
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      ORDER BY mi.category, mi.name
    `;

    const [orderResult, itemsResult] = await Promise.all([
      pool.query(orderQuery, [id]),
      pool.query(itemsQuery, [id]),
    ]);

    if (!orderResult.rows[0]) {
      return null;
    }

    return {
      ...orderResult.rows[0],
      items: itemsResult.rows,
    };
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM orders WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByCustomer(customerId, status = null) {
    let query = `
      SELECT
        o.*,
        r.name as restaurant_name,
        r.cuisine_type
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

  static async getByRestaurant(restaurantId, status = null) {
    let query = `
      SELECT
        o.*,
        c.name as customer_name,
        c.phone as customer_phone
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

  static async getRecentOrders(limit = 10) {
    const query = `
      SELECT
        o.*,
        c.name as customer_name,
        r.name as restaurant_name,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN restaurants r ON o.restaurant_id = r.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, c.name, r.name
      ORDER BY o.created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Order;
