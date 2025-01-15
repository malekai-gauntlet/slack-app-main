import React from 'react'
import { Icons } from './icons'
import EmojiPicker from 'emoji-picker-react'
import FileAttachment from './FileAttachment'

const MessageList = ({
  messages,
  showReactionPicker,
  pickerPosition,
  handleReactionButtonClick,
  handleThreadClick,
  handleReactionSelect,
  emojiPickerRef,
  messagesEndRef
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <div 
          key={message.id} 
          className="flex items-start space-x-3 group relative hover:bg-gray-50 p-2 rounded-lg message-container"
        >
          {message.profiles?.avatar_url ? (
            <img
              src={message.profiles.avatar_url}
              alt={message.profiles.full_name}
              className="w-9 h-9 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded bg-purple-700 flex items-center justify-center text-white flex-shrink-0">
              {message.profiles?.full_name?.[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="font-bold">
                {message.profiles?.full_name || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-900">
              {(() => {
                const content = message.content
                const parts = []
                let currentText = content
                
                // Handle bold text
                while (currentText.includes('**')) {
                  const startIdx = currentText.indexOf('**')
                  const endIdx = currentText.indexOf('**', startIdx + 2)
                  
                  if (endIdx === -1) break
                  
                  // Add text before bold
                  if (startIdx > 0) {
                    parts.push(<span key={parts.length}>{currentText.slice(0, startIdx)}</span>)
                  }
                  
                  // Add bold text
                  parts.push(
                    <span key={parts.length} className="font-bold">
                      {currentText.slice(startIdx + 2, endIdx)}
                    </span>
                  )
                  
                  currentText = currentText.slice(endIdx + 2)
                }
                
                // Handle italic text in remaining content
                while (currentText.includes('_')) {
                  const startIdx = currentText.indexOf('_')
                  const endIdx = currentText.indexOf('_', startIdx + 1)
                  
                  if (endIdx === -1) break
                  
                  // Add text before italic
                  if (startIdx > 0) {
                    parts.push(<span key={parts.length}>{currentText.slice(0, startIdx)}</span>)
                  }
                  
                  // Add italic text
                  parts.push(
                    <span key={parts.length} className="italic">
                      {currentText.slice(startIdx + 1, endIdx)}
                    </span>
                  )
                  
                  currentText = currentText.slice(endIdx + 1)
                }

                // Handle strikethrough text in remaining content
                while (currentText.includes('~~')) {
                  const startIdx = currentText.indexOf('~~')
                  const endIdx = currentText.indexOf('~~', startIdx + 2)
                  
                  if (endIdx === -1) break
                  
                  // Add text before strikethrough
                  if (startIdx > 0) {
                    parts.push(<span key={parts.length}>{currentText.slice(0, startIdx)}</span>)
                  }
                  
                  // Add strikethrough text
                  parts.push(
                    <span key={parts.length} className="line-through">
                      {currentText.slice(startIdx + 2, endIdx)}
                    </span>
                  )
                  
                  currentText = currentText.slice(endIdx + 2)
                }
                
                // Add any remaining text
                if (currentText) {
                  parts.push(<span key={parts.length}>{currentText}</span>)
                }
                
                return parts.length > 0 ? parts : content
              })()}
            </p>

            {/* Add File Attachment */}
            {message.has_attachment && (
              <FileAttachment
                file={{
                  url: message.attachment_url,
                  name: message.attachment_name,
                  type: message.attachment_type,
                  size: message.attachment_size
                }}
              />
            )}

            {/* Reactions display */}
            <div className="flex items-center space-x-2 mt-1">
              {Array.isArray(message.reactions) && message.reactions.map((reaction, index) => (
                <button
                  key={`${reaction.emoji}-${index}`}
                  className="inline-flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-sm"
                  onClick={() => handleReactionSelect(message.id, { emoji: reaction.emoji })}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-600">{reaction.count}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Reaction and Thread buttons */}
          <div className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 flex items-center space-x-2">
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.preventDefault()
                handleReactionButtonClick(message.id, e)
              }}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.preventDefault()
                handleThreadClick(message)
              }}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
          {/* Emoji picker for reactions */}
          {showReactionPicker === message.id && (
            <div 
              ref={emojiPickerRef} 
              className={`absolute right-0 ${
                pickerPosition === 'top' 
                  ? 'bottom-full mb-2' 
                  : 'top-full mt-2'
              } z-50`}
            >
              <EmojiPicker
                onEmojiClick={(emojiObject) => handleReactionSelect(message.id, emojiObject)}
                searchPlaceholder="Search all emoji"
                width={280}
                height={300}
              />
            </div>
          )}
        </div>
      ))}
      {/* Add div for scrolling reference */}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList 