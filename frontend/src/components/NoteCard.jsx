import React from 'react';
import { Trash2, Clock } from 'lucide-react';

const NoteCard = ({ note, onClick, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note._id);
    }
  };

  const truncateContent = (text, maxLength = 100) => {
    if (!text || text.trim() === '') return 'No content';
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  const truncateTitle = (text, maxLength = 40) => {
    if (!text || text.trim() === '') return 'Untitled';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl cursor-pointer transition-all border border-gray-200 hover:border-[#008069] p-4 group relative"
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
        title="Delete note"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-2 pr-8 line-clamp-2">
        {truncateTitle(note.title)}
      </h3>

      {/* Content */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
        {truncateContent(note.content)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(note.lastEditedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        {note.lastEditedBy && (
          <span className="text-xs text-gray-400">
            {note.lastEditedBy.name}
          </span>
        )}
      </div>

      {/* WhatsApp-style tail */}
      <div className="absolute bottom-0 right-4 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-white"></div>
    </div>
  );
};

export default NoteCard;