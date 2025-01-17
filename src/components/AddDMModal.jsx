import React from 'react'

const AddDMModal = ({
  showAddDM,
  setShowAddDM,
  users,
  setHiddenDMs,
  handleDMSelect
}) => {
  return (
    showAddDM && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-[480px] shadow-xl">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Direct Messages</h3>
              <button
                onClick={() => setShowAddDM(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To:
              </label>
              <input
                type="text"
                placeholder="@somebody or somebody@example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {users.map(user => (
                <button
                  key={user.user_id}
                  onClick={() => {
                    // Remove user from hiddenDMs if they were hidden
                    setHiddenDMs(prev => {
                      const newHidden = new Set(prev)
                      newHidden.delete(user.user_id)
                      return newHidden
                    })
                    handleDMSelect(user)
                    setShowAddDM(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-3"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white">
                      {user.full_name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  )
}

export default AddDMModal 