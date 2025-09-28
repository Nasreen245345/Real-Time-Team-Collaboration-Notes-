// src/services/socket.js
import { io } from "socket.io-client";
let socket = null;
/*
 * Connect socket with JWT token.
 * Client will send { auth: { token } } during handshake.
 */
export const connectSocket = (token) => {
  if (socket) {
    console.warn("Socket already connected");
    return socket;
  }

  socket = io("http://localhost:3000", {
    auth: {
      token, // will show up in server as socket.handshake.auth.token
    },
    withCredentials: true,
    autoConnect: true,
    transports: ["websocket"], // optional, ensures websocket
  });

  // debug listeners
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err.message, err);
  });

  return socket;
};

/**
 * Disconnect and clean up socket.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected manually");
  }
};

/*
Get current socket instance.
 */
export const getSocket = () => socket;
