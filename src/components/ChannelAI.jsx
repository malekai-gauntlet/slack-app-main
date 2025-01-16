import React from 'react'
import { Icons } from './icons'
import EmojiPicker from 'emoji-picker-react'
import { fetchAIResponse } from '../utils/ai'
import MessageInput from './MessageInput'

const ChannelAI = ({
  showAIChatSidebar,
  selectedDM,
  aiMessages,
  setShowAIChatSidebar,
  handleSendAIMessage,
  isTextBold,
  isTextItalic,
  isTextStrikethrough,
  handleTextInput,
  getCombinedText,
  handleUtilityClick,
  handleEmojiButtonClick,
  showEmojiPicker,
  onEmojiClick,
  inputRef,
  fileInputRef,
  handleFileSelect,
  handleBoldClick,
  handleItalicClick,
  handleStrikethroughClick,
  isLoading,
  messages,
  handleSendMessage
}) => {
  return (
    <div 
      className={`fixed right-0 top-0 bottom-0 w-[600px] border-l border-gray-200 bg-white flex flex-col transition-all duration-300 ease-in-out ${
        showAIChatSidebar ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Channel AI Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {selectedDM?.avatar_url ? (
            <img
              src={selectedDM.avatar_url}
              alt={selectedDM.full_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white">
              {selectedDM?.full_name[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-bold flex items-center">
              {selectedDM?.full_name}'s AI Avatar
              <Icons.AI className="ml-2 w-4 h-4" />
            </h2>
          </div>
        </div>
        <button 
          onClick={() => setShowAIChatSidebar(false)}
          className="p-2 hover:bg-gray-100 rounded text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`message-container mb-4 ${message.isAI ? 'ai-message' : ''}`}>
            <div className="flex items-start">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm mr-2">
                {message.isAI ? 'AI' : message.profiles?.full_name?.[0].toUpperCase()}
              </div>
              
              {/* Message content */}
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-bold">
                    {message.isAI ? 'AI Assistant' : message.profiles?.full_name}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    {message.timestamp}
                  </span>
                </div>
                <div className="mt-1">{message.content}</div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-3">
            {selectedDM?.avatar_url ? (
              <img
                src={selectedDM.avatar_url}
                alt={selectedDM.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white">
                {selectedDM?.full_name[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="font-medium">{selectedDM?.full_name}'s AI</span>
              </div>
              <div className="mt-1 text-gray-500">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendAIMessage} className="space-y-3">
          <div className="flex items-center space-x-2 mb-2">
            <button
              type="button"
              onClick={handleBoldClick}
              className={`p-1 hover:bg-gray-100 rounded ${isTextBold ? 'bg-gray-200' : ''}`}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={handleItalicClick}
              className={`p-1 hover:bg-gray-100 rounded ${isTextItalic ? 'bg-gray-200' : ''}`}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={handleStrikethroughClick}
              className={`p-1 hover:bg-gray-100 rounded ${isTextStrikethrough ? 'bg-gray-200' : ''}`}
              title="Strikethrough"
            >
              <span className="line-through">S</span>
            </button>
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={getCombinedText()}
              onChange={handleTextInput}
              placeholder="Message AI Avatar..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute right-2 top-2 flex items-center space-x-1">
              <div className="relative">
                <button
                  type="button"
                  className={`p-1 hover:bg-gray-100 rounded ${showEmojiPicker ? 'bg-gray-200' : ''}`}
                  title="Add emoji"
                  onClick={handleEmojiButtonClick}
                >
                  <Icons.Emoji />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      searchPlaceholder="Search emoji"
                      width={280}
                      height={300}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChannelAI