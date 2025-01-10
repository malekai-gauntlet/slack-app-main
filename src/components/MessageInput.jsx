import React, { useRef } from 'react'
import { Icons } from './icons'
import FormattingToolbar from './FormattingToolbar'
import EmojiPicker from 'emoji-picker-react'

export default function MessageInput({ 
  onSendMessage, 
  placeholder = "Message", 
  isTextBold,
  isTextItalic,
  handleTextInput,
  getCombinedText,
  handleUtilityClick,
  handleEmojiButtonClick,
  showEmojiPicker,
  onEmojiClick,
  inputRef,
  fileInputRef,
  handleFileSelect
}) {
  const emojiPickerRef = useRef(null)

  return (
    <div className="flex flex-col">
      <div className="border rounded-md flex">
        <input
          ref={inputRef}
          type="text"
          value={getCombinedText()}
          onChange={handleTextInput}
          placeholder={placeholder}
          className={`flex-1 px-4 py-2 focus:outline-none ${isTextBold ? 'font-bold' : ''} ${isTextItalic ? 'italic' : ''}`}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none"
          onClick={onSendMessage}
        >
          Send
        </button>
      </div>
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
            <div ref={emojiPickerRef} className="absolute bottom-full mb-2">
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
  )
}