import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { workspaceService } from '../services/workspace';

const WorkspaceList = ({ workspaces, onWorkspaceSelect, onWorkspaceCreated }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const workspace = await workspaceService.createWorkspace(name, description);
      onWorkspaceCreated(workspace);
      setShowCreateModal(false);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-[#f0f2f5] p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Workspaces
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-[#008069] text-white rounded-full hover:bg-[#017561] transition shadow-lg"
            title="New Workspace"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspaces..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent"
          />
        </div>
      </div>

      {/* Workspace List */}
      <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
        {filteredWorkspaces.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No workspaces found</p>
          </div>
        ) : (
          filteredWorkspaces.map(workspace => (
            <div
              key={workspace._id}
              onClick={() => onWorkspaceSelect(workspace)}
              className="p-4 hover:bg-[#f5f6f6] cursor-pointer transition-colors group"
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#00a884] to-[#008069] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-semibold text-lg">
                    {workspace.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#008069] transition">
                      {workspace.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(workspace.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {workspace.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    by {workspace.createdBy?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Create Workspace</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                  placeholder="e.g., Marketing Team"
                  required
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent resize-none"
                  placeholder="Purpose of this workspace"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#008069] text-white rounded-lg hover:bg-[#017561] transition font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;