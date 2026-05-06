import { getPool } from '../db/pool.js';

/**
 * Attaches the DB pool to req.db so route handlers can run req.db.query(...)
 */
export function attachDb(req, _res, next) {
  try {
    req.db = getPool();
  } catch (err) {
    console.error('[db] attachDb:', err.message);
    req.db = null;
  }
  next();
}
