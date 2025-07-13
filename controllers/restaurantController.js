const restaurantModel = require("../models/restaurantModel");

exports.addRestaurant = async (req, res) => {
  const { name, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Restaurant name is required" });
  }
  try {
    const newRestaurant = await restaurantModel.createRestaurant(name, address);
    res.status(201).json(newRestaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
