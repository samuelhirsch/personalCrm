import { api, parseJsonOrEmpty } from '../../api/client';

export function createNoteHandlers({ setContacts, setError }) {
  async function handleDeleteNote(contactId, noteId) {
    try {
      const res = await api(`/api/contacts/${contactId}/notes/${noteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await parseJsonOrEmpty(res);
        throw new Error(data?.message || 'Could not delete note.');
      }
      setContacts((prev) => prev.map((c) =>
        c.id === contactId
          ? { ...c, notes: (c.notes || []).filter((n) => n.id !== noteId) }
          : c
      ));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAddNote(contactId, body) {
    try {
      const res = await api(`/api/contacts/${contactId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      const note = await parseJsonOrEmpty(res);
      if (!res.ok) {
        throw new Error(note?.message || 'Could not save note.');
      }
      setContacts((prev) => prev.map((c) =>
        c.id === contactId
          ? { ...c, notes: [note, ...(c.notes || [])] }
          : c
      ));
    } catch (e) {
      setError(e.message);
    }
  }

  return { handleAddNote, handleDeleteNote };
}
