import React from 'react'
import { Icons } from './icons'
import EmojiPicker from 'emoji-picker-react'
import FileAttachment from './FileAttachment'
import TwitterPreview from './TwitterPreview'

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
            <div className="text-gray-900">
              {(() => {
                const content = message.content;
                const parts = [];
                let currentText = content;
                
                // Find Twitter URLs first
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const urls = content.match(urlRegex) || [];
                const twitterUrls = urls.filter(url => url.includes('twitter.com') || url.includes('x.com'));
                
                if (twitterUrls.length > 0) {
                  // Split content by URLs and process each part
                  const segments = content.split(urlRegex);
                  segments.forEach((segment, index) => {
                    if (urls.includes(segment)) {
                      // This is a URL segment
                      parts.push(
                        <a 
                          key={index} 
                          href={segment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {segment}
                        </a>
                      );
                      
                      // Add Twitter preview if it's a Twitter URL
                      if (segment.includes('twitter.com') || segment.includes('x.com')) {
                        parts.push(
                          <TwitterPreview
                            key={`preview-${index}`}
                            url={segment}
                          />
                        );
                      }
                    } else if (segment) {
                      // Process text formatting for non-URL segments
                      let text = segment;
                      let formattedParts = [];
                      
                      // Process bold
                      while (text.includes('**')) {
                        const startIdx = text.indexOf('**');
                        const endIdx = text.indexOf('**', startIdx + 2);
                        if (endIdx === -1) break;
                        
                        if (startIdx > 0) {
                          formattedParts.push(<span key={formattedParts.length}>{text.slice(0, startIdx)}</span>);
                        }
                        
                        formattedParts.push(
                          <span key={formattedParts.length} className="font-bold">
                            {text.slice(startIdx + 2, endIdx)}
                          </span>
                        );
                        
                        text = text.slice(endIdx + 2);
                      }
                      
                      // Process italic
                      while (text.includes('_')) {
                        const startIdx = text.indexOf('_');
                        const endIdx = text.indexOf('_', startIdx + 1);
                        if (endIdx === -1) break;
                        
                        if (startIdx > 0) {
                          formattedParts.push(<span key={formattedParts.length}>{text.slice(0, startIdx)}</span>);
                        }
                        
                        formattedParts.push(
                          <span key={formattedParts.length} className="italic">
                            {text.slice(startIdx + 1, endIdx)}
                          </span>
                        );
                        
                        text = text.slice(endIdx + 1);
                      }
                      
                      // Process strikethrough
                      while (text.includes('~~')) {
                        const startIdx = text.indexOf('~~');
                        const endIdx = text.indexOf('~~', startIdx + 2);
                        if (endIdx === -1) break;
                        
                        if (startIdx > 0) {
                          formattedParts.push(<span key={formattedParts.length}>{text.slice(0, startIdx)}</span>);
                        }
                        
                        formattedParts.push(
                          <span key={formattedParts.length} className="line-through">
                            {text.slice(startIdx + 2, endIdx)}
                          </span>
                        );
                        
                        text = text.slice(endIdx + 2);
                      }
                      
                      if (text) {
                        formattedParts.push(<span key={formattedParts.length}>{text}</span>);
                      }
                      
                      parts.push(...(formattedParts.length > 0 ? formattedParts : [<span key={index}>{segment}</span>]));
                    }
                  });
                } else {
                  // Original formatting logic for non-Twitter messages
                  while (currentText.includes('**')) {
                    const startIdx = currentText.indexOf('**');
                    const endIdx = currentText.indexOf('**', startIdx + 2);
                    if (endIdx === -1) break;
                    if (startIdx > 0) {
                      parts.push(<span key={parts.length}>{currentText.slice(0, startIdx)}</span>);
                    }
                    parts.push(
                      <span key={parts.length} className="font-bold">
                        {currentText.slice(startIdx + 2, endIdx)}
                      </span>
                    );
                    currentText = currentText.slice(endIdx + 2);
                  }
                  while (currentText.includes('_')) {
                    const startIdx = currentText.indexOf('_');
                    const endIdx = currentText.indexOf('_', startIdx + 1);
                    if (endIdx === -1) break;
                    if (startIdx > 0) {
                      parts.push(<span key={parts.length}>{currentText.slice(0, startIdx)}</span>);
                    }
                    parts.push(
                      <span key={parts.length} className="italic">
                        {currentText.slice(startIdx + 1, endIdx)}
                      </span>
                    );
                    currentText = currentText.slice(endIdx + 1);
                  }
                  while (currentText.includes('~~')) {
                    const startIdx = currentText.indexOf('~~');
                    const endIdx = currentText.indexOf('~~', startIdx + 2);
                    if (endIdx === -1) break;
                    if (startIdx > 0) {
                      parts.push(<span key={parts.length}>{currentText.slice(0, startIdx)}</span>);
                    }
                    parts.push(
                      <span key={parts.length} className="line-through">
                        {currentText.slice(startIdx + 2, endIdx)}
                      </span>
                    );
                    currentText = currentText.slice(endIdx + 2);
                  }
                  if (currentText) {
                    parts.push(<span key={parts.length}>{currentText}</span>);
                  }
                }
                
                return parts.length > 0 ? parts : content;
              })()}
            </div>

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
              <Icons.Emoji />
            </button>
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.preventDefault()
                handleThreadClick(message)
              }}
            >
              <Icons.Thread />
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
                width={350}
                height={450}
                emojiSize={20}
                emojiButtonSize={28}
                previewConfig={{ showPreview: false }}
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