import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, MessageSquare } from 'lucide-react';
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
      setNotes(prev => [data.note, ...prev]);
      setError('');
    };

    const handleNoteUpdated = (data) => {
      setNotes(prev => 
        prev.map(note => note._id === data.note._id ? data.note : note)
      );
    };

    const handleNoteDeleted = (data) => {
      setNotes(prev => prev.filter(note => note._id !== data.noteId));
      if (selectedNote?._id === data.noteId) {
        setSelectedNote(null);
        setShowEditor(false);
      }
    };

    const handleError = (data) => {
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
    
    createNote(workspaceId, noteData);
    setShowEditor(false);
  };

  const handleDeleteNote = (noteId) => {
    deleteNote(workspaceId, noteId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-[#f0f2f5] p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <span>Notes</span>
            <span className="text-sm font-normal text-gray-500">({notes.length})</span>
</h2>
<button
         onClick={handleCreateNote}
         className="p-2 bg-[#008069] text-white rounded-full hover:bg-[#017561] transition shadow-lg"
         title="New Note"
       >
<Plus className="w-5 h-5" />
</button>
</div>
</div>
  {error && (
    <div className="mx-4 mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center space-x-2">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )}

  {notes.length === 0 ? (
    <div className="text-center py-16 px-4">
      
      <p className="text-gray-500 mb-2 text-lg font-medium">No notes yet</p>
      <p className="text-gray-400 text-sm mb-6">Start a conversation by creating your first note</p>
      <button
        onClick={handleCreateNote}
        className="inline-flex items-center space-x-2 px-6 py-3 bg-[#008069] text-white rounded-full hover:bg-[#017561] transition shadow-md"
      >
        <span>Create First Note</span>
      </button>
    </div>
  ) : (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto">
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