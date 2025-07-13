const pool = require("../db/db");

// افزودن آیتم منو
exports.addMenuItem = async (req, res) => {
  const { restaurantId } = req.params;
  const { name, price } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO menu_items (restaurant_id, name, price) VALUES ($1, $2, $3) RETURNING *",
      [restaurantId, name, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// دریافت منوی یک رستوران
exports.getMenuByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY id",
      [restaurantId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ویرایش آیتم منو
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const result = await pool.query(
      "UPDATE menu_items SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name, price, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// حذف آیتم منو
exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تغییر وضعیت موجود بودن
exports.toggleAvailability = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE menu_items SET is_available = NOT is_available WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
