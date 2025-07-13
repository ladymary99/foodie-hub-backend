const express = require("express");
const app = express();
const restaurantRoutes = require("./routes/restaurantRoutes");
require("dotenv").config();

app.use(express.json());

app.use("/restaurants", restaurantRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  const menuRoutes = require("./routes/menuRoutes");
  app.use("/", menuRoutes);
  const customerRoutes = require("./routes/customerRoutes");
  app.use("/customers", customerRoutes);
  const orderRoutes = require("./routes/orderRoutes");
  app.use("/orders", orderRoutes);
});
