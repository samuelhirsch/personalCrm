import { useState, useEffect } from 'react';
import ErrorAlert from './ErrorAlert';

function NotesList({
  contactId,
  notes,
  onAddNote,
  onDeleteNote,
  onDraftDirtyChange,
  onRegisterSaveDraft,
  disabled = false,
  identifyRowsByIndex = false,
}) {
  const [newNote, setNewNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const isComposingNote = Boolean(newNote.trim());
  const draftIsDirty = Boolean(newNote.trim());

  useEffect(() => {
    onDraftDirtyChange?.(draftIsDirty);
  }, [draftIsDirty, onDraftDirtyChange]);

  async function saveDraftNote() {
    if (!newNote.trim()) {
      setNoteError('Write something before saving a note.');
      return false;
    }
    if (identifyRowsByIndex) {
      await onAddNote(newNote);
    } else {
      await onAddNote(contactId, newNote);
    }
    setNewNote('');
    return true;
  }

  useEffect(() => {
    onRegisterSaveDraft?.(saveDraftNote);
  }, [onRegisterSaveDraft, saveDraftNote]);

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Interaction History
      </p>

      <ErrorAlert
        message={noteError}
        onDismiss={() => setNoteError('')}
        className="mb-2"
      />

      <div className="space-y-2 mb-3">
        {notes && notes.length > 0 ? (
          notes.map((note, index) => (
              <div
                key={identifyRowsByIndex ? `note-row-${index}` : note.id}
                className="flex items-start justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                <div className="text-sm text-gray-600">
                  {note.created_at ? (
                    <span className="mr-2 text-xs text-gray-400">{note.created_at}</span>
                  ) : null}
                  {note.body}
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (identifyRowsByIndex) {
                      onDeleteNote(index);
                    } else {
                      onDeleteNote(contactId, note.id);
                    }
                  }}
                  className="shrink-0 text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic">No interactions yet</p>
        )}
      </div>

      <div className="space-y-2">
        <textarea
          placeholder="Start typing to add a note"
          disabled={disabled}
          rows={3}
          value={newNote}
          onChange={(e) => {
            setNoteError('');
            setNewNote(e.target.value);
          }}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
        />
        {isComposingNote ? (
          <button
            type="button"
            disabled={disabled}
            onClick={saveDraftNote}
            className="rounded-lg bg-gray-800 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 active:bg-gray-900 disabled:opacity-50"
            title="Save note"
          >
            Save note
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default NotesList;
