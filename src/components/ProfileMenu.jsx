import React from 'react'
import { Icons } from './icons'

const ProfileMenu = ({
  showProfileMenu,
  profileMenuRef,
  userProfile,
  user,
  statusText,
  isEditingStatus,
  setIsEditingStatus,
  setStatusText,
  updateStatus,
  signOut,
  handleProfileButtonClick
}) => {
  return (
    showProfileMenu && (
      <div 
        ref={profileMenuRef}
        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      >
        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center space-x-3">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white">
                {user.email?.[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-bold">{userProfile?.full_name || 'Anonymous'}</div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Status Update */}
        <div className="px-4 py-2">
          {isEditingStatus ? (
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              onBlur={() => {
                setIsEditingStatus(false)
                updateStatus(statusText)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingStatus(false)
                  updateStatus(statusText)
                } else if (e.key === 'Escape') {
                  setStatusText('')
                  setIsEditingStatus(false)
                }
              }}
              placeholder="What's your status?"
              className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
          ) : (
            <button 
              onClick={() => setIsEditingStatus(true)}
              className="w-full text-left px-3 py-2 rounded border border-gray-300 text-gray-600 hover:border-gray-400 focus:outline-none"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">☺</span>
                <span>{statusText || "Update your status"}</span>
              </div>
            </button>
          )}
        </div>

        {/* Set Away */}
        <div className="px-4 py-2 border-t">
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
            Set yourself as <span className="font-semibold">away</span>
          </button>
        </div>

        {/* Pause Notifications */}
        <div className="px-4 py-2 border-t">
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center justify-between">
            <span>Pause notifications</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Profile & Preferences */}
        <div className="px-4 py-2 border-t">
          <button 
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
            onClick={handleProfileButtonClick}
          >
            Profile
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
            Preferences
          </button>
        </div>

        {/* Sign Out */}
        <div className="px-4 py-2 border-t">
          <button 
            onClick={signOut}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
          >
            Sign out of GauntletAI
          </button>
        </div>
      </div>
    )
  )
}

export default ProfileMenu 