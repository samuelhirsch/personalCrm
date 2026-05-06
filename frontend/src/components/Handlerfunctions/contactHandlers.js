import { api, parseJsonOrEmpty } from '../../api/client';

export function contactHandlers({ setContacts, setError }) {
  async function loadContacts() {
    setError('');
    const res = await api('/api/contacts');
    const data = await parseJsonOrEmpty(res);
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to load contacts.');
    }
    setContacts(Array.isArray(data) ? data : []);
  }

  async function handleUpdate(id, data) {
    try {
      const res = await api(`/api/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      const updated = await parseJsonOrEmpty(res);
      if (!res.ok) {
        throw new Error(updated?.message || 'Could not save contact.');
      }
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? updated : c)),
      );
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message || 'Could not save contact.' };
    }
  }

  async function handleDelete(id) {
    try {
      const res = await api(`/api/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await parseJsonOrEmpty(res);
        throw new Error(data?.message || 'Could not delete contact.');
      }
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  return { loadContacts, handleUpdate, handleDelete };
}
