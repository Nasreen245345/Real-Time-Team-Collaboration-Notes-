import React from 'react';
import { FileText, Trash2} from 'lucide-react';

const NoteCard = ({ note, onClick, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note._id);
    }
  };

  const truncateContent = (text, maxLength = 150) => {
    if (!text || text.trim() === '') return 'No content';
    
    // Remove extra whitespace and newlines
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  const truncateTitle = (text, maxLength = 50) => {
    if (!text || text.trim() === '') return 'Untitled';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-all border border-gray-200 hover:border-blue-500 flex flex-col h-full"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
         
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 break-words line-clamp-2">
              {truncateTitle(note.title)}
            </h3>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex-shrink-0 ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Card Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <p className="text-sm text-gray-600 break-words line-clamp-4 leading-relaxed">
          {truncateContent(note.content)}
        </p>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-gray-500">
            <span className="truncate">
              {new Date(note.lastEditedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          {note.lastEditedBy && (
            <span className="text-gray-400 truncate ml-2" title={note.lastEditedBy.name}>
              by {note.lastEditedBy.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;