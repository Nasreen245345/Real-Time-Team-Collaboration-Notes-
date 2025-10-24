import React, { useState, useEffect } from 'react';
import { Plus, StickyNote, AlertCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';

const NotesBoard = ({ workspaceId, initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes || []);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState('');
  const { socket, createNote, deleteNote } = useSocket();

  useEffect(() => {
    setNotes(initialNotes || []);
  }, [initialNotes]);

  useEffect(() => {
    if (!socket) return;

    const handleNoteCreated = (data) => {
      console.log('Note created:', data);
      setNotes(prev => [data.note, ...prev]);
      setError('');
    };

    const handleNoteUpdated = (data) => {
      console.log('Note updated:', data);
      setNotes(prev => 
        prev.map(note => note._id === data.note._id ? data.note : note)
      );
    };

    const handleNoteDeleted = (data) => {
      console.log('Note deleted:', data);
      setNotes(prev => prev.filter(note => note._id !== data.noteId));
      if (selectedNote?._id === data.noteId) {
        setSelectedNote(null);
        setShowEditor(false);
      }
    };

    const handleError = (data) => {
      console.error('Socket error:', data);
      setError(data.message || 'An error occurred');
      setTimeout(() => setError(''), 5000);
    };

    socket.on('note.created', handleNoteCreated);
    socket.on('note.updated', handleNoteUpdated);
    socket.on('note.deleted', handleNoteDeleted);
    socket.on('error', handleError);

    return () => {
      socket.off('note.created', handleNoteCreated);
      socket.off('note.updated', handleNoteUpdated);
      socket.off('note.deleted', handleNoteDeleted);
      socket.off('error', handleError);
    };
  }, [socket, selectedNote]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setShowEditor(true);
    setError('');
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowEditor(true);
    setError('');
  };

  const handleSaveNewNote = (noteData) => {
    if (!noteData.title && !noteData.content) {
      setError('Please add a title or content to create a note');
      return;
    }
    
    console.log('Creating note:', noteData);
    createNote(workspaceId, noteData);
    setShowEditor(false);
  };

  const handleDeleteNote = (noteId) => {
    console.log('Deleting note:', noteId);
    deleteNote(workspaceId, noteId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
         
          <span>Notes ({notes.length})</span>
        </h2>
        <button
          onClick={handleCreateNote}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
       
          <span>New Note</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12">
         
          <p className="text-gray-500 mb-4">No notes yet. Create your first note!</p>
          <button
            onClick={handleCreateNote}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <NoteCard
              key={note._id}
              note={note}
              onClick={() => handleNoteClick(note)}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      {showEditor && (
        <NoteEditor
          note={selectedNote}
          workspaceId={workspaceId}
          onClose={() => {
            setShowEditor(false);
            setError('');
          }}
          onSave={handleSaveNewNote}
        />
      )}
    </div>
  );
};

export default NotesBoard;