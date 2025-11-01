import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { workspaceService } from '../services/workspace';

const InviteModal = ({ workspace, onClose, onMemberInvited }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await workspaceService.inviteMember(workspace._id, email);
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
      if (onMemberInvited) onMemberInvited();
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="bg-[#008069] p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Invite to {workspace.name}</h3>
            <button
              onClick={onClose}
              className="p-1 text-white hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm flex items-center space-x-2 rounded">
              <Check className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleInvite}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                placeholder="colleague@example.com"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#008069] text-white rounded-lg hover:bg-[#017561] transition font-medium disabled:opacity-50"
                disabled={loading}
              >
       
                <span>{loading ? 'Sending...' : 'Send Invite'}</span>
              </button>
            </div>
          </form>

          {/* Current Members */}
          {workspace.members && workspace.members.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                <span>Members</span>
                <span className="px-2 py-0.5 bg-[#008069] text-white text-xs rounded-full">
                  {workspace.members.length}
                </span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {workspace.members.map(member => (
                  <div key={member._id} className="flex items-center space-x-3 p-2 hover:bg-[#f5f6f6] rounded-lg transition">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00a884] to-[#008069] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;