import mysql from 'mysql2/promise';
import fs from 'fs';
let pool;

/**
 * Shared MariaDB / MySQL pool (mysql2). First call creates the pool; reuse after that.
 */
export function getPool() {
  if (pool) {
    return pool;
  }

  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!user || !database) {
    throw new Error('Missing DB_USER or DB_NAME in .env');
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user,
    password: password ?? '',
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
