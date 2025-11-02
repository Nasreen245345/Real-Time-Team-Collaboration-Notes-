const OnlineUsers = ({ users }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-[#f0f2f5] p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">Online</h3>
          <span className="px-2 py-0.5 bg-[#008069] text-white text-xs rounded-full">
            {users.length}
          </span>
        </div>
      </div>
      
      {/* Users List */}
      <div className="divide-y divide-gray-200 max-h-[calc(100vh-400px)] overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">No one else is online</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.socketId} className="p-3 hover:bg-[#f5f6f6] transition-colors">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00a884] to-[#008069] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">Active now</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;