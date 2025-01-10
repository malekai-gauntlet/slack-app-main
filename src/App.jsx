import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import EmojiPicker from 'emoji-picker-react'
import MessageInput from './components/MessageInput'
import { Icons } from './components/icons'




const navItems = [
  { id: 1, name: 'Messages', icon: '💬' },
  { id: 2, name: 'Add canvas', icon: '📝' },
  { id: 3, name: 'Bookmarks', icon: '🔖' },
  { id: 4, name: 'Pins', icon: '📌' },
  { id: 5, name: 'Files', icon: '📁' },
]

function App() {
  const { user, signOut } = useAuth()
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [selectedNav, setSelectedNav] = useState(navItems[0])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [isTextBold, setIsTextBold] = useState(false)
  const [isTextItalic, setIsTextItalic] = useState(false)
  const [isTextStrikethrough, setIsTextStrikethrough] = useState(false)
  const inputRef = useRef(null)
  
  // Updated state for managing formatted text segments with bold, italic, and strikethrough
  const [textSegments, setTextSegments] = useState([{ text: '', isBold: false, isItalic: false, isStrikethrough: false }])
  const [cursorPosition, setCursorPosition] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(null)
  const emojiPickerRef = useRef(null)
  const profileMenuRef = useRef(null)
  const [pickerPosition, setPickerPosition] = useState('top') // 'top' or 'bottom'
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showThreadSidebar, setShowThreadSidebar] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [showProfileSidebar, setShowProfileSidebar] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const nameInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  // Function to handle cursor position changes
  const handleCursorChange = (e) => {
    setCursorPosition(e.target.selectionStart)
  }

  // Function to handle text input
  const handleTextInput = (e) => {
    const newText = e.target.value
    const currentPosition = e.target.selectionStart
    
    // Find the current segment
    let totalLength = 0
    let currentSegmentIndex = 0
    
    for (let i = 0; i < textSegments.length; i++) {
      totalLength += textSegments[i].text.length
      if (currentPosition <= totalLength) {
        currentSegmentIndex = i
        break
      }
    }

    // Update the current segment
    const newSegments = [...textSegments]
    const currentSegment = newSegments[currentSegmentIndex]
    currentSegment.text = newText.slice(
      totalLength - currentSegment.text.length,
      totalLength + (newText.length - getCombinedText().length)
    )
    
    setTextSegments(newSegments)
    setCursorPosition(currentPosition)
  }

  // Function to handle formatting toggles
  const handleBoldClick = () => {
    setIsTextBold(!isTextBold)
    
    // Add a new segment when formatting changes
    setTextSegments(prev => {
      const newSegments = [...prev]
      if (newSegments[newSegments.length - 1].text === '') {
        // If last segment is empty, just update its formatting
        newSegments[newSegments.length - 1].isBold = !isTextBold
        newSegments[newSegments.length - 1].isItalic = isTextItalic // Preserve italic state
      } else {
        // Add a new segment with the new formatting
        newSegments.push({ 
          text: '', 
          isBold: !isTextBold,
          isItalic: isTextItalic // Preserve italic state
        })
      }
      return newSegments
    })
    
    focusInput()
  }

  const handleItalicClick = () => {
    setIsTextItalic(!isTextItalic)
    
    // Add a new segment when formatting changes
    setTextSegments(prev => {
      const newSegments = [...prev]
      if (newSegments[newSegments.length - 1].text === '') {
        // If last segment is empty, just update its formatting
        newSegments[newSegments.length - 1].isItalic = !isTextItalic
        newSegments[newSegments.length - 1].isBold = isTextBold // Preserve bold state
      } else {
        // Add a new segment with the new formatting
        newSegments.push({ 
          text: '', 
          isItalic: !isTextItalic,
          isBold: isTextBold // Preserve bold state
        })
      }
      return newSegments
    })
    
    focusInput()
  }

  // Function to get the combined text value
  const getCombinedText = () => {
    return textSegments.map(segment => segment.text).join('')
  }

  // Updated function to format message content with both bold and italic
  const formatMessageContent = (segments) => {
    return segments.map(segment => {
      let text = segment.text
      if (segment.isBold) {
        text = `**${text}**`
      }
      if (segment.isItalic) {
        text = `_${text}_`
      }
      if (segment.isStrikethrough) {
        text = `~~${text}~~`
      }
      return text
    }).join('')
  }

  // Modified message send handler
  async function handleSendMessage(e) {
    e.preventDefault()
    const messageContent = getCombinedText()
    if (!messageContent.trim()) return

    try {
      // First check if user is a member of the channel
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('channel_id', selectedChannel.id)
        .single()

      if (membershipError) {
        // If not a member, add them
        await supabase
          .from('memberships')
          .insert([
            {
              user_id: user.id,
              channel_id: selectedChannel.id,
              role: 'member'
            }
          ])
      }

      // Send the message
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: messageContent,
            channel_id: selectedChannel.id,
            user_id: user.id
          }
        ])

      if (error) throw error
      
      setTextSegments([{ text: '', isBold: false, isItalic: false, isStrikethrough: false }])
      setIsTextBold(false)
      setIsTextItalic(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Function to handle emoji click
  const onEmojiClick = (emojiObject) => {
    // Add emoji to current text segment
    setTextSegments(prev => {
      const newSegments = [...prev]
      const lastSegment = newSegments[newSegments.length - 1]
      lastSegment.text += emojiObject.emoji
      return newSegments
    })
    setShowEmojiPicker(false)
    focusInput()
  }

  // Function to handle emoji button click
  const handleEmojiButtonClick = (e) => {
    e.preventDefault()
    setShowEmojiPicker(!showEmojiPicker)
  }

  // Add strikethrough handler
  const handleStrikethroughClick = () => {
    setIsTextStrikethrough(!isTextStrikethrough)
    // Update the current text segment with strikethrough
    setTextSegments(prev => {
      const newSegments = [...prev]
      const lastSegment = newSegments[newSegments.length - 1]
      lastSegment.isStrikethrough = !isTextStrikethrough
      return newSegments
    })
    focusInput()
  }

  // If no user is logged in, show the Auth component
  if (!user) {
    return <Auth />
  }

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  async function fetchUserProfile() {
    try {
      // First check if profile exists
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle() // Use maybeSingle() instead of single()

      if (fetchError) throw fetchError

      if (!data) {
        // If profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              user_id: user.id, 
              full_name: user.email?.split('@')[0] || 'Anonymous' 
            }
          ])
          .select()
          .single()

        if (createError) throw createError
        setUserProfile(newProfile)
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching/creating user profile:', error)
    }
  }

  useEffect(() => {
    // Fetch channels
    fetchChannels()
  }, [])

  useEffect(() => {
    if (!selectedChannel) return;

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(currentMessages => [...currentMessages, payload.new])
          } else if (payload.eventType === 'DELETE') {
            setMessages(currentMessages => 
              currentMessages.filter(message => message.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Subscribe to reactions
    const reactionSubscription = supabase
      .channel('reactions')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions'
        },
        () => {
          // Refresh messages to get updated reactions
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
      reactionSubscription.unsubscribe()
    }
  }, [selectedChannel])

  async function fetchChannels() {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log('Fetched channels:', data); // Debug log
      
      setChannels(data);
      if (data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0]);
        console.log('Selected channel:', data[0]); // Debug log
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  }

  async function fetchMessages() {
    if (!selectedChannel) return;

    try {
      console.log('Fetching messages for channel ID:', selectedChannel.id);
      console.log('Selected channel:', selectedChannel);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey (
            full_name,
            avatar_url
          ),
          reactions (
            id,
            emoji,
            user_id
          )
        `)
        .eq('channel_id', selectedChannel.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      console.log('Raw messages data:', data);
      
      const processedData = data.map(message => {
        console.log('Processing message:', message);
        return {
          ...message,
          reactions: message.reactions || []
        };
      });

      setMessages(processedData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  }

  // Function to focus input
  const focusInput = () => {
    inputRef.current?.focus()
  }

  // Function to handle utility button clicks
  const handleUtilityClick = (e, type) => {
    e.preventDefault()
    if (type === 'file') {
      fileInputRef.current?.click()
    } else {
      focusInput()
    }
  }

  // Function to handle reaction button click with position calculation
  const handleReactionButtonClick = (messageId, event) => {
    const messageElement = event.currentTarget.closest('.message-container')
    const rect = messageElement.getBoundingClientRect()
    const distanceToTop = rect.top
    const MINIMUM_TOP_SPACE = 350 // Emoji picker height (300) + 50px padding
    
    setPickerPosition(distanceToTop < MINIMUM_TOP_SPACE ? 'bottom' : 'top')
    setShowReactionPicker(messageId)
  }

  // Function to handle reaction select
  const handleReactionSelect = async (messageId, emojiObject) => {
    try {
      // Check if reaction already exists
      const { data: existingReaction, error: fetchError } = await supabase
        .from('reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emojiObject.emoji)
        .single()

      if (existingReaction) {
        // Remove existing reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id)

        if (error) throw error
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('reactions')
          .insert([
            {
              message_id: messageId,
              user_id: user.id,
              emoji: emojiObject.emoji
            }
          ])

        if (error) throw error
      }

      // Refresh messages to get updated reactions
      await fetchMessages()
    } catch (error) {
      console.error('Error handling reaction:', error)
    }

    setShowReactionPicker(null)
  }

  // Handle click outside emoji picker and profile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowReactionPicker(null)
        setShowEmojiPicker(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Add click handler for profile menu
  const handleProfileClick = (e) => {
    e.preventDefault()
    setShowProfileMenu(!showProfileMenu)
  }

  // Add handler for thread button click
  const handleThreadClick = (message) => {
    setSelectedMessage(message)
    setShowThreadSidebar(true)
  }

  // Add handler for sending thread messages
  const handleSendThreadMessage = async (e) => {
    e.preventDefault()
    if (!selectedMessage) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content: getCombinedText(),
            user_id: user.id,
            channel_id: selectedChannel.id,
            parent_id: selectedMessage.id // Reference to the original message
          }
        ])
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!messages_user_id_fkey (
            full_name,
            avatar_url
          )
        `)

      if (error) throw error

      setThreadMessages([...threadMessages, data[0]])
      // Reset input
      setTextSegments([{ text: '', isBold: false, isItalic: false, isStrikethrough: false }])
    } catch (error) {
      console.error('Error sending thread message:', error)
    }
  }

  // Fetch thread messages when a message is selected
  useEffect(() => {
    if (selectedMessage) {
      fetchThreadMessages()
    }
  }, [selectedMessage])

  // Function to fetch thread messages
  const fetchThreadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!messages_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('parent_id', selectedMessage.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setThreadMessages(data)
    } catch (error) {
      console.error('Error fetching thread messages:', error)
    }
  }

  // Add handler for profile button click
  const handleProfileButtonClick = () => {
    setShowProfileSidebar(true)
    setShowProfileMenu(false) // Close the profile menu when opening sidebar
  }

  // Add handler for name edit
  const handleNameEdit = () => {
    if (isEditingName) {
      // If we're currently editing, this is a save action
      handleNameSave()
    } else {
      // If we're not editing, start editing
      setEditedName(userProfile?.full_name || '')
      setIsEditingName(true)
      // Focus the input after it renders
      setTimeout(() => nameInputRef.current?.focus(), 0)
    }
  }

  // Add handler for name save
  const handleNameSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editedName })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setUserProfile(prev => ({ ...prev, full_name: editedName }))
      setIsEditingName(false)
    } catch (error) {
      console.error('Error updating name:', error)
    }
  }

  // Add handler for name input key press
  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
      setEditedName(userProfile?.full_name || '') // Reset to current name
    }
  }

  // Add new handler for file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Add the file name to the current text segment
      setTextSegments(prev => {
        const newSegments = [...prev]
        const lastSegment = newSegments[newSegments.length - 1]
        lastSegment.text += `[File: ${file.name}] `
        return newSegments
      })
    }
  }

  // Update the channel selection handler
  const handleChannelSelect = (channel) => {
    console.log('Selecting channel:', channel); // Debug log
    setSelectedChannel(channel);
    fetchMessages(); // Add this to fetch messages immediately when channel is selected
  };

  useEffect(() => {
    if (selectedChannel) {
      console.log('Selected channel changed to:', selectedChannel);
      fetchMessages();
    }
  }, [selectedChannel]);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div 
        className={`bg-purple-900 text-white flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-60' : 'w-0'
        }`}
      >
        {/* Workspace Header */}
        <div className={`p-3 flex items-center justify-between border-b border-purple-800 ${
          !isSidebarOpen && 'opacity-0'
        }`}>
          <h1 className="font-bold text-lg">GauntletAI</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ≡
          </button>
        </div>

        {/* Channels Section */}
        <div className={`flex-1 overflow-y-auto ${!isSidebarOpen && 'opacity-0'}`}>
          <div className="px-3 py-4">
            <h2 className="text-sm font-medium mb-2 text-gray-300">Channels</h2>
            <div className="space-y-1">
              {/* Old channels mapping (kept for reference) */}
              {/*dummyChannels.map(channel => (*/}
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel)}
                  className={`w-full text-left px-2 py-1 rounded text-gray-300 hover:bg-purple-800 ${
                    selectedChannel?.id === channel.id ? 'bg-purple-700' : ''
                  }`}
                >
                  # {channel.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content + Thread Sidebar Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col bg-white min-w-0 ${showThreadSidebar ? 'max-w-[calc(100%-600px)]' : ''}`}>
          {/* Search Bar */}
          <div className="bg-purple-900 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="text-gray-300 hover:text-white text-2xl"
                >
                  ≡
                </button>
              )}
            </div>
            <div className="flex-1 max-w-3xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search GauntletAI"
                  className="w-full bg-purple-800/50 text-white placeholder-gray-300 rounded-md py-1.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="absolute left-3 top-2">
                  <Icons.Search />
                </div>
              </div>
            </div>
            <div className="w-8"></div> {/* Spacer for alignment */}
          </div>

          {/* Channel Header */}
          <div className="border-b">
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center">
                {!isSidebarOpen && (
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="mr-3 text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ≡
                  </button>
                )}
                <h2 className="text-lg font-bold">#{selectedChannel?.name}</h2>
              </div>
              <div className="flex items-center space-x-2 relative">
                <button
                  onClick={handleProfileClick}
                  className="focus:outline-none"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div 
                    ref={profileMenuRef}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    {/* User Info */}
                    <div className="p-4">
                      <div className="flex items-center space-x-3">
                        {userProfile?.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white">
                            {user.email?.[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold">{userProfile?.full_name || 'Anonymous'}</div>
                          <div className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Active
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="px-4 py-2">
                      <button className="w-full text-left px-3 py-2 rounded border border-gray-300 text-gray-600 hover:border-gray-400 focus:outline-none">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">☺</span>
                          <span>Update your status</span>
                        </div>
                      </button>
                    </div>

                    {/* Set Away */}
                    <div className="px-4 py-2 border-t">
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                        Set yourself as <span className="font-semibold">away</span>
                      </button>
                    </div>

                    {/* Pause Notifications */}
                    <div className="px-4 py-2 border-t">
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center justify-between">
                        <span>Pause notifications</span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Profile & Preferences */}
                    <div className="px-4 py-2 border-t">
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                        onClick={handleProfileButtonClick}
                      >
                        Profile
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                        Preferences
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="px-4 py-2 border-t">
                      <button 
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                      >
                        Sign out of GauntletAI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Navigation Tabs */}
            <div className="px-4 flex items-center space-x-4 text-sm">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNav(item)}
                  className={`px-3 py-2 hover:bg-gray-100 ${
                    selectedNav.id === item.id ? 'border-b-2 border-purple-600' : ''
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
              <button className="ml-auto text-xl">+</button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className="flex items-start space-x-3 group relative hover:bg-gray-50 p-2 rounded-lg message-container"
              >
                <div className="w-9 h-9 rounded bg-gray-300 flex-shrink-0" /> {/* Avatar placeholder */}
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
                  {/* Reactions display */}
                  <div className="flex items-center space-x-2 mt-1">
                    {console.log('Message reactions:', message.reactions)}
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
          </div>

          {/* Message Input */}
          <MessageInput 
            onSendMessage={handleSendMessage}
            placeholder={`Message #${selectedChannel?.name}`}
            isTextBold={isTextBold}
            isTextItalic={isTextItalic}
            handleTextInput={handleTextInput}
            getCombinedText={getCombinedText}
            handleUtilityClick={handleUtilityClick}
            handleEmojiButtonClick={handleEmojiButtonClick}
            showEmojiPicker={showEmojiPicker}
            onEmojiClick={onEmojiClick}
            inputRef={inputRef}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
          />
        </div>

        {/* Thread Sidebar */}
        <div 
          className={`fixed right-0 top-0 bottom-0 w-[600px] border-l border-gray-200 bg-white flex flex-col transition-all duration-300 ease-in-out ${
            showThreadSidebar ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Thread Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold">Thread</h2>
            <button 
              onClick={() => setShowThreadSidebar(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Icons.Close />
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
                  <p className="text-gray-900">{selectedMessage.content}</p>
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
                  <p className="text-gray-900">{message.content}</p>
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
                    <Icons.NumberedList />
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Bulleted List"
                    onClick={handleUtilityClick}
                  >
                    <Icons.BulletedList />
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Code Block"
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
                    <Icons.Quote />
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
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Profile Sidebar */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-[600px] border-l border-gray-200 bg-white flex flex-col transition-all duration-300 ease-in-out ${
          showProfileSidebar ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
        {/* Profile Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold">Profile</h2>
          <button 
            onClick={() => setShowProfileSidebar(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Image */}
          <div className="p-8 flex justify-center">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt="Profile"
                className="w-40 h-40 rounded-lg object-cover"
              />
            ) : (
              <div className="w-40 h-40 rounded-lg bg-purple-700 flex items-center justify-center text-white text-4xl">
                {user.email?.[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-8">
            {/* Name Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={handleNameKeyPress}
                    className="text-2xl font-bold px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{userProfile?.full_name || 'Anonymous'}</h1>
                )}
                <button 
                  onClick={handleNameEdit}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {isEditingName ? 'Save' : 'Edit'}
                </button>
              </div>
              <button className="mt-2 text-blue-600 hover:underline text-sm flex items-center">
                <Icons.Plus />
                Add name pronunciation
              </button>
            </div>

            {/* Status Section */}
            <div className="mb-6">
              <div className="flex items-center text-sm mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active
                <span className="text-gray-500 ml-2">8:50 PM local time</span>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-1 border rounded hover:bg-gray-50 text-sm">
                  Set a status
                </button>
                <button className="px-4 py-1 border rounded hover:bg-gray-50 text-sm flex items-center">
                  View as
                  <Icons.ChevronDown />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Icons.More />
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Contact information</h2>
                <button className="text-blue-600 hover:underline text-sm">Edit</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Icons.Email />
                  <div>
                    <div className="text-sm">Email Address</div>
                    <div className="text-blue-600 hover:underline">{user.email}</div>
                  </div>
                </div>
                <button className="text-blue-600 hover:underline text-sm flex items-center">
                  <Icons.Plus />
                  Add Phone
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
