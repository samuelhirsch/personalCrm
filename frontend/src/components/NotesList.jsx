import { useState } from 'react';

function NotesList({ contactId, notes, onAddNote, onDeleteNote }) {
  const [newNote, setNewNote] = useState('');

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Interaction History
      </p>

      <div className="space-y-2 mb-3">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="flex items-start justify-between bg-gray-50 rounded-lg px-3 py-2 gap-2">
              <div className="text-sm text-gray-600">
                <span className="text-xs text-gray-400 mr-2">{note.created_at}</span>
                {note.body}
              </div>
              <button
                onClick={() => onDeleteNote(contactId, note.id)}
                className="text-xs text-red-400 hover:text-red-600 shrink-0"
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic">No interactions yet</p>
        )}
      </div>

      <textarea
        placeholder="Add a note..."
        rows={2}
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <button
        onClick={() => {
          if (!newNote.trim()) return;
          onAddNote(contactId, newNote);
          setNewNote('');
        }}
        className="mt-1 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
      >
        Save Note
      </button>
    </div>
  );
}

export default NotesList;
