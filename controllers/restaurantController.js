exports.addRestaurant = async (req, res) => {
  const { name, address } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO restaurants (name, address) VALUES ($1, $2) RETURNING *",
      [name, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
