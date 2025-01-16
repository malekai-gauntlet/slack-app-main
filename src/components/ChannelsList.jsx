import React from 'react'

const ChannelsList = ({
  channels,
  selectedChannel,
  unreadChannels,
  mutedChannels,
  handleChannelSelect,
  handleChannelContextMenu,
  setShowCreateChannel
}) => {
  return (
    <div className="px-3 py-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-300">Channels</h2>
        <button
          onClick={() => setShowCreateChannel(true)}
          className="text-gray-300 hover:text-white text-lg font-medium"
          title="Create Channel"
        >
          +
        </button>
      </div>
      <div className="space-y-1">
        {channels.map(channel => (
          <button
            key={channel.id}
            onClick={() => handleChannelSelect(channel)}
            onContextMenu={(e) => handleChannelContextMenu(e, channel.id)}
            className={`w-full text-left px-2 py-1 rounded text-gray-300 ${
              selectedChannel?.id === channel.id 
                ? 'bg-purple-800 text-white' 
                : 'hover:bg-purple-800 hover:text-white'
            } flex items-center justify-between ${
              unreadChannels.has(channel.id) ? 'font-bold' : ''
            }`}
          >
            <span># {channel.name}</span>
            <div className="flex items-center space-x-1">
              {unreadChannels.has(channel.id) && !mutedChannels.has(channel.id) && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              {mutedChannels.has(channel.id) && (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChannelsList 