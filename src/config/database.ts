const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE || "blog",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});
module.exports = pool;
