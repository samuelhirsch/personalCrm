import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { protectApi } from './middleware/auth.js';
import { attachDb } from './middleware/db.js';
import contactsRouter from './routes/contacts.js';
import sendEmailRouter from './routes/sendemail.js';
import dashboardRouter from './routes/dashboard.js';
import tasksRouter from './routes/tasks.js';
import aiRouter from './routes/aiRouter.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

function logDbError(prefix, err) {
  console.error(prefix, {
    code: err.code,
    errno: err.errno,
    sqlState: err.sqlState,
    sqlMessage: err.sqlMessage,
    message: err.message,
  });
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('[db] Hint: Check DB_USER and DB_PASSWORD in backend/.env match a MariaDB user (e.g. CREATE USER ... IDENTIFIED BY ...; GRANT ...).');
  }
  if (err.code === 'ER_BAD_DB_ERROR') {
    console.error('[db] Hint: Create the database (run schema.sql) or fix DB_NAME in .env.');
  }
}

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(attachDb);
app.use(protectApi);

app.post('/api/login', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('Missing JWT_SECRET in .env');
    return res.status(500).json({ message: 'Server is not configured.' });
  }

  if (!email || !password || email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ sub: email }, secret, { expiresIn: '7d' });
  return res.json({ token });
});

app.get('/api/health', async (req, res) => {
  let db = false;
  let dbError = null;
  try {
    if (req.db) {
      await req.db.query('SELECT 1');
      db = true;
    }
  } catch (err) {
    logDbError('[db] health check failed:', err);
    dbError = err.code || err.message;
  }
  res.json({
    ok: true,
    db,
    ...(process.env.NODE_ENV !== 'production' && dbError ? { dbError } : {}),
  });
});

app.get('/api/me', (req, res) => {
  res.json({ email: req.user.email });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/sendemail', sendEmailRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/ai-chat', aiRouter);

app.listen(port, () => {
  console.log(`MyCRM API listening on http://localhost:${port}`);
});
