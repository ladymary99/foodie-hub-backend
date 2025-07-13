const pool = require("../db/db");

// نمایش همه رستوران‌ها
exports.getAllRestaurants = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM restaurants ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// افزودن رستوران جدید
exports.createRestaurant = async (req, res) => {
  const { name, address } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO restaurants (name, address) VALUES ($1, $2) RETURNING *",
      [name, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ویرایش اطلاعات رستوران
exports.updateRestaurant = async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  try {
    const result = await pool.query(
      "UPDATE restaurants SET name = $1, address = $2 WHERE id = $3 RETURNING *",
      [name, address, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// حذف رستوران
exports.deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM restaurants WHERE id = $1", [id]);
    res.json({ message: "Restaurant deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
