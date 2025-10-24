const jwt = require('jsonwebtoken');
const Note = require('../models/Note');
const Workspace = require('../models/Workspace');

// Store user socketId mappings: userId -> Set of socketIds
const userSockets = new Map();

const setupSocketHandlers = (io) => {
  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log('No token provided');
      return next(new Error('Authentication token missing'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      console.log('✅ Token verified for user:', payload.email);
      return next();
    } catch (err) {
      console.log('❌ Invalid token:', err.message);
      return next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id.toString();
    console.log(`User connected: ${socket.user.name} (${userId})`);
    console.log(`Socket ID: ${socket.id}`);

    // Track connected user sockets
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    console.log(`   Total sockets for user: ${userSockets.get(userId).size}`);

    // Join a personal room for direct notifications
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    console.log(`   Joined personal room: ${userRoom}`);

    // User online notification
    socket.on('user.online', () => {
      console.log(`👤 User ${socket.user.name} marked as online`);
    });

    // Join workspace
    socket.on('workspace.join', async ({ workspaceId }) => {
      try {
        console.log(`\n📁 Workspace join request from ${socket.user.name}`);
        console.log(`   Workspace ID: ${workspaceId}`);
        console.log(`   User ID: ${userId}`);

        const workspace = await Workspace.findById(workspaceId);
        
        if (!workspace) {
          console.log(`Workspace not found: ${workspaceId}`);
          return socket.emit('error', { message: 'Workspace not found' });
        }

        console.log(`   Workspace: ${workspace.name}`);
        console.log(`   Members in workspace: ${workspace.members.length}`);

        // Check if user is a member
        const isMember = workspace.members.some(memberId => {
          const mId = memberId.toString();
          const uId = userId.toString();
          console.log(`   Checking: ${mId} === ${uId} ? ${mId === uId}`);
          return mId === uId;
        });

        if (!isMember) {
          console.log(`User ${userId} is not a member of workspace ${workspaceId}`);
          return socket.emit('error', { message: 'Access denied to workspace' });
        }

        const room = `workspace:${workspaceId}`;
        socket.join(room);
        console.log(`✅ User joined workspace room: ${room}`);

        // Get all users in this room
        const socketsInRoom = await io.in(room).fetchSockets();
        const users = socketsInRoom.map(s => ({
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          socketId: s.id
        }));

        // Remove duplicates (same user, different sockets)
        const uniqueUsers = Array.from(
          new Map(users.map(u => [u.id, u])).values()
        );

        io.in(room).emit('presence.update', {
          workspaceId,
          users: uniqueUsers
        });

        console.log(`   Online users in workspace: ${uniqueUsers.length}`);
      } catch (error) {
        console.error('Workspace join error:', error);
        socket.emit('error', { message: 'Failed to join workspace' });
      }
    });

    // Leave workspace
    socket.on('workspace.leave', async ({ workspaceId }) => {
      try {
        const room = `workspace:${workspaceId}`;
        socket.leave(room);
        console.log(` User ${socket.user.name} left workspace: ${workspaceId}`);

        const socketsInRoom = await io.in(room).fetchSockets();
        const users = socketsInRoom.map(s => ({
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          socketId: s.id
        }));

        const uniqueUsers = Array.from(
          new Map(users.map(u => [u.id, u])).values()
        );

        io.in(room).emit('presence.update', {
          workspaceId,
          users: uniqueUsers
        });
      } catch (error) {
        console.error(' Workspace leave error:', error);
      }
    });

    // Create note
    socket.on('note.create', async ({ workspaceId, note }) => {
      try {
        console.log(`📝 Creating note in workspace ${workspaceId} by ${socket.user.name}`);
        
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          console.log(` Workspace not found`);
          return socket.emit('error', { message: 'Workspace not found' });
        }

        const isMember = workspace.members.some(m => m.toString() === userId);
        if (!isMember) {
          console.log(`Access denied for note creation`);
          return socket.emit('error', { message: 'Access denied to workspace' });
        }

        const created = await Note.create({
          workspaceId,
          title: note.title || 'Untitled',
          content: note.content || '',
          lastEditedBy: userId
        });

        const populatedNote = await Note.findById(created._id)
          .populate('lastEditedBy', 'name email');

        io.in(`workspace:${workspaceId}`).emit('note.created', {
          note: populatedNote
        });

        console.log(`Note created successfully: ${created._id}`);
      } catch (error) {
        console.error('Note create error:', error);
        socket.emit('error', { message: 'Failed to create note', details: error.message });
      }
    });

    // Update note
    socket.on('note.update', async ({ workspaceId, noteId, updates }) => {
      try {
        console.log(` Updating note ${noteId} by ${socket.user.name}`);
        
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return socket.emit('error', { message: 'Workspace not found' });
        }

        const isMember = workspace.members.some(m => m.toString() === userId);
        if (!isMember) {
          return socket.emit('error', { message: 'Access denied to workspace' });
        }

        const updated = await Note.findByIdAndUpdate(
          noteId,
          {
            ...updates,
            lastEditedBy: userId,
            lastEditedAt: Date.now()
          },
          { new: true }
        ).populate('lastEditedBy', 'name email');

        if (!updated) {
          return socket.emit('error', { message: 'Note not found' });
        }

        io.in(`workspace:${workspaceId}`).emit('note.updated', {
          note: updated
        });

        console.log(`Note updated successfully`);
      } catch (error) {
        console.error(' Note update error:', error);
        socket.emit('error', { message: 'Failed to update note', details: error.message });
      }
    });

    // Delete note
    socket.on('note.delete', async ({ workspaceId, noteId }) => {
      try {
        console.log(`🗑️ Deleting note ${noteId} by ${socket.user.name}`);
        
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return socket.emit('error', { message: 'Workspace not found' });
        }

        const isMember = workspace.members.some(m => m.toString() === userId);
        if (!isMember) {
          return socket.emit('error', { message: 'Access denied to workspace' });
        }

        await Note.findByIdAndDelete(noteId);

        io.in(`workspace:${workspaceId}`).emit('note.deleted', {
          noteId
        });

        console.log(` Note deleted successfully`);
      } catch (error) {
        console.error('Note delete error:', error);
        socket.emit('error', { message: 'Failed to delete note', details: error.message });
      }
    });

    // Typing indicator
    // Typing indicator
socket.on('note.typing', ({ workspaceId, noteId, isTyping }) => {
  console.log(`⌨️ Typing event from ${socket.user.name}`);
  console.log(`   Workspace: ${workspaceId}`);
  console.log(`   Note: ${noteId}`);
  console.log(`   Is typing: ${isTyping}`);
  
  const typingData = {
    noteId,
    userId: userId,
    userName: socket.user.name,
    isTyping
  };
  
  console.log(`   Broadcasting to workspace room except sender`);
  
  // Broadcast to everyone in the workspace EXCEPT the sender
  socket.to(`workspace:${workspaceId}`).emit('note.typing', typingData);
  
  console.log(`   ✅ Typing event broadcasted`);
});

    // Presence request
    socket.on('presence.request', async ({ workspaceId }) => {
      try {
        const room = `workspace:${workspaceId}`;
        const socketsInRoom = await io.in(room).fetchSockets();
        const users = socketsInRoom.map(s => ({
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          socketId: s.id
        }));

        const uniqueUsers = Array.from(
          new Map(users.map(u => [u.id, u])).values()
        );

        socket.emit('presence.update', {
          workspaceId,
          users: uniqueUsers
        });
      } catch (error) {
        console.error('Presence request error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(` User disconnected: ${socket.user.name} (${socket.id})`);

      // Remove socket from user sockets map
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
          console.log(`   User ${userId} has no more active connections`);
        } else {
          console.log(`   User ${userId} still has ${userSockets.get(userId).size} active connection(s)`);
        }
      }

      // Update presence in all rooms the socket was in
      const rooms = Array.from(socket.rooms).filter(r => r.startsWith('workspace:'));
      
      for (const room of rooms) {
        const socketsInRoom = await io.in(room).fetchSockets();
        const users = socketsInRoom.map(s => ({
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          socketId: s.id
        }));

        const uniqueUsers = Array.from(
          new Map(users.map(u => [u.id, u])).values()
        );

        const workspaceId = room.replace('workspace:', '');
        io.in(room).emit('presence.update', {
          workspaceId,
          users: uniqueUsers
        });
      }
    });
  });

  // Store io instance for global access
  global.io = io;
  
  console.log('Socket.IO handlers setup complete\n');
};

// Helper function to send notification to specific user
const sendToUser = (userId, event, data) => {
  if (!global.io) {
    console.error('Socket.IO not initialized');
    return;
  }
  
  const room = `user:${userId}`;
  console.log(`Sending ${event} to user ${userId}`);
  console.log(`   Room: ${room}`);
  
  global.io.to(room).emit(event, data);
  console.log(`Event sent\n`);
};

module.exports = { setupSocketHandlers, sendToUser };