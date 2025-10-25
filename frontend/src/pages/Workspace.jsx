import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { workspaceService } from '../services/workspace';
import NotesBoard from '../components/NotesBoard';
import OnlineUsers from '../components/OnlineUsers';
import InviteModal from '../components/InviteModal';

const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinWorkspace, leaveWorkspace, socket, requestPresence } = useSocket();
  const [workspace, setWorkspace] = useState(null);
  const [notes, setNotes] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchWorkspaceData();
  }, [id]);

  useEffect(() => {
    if (id && socket) {
      joinWorkspace(id);
      requestPresence(id);

      return () => {
        leaveWorkspace(id);
      };
    }
  }, [id, socket, joinWorkspace, leaveWorkspace, requestPresence]);

  useEffect(() => {
    if (!socket) return;

    const handlePresenceUpdate = (data) => {
      if (data.workspaceId === id) {
        setOnlineUsers(data.users);
      }
    };

    socket.on('presence.update', handlePresenceUpdate);

    return () => {
      socket.off('presence.update', handlePresenceUpdate);
    };
  }, [socket, id]);

  const fetchWorkspaceData = async () => {
    try {
      const data = await workspaceService.getWorkspace(id);
      setWorkspace(data.workspace);
      setNotes(data.notes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{workspace?.name}</h1>
            <p className="text-gray-600">{workspace?.description || 'No description'}</p>
          </div>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          
          <span>Invite Member</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notes Board - 3 columns */}
        <div className="lg:col-span-3">
          <NotesBoard workspaceId={id} initialNotes={notes} />
        </div>

        {/* Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <OnlineUsers users={onlineUsers} />
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          workspace={workspace}
          onClose={() => setShowInviteModal(false)}
          onMemberAdded={fetchWorkspaceData}
        />
      )}
    </div>
  );
};

export default Workspace;