export function dbReady(req, res) {
  if (!req.db) {
    res.status(503).json({ message: 'Database unavailable.' });
    return false;
  }
  return true;
}
