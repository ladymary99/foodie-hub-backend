// index.js
const express = require("express");
const app = express();
const restaurantRoutes = require("./routes/restaurantRoutes");
require("dotenv").config();

app.use(express.json());

// routes
app.use("/restaurants", restaurantRoutes);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
