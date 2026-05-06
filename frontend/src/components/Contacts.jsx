import { useState, useEffect, useMemo } from 'react';
import ContactCard from './ContactCard';
import AddContactModal from './addcontactmodel/addcontact';
import ContactsSearchBar from './ContactsSearchBar';
import ErrorAlert from './ErrorAlert';
import { filterContacts } from './SearchContactFunctions';
import { contactHandlers } from './Handlerfunctions/contactHandlers';
import { makeCreateContact } from './addcontactmodel/createcontact';
import { createDealHandlers } from './Handlerfunctions/dealHandlers';
import { createNoteHandlers } from './Handlerfunctions/noteHandlers';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [addContactOpen, setAddContactOpen] = useState(false);

  const { loadContacts, handleUpdate, handleDelete } = useMemo(
    () => contactHandlers({ setContacts, setError }),
    [],
  );

  const createContact = useMemo(
    () => makeCreateContact({ setContacts, setError }),
    [],
  );

  const { handleAddDeal, handleUpdateDeal, handleDeleteDeal } = useMemo(
    () => createDealHandlers({ setContacts, setError }),
    [],
  );

  const { handleAddNote, handleDeleteNote } = useMemo(
    () => createNoteHandlers({ setContacts, setError }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await loadContacts();
      } catch (e) {
        if (!cancelled) setError(e.message || 'Something went wrong.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadContacts]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-sm text-gray-500">
        Loading contacts…
      </div>
    );
  }

  const filtered = filterContacts(contacts, search, filter);

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      <ErrorAlert
        message={error}
        title="Something went wrong"
        onDismiss={() => setError('')}
        onRetry={() => { setError(''); loadContacts(); }}
        retryLabel="Retry"
      />

      <ContactsSearchBar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        onAddContact={() => setAddContactOpen(true)}
        resultCount={filtered.length}
      />

      {addContactOpen ? (
        <AddContactModal
          onClose={() => setAddContactOpen(false)}
          createContact={createContact}
        />
      ) : null}

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
