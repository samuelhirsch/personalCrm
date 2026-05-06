
import { Router } from 'express';
import { dbReady } from '../utils/dbReady.js';
import { sendEmail } from '../mail/smtp.js';

const router = Router();

/** POST /api/sendemail — body: { contactId, subject, body | text }; recipient from DB contact */
router.post('/', async (req, res) => {
  if (!dbReady(req, res)) return;

  const contactId = Number(req.body?.contactId);
  if (!Number.isInteger(contactId) || contactId < 1) {
    return res.status(400).json({ message: 'Invalid contact id.' });
  }

  const subject = req.body?.subject != null ? String(req.body.subject) : '';
  const text =
    req.body?.body != null
      ? String(req.body.body)
      : req.body?.text != null
        ? String(req.body.text)
        : '';

  try {
    const [[row]] = await req.db.query(
      'SELECT email FROM contacts WHERE id = ?',
      [contactId],
    );
    if (!row) {
      return res.status(404).json({ message: 'Contact not found.' });
    }
    const to = row.email != null ? String(row.email).trim() : '';
    if (!to) {
      return res.status(400).json({ message: 'Contact has no email address.' });
    }

    await sendEmail({ to, subject, text });
    return res.json({ success: true });
  } catch (err) {
    if (err.code === 'SMTP_NOT_CONFIGURED') {
      return res.status(503).json({ message: err.message });
    }
    console.error('[sendemail] POST /', err);
    return res.status(500).json({
      message: err.message || 'Failed to send email.',
    });
  }
});

export default router;
