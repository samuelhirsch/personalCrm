import { useState, useMemo, useEffect } from 'react';
import NotesList from './NotesList';
import DealsList from './DealsList';
import ErrorAlert from './ErrorAlert';
import SendEmailButton from './SendEmailButton';

function fieldsFromContact(c) {
    return {
        first_name: c.first_name ?? '',
        last_name: c.last_name ?? '',
        company: c.company ?? '',
        phone: c.phone ?? '',
        email: c.email ?? '',
        role: c.role ?? '',
        follow_up_date: c.follow_up_date ? String(c.follow_up_date).slice(0, 10) : '',
    };
}

function ContactCard({
    contact,
    onUpdate,
    onDelete,
    onAddNote,
    onDeleteNote,
    onAddDeal,
    onUpdateDeal,
    onDeleteDeal,
}) {
    const [open, setOpen] = useState(false);
    /** Read-only profile until Edit; collapsing clears edit mode. */
    const [editingProfile, setEditingProfile] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [dealDraftDirty, setDealDraftDirty] = useState(false);
    const [noteDraftDirty, setNoteDraftDirty] = useState(false);
    const [saveDealDraftFn, setSaveDealDraftFn] = useState(null);
    const [saveNoteDraftFn, setSaveNoteDraftFn] = useState(null);
    const [form, setForm] = useState(() => fieldsFromContact(contact));
    // this use effect is just for safety
    useEffect(() => {
        setForm(fieldsFromContact(contact));
    }, [contact.id]);

    function handleChange(e) {
        setSaveError('');
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const savedFields = useMemo(
        () => fieldsFromContact(contact),
        [
            contact.id,
            contact.first_name,
            contact.last_name,
            contact.company,
            contact.phone,
            contact.email,
            contact.role,
            contact.follow_up_date,
        ],
    );

    const isDirty = useMemo(
        () => ['first_name', 'last_name', 'company', 'phone', 'email', 'role', 'follow_up_date'].some(
            (key) => (form[key] ?? '') !== (savedFields[key] ?? ''),
        ),
        [form, savedFields],
    );
    useEffect(() => {
        if (!open) {
            setEditingProfile(false);
        }
    }, [open]);

    const hasUnsavedChanges =
        isDirty || dealDraftDirty || noteDraftDirty;

    async function handleSave() {
        setSaveError('');
        if (!form.first_name.trim() || !form.last_name.trim()) {
            setSaveError('First name and last name are required.');
            return { success: false };
        }
        const result = await onUpdate(contact.id, form);
        if (result?.success) {
            setEditingProfile(false);
            return { success: true };
        }
        if (result?.message) {
            setSaveError(result.message);
        }
        return { success: false };
    }

    function discardAndClose() {
        setForm(fieldsFromContact(contact));
        setSaveError('');
        setOpen(false);
        setShowUnsavedConfirm(false);
    }

    function cancelEditingProfile(e) {
        e?.stopPropagation?.();
        setForm(fieldsFromContact(contact));
        setSaveError('');
        setEditingProfile(false);
    }

    function handleHeaderClick() {
        if (!open) {
            setOpen(true);
            return;
        }
        if (hasUnsavedChanges) {
            setShowUnsavedConfirm(true);
            return;
        }
        setOpen(false);
    }

    async function handleUnsavedYes() {
        let ok = true;
        if (isDirty) {
            const result = await handleSave();
            ok = Boolean(result?.success);
        }
        if (ok && dealDraftDirty && saveDealDraftFn) {
            ok = await saveDealDraftFn();
        }
        if (ok && noteDraftDirty && saveNoteDraftFn) {
            ok = await saveNoteDraftFn();
        }
        if (ok) {
            setShowUnsavedConfirm(false);
            setOpen(false);
        }
    }

    const displayNameTrimmed = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    const defaultEmailSubject = displayNameTrimmed ? `CRM: ${displayNameTrimmed}` : 'CRM contact';
    const fullName = displayNameTrimmed || 'this contact';
    const headerNameLine = displayNameTrimmed || '—';
    const emailDisplay = contact.email || 'no email';
    const initialF = (contact.first_name || '?')[0];
    const initialL = (contact.last_name || '?')[0];

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* Header row */}
                <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                    onClick={handleHeaderClick}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex items-center justify-center">
                            {initialF}{initialL}
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">
                                {headerNameLine}
                            </p>
                            <p className="text-xs text-gray-400">{contact.company || 'No company'}</p>
                        </div>
                    </div>
                    <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
                </div>

                {/* Expanded details */}
                {open && (
                    <div className="border-t border-gray-100 px-5 py-4 space-y-4">

                        <ErrorAlert
                            message={saveError}
                            title="Can't save contact"
                            onDismiss={() => setSaveError('')}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Contact
                            </p>
                            <div className="flex items-center gap-2">
                                <SendEmailButton
                                    contactId={contact.id}
                                    toEmail={contact.email}
                                    defaultSubject={defaultEmailSubject}
                                />
                                {!editingProfile ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProfile(true);
                                        }}
                                        className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                    >
                                        Edit
                                    </button>
                                ) : null}
                                {editingProfile ? (
                                    <button
                                        type="button"
                                        onClick={cancelEditingProfile}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                ) : null}
                                {isDirty ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSave();
                                        }}
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                    >
                                        Save changes
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {[
                                { label: 'First Name', name: 'first_name' },
                                { label: 'Last Name', name: 'last_name' },
                                { label: 'Company', name: 'company' },
                                { label: 'Phone', name: 'phone' },
                                { label: 'Email', name: 'email' },
                                { label: 'Role / Title', name: 'role' },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                        {field.label}
                                    </label>
                                    <input
                                        name={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        readOnly={!editingProfile}
                                        className={`w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editingProfile ? 'bg-gray-50 text-gray-800 cursor-default' : ''
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Follow-up date */}
                        <div className="w-48">
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Follow-up Date
                            </label>
                            <input
                                type="date"
                                name="follow_up_date"
                                value={form.follow_up_date}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <DealsList
                            contactId={contact.id}
                            deals={contact.deals}
                            onAddDeal={onAddDeal}
                            onUpdateDeal={onUpdateDeal}
                            onDeleteDeal={onDeleteDeal}
                            onDraftDirtyChange={setDealDraftDirty}
                            onRegisterSaveDraft={(fn) => setSaveDealDraftFn(() => fn)}
                        />

                        <NotesList
                            contactId={contact.id}
                            notes={contact.notes}
                            onAddNote={onAddNote}
                            onDeleteNote={onDeleteNote}
                            onDraftDirtyChange={setNoteDraftDirty}
                            onRegisterSaveDraft={(fn) => setSaveNoteDraftFn(() => fn)}
                        />
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Added {contact.created_at}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Delete contact
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {showUnsavedConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={() => setShowUnsavedConfirm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <p className="text-sm text-gray-800">
                            You didn&apos;t save your changes. Do you want to save them?
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={discardAndClose}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={handleUnsavedYes}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <p className="text-sm text-gray-800">
                            Do you really want to delete {fullName || 'this contact'} ({emailDisplay})?
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { onDelete(contact.id); setShowDeleteConfirm(false); }}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ContactCard;