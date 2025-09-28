import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/auth.jsx'
import { BrowserRouter as Router  }  from 'react-router-dom'
import { SocketProvider } from "./context/socket.jsx";
createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Router>
     <AuthProvider>
    <SocketProvider>
       <App />
    </SocketProvider>
   </AuthProvider>
  </Router>
  </StrictMode>,
)
