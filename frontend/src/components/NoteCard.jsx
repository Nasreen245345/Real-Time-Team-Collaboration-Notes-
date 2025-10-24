import React from 'react';
import { FileText, Trash2, Clock } from 'lucide-react';

const NoteCard = ({ note, onClick, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note._id);
    }
  };

  const truncateContent = (text, maxLength = 100) => {
    if (!text) return 'No content';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition border border-gray-200 hover:border-blue-500"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
         
          <h3 className="font-semibold text-gray-900 truncate">{note.title || 'Untitled'}</h3>
        </div>
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {truncateContent(note.content)}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(note.lastEditedAt).toLocaleString()}</span>
        </div>
        {note.lastEditedBy && (
          <span>by {note.lastEditedBy.name}</span>
        )}
      </div>
    </div>
  );
};

export default NoteCard;