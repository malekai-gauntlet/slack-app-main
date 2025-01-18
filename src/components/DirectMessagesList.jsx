import React from 'react'

const DirectMessagesList = ({ 
  users, 
  selectedDM, 
  userProfile, 
  user,
  onlineUsers, 
  unreadDMs, 
  hiddenDMs,
  statusText,
  handleDMSelect,
  handleDMContextMenu,
  setShowAddDM
}) => {
  return (
    <div className="px-3 py-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-300">Direct messages</h2>
        <button
          onClick={() => setShowAddDM(true)}
          className="text-gray-300 hover:text-white text-lg font-medium"
          title="Add Direct Message"
        >
          +
        </button>
      </div>
      <div className="space-y-1">
        {users
          .filter(user => !hiddenDMs.has(user.user_id))
          .map(user => (
          <button
            key={user.user_id}
            onClick={() => handleDMSelect(user)}
            onContextMenu={(e) => handleDMContextMenu(e, user.user_id)}
            className={`w-full text-left px-2 py-1 rounded text-gray-300 hover:bg-purple-800 ${
              selectedDM?.user_id === user.user_id ? 'bg-purple-700' : ''
            } flex items-center ${
              unreadDMs.has(user.user_id) ? 'font-bold' : ''
            }`}
          >
            <div className="flex items-center min-w-0 flex-1">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-4 h-4 rounded-full object-cover mr-2"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center text-[10px] text-white mr-2">
                  {user.full_name[0].toUpperCase()}
                </div>
              )}
              <span className="truncate">
                {user.full_name}
                {user.status_text && (
                  <span className="ml-1 text-gray-400" title={user.status_text}>
                    💬
                  </span>
                )}
              </span>
              {unreadDMs.has(user.user_id) && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
              )}
            </div>
            <div className={`w-2 h-2 rounded-full ml-2 ${
              onlineUsers.has(user.user_id) ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </button>
        ))}
        
        {/* Current User */}
        <button
          onClick={() => handleDMSelect(userProfile)}
          onContextMenu={(e) => handleDMContextMenu(e, user.id)}
          className={`w-full text-left px-2 py-1 rounded text-gray-300 hover:bg-purple-800 flex items-center mt-2 relative group ${
            selectedDM?.user_id === user.id ? 'bg-purple-700' : ''
          }`}
        >
          <div className="flex items-center min-w-0 flex-1">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={userProfile?.full_name}
                className="w-4 h-4 rounded-full object-cover mr-2"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center text-[10px] text-white mr-2">
                {userProfile?.full_name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
              </div>
            )}
            <span className="truncate">
              {userProfile?.full_name || 'You'} <span className="text-gray-400">(you)</span>
            </span>
            {statusText && (
              <div className="hidden group-hover:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
                {statusText}
              </div>
            )}
          </div>
          <div className="w-2 h-2 rounded-full ml-2 bg-green-500"></div>
        </button>
      </div>
    </div>
  )
}

export default DirectMessagesList 