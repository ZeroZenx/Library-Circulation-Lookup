import { useState, useEffect, FormEvent } from 'react';
import { Note } from '../lib/types';
import { getItemNotes, addItemNote } from '../lib/api';
import { formatDateTime } from '../lib/statusHelpers';

interface NotesPanelProps {
  itemId: string;
}

export default function NotesPanel({ itemId }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newNote, setNewNote] = useState({ text: '', createdBy: '' });

  useEffect(() => {
    loadNotes();
  }, [itemId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await getItemNotes(itemId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.text.trim() || !newNote.createdBy.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const note = await addItemNote(itemId, newNote.text, newNote.createdBy);
      setNotes([...notes, note]);
      setNewNote({ text: '', createdBy: '' });
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Notes</h3>
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Notes</h3>

      {notes.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">No notes yet.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {notes.map((note) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-900">{note.createdBy}</p>
                <p className="text-xs text-gray-500">{formatDateTime(note.createdAt)}</p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={newNote.createdBy}
            onChange={(e) => setNewNote({ ...newNote, createdBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            value={newNote.text}
            onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !newNote.text.trim() || !newNote.createdBy.trim()}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding...' : 'Add Note'}
        </button>
      </form>
    </div>
  );
}

