import React, { useEffect, useRef } from 'react'

const CreateChannelModal = ({
  showCreateChannel,
  setShowCreateChannel,
  newChannelName,
  setNewChannelName,
  isCreatingChannel,
  handleCreateChannel
}) => {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowCreateChannel(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowCreateChannel(false)
      }
    }

    if (showCreateChannel) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showCreateChannel, setShowCreateChannel])

  return (
    showCreateChannel && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div ref={modalRef} className="bg-white rounded-lg w-[480px] shadow-xl">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create a channel</h3>
              <button
                onClick={() => setShowCreateChannel(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Channels are where your team communicates. They're best when organized around a topic — #marketing, for example.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  #
                </span>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900"
                  placeholder="e.g. marketing"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateChannel(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChannel}
              disabled={!newChannelName.trim() || isCreatingChannel}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                !newChannelName.trim() || isCreatingChannel
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isCreatingChannel ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </div>
      </div>
    )
  )
}

export default CreateChannelModal 