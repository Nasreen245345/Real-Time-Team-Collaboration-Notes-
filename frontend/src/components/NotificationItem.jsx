import React, { useState } from 'react';
import { Check, X, Loader, AlertCircle } from 'lucide-react';
import { workspaceService } from '../services/workspace';

const NotificationItem = ({ notification, onDismiss }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAccept = async () => {
    if (notification.type !== 'invitation') return;

    setLoading(true);
    setError('');

    try {
      console.log('🟢 Accepting invitation for workspace:', notification.workspaceId);
      const response = await workspaceService.acceptInvitation(notification.workspaceId);
      console.log('✅ Invitation accepted:', response);
      
      // Check if already a member
      if (response.data?.alreadyMember) {
        console.log('ℹ️ User is already a member, dismissing notification');
        onDismiss();
        return;
      }
      
      setSuccess(true);
      
      // Show success message briefly then redirect
      setTimeout(() => {
        onDismiss();
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error('❌ Failed to accept invitation:', err);
      const errorMessage = err.response?.data?.message || 'Failed to accept invitation';
      setError(errorMessage);
      
      // If already a member, just dismiss the notification after a delay
      if (errorMessage.includes('already a member')) {
        setTimeout(() => {
          onDismiss();
        }, 2000);
      }
      
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 border-b border-gray-100 bg-green-50">
        <div className="flex items-center space-x-2 text-green-700">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">Joined successfully! Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
      <p className="text-sm text-gray-900 mb-2">{notification.message}</p>
      
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {new Date(notification.timestamp).toLocaleString()}
        </span>

        {notification.type === 'invitation' ? (
          <div className="flex space-x-2">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  <span>Accept</span>
                </>
              )}
            </button>
            <button
              onClick={onDismiss}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-3 h-3" />
              <span>Dismiss</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onDismiss}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;