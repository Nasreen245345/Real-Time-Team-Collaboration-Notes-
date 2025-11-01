require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const app = require('./app');
const { setupSocketHandlers } = require('./services/socketService');

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with proper CORS
const io = new Server(server, {
  cors: {
    origin:  'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io available to routes
app.set('io', io);

// Setup socket handlers
setupSocketHandlers(io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    server.listen(PORT, () => {
     
      console.log(`Server running on port ${PORT}`);
      // console.log(` Socket.IO ready for connections`);
 
     
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

