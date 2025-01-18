import React, { useEffect } from 'react'
import { Icons } from './icons'
import EmojiPicker from 'emoji-picker-react'

const ThreadSidebar = ({
  showThreadSidebar,
  selectedMessage,
  threadMessages,
  setShowThreadSidebar,
  handleSendThreadMessage,
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
  handleStrikethroughClick
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showThreadSidebar) {
        setShowThreadSidebar(false)
      }
    }

    if (showThreadSidebar) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showThreadSidebar, setShowThreadSidebar])

  return (
    <div 
      className={`fixed right-0 top-[104px] bottom-0 w-[400px] border-l border-gray-200 bg-white flex flex-col transition-all duration-300 ease-in-out ${
        showThreadSidebar ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Thread Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold">Thread</h2>
        <button 
          onClick={() => setShowThreadSidebar(false)}
          className="p-2 hover:bg-gray-100 rounded text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Original Message */}
      {selectedMessage && (
        <div className="p-4 border-b">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded bg-gray-300 flex-shrink-0" />
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-bold">{selectedMessage.profiles?.full_name || 'Anonymous'}</span>
                <span className="text-xs text-gray-500">
                  {new Date(selectedMessage.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-900">
                {(() => {
                  const content = selectedMessage.content
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
            </div>
          </div>
        </div>
      )}

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {threadMessages.map(message => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded bg-gray-300 flex-shrink-0" />
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-bold">{message.profiles?.full_name || 'Anonymous'}</span>
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
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input */}
      <div className="p-4 mt-auto border-t">
        <form onSubmit={handleSendThreadMessage}>
          <div className="flex flex-col">
            {/* Formatting Toolbar */}
            <div className="flex items-center space-x-2 mb-2 border-b pb-2">
              <button
                type="button"
                className={`p-1 hover:bg-gray-100 rounded ${isTextBold ? 'bg-gray-200' : ''}`}
                title="Bold"
                onClick={handleBoldClick}
              >
                <span className="font-bold">B</span>
              </button>
              <button
                type="button"
                className={`p-1 hover:bg-gray-100 rounded ${isTextItalic ? 'bg-gray-200' : ''}`}
                title="Italic"
                onClick={handleItalicClick}
              >
                <span className="italic">I</span>
              </button>
              <button
                type="button"
                className={`p-1 hover:bg-gray-100 rounded ${isTextStrikethrough ? 'bg-gray-200' : ''}`}
                title="Strikethrough"
                onClick={handleStrikethroughClick}
              >
                <span className="line-through">S</span>
              </button>
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded"
                title="Link"
                onClick={handleUtilityClick}
              >
                <Icons.Link />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded"
                title="Numbered List"
                onClick={handleUtilityClick}
              >

                <Icons.CodeBlock />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded"
                title="Quote"
                onClick={handleUtilityClick}
              >
              
              </button>
            </div>
            {/* Message Input */}
            <div className="flex flex-col">
              <div className="border rounded-md flex">
                <input
                  ref={inputRef}
                  type="text"
                  value={getCombinedText()}
                  onChange={handleTextInput}
                  placeholder="Reply..."
                  className={`flex-1 px-4 py-2 focus:outline-none ${isTextBold ? 'font-bold' : ''} ${isTextItalic ? 'italic' : ''}`}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none"
                >
                  Send
                </button>
              </div>
              {/* Utility Buttons */}
              <div className="flex items-center space-x-3 mt-2 text-gray-500">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Add files"
                  onClick={(e) => handleUtilityClick(e, 'file')}
                >
                  <Icons.Attachment />
                </button>
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
                    <div className="absolute bottom-full mb-2">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        searchPlaceholder="Search all emoji"
                        width={280}
                        height={300}
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Mention someone"
                  onClick={handleUtilityClick}
                >
                  <Icons.Mention />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Record audio"
                  onClick={handleUtilityClick}
                >
                  <Icons.Audio />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ThreadSidebar 