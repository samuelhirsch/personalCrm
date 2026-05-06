import { Router } from 'express';
import { dbReady } from '../utils/dbReady.js';

const router = Router({ mergeParams: true });
const DEAL_STAGES = ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'];

function serializeDeal(row) {
  return {
    id: Number(row.id),
    title: row.title,
    stage: row.stage,
    value: row.value != null ? String(row.value) : '',
  };
}

router.post('/', async (req, res) => {
  if (!dbReady(req, res)) return;

  const contactId = Number(req.params.contactId);
  if (!Number.isInteger(contactId) || contactId < 1) {
    return res.status(400).json({ message: 'Invalid contact id.' });
  }

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return res.status(400).json({ message: 'title is required.' });
  }

  const stage = DEAL_STAGES.includes(req.body?.stage) ? req.body.stage : 'Lead';
  let value = req.body?.value;
  if (value === '' || value == null) value = null;
  else value = String(value);

  try {
    const [[c]] = await req.db.query('SELECT id FROM contacts WHERE id = ?', [contactId]);
    if (!c) return res.status(404).json({ message: 'Contact not found.' });

    const [r] = await req.db.query(
      'INSERT INTO deals (contact_id, title, stage, value) VALUES (?, ?, ?, ?)',
      [contactId, title, stage, value],
    );
    const [[row]] = await req.db.query(
      'SELECT id, contact_id, title, stage, value, created_at FROM deals WHERE id = ?',
      [r.insertId],
    );
    res.status(201).json(serializeDeal(row));
  } catch (err) {
    console.error('[deals] POST /', err);
    res.status(500).json({ message: 'Failed to save deal.' });
  }
});

router.patch('/:dealId', async (req, res) => {
  if (!dbReady(req, res)) return;

  const contactId = Number(req.params.contactId);
  const dealId = Number(req.params.dealId);
  if (!Number.isInteger(contactId) || !Number.isInteger(dealId)) {
    return res.status(400).json({ message: 'Invalid id.' });
  }

  const sets = [];
  const vals = [];

  if ('title' in req.body) {
    const t = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    sets.push('title = ?');
    vals.push(t || null);
  }
  if ('stage' in req.body && DEAL_STAGES.includes(req.body.stage)) {
    sets.push('stage = ?');
    vals.push(req.body.stage);
  }
  if ('value' in req.body) {
    let v = req.body.value;
    if (v === '' || v == null) v = null;
    else v = String(v);
    sets.push('value = ?');
    vals.push(v);
  }

  if (sets.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' });
  }

  vals.push(dealId, contactId);

  try {
    const [r] = await req.db.query(
      `UPDATE deals SET ${sets.join(', ')} WHERE id = ? AND contact_id = ?`,
      vals,
    );
    if (r.affectedRows === 0) {
      return res.status(404).json({ message: 'Deal not found or contact id is invalid.' });
    }
    const [[row]] = await req.db.query(
      'SELECT id, contact_id, title, stage, value, created_at FROM deals WHERE id = ?',
      [dealId],
    );
    res.json(serializeDeal(row));
  } catch (err) {
    console.error('[deals] PATCH /:dealId', err);
    res.status(500).json({ message: 'Failed to update deal.' });
  }
});

router.delete('/:dealId', async (req, res) => {
  if (!dbReady(req, res)) return;

  const contactId = Number(req.params.contactId);
  const dealId = Number(req.params.dealId);
  if (!Number.isInteger(contactId) || !Number.isInteger(dealId)) {
    return res.status(400).json({ message: 'Invalid id.' });
  }

  try {
    const [r] = await req.db.query(
      'DELETE FROM deals WHERE id = ? AND contact_id = ?',
      [dealId, contactId],
    );
    if (r.affectedRows === 0) {
      return res.status(404).json({ message: 'Deal not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('[deals] DELETE /:dealId', err);
    res.status(500).json({ message: 'Failed to delete deal.' });
  }
});

export default router;
