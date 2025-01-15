import React, { useRef } from 'react'
import { Icons } from './icons'
import FormattingToolbar from './FormattingToolbar'
import EmojiPicker from 'emoji-picker-react'
import FilePreview from './FilePreview'

export default function MessageInput({ 
  onSendMessage, 
  placeholder = "Message", 
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
  selectedFile,
  onRemoveFile
}) {
  const emojiPickerRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage(e)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center h-10 px-2 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${isTextBold ? 'bg-gray-100' : ''}`}
            title="Bold"
            onClick={handleBoldClick}
          >
            <span className="font-bold text-gray-600">B</span>
          </button>
          <button
            type="button"
            className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${isTextItalic ? 'bg-gray-100' : ''}`}
            title="Italic"
            onClick={handleItalicClick}
          >
            <span className="italic text-gray-600">I</span>
          </button>
          <button
            type="button"
            className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${isTextStrikethrough ? 'bg-gray-100' : ''}`}
            title="Strikethrough"
            onClick={handleStrikethroughClick}
          >
            <span className="line-through text-gray-600">S</span>
          </button>
          <div className="h-4 w-px bg-gray-200 mx-1"></div>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            title="Link"
            onClick={handleUtilityClick}
          >
            <Icons.Link className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            title="Numbered List"
            onClick={handleUtilityClick}
          >
            <Icons.NumberedList className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            title="Bulleted List"
            onClick={handleUtilityClick}
          >
            <Icons.BulletedList className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            title="Code Block"
            onClick={handleUtilityClick}
          >
            <Icons.CodeBlock className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            title="Quote"
            onClick={handleUtilityClick}
          >
            <Icons.Quote className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="border rounded-md flex flex-col mt-2">
        {selectedFile && (
          <div className="px-4 pt-3">
            <FilePreview file={selectedFile} onRemove={onRemoveFile} />
          </div>
        )}
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={getCombinedText()}
            onChange={handleTextInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`flex-1 px-4 py-2 focus:outline-none ${isTextBold ? 'font-bold' : ''} ${isTextItalic ? 'italic' : ''} ${isTextStrikethrough ? 'line-through' : ''}`}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none"
            onClick={onSendMessage}
          >
            Send
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-2 text-gray-500">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          title="Add files"
          onClick={(e) => handleUtilityClick(e, 'file')}
        >
          <Icons.Attachment className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            type="button"
            className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${showEmojiPicker ? 'bg-gray-100' : ''}`}
            title="Add emoji"
            onClick={handleEmojiButtonClick}
          >
            <Icons.Emoji className="w-4 h-4" />
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
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          title="Mention someone"
          onClick={handleUtilityClick}
        >
          <Icons.Mention className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          title="Record audio"
          onClick={handleUtilityClick}
        >
          <Icons.Audio className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}