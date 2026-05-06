import { Router } from 'express';
import { dbReady } from '../utils/dbReady.js';

const router = Router();

/** GET /api/dashboard — follow-up and task buckets for the dashboard */
router.get('/', async (req, res) => {
  if (!dbReady(req, res)) return;

  try {
    const [[fuOverdue]]= await req.db.query(
      `SELECT COUNT(*) AS c FROM contacts
       WHERE follow_up_date IS NOT NULL AND follow_up_date < CURDATE()`,
    );
    //console.log(fuOverdue);
    const [[fuToday]] = await req.db.query(
      `SELECT COUNT(*) AS c FROM contacts WHERE follow_up_date = CURDATE()`,
    );
    const [[fuSoon]] = await req.db.query(
      `SELECT COUNT(*) AS c FROM contacts
       WHERE follow_up_date IS NOT NULL
         AND follow_up_date > CURDATE()
         AND follow_up_date < DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
    );
    const [[fuNone]] = await req.db.query(
      `SELECT COUNT(*) AS c FROM contacts WHERE follow_up_date IS NULL`,
    );

    const [[taOverdue]] = await req.db.query(
      `SELECT COUNT(*) AS c FROM tasks
       WHERE done = 0 AND due_date IS NOT NULL AND due_date < CURDATE()`,
    );
    const [[taToday]] = await req.db.query(
      `SELECT COUNT(*) AS c FROM tasks
       WHERE done = 0 AND due_date = CURDATE()`,
    );
    const [[taSoon]] = await req.db.query(
      `SELECT COUNT(*) AS c FROM tasks
       WHERE done = 0 AND due_date IS NOT NULL
         AND due_date > CURDATE()
         AND due_date < DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
    );
    const [[taNone]] = await req.db.query(
      `SELECT COUNT(*) AS c FROM tasks WHERE done = 0 AND due_date IS NULL`,
    );

    const [[contactsRow]] = await req.db.query('SELECT COUNT(*) AS c FROM contacts');
    const [[notesRow]] = await req.db.query('SELECT COUNT(*) AS c FROM notes');
    const [[tasksTotalRow]] = await req.db.query('SELECT COUNT(*) AS c FROM tasks');
    const [[dealsTotalRow]] = await req.db.query('SELECT COUNT(*) AS c FROM deals');

    const [[dealStages]] = await req.db.query(`
      SELECT
        SUM(stage = 'Lead') AS cnt_lead,
        SUM(stage = 'Qualified') AS cnt_qualified,
        SUM(stage = 'Proposal') AS cnt_proposal,
        SUM(stage = 'Won') AS cnt_won,
        SUM(stage = 'Lost') AS cnt_lost
      FROM deals
    `);
//console.log(dealStages);
    const bucket = (row) => Number(row.c);
    const n = (val) => Number(val ?? 0);

    res.json({
      totals: {
        contacts: bucket(contactsRow),
        notes: bucket(notesRow),
        tasks: bucket(tasksTotalRow),
        deals: bucket(dealsTotalRow),
      },
      deals_by_stage: {
        Lead: n(dealStages.cnt_lead),
        Qualified: n(dealStages.cnt_qualified),
        Proposal: n(dealStages.cnt_proposal),
        Won: n(dealStages.cnt_won),
        Lost: n(dealStages.cnt_lost),
      },
      follow_ups: {
        due_today: bucket(fuToday),
        due_soon: bucket(fuSoon),
        overdue: bucket(fuOverdue),
        no_due: bucket(fuNone),
      },
      tasks: {
        due_today: bucket(taToday),
        due_soon: bucket(taSoon),
        overdue: bucket(taOverdue),
        no_due: bucket(taNone),
      },
    });
  } catch (err) {
    console.error('[dashboard] GET /', err);
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
});

export default router;
