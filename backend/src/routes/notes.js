import { Router } from 'express';
import { dbReady } from '../utils/dbReady.js';

const router = Router({ mergeParams: true });

function formatDisplayDate(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('en-CA');
}

function serializeNote(row) {
  return {
    id: Number(row.id),
    body: row.body,
    created_at: formatDisplayDate(row.created_at),
  };
}

router.post('/', async (req, res) => {
  if (!dbReady(req, res)) return;

  const contactId = Number(req.params.contactId);
  if (!Number.isInteger(contactId) || contactId < 1) {
    return res.status(400).json({ message: 'Invalid contact id.' });
  }

  const text = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
  if (!text) {
    return res.status(400).json({ message: 'body is required.' });
  }

  try {
    const [[c]] = await req.db.query('SELECT id FROM contacts WHERE id = ?', [contactId]);
    if (!c) return res.status(404).json({ message: 'Contact not found.' });

    const [r] = await req.db.query(
      'INSERT INTO notes (contact_id, body) VALUES (?, ?)',
      [contactId, text],
    );
    const [[row]] = await req.db.query(
      'SELECT id, contact_id, body, created_at FROM notes WHERE id = ?',
      [r.insertId],
    );
    res.status(201).json(serializeNote(row));
  } catch (err) {
    console.error('[notes] POST /', err);
    res.status(500).json({ message: 'Failed to save note.' });
  }
});

router.delete('/:noteId', async (req, res) => {
  if (!dbReady(req, res)) return;

  const contactId = Number(req.params.contactId);
  const noteId = Number(req.params.noteId);
  if (!Number.isInteger(contactId) || !Number.isInteger(noteId)) {
    return res.status(400).json({ message: 'Invalid id.' });
  }

  try {
    const [r] = await req.db.query(
      'DELETE FROM notes WHERE id = ? AND contact_id = ?',
      [noteId, contactId],
    );
    if (r.affectedRows === 0) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('[notes] DELETE /:noteId', err);
    res.status(500).json({ message: 'Failed to delete note.' });
  }
});

export default router;
