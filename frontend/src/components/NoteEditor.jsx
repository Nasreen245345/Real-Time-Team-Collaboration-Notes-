import React, { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';
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

    console.log('📝 Setting up typing listeners for note:', note._id);

    const handleTyping = (data) => {
      console.log('⌨️ Typing event received:', data);
      
      // Only handle typing for this specific note
      if (data.noteId === note._id) {
        console.log(`   For this note! User: ${data.userName}, isTyping: ${data.isTyping}`);
        
        setTypingUsers(prev => {
          if (data.isTyping) {
            // Add user to typing list if not already there
            const exists = prev.find(u => u.userId === data.userId);
            if (!exists) {
              const updated = [...prev, { 
                userId: data.userId, 
                userName: data.userName 
              }];
              console.log('   Updated typing users:', updated);
              return updated;
            }
            return prev;
          } else {
            // Remove user from typing list
            const updated = prev.filter(u => u.userId !== data.userId);
            console.log('   Updated typing users:', updated);
            return updated;
          }
        });
      }
    };

    const handleNoteUpdated = (data) => {
      if (data.note._id === note._id) {
        console.log('📄 Note updated remotely:', data.note);
        setTitle(data.note.title);
        setContent(data.note.content);
      }
    };

    socket.on('note.typing', handleTyping);
    socket.on('note.updated', handleNoteUpdated);

    return () => {
      console.log('🧹 Cleaning up typing listeners');
      socket.off('note.typing', handleTyping);
      socket.off('note.updated', handleNoteUpdated);
    };
  }, [socket, note]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Send typing indicator
    if (note) {
      console.log('⌨️ Sending typing indicator (true)');
      sendTyping(workspaceId, note._id, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⌨️ Sending typing indicator (false) - timeout');
        sendTyping(workspaceId, note._id, false);
      }, 1000);

      // Auto-save after 2 seconds of inactivity
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
    
    // Auto-save title change
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
      console.log('💾 Saving note:', { title, content: content.substring(0, 50) + '...' });
      updateNote(workspaceId, note._id, { title, content });
    } else {
      onSave({ title, content });
    }
  };

  const handleClose = () => {
    if (note) {
      console.log('⌨️ Sending typing indicator (false) - closing');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="flex-1 text-xl font-bold text-gray-900 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            placeholder="Note title..."
          />
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <span>Save</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Typing Indicator - Fixed position below header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <TypingIndicator typingUsers={typingUsers} />
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <textarea
            value={content}
            onChange={handleContentChange}
            className="w-full h-full text-gray-700 bg-white border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-sans text-base leading-relaxed shadow-sm"
            placeholder="Start typing your note here...&#10;&#10;You can write as much as you want. The editor will scroll automatically."
            style={{ minHeight: '100%' }}
          />
        </div>

        {/* Footer - Info bar */}
        <div className="flex-shrink-0 px-6 py-3 bg-gray-100 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {content.length} characters · {content.split(/\s+/).filter(w => w.length > 0).length} words
            </span>
            <span className="text-gray-400">
              Auto-saves after you stop typing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;