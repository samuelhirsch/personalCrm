function toYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getFollowUpYmdThresholds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  return {
    todayYmd: toYmd(today),
    sevenDaysYmd: toYmd(sevenDaysFromNow),
  };
}

/** Filter contacts by search text and follow-up tab (Due today / Overdue / Due soon / No follow-up). */
export function filterContacts(contacts, search, filterKey) {
  const { todayYmd, sevenDaysYmd } = getFollowUpYmdThresholds();
  const q = search.toLowerCase();

  return contacts.filter((c) => {
    const matchesSearch =
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterKey === 'all') return true;

    const followUpYmd = c.follow_up_date ? String(c.follow_up_date).slice(0, 10) : '';

    if (filterKey === 'due_today') return followUpYmd === todayYmd;
    if (filterKey === 'overdue') return Boolean(followUpYmd) && followUpYmd < todayYmd;
    if (filterKey === 'due_soon')
      return Boolean(followUpYmd) && followUpYmd > todayYmd && followUpYmd < sevenDaysYmd;
    if (filterKey === 'no_followup') return !c.follow_up_date;

    return true;
  });
}
