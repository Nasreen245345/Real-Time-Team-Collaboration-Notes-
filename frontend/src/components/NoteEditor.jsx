import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import TypingIndicator from './TypingIndicator';

const NoteEditor = ({ note, workspaceId, onClose, onSave }) => {
  const [title, setTitle] = useState(note?.title || 'Untitled');
  const [content, setContent] = useState(note?.content || '');
  const [typingUsers, setTypingUsers] = useState([]);
  const { socket, sendTyping, updateNote } = useSocket();
  const typingTimeoutRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !note) return;

    const handleTyping = (data) => {
      if (data.noteId === note._id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            const exists = prev.find(u => u.userId === data.userId);
            if (!exists) {
              return [...prev, { userId: data.userId, userName: data.userName }];
            }
            return prev;
          } else {
            return prev.filter(u => u.userId !== data.userId);
          }
        });
      }
    };

    const handleNoteUpdated = (data) => {
      if (data.note._id === note._id) {
        setTitle(data.note.title);
        setContent(data.note.content);
      }
    };

    socket.on('note.typing', handleTyping);
    socket.on('note.updated', handleNoteUpdated);

    return () => {
      socket.off('note.typing', handleTyping);
      socket.off('note.updated', handleNoteUpdated);
    };
  }, [socket, note]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (note) {
      sendTyping(workspaceId, note._id, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(workspaceId, note._id, false);
      }, 1000);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    
    if (note) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    }
  };

  const handleSave = () => {
    if (note) {
      updateNote(workspaceId, note._id, { title, content });
    } else {
      onSave({ title, content });
    }
  };

  const handleClose = () => {
    if (note) {
      sendTyping(workspaceId, note._id, false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#efeae2] rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
        {/* WhatsApp-style Header */}
        <div className="flex-shrink-0 bg-[#008069] p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={handleClose}
                className="p-1 text-white hover:bg-white/10 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="flex-1 bg-white/10 text-white placeholder-white/70 px-4 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white/30 font-medium"
                placeholder="Note title..."
              />
            </div>
            <button
              onClick={handleSave}
              className="ml-3 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition"
              title="Save"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex-shrink-0 bg-[#f0f2f5]">
            <TypingIndicator typingUsers={typingUsers} />
          </div>
        )}

        {/* Content Area - WhatsApp Background Pattern */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#efeae2]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}>
          <div className="max-w-3xl mx-auto">
            <textarea
              value={content}
              onChange={handleContentChange}
              className="w-full min-h-[500px] text-gray-800 bg-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#008069] resize-none font-sans text-base leading-relaxed shadow-md"
              placeholder="Type your note here..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-3 bg-[#f0f2f5] rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {content.length} characters · {content.split(/\s+/).filter(w => w.length > 0).length} words
            </span>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;