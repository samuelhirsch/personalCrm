import { api, parseJsonOrEmpty } from '../../api/client';

export function createDealHandlers({ setContacts, setError }) {
  async function handleAddDeal(contactId, deal) {
    try {
      const res = await api(`/api/contacts/${contactId}/deals`, {
        method: 'POST',
        body: JSON.stringify({
          title: deal.title,
          stage: deal.stage,
          value: deal.value || null,
        }),
      });
      const newDeal = await parseJsonOrEmpty(res);
      if (!res.ok) {
        throw new Error(newDeal?.message || 'Could not add deal.');
      }
      setContacts((prev) => prev.map((c) =>
        c.id === contactId
          ? { ...c, deals: [...(c.deals || []), newDeal] }
          : c
      ));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleUpdateDeal(contactId, dealId, updated) {
    try {
      const res = await api(`/api/contacts/${contactId}/deals/${dealId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: updated.title,
          stage: updated.stage,
          value: updated.value,
        }),
      });
      const deal = await parseJsonOrEmpty(res);
      if (!res.ok) {
        throw new Error(deal?.message || 'Could not update deal.');
      }
      setContacts((prev) => prev.map((c) =>
        c.id === contactId
          ? { ...c, deals: (c.deals || []).map((d) => (d.id === dealId ? deal : d)) }
          : c
      ));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteDeal(contactId, dealId) {
    try {
      const res = await api(`/api/contacts/${contactId}/deals/${dealId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await parseJsonOrEmpty(res);
        throw new Error(data?.message || 'Could not delete deal.');
      }
      setContacts((prev) => prev.map((c) =>
        c.id === contactId
          ? { ...c, deals: (c.deals || []).filter((d) => d.id !== dealId) }
          : c
      ));
    } catch (e) {
      setError(e.message);
    }
  }

  return { handleAddDeal, handleUpdateDeal, handleDeleteDeal };
}
