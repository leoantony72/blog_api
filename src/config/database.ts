const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE || "blog",
  max: 5,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});
module.exports = pool;

pool.on("error", (err: any) => {
  console.log("error ", err);
  process.exit(-1);
});
