import { Router } from 'express';
import { dbReady } from '../utils/dbReady.js';
import { normalizeYmd } from '../utils/normalizeYmd.js';

const router = Router();

function serializeTask(row) {
  return {
    id: Number(row.id),
    title: row.title,
    due_date: row.due_date ? normalizeYmd(row.due_date) : '',
    done: Boolean(row.done),
  };
}

router.get('/', async (req, res) => {
  if (!dbReady(req, res)) return;

  try {
    const [rows] = await req.db.query(
      'SELECT id, title, due_date, done FROM tasks ORDER BY done ASC, due_date IS NULL ASC, due_date ASC, id DESC',
    );
    res.json(rows.map(serializeTask));
  } catch (err) {
    console.error('[tasks] GET /', err);
    res.status(500).json({ message: 'Failed to load tasks.' });
  }
});

router.post('/', async (req, res) => {
  if (!dbReady(req, res)) return;

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return res.status(400).json({ message: 'Task title cannot be empty.' });
  }

  const dueDate = req.body?.due_date && String(req.body.due_date).trim()
    ? String(req.body.due_date).slice(0, 10)
    : null;

  try {
    const [r] = await req.db.query(
      'INSERT INTO tasks (title, due_date, done) VALUES (?, ?, 0)',
      [title, dueDate],
    );
    const [[row]] = await req.db.query(
      'SELECT id, title, due_date, done FROM tasks WHERE id = ?',
      [r.insertId],
    );
    res.status(201).json(serializeTask(row));
  } catch (err) {
    console.error('[tasks] POST /', err);
    res.status(500).json({ message: 'Failed to create task.' });
  }
});

router.patch('/:id', async (req, res) => {
  if (!dbReady(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Invalid task id.' });
  }

  const sets = [];
  const values = [];

  if ('title' in req.body) {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      return res.status(400).json({ message: 'Task title cannot be empty.' });
    }
    sets.push('title = ?');
    values.push(title);
  }

  if ('due_date' in req.body) {
    const dueDate = req.body.due_date && String(req.body.due_date).trim()
      ? String(req.body.due_date).slice(0, 10)
      : null;
    sets.push('due_date = ?');
    values.push(dueDate);
  }

  if ('done' in req.body) {
    sets.push('done = ?');
    values.push(req.body.done ? 1 : 0);
  }

  if (sets.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' });
  }

  values.push(id);

  try {
    const [r] = await req.db.query(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, values);
    if (r.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const [[row]] = await req.db.query(
      'SELECT id, title, due_date, done FROM tasks WHERE id = ?',
      [id],
    );
    res.json(serializeTask(row));
  } catch (err) {
    console.error('[tasks] PATCH /:id', err);
    res.status(500).json({ message: 'Failed to update task.' });
  }
});

router.delete('/:id', async (req, res) => {
  if (!dbReady(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Invalid task id.' });
  }

  try {
    const [r] = await req.db.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('[tasks] DELETE /:id', err);
    res.status(500).json({ message: 'Failed to delete task.' });
  }
});

export default router;
