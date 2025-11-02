import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { connected, notifications, clearNotification } = useSocket();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* WhatsApp-style Header */}
      <header className="bg-[#008069] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                
                <h1 className="text-xl font-medium text-white">Real-Time Collaboration</h1>
              </div>
              {connected ? (
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  Online
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  Offline
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-white hover:bg-white/10 rounded-full transition"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200 bg-[#f0f2f5]">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onDismiss={() => clearNotification(notif.id)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-4 pl-2">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="py-2 px-3 bg-green-500 text-white hover:bg-white/10 rounded-full transition"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;