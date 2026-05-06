import { Router } from 'express';
import { dbReady } from '../utils/dbReady.js';
import { normalizeYmd } from '../utils/normalizeYmd.js';
import notesRouter from './notes.js';
import dealsRouter from './deals.js';

const router = Router();

function formatDisplayDate(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('en-CA');
}

function serializeContact(row) {
  return {
    id: Number(row.id),
    first_name: row.first_name,
    last_name: row.last_name,
    company: row.company ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    role: row.role ?? '',
    follow_up_date: row.follow_up_date ? normalizeYmd(row.follow_up_date) : '',
    created_at: formatDisplayDate(row.created_at),
    updated_at: formatDisplayDate(row.updated_at),
  };
}

function serializeNote(row) {
  return {
    id: Number(row.id),
    body: row.body,
    created_at: formatDisplayDate(row.created_at),
  };
}

function serializeDeal(row) {
  return {
    id: Number(row.id),
    title: row.title,
    stage: row.stage,
    value: row.value != null ? String(row.value) :'',
  };
}

function groupByContact(rows, contactIdKey = 'contact_id') {
  return rows.reduce((acc, row) => {
    const cid = Number(row[contactIdKey]);
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(row);
    return acc;
  }, {});
}

router.use('/:contactId/notes', notesRouter);
router.use('/:contactId/deals', dealsRouter);


/** GET /api/contacts — list all contacts with notes and deals */
router.get('/', async (req, res) => {
  if (!dbReady(req, res)) return;

  try {
    const [contacts] = await req.db.query(
      `SELECT id, first_name, last_name, company, phone, email, role, follow_up_date, created_at, updated_at
       FROM contacts
       ORDER BY created_at DESC`,
    );

    if (contacts.length === 0) {
      return res.json([]);
    }

    const ids = contacts.map((c) => c.id);

    const [notesRows] = await req.db.query(
      'SELECT id, contact_id, body, created_at FROM notes WHERE contact_id IN (?) ORDER BY created_at DESC',
      [ids],
    );

    const [dealsRows] = await req.db.query(
      'SELECT id, contact_id, title, stage, value, created_at FROM deals WHERE contact_id IN (?) ORDER BY id ASC',
      [ids],
    );

    const notesBy = groupByContact(notesRows);
    const dealsBy = groupByContact(dealsRows);

    const result = contacts.map((c) => {
      const id = Number(c.id);
      return {
        ...serializeContact(c),
        notes: (notesBy[id] || []).map(serializeNote),
        deals: (dealsBy[id] || []).map(serializeDeal),
      };
    });

    res.json(result);
  } catch (err) {
    console.error('[contacts] GET /', err);
    res.status(500).json({ message: 'Failed to load contacts.' });
  }
});

/** POST /api/contacts — create contact */
router.post('/', async (req, res) => {
  if (!dbReady(req, res)) return;

  const first = typeof req.body?.first_name === 'string' ? req.body.first_name.trim() : '';
  const last = typeof req.body?.last_name === 'string' ? req.body.last_name.trim() : '';

  const company = req.body.company != null ? String(req.body.company).trim() || null : null;
  const phone = req.body.phone != null ? String(req.body.phone).trim() || null : null;
  const email = req.body.email != null ? String(req.body.email).trim() || null : null;
  const role = req.body.role != null ? String(req.body.role).trim() || null : null;
  const followUp = req.body.follow_up_date && String(req.body.follow_up_date).trim()
    ? String(req.body.follow_up_date).slice(0, 10)
    : null;

  try {
    const [r] = await req.db.query(
      `INSERT INTO contacts (first_name, last_name, company, phone, email, role, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first, last, company, phone, email, role, followUp],
    );

    const id = Number(r.insertId);
    const [[row]] = await req.db.query(
      'SELECT id, first_name, last_name, company, phone, email, role, follow_up_date, created_at, updated_at FROM contacts WHERE id = ?',
      [id],
    );

    res.status(201).json({
      ...serializeContact(row),
      notes: [],
      deals: [],
    });
  } catch (err) {
    console.error('[contacts] POST /', err);
    res.status(500).json({ message: 'Failed to create contact.' });
  }
});

/** PATCH /api/contacts/:id — update fields */
router.patch('/:id', async (req, res) => {
  if (!dbReady(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Invalid contact id.' });
  }

  const allowed = ['first_name', 'last_name', 'company', 'phone', 'email', 'role', 'follow_up_date'];
  const sets = [];
  const vals = [];

  for (const key of allowed) {
    if (!(key in req.body)) continue;
    let v = req.body[key];
    if (key === 'follow_up_date') {
      v = v && String(v).trim() ? String(v).slice(0, 10) : null;
    } else if (typeof v === 'string') {
      v = v.trim() || null;
    }
    sets.push(`${key} = ?`);
    vals.push(v);
  }

  if (sets.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' });
  }

  vals.push(id);

  try {
    const [r] = await req.db.query(
      `UPDATE contacts SET ${sets.join(', ')} WHERE id = ?`,
      vals,
    );

    if (r.affectedRows === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    const [[contacts]] = await req.db.query(
      'SELECT id, first_name, last_name, company, phone, email, role, follow_up_date, created_at, updated_at FROM contacts WHERE id = ?',
      [id],
    );

    const [notesRows] = await req.db.query(
      'SELECT id, contact_id, body, created_at FROM notes WHERE contact_id = ? ORDER BY created_at DESC',
      [id],
    );

    const [dealsRows] = await req.db.query(
      'SELECT id, contact_id, title, stage, value, created_at FROM deals WHERE contact_id = ? ORDER BY id ASC',
      [id],
    );
    console.log(notesRows, dealsRows);
    res.json({
      ...serializeContact(contacts),
      notes: notesRows.map(serializeNote),
      deals: dealsRows.map(serializeDeal),
    });
  } catch (err) {
    console.error('[contacts] PATCH /:id', err);
    res.status(500).json({ message: 'Failed to update contact.' });
  }
});

/** DELETE /api/contacts/:id */
router.delete('/:id', async (req, res) => {
  if (!dbReady(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Invalid contact id.' });
  }

  try {
    const [r] = await req.db.query('DELETE FROM contacts WHERE id = ?', [id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('[contacts] DELETE /:id', err);
    res.status(500).json({ message: 'Failed to delete contact.' });
  }
});

export default router;
