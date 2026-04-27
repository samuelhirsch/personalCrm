import { useState } from 'react';
import ContactCard from '../components/ContactCard';

const fakeContacts = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    company: 'ABC Plumbing',
    phone: '555-1234',
    email: 'john@abc.com',
    role: 'Owner',
    follow_up_date: '2026-04-28',
    created_at: '2026-03-22',
    deals: [
      { id: 1, title: 'Website Redesign', stage: 'Proposal', value: '3500' },
    ],
    notes: [
      { id: 1, body: 'Met at conference, very interested.', created_at: '2026-04-25' },
      { id: 2, body: 'Called, left voicemail.', created_at: '2026-04-10' },
    ],
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    company: 'XYZ Law',
    phone: '555-5678',
    email: 'jane@xyz.com',
    role: 'Manager',
    follow_up_date: '',
    created_at: '2026-04-01',
    deals: [],
    notes: [],
  },
];

function Contacts() {
  const [contacts, setContacts] = useState(fakeContacts);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filter === 'all') return true;

    const followUp = c.follow_up_date ? new Date(c.follow_up_date) : null;

    if (filter === 'overdue') return followUp && followUp < today;
    if (filter === 'due_soon') return followUp && followUp >= today && followUp <= sevenDaysFromNow;
    if (filter === 'no_followup') return !followUp;

    return true;
  });

  function handleUpdate(id, data) {
    setContacts(contacts.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }

  function handleDelete(id) {
    setContacts(contacts.filter((c) => c.id !== id));
  }

  function handleAddDeal(contactId, deal) {
    const newDeal = { ...deal, id: Date.now() };
    setContacts(contacts.map((c) =>
      c.id === contactId
        ? { ...c, deals: [...(c.deals || []), newDeal] }
        : c
    ));
  }

  function handleUpdateDeal(contactId, dealId, updated) {
    setContacts(contacts.map((c) =>
      c.id === contactId
        ? { ...c, deals: c.deals.map((d) => (d.id === dealId ? updated : d)) }
        : c
    ));
  }

  function handleDeleteDeal(contactId, dealId) {
    setContacts(contacts.map((c) =>
      c.id === contactId
        ? { ...c, deals: c.deals.filter((d) => d.id !== dealId) }
        : c
    ));
  }

  function handleDeleteNote(contactId, noteId) {
    setContacts(contacts.map((c) =>
      c.id === contactId
        ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) }
        : c
    ));
  }

  function handleAddNote(contactId, body) {
    const newNote = {
      id: Date.now(),
      body,
      created_at: new Date().toLocaleDateString(),
    };
    setContacts(contacts.map((c) =>
      c.id === contactId
        ? { ...c, notes: [newNote, ...(c.notes || [])] }
        : c
    ));
  }

  function handleAddContact() {
    const newContact = {
      id: Date.now(),
      first_name: 'New',
      last_name: 'Contact',
      company: '',
      phone: '',
      email: '',
      role: '',
      follow_up_date: '',
      created_at: new Date().toLocaleDateString(),
      notes: [],
    };
    setContacts([newContact, ...contacts]);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Top bar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddContact}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
        >
          + Add Contact
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'due_soon', label: 'Due Soon' },
          { key: 'no_followup', label: 'No Follow-up' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</p>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-8">No contacts found.</p>
        ) : (
          filtered.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onAddDeal={handleAddDeal}
              onUpdateDeal={handleUpdateDeal}
              onDeleteDeal={handleDeleteDeal}
            />
          ))
        )}
      </div>

    </div>
  );
}

export default Contacts;
