import { useState } from 'react';
import ErrorAlert from '../ErrorAlert';
import DealsList from '../DealsList';
import NotesList from '../NotesList';
import { createHandlersForNewContact } from './handlerfuncsfornewcontact';

const emptyForm = () => ({
  first_name: '',
  last_name: '',
  company: '',
  phone: '',
  email: '',
  role: '',
  follow_up_date: '',
});

function AddContactModal({ onClose, createContact }) {
  const [form, setForm] = useState(emptyForm);
  const [draftDeals, setDraftDeals] = useState([]);
  const [draftNotes, setDraftNotes] = useState([]);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    handleAddDeal,
    handleUpdateDeal,
    handleDeleteDeal,
    handleAddNote,
    handleDeleteNote,
    handleChange,
    handleBackdropClick,
    handleSubmit,
  } = createHandlersForNewContact({
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
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={handleBackdropClick}
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="add-contact-title" className="text-lg font-semibold text-gray-900">
          New contact
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below, then save to add this person to your list.
        </p>

        <ErrorAlert
          message={saveError}
          title="Could not save"
          onDismiss={() => setSaveError('')}
          className="mt-4"
        />

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'First name', name: 'first_name', required: true },
              { label: 'Last name', name: 'last_name', required: true },
              { label: 'Company', name: 'company' },
              { label: 'Phone', name: 'phone' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Role / title', name: 'role' },
            ].map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={`add-${field.name}`}
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  {field.label}
                  {field.required ? ' *' : ''}
                </label>
                <input
                  id={`add-${field.name}`}
                  name={field.name}
                  type={field.type || 'text'}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={Boolean(field.required)}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            ))}
          </div>

          <div className="w-48">
            <label
              htmlFor="add-follow_up_date"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Follow-up date
            </label>
            <input
              id="add-follow_up_date"
              type="date"
              name="follow_up_date"
              value={form.follow_up_date}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
            <DealsList
              deals={draftDeals}
              onAddDeal={handleAddDeal}
              onUpdateDeal={handleUpdateDeal}
              onDeleteDeal={handleDeleteDeal}
              identifyRowsByIndex
              disabled={saving}
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
            <NotesList
              notes={draftNotes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              identifyRowsByIndex
              disabled={saving}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={handleBackdropClick}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddContactModal;
