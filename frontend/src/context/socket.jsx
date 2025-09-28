// src/context/SocketProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket.js";
import { useAuth } from "./auth.jsx";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth(); // assumes your auth context exposes token & user
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const s = connectSocket(token);
      console.log(s.id)
      setSocket(s);
    } else {
      // logged out — ensure socket disconnected
      disconnectSocket();
      setSocket(null);
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, getSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
