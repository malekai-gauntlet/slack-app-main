import React from 'react'
import { Icons } from './icons'

const ProfileSidebar = ({
  showProfileSidebar,
  setShowProfileSidebar,
  userProfile,
  user,
  isEditingName,
  setIsEditingName,
  editedName,
  setEditedName,
  handleNameEdit,
  handleNameKeyPress,
  nameInputRef
}) => {
  return (
    <div 
      className={`fixed right-0 top-0 bottom-0 w-[600px] border-l border-gray-200 bg-white flex flex-col transition-all duration-300 ease-in-out ${
        showProfileSidebar ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      {/* Profile Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold">Profile</h2>
        <button 
          onClick={() => setShowProfileSidebar(false)}
          className="p-2 hover:bg-gray-100 rounded text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Image */}
        <div className="p-8 flex justify-center">
          {userProfile?.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt="Profile"
              className="w-40 h-40 rounded-lg object-cover"
            />
          ) : (
            <div className="w-40 h-40 rounded-lg bg-purple-700 flex items-center justify-center text-white text-4xl">
              {userProfile?.full_name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-8">
          {/* Name Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleNameKeyPress}
                  className="text-2xl font-bold px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your name"
                />
              ) : (
                <h1 className="text-2xl font-bold">{userProfile?.full_name || 'Anonymous'}</h1>
              )}
              <button 
                onClick={handleNameEdit}
                className="text-blue-600 hover:underline text-sm"
              >
                {isEditingName ? 'Save' : 'Edit'}
              </button>
            </div>
            <button className="mt-2 text-blue-600 hover:underline text-sm flex items-center">
              <Icons.Plus />
              Add name pronunciation
            </button>
          </div>

          {/* Status Section */}
          <div className="mb-6">
            <div className="flex items-center text-sm mb-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Active
              <span className="text-gray-500 ml-2">8:50 PM local time</span>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-1 border rounded hover:bg-gray-50 text-sm">
                Set a status
              </button>
              <button className="px-4 py-1 border rounded hover:bg-gray-50 text-sm flex items-center">
                View as
                <Icons.ChevronDown />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Icons.More />
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Contact information</h2>
              <button className="text-blue-600 hover:underline text-sm">Edit</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <Icons.Email />
                <div>
                  <div className="text-sm">Email Address</div>
                  <div className="text-blue-600 hover:underline">{user.email}</div>
                </div>
              </div>
              <button className="text-blue-600 hover:underline text-sm flex items-center">
                <Icons.Plus />
                Add Phone
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSidebar 