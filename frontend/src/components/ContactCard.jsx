import { useState } from 'react';
import NotesList from './NotesList';
import DealsList from './DealsList';

function ContactCard({ contact, onUpdate, onDelete, onAddNote, onDeleteNote, onAddDeal, onUpdateDeal, onDeleteDeal }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        first_name: contact.first_name,
        last_name: contact.last_name,
        company: contact.company || '',
        phone: contact.phone || '',
        email: contact.email || '',
        role: contact.role || '',
        follow_up_date: contact.follow_up_date || '',
    });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSave() {
        onUpdate(contact.id, form);
        setOpen(false);
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

            {/* Header row */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex items-center justify-center">
                        {contact.first_name[0]}{contact.last_name[0]}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">
                            {contact.first_name} {contact.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{contact.company || 'No company'}</p>
                    </div>
                </div>
                <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
            </div>

            {/* Expanded details */}
            {open && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">

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
                                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    {/* Deals */}
                    <DealsList
                        contactId={contact.id}
                        deals={contact.deals}
                        onAddDeal={onAddDeal}
                        onUpdateDeal={onUpdateDeal}
                        onDeleteDeal={onDeleteDeal}
                    />

                    {/* Interaction History */}
                    <NotesList
                        contactId={contact.id}
                        notes={contact.notes}
                        onAddNote={onAddNote}
                        onDeleteNote={onDeleteNote}
                    />
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Added {contact.created_at}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onDelete(contact.id)}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

export default ContactCard;