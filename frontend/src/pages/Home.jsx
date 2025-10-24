import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceList from '../components/WorkspaceList';
import { workspaceService } from '../services/workspace';
import { Loader, Plus,  } from 'lucide-react';

const Home = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceCreated = (workspace) => {
    setWorkspaces(prev => [workspace, ...prev]);
    setShowCreateModal(false);
  };

  const handleWorkspaceSelect = (workspace) => {
    navigate(`/workspace/${workspace._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your workspaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Workspaces</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchWorkspaces}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no workspaces
  if (workspaces.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-12 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Icon */}

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to Real-Time Collaboration
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You don't have any workspaces yet. Create your first workspace to start collaborating with your team in real-time.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
            >
              <span>Create Your First Workspace</span>
            </button>

            {/* Features */}
            <div className="mt-12 pt-10 border-t border-gray-200">







            </div>


          </div>
        </div>

        {showCreateModal && (
          <CreateWorkspaceModal
            onClose={() => setShowCreateModal(false)}
            onWorkspaceCreated={handleWorkspaceCreated}
          />
        )}
      </div>
    );
  }

  // Has workspaces - show normal list
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Workspaces</h1>
        <p className="text-gray-600">Select a workspace to start collaborating</p>
      </div>

      <WorkspaceList
        workspaces={workspaces}
        onWorkspaceSelect={handleWorkspaceSelect}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
};

// Create Workspace Modal Component
const CreateWorkspaceModal = ({ onClose, onWorkspaceCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const workspace = await workspaceService.createWorkspace(name, description);
      onWorkspaceCreated(workspace);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Workspace</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Marketing Team, Product Development"
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's this workspace for?"
              rows="3"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;