const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function initializeDatabase() {
  // Connect to PostgreSQL server (without database)
  const adminPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log(" Connecting to PostgreSQL server...");

    const dbName = process.env.DB_NAME;
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const dbExists = await adminPool.query(checkDbQuery, [dbName]);

    if (dbExists.rows.length === 0) {
      console.log(`Creating database '${dbName}'...`);
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully`);
    } else {
      console.log(`Database '${dbName}' already exists`);
    }

    await adminPool.end();

    // Connect to the target database
    const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    console.log(` Connecting to database '${dbName}'...`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, "../../database/schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("Executing database schema...");
    await pool.query(schemaSQL);
    console.log("Database schema applied successfully");

    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tables = await pool.query(tablesQuery);
    console.log("Created tables:");
    tables.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    const counts = await Promise.all([
      pool.query("SELECT COUNT(*) FROM restaurants"),
      pool.query("SELECT COUNT(*) FROM customers"),
      pool.query("SELECT COUNT(*) FROM menu_items"),
    ]);

    console.log("Sample data loaded:");
    console.log(`   - Restaurants: ${counts[0].rows[0].count}`);
    console.log(`   - Customers: ${counts[1].rows[0].count}`);
    console.log(`   - Menu Items: ${counts[2].rows[0].count}`);

    await pool.end();
    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    process.exit(1);
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
