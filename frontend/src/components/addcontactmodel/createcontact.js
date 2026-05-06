import { api, parseJsonOrEmpty } from '../../api/client';

export function makeCreateContact({ setContacts, setError }) {
  return async function createContact(payload) {
    const dealsIn = Array.isArray(payload.initialDeals) ? payload.initialDeals : [];
    const notesIn = Array.isArray(payload.initialNotes) ? payload.initialNotes : [];

    try {
      setError('');
      const res = await api('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          first_name: payload.first_name ?? '',
          last_name: payload.last_name ?? '',
          company: payload.company ?? '',
          phone: payload.phone ?? '',
          email: payload.email ?? '',
          role: payload.role ?? '',
          follow_up_date: payload.follow_up_date ?? null,
        }),
      });
      const created = await parseJsonOrEmpty(res);
      if (!res.ok) {
        const msg = created?.message || 'Could not create contact.';
        return { success: false, message: msg };
      }

      const contactId = created.id;
      const dealsOut = [];
      const notesOut = [];

      for (const d of dealsIn) {
        const title = typeof d?.title === 'string' ? d.title.trim() : '';
        if (!title) continue;
        const dealRes = await api(`/api/contacts/${contactId}/deals`, {
          method: 'POST',
          body: JSON.stringify({
            title,
            stage: d?.stage,
            value: d?.value === '' || d?.value == null ? null : String(d.value),
          }),
        });
        const newDeal = await parseJsonOrEmpty(dealRes);
        if (!dealRes.ok) {
          const msg =
            newDeal?.message ||
            `Contact was created but a deal (${title.slice(0, 40)}…) could not be saved.`;
          const partialRow = {
            ...created,
            deals: dealsOut,
            notes: notesOut,
          };
          setContacts((prev) => [partialRow, ...prev]);
          return { success: false, message: msg };
        }
        dealsOut.push(newDeal);
      }

      for (const raw of notesIn) {
        const body =
          typeof raw === 'string' ? raw.trim() : String(raw?.body ?? '').trim();
        if (!body) continue;
        const noteRes = await api(`/api/contacts/${contactId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ body }),
        });
        const note = await parseJsonOrEmpty(noteRes);
        if (!noteRes.ok) {
          const msg =
            note?.message ||
            'Contact was created but one note could not be saved.';
          const partialRow = {
            ...created,
            deals: dealsOut,
            notes: notesOut,
          };
          setContacts((prev) => [partialRow, ...prev]);
          return { success: false, message: msg };
        }
        notesOut.unshift(note);
      }

      const row = {
        ...created,
        deals: dealsOut,
        notes: notesOut,
      };
      setContacts((prev) => [row, ...prev]);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message || 'Could not create contact.' };
    }
  };
}
