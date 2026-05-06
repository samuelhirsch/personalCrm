export function createHandlersForNewContact({
  form,
  draftDeals,
  draftNotes,
  saving,
  setForm,
  setDraftDeals,
  setDraftNotes,
  setSaveError,
  setSaving,
  onClose,
  createContact,
}) {
  async function handleAddDeal(deal) {
    setDraftDeals((prev) => [
      ...prev,
      {
        title: deal.title,
        stage: deal.stage,
        value: deal.value ?? '',
      },
    ]);
  }

  async function handleUpdateDeal(index, updated) {
    setDraftDeals((prev) =>
      prev.map((d, i) => (i === index ? { ...updated } : d)),
    );
  }

  async function handleDeleteDeal(index) {
    setDraftDeals((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAddNote(body) {
    const text = typeof body === 'string' ? body.trim() : '';
    if (!text) return;
    setDraftNotes((prev) => [{ body: text }, ...prev]);
  }

  async function handleDeleteNote(index) {
    setDraftNotes((prev) => prev.filter((_, i) => i !== index));
  }

  function handleChange(e) {
    setSaveError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleBackdropClick() {
    if (saving) return;
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setSaveError('First name and last name are required.');
      return;
    }

    const initialDeals = draftDeals
      .filter((d) => String(d.title || '').trim())
      .map(({ title, stage, value }) => ({
        title: String(title).trim(),
        stage,
        value: value === '' || value == null ? '' : String(value),
      }));

    setSaving(true);
    const result = await createContact({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      follow_up_date: form.follow_up_date?.trim()
        ? form.follow_up_date.slice(0, 10)
        : null,
      initialDeals,
      initialNotes: draftNotes.map((n) => n.body),
    });
    setSaving(false);

    if (result?.success) {
      onClose();
    } else if (result?.message) {
      setSaveError(result.message);
    } else {
      setSaveError('Could not create contact.');
    }
  }

  return {
    handleAddDeal,
    handleUpdateDeal,
    handleDeleteDeal,
    handleAddNote,
    handleDeleteNote,
    handleChange,
    handleBackdropClick,
    handleSubmit,
  };
}
