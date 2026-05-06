import jwt from 'jsonwebtoken';

/** All `/api/*` routes need a valid JWT except POST /api/login and GET /api/health. OPTIONS is allowed for CORS preflight. */
export function protectApi(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  if (!req.path.startsWith('/api')) {
    return next();
  }
  if (req.path === '/api/login' && req.method === 'POST') {
    return next();
  }
  if (req.path === '/api/health' && req.method === 'GET') {
    return next();
  }
  return requireAuth(req, res, next);
}

export function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'Server is not configured.' });
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, secret);
    req.user = { email: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
