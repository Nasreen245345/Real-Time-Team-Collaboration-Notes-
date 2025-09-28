// server.js
require('dotenv').config(); // if you use a .env file
const express = require("express");
const ConnectDB = require("./config/db.js");
const AuthRoute = require('./routes/auth.js');
const Socketmiddler=require('./middleware/socket.js')
const authMiddleware=require('./middleware/auth.js')
const Notesroute=require('./routes/notes.js')
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));



const port = process.env.PORT || 3000;
app.use(authMiddleware)
app.use('/api/notes',Notesroute)
app.use('/api/auth', AuthRoute);
ConnectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// read JWT secret (ensure it's set in your env)

io.use(Socketmiddler)
/**
 * Socket auth middleware
 * Expects client to connect with:
 *   const socket = io(URL, { auth: { token: "..." } });
 */

// now connection handlers will only run for authenticated sockets
io.on('connection', (socket) => {
  console.log("user connected", socket.id, "user:", socket.user);

  // example: join room per user id
  if (socket.user && socket.user.id) {
    socket.join(`user:${socket.user.id}`);
  }

  socket.on('ping-server', (payload) => {
    console.log('ping-server from', socket.user?.id, payload);
    socket.emit('pong', { ok: true });
  });

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', socket.id, reason);
  });
});

// start HTTP+Socket server (important: use server.listen, not app.listen)
server.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
