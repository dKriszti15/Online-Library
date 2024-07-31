import mysql from 'mysql2/promise.js';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Kecske111',
  database: 'webprog',
  connectionLimit: 100,
  queueLimit: 0,
});

export default pool;
