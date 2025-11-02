
#  Real-Time Team Collaboration Notes

A lightweight, real-time, team collaboration notes app built with the MERN stack and Socket.IO.  
Multiple authenticated users can join a workspace and create, edit, or delete notes collaboratively with synchronization across all connected clients.

---

##  Features

**User Authentication:** JWT-based email/password login & register  
 **Workspaces:** Create or join workspaces for team collaboration  
 **Real-Time Notes:** Create, update, and delete notes with instant sync  
 **Presence Tracking:** See which users are currently online  
 **Typing Indicator:** Displays when a user is editing a note  
 **Persistence:** Notes are saved in MongoDB for reliability  
 **Responsive UI:**  Built with Tailwind CSS  


---

##  Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Socket.IO Client

**Backend**
- Node.js
- Express
- Socket.IO Server
- MongoDB (Atlas)
- Mongoose
- JWT Authentication

---

##  Architecture Overview

- The **frontend** connects to the REST API for authentication and data loading.  
- The **Socket.IO** connection is authenticated using a JWT token.  
- Each workspace corresponds to a **Socket.IO room** (`workspace:<workspaceId>`).  
- Notes are stored in MongoDB, and any changes are broadcast in real-time to connected clients.

---


**Base URL:** `http:localhost:3000/api`

| Method | Endpoint                        | Description                      |
| ------ | ------------------------------- | -------------------------------- |
| POST   | `/auth/register`                | Register a new user              |
| POST   | `/auth/login`                   | Login and receive JWT            |
| GET    | `/workspaces`                   | List all user’s workspaces       |
| POST   | `/workspaces`                   | Create a new workspace           |
| GET    | `/workspaces/:id`               | Get workspace metadata and notes |
| GET    | `/workspaces/:id/notes`         | Get notes in a workspace         |
| POST   | `/workspaces/:id/notes`         | Create a new note                |
| DELETE | `/workspaces/:id/notes/:noteId` | Delete a note                    |

All protected routes require

```
Authorization: Bearer <JWT_TOKEN>
```

---

##  Socket.IO Events

### Client → Server

| Event              | Payload                             | Description                  |
| ------------------ | ----------------------------------- | ---------------------------- |
| `workspace.join`   | `{ workspaceId }`                   | Join a workspace room        |
| `workspace.leave`  | `{ workspaceId }`                   | Leave workspace room         |
| `note.create`      | `{ workspaceId, note }`             | Create new note              |
| `note.update`      | `{ workspaceId, noteId, updates }`  | Update existing note         |
| `note.delete`      | `{ workspaceId, noteId }`           | Delete a note                |
| `note.typing`      | `{ workspaceId, noteId, isTyping }` | Indicate user typing         |
| `presence.request` | `{ workspaceId }`                   | Request list of online users |

### Server → Client

| Event             | Payload                        | Description                        |
| ----------------- | ------------------------------ | ---------------------------------- |
| `presence.update` | `{ workspaceId, users }`       | List of online users               |
| `note.created`    | `{ note }`                     | Notify all clients of new note     |
| `note.updated`    | `{ note }`                     | Notify all clients of updated note |
| `note.deleted`    | `{ noteId }`                   | Notify all clients of deleted note |
| `note.typing`     | `{ noteId, userId, isTyping }` | Notify who is typing               |

---

##  Conflict Handling

The app uses **Last-Write-Wins (LWW)** for note updates:

1. Client sends `note.update` with updates.
2. Server overwrites DB with server timestamp.
3. Server broadcasts canonical updated note to all clients.


---

##  Setup Instructions

###  Clone the repository

```bash
git clone https://github.com/yourusername/realtime-notes.git
cd realtime-notes
```

###  Setup Backend

```bash
cd backend
npm install
npm run dev
```

Fill `.env` with your own credentials:

```env
MONGO_URI=mongodb+srv://<your-mongo-uri>
JWT_SECRET=supersecret

```

###  Setup Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Example `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api

```

###  Test it locally

* Register a new user.
* Create a workspace.
* Open the same workspace in two browsers.
* Create or edit notes → changes appear instantly.

---

## Testing Checklist

*  User registration & login
*  Workspace creation & join
* Real-time note create/update/delete
*  Presence list updates
*  Typing indicator works
*  Invalid token triggers proper socket error



---

##  Author

**Nasreen**
 Computer Science Student at Namal University
 Aspiring Software Developer


