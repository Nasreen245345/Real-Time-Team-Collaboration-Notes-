import React from 'react';
import { Users } from 'lucide-react';

const OnlineUsers = ({ users }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-2 mb-3">
        <h3 className="font-semibold text-gray-900">Online ({users.length})</h3>
      </div>
      
      {users.length === 0 ? (
        <p className="text-sm text-gray-500">No one else is online</p>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.socketId} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnlineUsers;