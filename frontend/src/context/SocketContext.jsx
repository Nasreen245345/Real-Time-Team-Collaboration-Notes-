import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { authService } from '../services/auth';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const currentUserRef = useRef(null);

  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    
    if (!token || !currentUser) {
      console.log('No token or user found, skipping socket connection');
      return;
    }

    // Store current user in ref for consistent access
    currentUserRef.current = currentUser;

    const socketUrl = 'http://localhost:3000';
    console.log('\n🔌 Initializing socket connection...');
    console.log('   URL:', socketUrl);
    console.log('   User:', currentUser.name, `(${currentUser.email})`);
    console.log('   User ID:', currentUser.id);
    
    const newSocket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Socket connected successfully!');
      console.log('Socket ID:', newSocket.id);
      setConnected(true);
      setSocket(newSocket);
      
      // Emit user online event
      newSocket.emit('user.online');
      console.log('   Emitted user.online event');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnected(false);
    });

    // Listen for workspace invitations
    newSocket.on('workspace.invitation', (data) => {
      console.log('\nWORKSPACE INVITATION RECEIVED!');
      console.log('Full data:', JSON.stringify(data, null, 2));
      
      const myEmail = currentUserRef.current.email.toLowerCase().trim();
      const invitedEmail = data.invitedUserEmail.toLowerCase().trim();
      const myUserId = currentUserRef.current.id.toString();
      const invitedUserId = data.invitedUserId.toString();
      
      console.log('   My email:', myEmail);
      console.log('   Invited email:', invitedEmail);
      console.log('   My user ID:', myUserId);
      console.log('   Invited user ID:', invitedUserId);
      console.log('   Email match:', myEmail === invitedEmail);
      console.log('   User ID match:', myUserId === invitedUserId);
      
      // Check both email AND user ID for maximum reliability
      if (myEmail === invitedEmail && myUserId === invitedUserId) {
        console.log('This invitation is for ME! Creating notification...');
        
        const notification = {
          id: `invitation-${data.workspaceId}-${Date.now()}`,
          type: 'invitation',
          message: `${data.invitedBy} invited you to join "${data.workspace.name}"`,
          workspace: data.workspace,
          workspaceId: data.workspaceId,
          invitedBy: data.invitedBy,
          timestamp: new Date(data.timestamp)
        };
        
        console.log('   Created notification:', notification);
        
        setNotifications(prev => {
          // Check if this invitation already exists
          const exists = prev.some(n => 
            n.type === 'invitation' && 
            n.workspaceId === data.workspaceId
          );
          
          if (exists) {
            console.log('Duplicate invitation, skipping');
            return prev;
          }
          
          const newNotifications = [notification, ...prev];
          console.log('   Total notifications:', newNotifications.length);
          return newNotifications;
        });
      } else {
        console.log('This invitation is NOT for me');
        console.log('   Reason: Email or User ID mismatch');
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const joinWorkspace = useCallback((workspaceId) => {
    if (socketRef.current && connected) {
      console.log('Joining workspace:', workspaceId);
      socketRef.current.emit('workspace.join', { workspaceId });
    } else {
      console.warn('Cannot join workspace - socket not connected');
    }
  }, [connected]);

  const leaveWorkspace = useCallback((workspaceId) => {
    if (socketRef.current && connected) {
      console.log('Leaving workspace:', workspaceId);
      socketRef.current.emit('workspace.leave', { workspaceId });
    }
  }, [connected]);

  const createNote = useCallback((workspaceId, note) => {
    if (socketRef.current && connected) {
      console.log('Creating note in workspace:', workspaceId);
      socketRef.current.emit('note.create', { workspaceId, note });
    } else {
      console.error('Cannot create note - socket not connected');
    }
  }, [connected]);

  const updateNote = useCallback((workspaceId, noteId, updates) => {
    if (socketRef.current && connected) {
      console.log('Updating note:', noteId);
      socketRef.current.emit('note.update', { workspaceId, noteId, updates });
    }
  }, [connected]);

  const deleteNote = useCallback((workspaceId, noteId) => {
    if (socketRef.current && connected) {
      console.log('Deleting note:', noteId);
      socketRef.current.emit('note.delete', { workspaceId, noteId });
    }
  }, [connected]);

  const sendTyping = useCallback((workspaceId, noteId, isTyping) => {
  if (socketRef.current && connected) {
    // console.log(`⌨️ Sending typing event:`);
    // console.log(`   Workspace: ${workspaceId}`);
    // console.log(`   Note: ${noteId}`);
    // console.log(`   Is typing: ${isTyping}`);
    socketRef.current.emit('note.typing', { workspaceId, noteId, isTyping });
  } else {
    console.warn('⚠️ Cannot send typing - socket not connected');
  }
}, [connected]);

  const requestPresence = useCallback((workspaceId) => {
    if (socketRef.current && connected) {
      console.log('Requesting presence for workspace:', workspaceId);
      socketRef.current.emit('presence.request', { workspaceId });
    }
  }, [connected]);

  const clearNotification = useCallback((id) => {
    console.log(' Clearing notification:', id);
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== id);
      console.log('Remaining notifications:', filtered.length);
      return filtered;
    });
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    notifications,
    joinWorkspace,
    leaveWorkspace,
    createNote,
    updateNote,
    deleteNote,
    sendTyping,
    requestPresence,
    clearNotification
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};