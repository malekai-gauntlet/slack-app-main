import React, { useRef, useState, useEffect } from 'react'
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
  const [isRecording, setIsRecording] = useState(false)
  const [hasMicPermission, setHasMicPermission] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        handleEmojiButtonClick()
      }
    }

    // Add escape key handler
    function handleEscapeKey(event) {
      if (event.key === 'Escape' && showEmojiPicker) {
        handleEmojiButtonClick()
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showEmojiPicker, handleEmojiButtonClick])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage(e)
    }
  }

  const transcribeAudio = async (audioBlob) => {
    try {
      setIsTranscribing(true)
      
      // Create form data with audio file
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      // Send to Supabase Edge Function
      const response = await fetch('https://kzxuqhhdfoztrgjgidak.supabase.co/functions/v1/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Transcription failed')
      }
      
      const { text } = await response.json()
      
      // Update the input field with transcribed text
      if (handleTextInput) {
        const event = {
          target: { value: text }
        }
        handleTextInput(event)
        
        // Focus the input and move cursor to end
        if (inputRef.current) {
          inputRef.current.focus()
          // Use a small timeout to ensure the value is set before moving cursor
          setTimeout(() => {
            inputRef.current.selectionStart = inputRef.current.selectionEnd = text.length
          }, 0)
        }
      }
    } catch (error) {
      console.error('Transcription error:', error)
      // You might want to show an error toast here
    } finally {
      setIsTranscribing(false)
      setRecordedAudio(null) // Clear the recording after transcription
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        stream.getTracks().forEach(track => track.stop())
        // Automatically start transcription when recording stops
        transcribeAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error starting recording:', err)
      setHasMicPermission(false)
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
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
            title="Code Block"
            onClick={handleUtilityClick}
          >
            <Icons.CodeBlock className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-col mt-2">
        {selectedFile && (
          <div className="px-4 pt-3">
            <FilePreview file={selectedFile} onRemove={onRemoveFile} />
          </div>
        )}
        <div className="flex border rounded-md focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-150">
          <input
            ref={inputRef}
            type="text"
            value={getCombinedText()}
            onChange={handleTextInput}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : placeholder}
            className={`flex-1 px-4 py-2 focus:outline-none [caret-color:black] ${isTextBold ? 'font-bold' : ''} ${isTextItalic ? 'italic' : ''} ${isTextStrikethrough ? 'line-through' : ''}`}
            style={{ caretColor: 'black' }}
          />
          <button
            type="submit"
            className="px-4 py-2 text-gray-400 hover:text-purple-600 focus:outline-none transition-colors duration-150"
            onClick={onSendMessage}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="w-5 h-5 rotate-90"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
              />
            </svg>
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
                width={350}
                height={450}
                emojiSize={20}
                emojiButtonSize={28}
                previewConfig={{ showPreview: false }}
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
          className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${isRecording ? 'bg-red-50' : ''}`}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
          onClick={toggleRecording}
          disabled={hasMicPermission === false}
        >
          <Icons.Audio className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''} ${hasMicPermission === false ? 'opacity-50' : ''}`} />
          {isRecording && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>
    </div>
  )
}