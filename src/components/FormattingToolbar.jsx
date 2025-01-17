import React from 'react'
import { Icons } from './icons'
import EmojiPicker from 'emoji-picker-react'

export default function FormattingToolbar({
  fileInputRef,
  handleFileSelect,
  handleUtilityClick,
  handleEmojiButtonClick,
  showEmojiPicker,
  emojiPickerRef,
  onEmojiClick
}) {
  return (
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
  )
}