// middleware/socketAuth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

/**
 * Socket.IO authentication middleware
 * Validates JWT from socket.handshake.auth.token
 */
const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token;
    if (!token) {
      const err = new Error("Authentication error: token missing");
      err.data = { reason: "token missing" };
      return next(err);
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        const e = new Error("Authentication error: invalid token");
        e.data = { reason: "invalid token" };
        return next(e);
      }

      // attach decoded payload to socket
      socket.user = decoded;
      return next();
    });
  } catch (e) {
    return next(new Error("Authentication error"));
  }
};

module.exports = socketAuth;
