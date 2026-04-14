const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "seat_booking",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Vasu8854@2004",
});

const schema = fs.readFileSync("schema.sql", "utf8");

console.log("Running schema.sql against database...");

pool
  .query(schema)
  .then(() => {
    console.log(
      "✅ Database setup successfully! All tables and seed data created.",
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error executing schema:", err);
    process.exit(1);
  });
