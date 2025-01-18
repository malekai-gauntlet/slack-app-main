import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './contexts/AuthContext'
import { debounce } from './utils/debounce'
import Auth from './components/Auth'
import EmojiPicker from 'emoji-picker-react'
import MessageInput from './components/MessageInput'
import { Icons } from './components/icons'
import DirectMessagesList from './components/DirectMessagesList'
import ChannelsList from './components/ChannelsList'
import ProfileMenu from './components/ProfileMenu'
import ThreadSidebar from './components/ThreadSidebar'
import AIChatSidebar from './components/AIChatSidebar'
import MessageList from './components/MessageList'
import ProfileSidebar from './components/ProfileSidebar'
import CreateChannelModal from './components/CreateChannelModal'
import AddDMModal from './components/AddDMModal'
import SearchResults from './components/SearchResults'

function App() {
  const { user, signOut } = useAuth()
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [isTextBold, setIsTextBold] = useState(false)
  const [isTextItalic, setIsTextItalic] = useState(false)
  const [isTextStrikethrough, setIsTextStrikethrough] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedDM, setSelectedDM] = useState(null)
  const [showAddDM, setShowAddDM] = useState(false)
  const [hiddenDMs, setHiddenDMs] = useState(new Set())
  const [onlineUsers, setOnlineUsers] = useState(new Set())
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
  const [showAIChatSidebar, setShowAIChatSidebar] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [threadMessages, setThreadMessages] = useState([])
  const [threadTextSegments, setThreadTextSegments] = useState([{ text: '', isBold: false, isItalic: false, isStrikethrough: false }])
  const [isThreadTextBold, setIsThreadTextBold] = useState(false)
  const [isThreadTextItalic, setIsThreadTextItalic] = useState(false)
  const [isThreadTextStrikethrough, setIsThreadTextStrikethrough] = useState(false)
  const threadInputRef = useRef(null)
  const [showProfileSidebar, setShowProfileSidebar] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const nameInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  // Add state for channel context menu
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    channelId: null
  })
  // Add state for DM context menu
  const [dmContextMenu, setDmContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    userId: null
  })
  // Add state for muted channels
  const [mutedChannels, setMutedChannels] = useState(new Set())
  // Add state for unread channels
  const [unreadChannels, setUnreadChannels] = useState(new Set())
  // Add state for unread DMs
  const [unreadDMs, setUnreadDMs] = useState(new Set())
  const [selectedChannelAI, setSelectedChannelAI] = useState(false)
  const [channelAIMessages, setChannelAIMessages] = useState([])
  const [isChannelAILoading, setIsChannelAILoading] = useState(false)

  // Add ref for context menu
  const contextMenuRef = useRef(null)
  // Add ref for DM context menu
  const dmContextMenuRef = useRef(null)

  // Add state for search
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef(null)

  // Add useEffect to handle clicking outside context menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0, channelId: null })
      }
      if (dmContextMenuRef.current && !dmContextMenuRef.current.contains(event.target)) {
        setDmContextMenu({ show: false, x: 0, y: 0, userId: null })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Add useEffect for click outside search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Add useEffect to auto-focus input on channel selection
  useEffect(() => {
    console.log('Channel selection changed, attempting to focus input')
    if (inputRef.current) {
      // Simple focus with a small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus()
        console.log('Input focused')
      }, 10)
    }
  }, [selectedChannel, selectedDM, selectedChannelAI])

  // Add debounced search function
  const handleSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        // First, let's just search messages without joins
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .ilike('content', `%${term}%`)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        // If we get messages, then fetch profiles separately
        const processedResults = await Promise.all(
          data.map(async (message) => {
            // Get profile info
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', message.user_id)
              .single()

            // Get channel info if it exists
            let channelData = null
            if (message.channel_id) {
              const { data: channel } = await supabase
                .from('channels')
                .select('name')
                .eq('id', message.channel_id)
                .single()
              channelData = channel
            }

            return {
              ...message,
              profiles: profileData || { full_name: 'Anonymous' },
              channel_name: channelData?.name
            }
          })
        )

        setSearchResults(processedResults)
      } catch (error) {
        console.error('Error searching messages:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300),
    []
  )

  // Add search result click handler
  const handleSearchResultClick = (message) => {
    // If it's a channel message
    if (message.channel_id) {
      const channel = channels.find(c => c.id === message.channel_id)
      if (channel) {
        handleChannelSelect(channel)
      }
    }
    // If it's a DM
    else if (message.dm_user_id) {
      const dmUser = users.find(u => u.user_id === message.dm_user_id)
      if (dmUser) {
        handleDMSelect(dmUser)
      }
    }
    setShowSearchResults(false)
    setSearchTerm('')
  }

  // Add handler for channel context menu
  const handleChannelContextMenu = (e, channelId) => {
    e.preventDefault() // Prevent default context menu
    setContextMenu({
      show: true,
      x: e.pageX,
      y: e.pageY,
      channelId
    })
  }

  // Add handler for DM context menu
  const handleDMContextMenu = (e, userId) => {
    e.preventDefault() // Prevent default context menu
    setDmContextMenu({
      show: true,
      x: e.pageX,
      y: e.pageY,
      userId
    })
  }

  // Add ref for messages container
  const messagesEndRef = useRef(null)

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ block: "end" })
  }

  // Add useEffect to scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add useEffect for ChannelAI messages
  useEffect(() => {
    if (selectedChannelAI) {
      scrollToBottom()
    }
  }, [channelAIMessages, isChannelAILoading])

  // Function to handle cursor position changes
  const handleCursorChange = (e) => {
    setCursorPosition(e.target.selectionStart)
  }

  // Function to handle text input
  const handleTextInput = (e) => {
    const newText = e.target.value
    // Update the text segments with current formatting
    setTextSegments([{
      text: newText,
      isBold: isTextBold,
      isItalic: isTextItalic,
      isStrikethrough: isTextStrikethrough
    }])
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
      if (segment.isBold && text.trim()) {
        text = `**${text}**`
      }
      if (segment.isItalic && text.trim()) {
        text = `_${text}_`
      }
      if (segment.isStrikethrough && text.trim()) {
        text = `~~${text}~~`
      }
      return text
    }).join('')
  }

  // Modified message send handler
  async function handleSendMessage(e) {
    e.preventDefault()
    const messageContent = formatMessageContent(textSegments)
    if (!messageContent.trim() && !selectedFile) return
    if (!selectedChannel && !selectedDM) return

    try {
      let messageData = {
        content: messageContent,
        user_id: user.id,
        has_attachment: false
      }

      // If there's a file, upload it first
      if (selectedFile) {
        const fileData = await uploadFile(selectedFile)
        messageData = {
          ...messageData,
          has_attachment: true,
          attachment_url: fileData.url,
          attachment_name: fileData.name,
          attachment_type: fileData.type,
          attachment_size: fileData.size
        }
      }

      if (selectedChannel) {
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

        messageData.channel_id = selectedChannel.id
      } else {
        // For DMs, set the dm_user_id
        messageData.dm_user_id = selectedDM.user_id
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData])

      if (error) throw error
      
      // Clear input and file selection after successful send
      setTextSegments([{ text: '', isBold: false, isItalic: false, isStrikethrough: false }])
      setIsTextBold(false)
      setIsTextItalic(false)
      setIsTextStrikethrough(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
  const handleEmojiButtonClick = () => {
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

  useEffect(() => {
    if (!user) return; // Early return in useEffect if no user
    
    fetchUserProfile()
    fetchUsers()
    
    // Set up presence tracking
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
      retryIntervalMs: 5000,
      retryAttempts: 10
    })

    channel.on('error', (error) => {
      console.error('Supabase realtime error:', error)
    })

    // Handle presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState()
      const onlineUserIds = new Set(Object.keys(presenceState))
      setOnlineUsers(onlineUserIds)
    })

    // Track window visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        channel.untrack()
      } else {
        channel.track({ online_at: new Date().toISOString() })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Join the channel and start tracking
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() })
      }
    })

    return () => {
      channel.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
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
              full_name: user.email?.split('@')[0] || 'Anonymous',
              status_text: ''
            }
          ])
          .select()
          .single()

        if (createError) throw createError
        setUserProfile(newProfile)
        setStatusText(newProfile.status_text || '')
      } else {
        setUserProfile(data)
        setStatusText(data.status_text || '')
      }
    } catch (error) {
      console.error('Error fetching/creating user profile:', error)
    }
  }

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id) // Exclude current user
        .order('full_name')

      if (error) throw error
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    // Fetch channels
    fetchChannels()
  }, [])

  useEffect(() => {
    if (!selectedChannel && !selectedDM) return;

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, 
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            let shouldAddMessage = false;
            
            // For DMs, check if this is part of the current conversation
            if (selectedDM) {
              const isRelevantDM = (
                // Message from current user to selected user
                (payload.new.user_id === user.id && payload.new.dm_user_id === selectedDM.user_id) ||
                // Message from selected user to current user
                (payload.new.user_id === selectedDM.user_id && payload.new.dm_user_id === user.id)
              );
              
              if (isRelevantDM) {
                shouldAddMessage = true;
              } else if (payload.new.dm_user_id === user.id) {
                // If this is a DM to the current user but not from the currently selected conversation
                // Mark it as unread
                setUnreadDMs(prev => {
                  const newUnread = new Set(prev);
                  newUnread.add(payload.new.user_id);
                  return newUnread;
                });
              }
            } else if (payload.new.channel_id === selectedChannel.id) {
              // For channels, check if message is for current channel
              shouldAddMessage = true;
            } else if (payload.new.channel_id) {
              // Message is for a different channel, mark it as unread if not muted
              if (!mutedChannels.has(payload.new.channel_id)) {
                console.log('Marking channel as unread:', payload.new.channel_id);
                setUnreadChannels(prev => {
                  const newUnread = new Set(prev);
                  newUnread.add(payload.new.channel_id);
                  return newUnread;
                });
              }
            }

            if (shouldAddMessage) {
              try {
                // Don't add thread replies to the main message list
                if (payload.new.parent_id) return;

                // Fetch the user's profile
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('user_id', payload.new.user_id)
                  .single();

                if (profileError) {
                  console.error('Error fetching profile:', profileError);
                }

                // Create enriched message
                const enrichedMessage = {
                  ...payload.new,
                  profiles: userProfile || { 
                    full_name: 'Anonymous',
                    avatar_url: null
                  },
                  reactions: []
                };

                setMessages(currentMessages => [...currentMessages, enrichedMessage]);
              } catch (error) {
                console.error('Error processing new message:', error);
              }
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted messages from the current view
            if (selectedDM) {
              const isRelevantDM = (
                (payload.old.user_id === user.id && payload.old.dm_user_id === selectedDM.user_id) ||
                (payload.old.user_id === selectedDM.user_id && payload.old.dm_user_id === user.id)
              );
              if (!isRelevantDM) return;
            } else {
              if (payload.old.channel_id !== selectedChannel.id) return;
            }

              setMessages(currentMessages => 
                currentMessages.filter(message => message.id !== payload.old.id)
              );
          } else if (payload.eventType === 'UPDATE') {
            // Handle thread metadata updates
            if (selectedDM) {
              const isRelevantDM = (
                (payload.new.user_id === user.id && payload.new.dm_user_id === selectedDM.user_id) ||
                (payload.new.user_id === selectedDM.user_id && payload.new.dm_user_id === user.id)
              );
              if (!isRelevantDM) return;
            } else {
              if (payload.new.channel_id !== selectedChannel.id) return;
            }

            setMessages(currentMessages => 
              currentMessages.map(message => 
                message.id === payload.new.id 
                  ? { 
                      ...message, 
                      has_thread: payload.new.has_thread,
                      thread_participant_count: payload.new.thread_participant_count,
                      last_reply_at: payload.new.last_reply_at
                    }
                  : message
              )
            );
          }
        }
      )
      .subscribe()

    // Fetch existing messages when channel/DM changes
    fetchMessages();

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
  }, [selectedChannel, selectedDM])

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
    if (!selectedChannel && !selectedDM) return;

    try {
      if (selectedDM) {
        console.log('Fetching DM messages with:', selectedDM.full_name);
      } else {
        console.log('Fetching messages for channel:', selectedChannel.id);
      }

      // Build the query based on whether we're in a channel or DM
      let query = supabase
        .from('messages')
        .select(`
          *,
          reactions (
            id,
            emoji,
            user_id
          ),
          has_thread,
          thread_participant_count,
          last_reply_at
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (selectedDM) {
        // For DMs, we want messages where:
        // (user_id = current_user AND dm_user_id = selected_user) OR
        // (user_id = selected_user AND dm_user_id = current_user)
        query = query.or(`and(user_id.eq.${user.id},dm_user_id.eq.${selectedDM.user_id}),and(user_id.eq.${selectedDM.user_id},dm_user_id.eq.${user.id})`)
      } else {
        // For channels, just filter by channel_id
        query = query.eq('channel_id', selectedChannel.id)
      }

      const { data: messagesData, error: messagesError } = await query;

      if (messagesError) {
        console.error('Error details:', messagesError);
        throw messagesError;
      }

      // Get unique user IDs from messages
      const userIds = [...new Set(messagesData.map(message => message.user_id))];

      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of user profiles for faster lookup
      const profileMap = new Map(profilesData.map(profile => [profile.user_id, profile]));

      // Combine the data
      const processedData = messagesData.map(message => {
        const userProfile = profileMap.get(message.user_id);
        
        const groupedReactions = (message.reactions || []).reduce((acc, reaction) => {
          acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
          return acc;
        }, {});

        return {
          ...message,
          profiles: userProfile || { 
            full_name: 'Anonymous',
            avatar_url: null 
          },
          reactions: Object.entries(groupedReactions).map(([emoji, count]) => ({
            emoji,
            count
          }))
        };
      });

      console.log('Processed messages:', processedData);
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
    event.preventDefault();
    setShowReactionPicker(messageId);
    setPickerPosition(event.clientY > window.innerHeight / 2 ? 'top' : 'bottom');
  }

  // Function to handle reaction select
  const handleReactionSelect = async (messageId, emoji) => {
    try {
      // Check if reaction already exists
      const { data: existingReaction, error: fetchError } = await supabase
        .from('reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji.emoji)
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
              emoji: emoji.emoji
            }
          ])

        if (error) throw error
      }

      // Refresh messages to get updated reactions
      if (selectedChannel) {
        fetchMessages()
      } else if (selectedDM) {
        fetchDirectMessages()
      }
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
    if (showThreadSidebar && selectedMessage?.id === message.id) {
      // If clicking the same message's thread text while sidebar is open, close it
      setShowThreadSidebar(false);
      return;
    }
    setSelectedMessage(message);
    setThreadMessages([]); // Clear thread messages before loading new ones
    setShowThreadSidebar(true);
  }

  // Add handler for sending thread messages
  const handleSendThreadMessage = async (e) => {
    e.preventDefault()
    if (!selectedMessage) return

    try {
      // First, send the thread reply
      const messageData = {
        content: formatMessageContent(threadTextSegments),
        user_id: user.id,
        parent_id: selectedMessage.id
      }

      // Add either channel_id or dm_user_id based on context
      if (selectedChannel) {
        messageData.channel_id = selectedChannel.id
      } else if (selectedDM) {
        messageData.dm_user_id = selectedDM.user_id
      }

      const { data: replyData, error: replyError } = await supabase
        .from('messages')
        .insert([messageData])
        .select()  // Just select all fields without trying to join profiles yet

      if (replyError) throw replyError

      // Then fetch the profile data separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single()

      // Combine message and profile data
      const enrichedReplyData = {
        ...replyData[0],
        profiles: profileData
      }

      // Then, update the parent message's thread metadata
      const { data: threadReplies } = await supabase
        .from('messages')
        .select('id')
        .eq('parent_id', selectedMessage.id)

      const replyCount = threadReplies ? threadReplies.length : 0;

      const { error: updateError } = await supabase
        .from('messages')
        .update({
          has_thread: true,
          thread_participant_count: replyCount,  // Now using actual reply count
          last_reply_at: new Date().toISOString()
        })
        .eq('id', selectedMessage.id)

      if (updateError) throw updateError

      setThreadMessages([...threadMessages, enrichedReplyData])
      // Reset thread input
      setThreadTextSegments([{ text: '', isBold: false, isItalic: false, isStrikethrough: false }])
      setIsThreadTextBold(false)
      setIsThreadTextItalic(false)
      setIsThreadTextStrikethrough(false)
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
      // First, fetch the messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('parent_id', selectedMessage.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Then fetch the profiles for these messages
      const userIds = [...new Set(messagesData.map(message => message.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles for faster lookup
      const profileMap = new Map(profilesData.map(profile => [profile.user_id, profile]));

      // Combine messages with their profile data
      const enrichedMessages = messagesData.map(message => ({
        ...message,
        profiles: profileMap.get(message.user_id) || {
          full_name: 'Anonymous',
          avatar_url: null
        }
      }));

      setThreadMessages(enrichedMessages);
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    }
  };

  // Thread-specific handlers
  const handleThreadTextInput = (e) => {
    const newText = e.target.value
    setThreadTextSegments([{
      text: newText,
      isBold: isThreadTextBold,
      isItalic: isThreadTextItalic,
      isStrikethrough: isThreadTextStrikethrough
    }])
  }

  const getThreadCombinedText = () => {
    return threadTextSegments.map(segment => segment.text).join('')
  }

  const handleThreadBoldClick = () => {
    setIsThreadTextBold(!isThreadTextBold)
    setThreadTextSegments(prev => {
      const newSegments = [...prev]
      if (newSegments[newSegments.length - 1].text === '') {
        newSegments[newSegments.length - 1].isBold = !isThreadTextBold
        newSegments[newSegments.length - 1].isItalic = isThreadTextItalic
      } else {
        newSegments.push({ 
          text: '', 
          isBold: !isThreadTextBold,
          isItalic: isThreadTextItalic
        })
      }
      return newSegments
    })
    threadInputRef.current?.focus()
  }

  const handleThreadItalicClick = () => {
    setIsThreadTextItalic(!isThreadTextItalic)
    setThreadTextSegments(prev => {
      const newSegments = [...prev]
      if (newSegments[newSegments.length - 1].text === '') {
        newSegments[newSegments.length - 1].isItalic = !isThreadTextItalic
        newSegments[newSegments.length - 1].isBold = isThreadTextBold
      } else {
        newSegments.push({ 
          text: '', 
          isItalic: !isThreadTextItalic,
          isBold: isThreadTextBold
        })
      }
      return newSegments
    })
    threadInputRef.current?.focus()
  }

  const handleThreadStrikethroughClick = () => {
    setIsThreadTextStrikethrough(!isThreadTextStrikethrough)
    setThreadTextSegments(prev => {
      const newSegments = [...prev]
      if (newSegments[newSegments.length - 1].text === '') {
        newSegments[newSegments.length - 1].isStrikethrough = !isThreadTextStrikethrough
      } else {
        newSegments.push({ 
          text: '', 
          isStrikethrough: !isThreadTextStrikethrough,
          isBold: isThreadTextBold,
          isItalic: isThreadTextItalic
        })
      }
      return newSegments
    })
    threadInputRef.current?.focus()
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
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setUserProfile(prev => ({ ...prev, full_name: editedName }))
      setIsEditingName(false)
      
      // Refresh messages to show updated name
      fetchMessages()
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
    }
  }

  // Add function to mark channel as read
  const markChannelAsRead = (channelId) => {
    setUnreadChannels(prev => {
      const newUnread = new Set(prev)
      newUnread.delete(channelId)
      return newUnread
    })
  }

  // Update the channel selection handler
  const handleChannelSelect = async (channel) => {
    setSelectedChannel(channel)
    setSelectedDM(null)
    setSelectedChannelAI(false)
    setMessages([]) // Clear messages when switching channels
    // Mark the channel as read when selected
    markChannelAsRead(channel.id)
  }

  // Add handler for DM selection
  const handleDMSelect = async (dmUser) => {
    // Ensure the user profile has the correct user_id for self-DMs
    const selectedUser = dmUser.user_id === user.id ? { ...dmUser, user_id: user.id } : dmUser
    setSelectedDM(selectedUser)
    setSelectedChannel(null)
    setSelectedChannelAI(false)
    setMessages([]) // Clear messages for now
    markDMAsRead(selectedUser.user_id) // Mark DM as read when selected
  }

  // Add handler for creating a new channel
  const handleCreateChannel = async () => {
    try {
      setIsCreatingChannel(true)
      const { data, error } = await supabase
        .from('channels')
        .insert([
          {
            name: newChannelName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('*')
        .single()

      if (error) throw error

      // Add the new channel to the channels list
      setChannels(prev => [...prev, data])
      // Select the new channel
      setSelectedChannel(data)
      // Close the modal and reset the input
      setShowCreateChannel(false)
      setNewChannelName('')
    } catch (error) {
      console.error('Error creating channel:', error)
    } finally {
      setIsCreatingChannel(false)
    }
  }

  // Add handler for muting channels
  const handleMuteChannel = (channelId) => {
    setMutedChannels(prev => {
      const newMuted = new Set(prev)
      if (newMuted.has(channelId)) {
        newMuted.delete(channelId)
      } else {
        newMuted.add(channelId)
      }
      return newMuted
    })
    setContextMenu({ show: false, x: 0, y: 0, channelId: null })
  }

  // Add handler for leaving a channel
  const handleLeaveChannel = (channelId) => {
    setChannels(prev => prev.filter(channel => channel.id !== channelId));
    if (selectedChannel?.id === channelId) {
      setSelectedChannel(null);
      setMessages([]);
    }
    setContextMenu({ show: false, x: 0, y: 0, channelId: null });
  }

  // Add function to mark DM as read
  const markDMAsRead = (userId) => {
    setUnreadDMs(prev => {
      const newUnread = new Set(prev)
      newUnread.delete(userId)
      return newUnread
    })
  }

  // Add handler for removing DMs from list
  const handleRemoveDM = (userId) => {
    setHiddenDMs(prev => {
      const newHidden = new Set(prev)
      newHidden.add(userId)
      return newHidden
    })
    // If the removed DM was selected, clear the selection
    if (selectedDM?.user_id === userId) {
      setSelectedDM(null)
      setMessages([])
    }
    // Close the context menu
    setDmContextMenu({ show: false, x: 0, y: 0, userId: null })
  }

  // Function to update status in database
  const updateStatus = async (status) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status_text: status })
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Add handler for file removal
  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Reset the file input
    }
  }

  // Helper function to upload file to Supabase Storage
  const uploadFile = async (file) => {
    try {
      // Create a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload file to Supabase
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  // Function to fetch AI response from the API
  const fetchAIResponse = async (prompt) => {
    try {
      const response = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      throw error;
    }
  }

  const [aiMessages, setAiMessages] = useState([])
  const aiChatInputRef = useRef(null)
  const [isAILoading, setIsAILoading] = useState(false)

  // Handler for sending messages in ChannelAI
  const handleChannelAIMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message with profile information
    const userMessage = {
      content: messageText,
      timestamp: new Date().toLocaleTimeString(),
      isAI: false,
      profiles: userProfile // Include the user's profile information
    };
    setChannelAIMessages(prev => [...prev, userMessage]);

    try {
      setIsChannelAILoading(true);
      // Clear input
      setTextSegments([{ text: '', isBold: false, isItalic: false, isStrikethrough: false }]);
      
      // Get AI response
      const { response } = await fetchAIResponse(messageText);
      
      // Add AI message
      const aiMessage = {
        content: response.blocks ? (
          <div>
            {response.blocks.map((block, index) => {
              if (block.type === 'section') {
                return <div key={index}>{block.text.text}</div>
              }
              if (block.type === 'file') {
                return (
                  <div key={index} className="mt-2">
                    <a 
                      href={block.external_id}
                      download={block.title}
                      className="text-blue-600 hover:underline flex items-center cursor-pointer"
                    >
                      <Icons.File className="w-4 h-4 mr-1" />
                      {block.title}
                      <Icons.Download className="w-3 h-3 ml-2 text-gray-500" />
                    </a>
                  </div>
                )
              }
              return null
            })}
          </div>
        ) : response,
        timestamp: new Date().toLocaleTimeString(),
        isAI: true,
        profiles: {
          full_name: 'ChannelAI',
          avatar_url: null
        }
      };
      setChannelAIMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Add error message to chat
      const errorMessage = {
        content: "Sorry, I couldn't process your message. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
        isAI: true,
        isError: true,
        profiles: {
          full_name: 'ChannelAI',
          avatar_url: null
        }
      };
      setChannelAIMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChannelAILoading(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    // Add the emoji reaction to the message
    console.log('Selected emoji:', emoji);
    setShowReactionPicker(null);
  }

  // Move the Auth check here, after all hooks are declared
  if (!user) {
    return <Auth />
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div 
        className={`bg-sidebar-gradient text-white flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-60' : 'w-0'
        }`}
      >
        {/* Workspace Header */}
        <div className={`p-3 flex items-center justify-between border-b border-gray-700 ${
          !isSidebarOpen && 'opacity-0'
        }`}>
          <h1 className="font-['Dancing_Script'] text-2xl tracking-wide">ChatAI</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ≡
          </button>
        </div>

        {/* Channels Section */}
        <div className={`flex-1 overflow-y-auto ${!isSidebarOpen && 'opacity-0'}`}>
          <ChannelsList
            channels={channels}
            selectedChannel={selectedChannel}
            unreadChannels={unreadChannels}
            mutedChannels={mutedChannels}
            handleChannelSelect={handleChannelSelect}
            handleChannelContextMenu={handleChannelContextMenu}
            setShowCreateChannel={setShowCreateChannel}
          />

          {/* AI Section */}
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-300">AI</h2>
            </div>
            <div>
              <button
                onClick={() => {
                  setSelectedChannelAI(true);
                  setSelectedChannel(null);
                  setSelectedDM(null);
                  setMessages([]);
                }}
                className={`w-full text-left px-2 py-1 rounded text-gray-300 ${
                  selectedChannelAI 
                    ? 'bg-purple-800 text-white' 
                    : 'hover:bg-purple-800 hover:text-white'
                } flex items-center space-x-2`}
              >
                <Icons.AI className="w-4 h-4" />
                <span>ChannelAI</span>
              </button>
            </div>
          </div>

          {/* Direct Messages Section */}
          <DirectMessagesList 
            users={users}
            selectedDM={selectedDM}
            userProfile={userProfile}
            user={user}
            onlineUsers={onlineUsers}
            unreadDMs={unreadDMs}
            hiddenDMs={hiddenDMs}
            statusText={statusText}
            handleDMSelect={handleDMSelect}
            handleDMContextMenu={handleDMContextMenu}
            setShowAddDM={setShowAddDM}
          />

          <AddDMModal
            showAddDM={showAddDM}
            setShowAddDM={setShowAddDM}
            users={users}
            setHiddenDMs={setHiddenDMs}
            handleDMSelect={handleDMSelect}
          />

          {/* Channel Context Menu */}
          {contextMenu.show && (
            <div
              ref={contextMenuRef}
              style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
                zIndex: 1000
              }}
              className="bg-white rounded-lg shadow-dropdown border border-gray-200 py-1 w-48"
            >
              <button 
                onClick={() => handleMuteChannel(contextMenu.channelId)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 flex items-center justify-between"
              >
                <span>{mutedChannels.has(contextMenu.channelId) ? 'Unmute channel' : 'Mute channel'}</span>
                {mutedChannels.has(contextMenu.channelId) && (
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => handleLeaveChannel(contextMenu.channelId)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
              >
                Leave channel
              </button>
            </div>
          )}

          {/* DM Context Menu */}
          {dmContextMenu.show && (
            <div
              ref={dmContextMenuRef}
              style={{
                position: 'fixed',
                top: dmContextMenu.y,
                left: dmContextMenu.x,
                zIndex: 1000
              }}
              className="bg-white rounded-lg shadow-dropdown border border-gray-200 py-1 w-48"
            >
              <button 
                onClick={() => handleRemoveDM(dmContextMenu.userId)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
              >
                Remove DM from list
              </button>
          </div>
          )}
        </div>

        <CreateChannelModal
          showCreateChannel={showCreateChannel}
          setShowCreateChannel={setShowCreateChannel}
          newChannelName={newChannelName}
          setNewChannelName={setNewChannelName}
          isCreatingChannel={isCreatingChannel}
          handleCreateChannel={handleCreateChannel}
        />
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white min-w-0 shadow-soft">
          {/* Search Bar */}
          <div className="bg-topbar-gradient px-4 py-2 flex items-center justify-between">
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
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchTerm(value)
                    handleSearch(value)
                    setShowSearchResults(true)
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search Workspace"
                  className="w-full bg-sidebar-hover/70 text-white placeholder-gray-300 rounded-md py-1.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
                />
                <div className="absolute left-3 top-2">
                  <Icons.Search />
                </div>
                <SearchResults
                  results={searchResults}
                  isLoading={isSearching}
                  visible={showSearchResults}
                  onResultClick={handleSearchResultClick}
                  searchTerm={searchTerm}
                />
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
                {selectedDM ? (
                  <div className="flex items-center space-x-2">
                    {selectedDM.avatar_url ? (
                      <img
                        src={selectedDM.avatar_url}
                        alt={selectedDM.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm">
                        {selectedDM.full_name[0].toUpperCase()}
                      </div>
                    )}
                    <h2 className="text-lg font-bold">{selectedDM.full_name}</h2>
                    <span className={`w-2 h-2 rounded-full ${
                      onlineUsers.has(selectedDM.user_id) ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    {!onlineUsers.has(selectedDM.user_id) && (
                      <button 
                        onClick={() => setShowAIChatSidebar(true)}
                        className="ml-2 hover:bg-gray-100 rounded p-1" 
                        title="Chat with AI Avatar"
                      >
                        <Icons.AI />
                      </button>
                    )}
                  </div>
                ) : selectedChannelAI ? (
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Icons.AI className="w-6 h-6" />
                      <h2 className="text-lg font-bold">ChannelAI</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 max-w-xl">
                      I'm an AI trained on all messages & files in the public channels. Ask me questions like: 
                      <br />
                      <span className="text-sm text-gray-500 mt-1 max-w-xl">
                        • <em>"Gather all resources shared the past week"</em> <br/>• <em>"Tell me about our company mission"</em>
                      </span>
                    </p>
                  </div>
                ) : (
                  <h2 className="text-lg font-bold">#{selectedChannel?.name}</h2>
                )}
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
                      {userProfile?.full_name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Profile Menu */}
                <ProfileMenu
                  showProfileMenu={showProfileMenu}
                  profileMenuRef={profileMenuRef}
                  userProfile={userProfile}
                  user={user}
                  statusText={statusText}
                  isEditingStatus={isEditingStatus}
                  setIsEditingStatus={setIsEditingStatus}
                  setStatusText={setStatusText}
                  updateStatus={updateStatus}
                  signOut={signOut}
                  handleProfileButtonClick={handleProfileButtonClick}
                />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            {selectedChannelAI ? (
              <div className="p-4 space-y-4">
                {channelAIMessages.map((message, index) => (
                  <div key={index} className="flex items-start space-x-3 group relative hover:bg-gray-50 p-2 rounded-lg message-container">
                    {message.profiles?.avatar_url ? (
                      <img
                        src={message.profiles.avatar_url}
                        alt={message.profiles.full_name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-full ${message.isAI ? 'bg-gray-300' : 'bg-purple-700'} flex items-center justify-center text-white flex-shrink-0`}>
                        {message.isAI ? 'AI' : message.profiles?.full_name?.[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold">
                          {message.profiles?.full_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp}
                        </span>
                      </div>
                      <div className="text-gray-900 mt-1">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isChannelAILoading && (
                  <div className="flex items-start space-x-3 group relative hover:bg-gray-50 p-2 rounded-lg message-container">
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white flex-shrink-0">
                      <Icons.AI className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold">ChannelAI</span>
                      </div>
                      <div className="mt-1 text-gray-500">Thinking...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <MessageList
                messages={messages}
                selectedMessage={selectedMessage}
                setSelectedMessage={setSelectedMessage}
                setShowThreadSidebar={setShowThreadSidebar}
                showReactionPicker={showReactionPicker}
                setShowReactionPicker={setShowReactionPicker}
                handleEmojiSelect={handleEmojiSelect}
                messagesEndRef={messagesEndRef}
                handleReactionButtonClick={handleReactionButtonClick}
                handleThreadClick={handleThreadClick}
                pickerPosition={pickerPosition}
                handleReactionSelect={handleReactionSelect}
                emojiPickerRef={emojiPickerRef}
              />
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <MessageInput
              inputRef={inputRef}
              fileInputRef={fileInputRef}
              selectedFile={selectedFile}
              handleRemoveFile={handleRemoveFile}
              handleFileSelect={handleFileSelect}
              isTextBold={isTextBold}
              isTextItalic={isTextItalic}
              isTextStrikethrough={isTextStrikethrough}
              handleBoldClick={() => setIsTextBold(!isTextBold)}
              handleItalicClick={() => setIsTextItalic(!isTextItalic)}
              handleStrikethroughClick={() => setIsTextStrikethrough(!isTextStrikethrough)}
              handleTextInput={handleTextInput}
              getCombinedText={getCombinedText}
              handleUtilityClick={handleUtilityClick}
              handleEmojiButtonClick={handleEmojiButtonClick}
              showEmojiPicker={showEmojiPicker}
              onEmojiClick={onEmojiClick}
              onSendMessage={(e) => {
                e.preventDefault();
                const messageText = getCombinedText();
                if (selectedChannelAI) {
                  handleChannelAIMessage(messageText);
                } else {
                  handleSendMessage(e);
                }
              }}
              placeholder={selectedChannelAI ? "Message ChannelAI..." : selectedDM ? `Message ${selectedDM.full_name}` : `Message #${selectedChannel?.name}`}
            />
          </div>
        </div>

        {/* Thread Sidebar - Now outside the main content container */}
        <ThreadSidebar
          showThreadSidebar={showThreadSidebar}
          selectedMessage={selectedMessage}
          threadMessages={threadMessages}
          setShowThreadSidebar={setShowThreadSidebar}
          handleSendThreadMessage={handleSendThreadMessage}
          isTextBold={isThreadTextBold}
          isTextItalic={isThreadTextItalic}
          isTextStrikethrough={isThreadTextStrikethrough}
          handleTextInput={handleThreadTextInput}
          getCombinedText={getThreadCombinedText}
          handleUtilityClick={handleUtilityClick}
          handleEmojiButtonClick={handleEmojiButtonClick}
          showEmojiPicker={showEmojiPicker}
          onEmojiClick={onEmojiClick}
          inputRef={threadInputRef}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          handleBoldClick={handleThreadBoldClick}
          handleItalicClick={handleThreadItalicClick}
          handleStrikethroughClick={handleThreadStrikethroughClick}
        />

        {/* AI Chat Sidebar */}
        <AIChatSidebar
          showAIChatSidebar={showAIChatSidebar}
          selectedDM={selectedDM}
          aiMessages={aiMessages}
          setShowAIChatSidebar={setShowAIChatSidebar}
          isLoading={isAILoading}
          handleSendAIMessage={async (e) => {
            e.preventDefault();
            const messageText = getThreadCombinedText();
            if (!messageText.trim()) return;

            // Add user message
            const userMessage = {
              content: messageText,
              timestamp: new Date().toLocaleTimeString(),
              isAI: false
            };
            setAiMessages(prev => [...prev, userMessage]);

            try {
              setIsAILoading(true);
              // Clear input before awaiting response
              setThreadTextSegments([{ text: '', isBold: false, isItalic: false, isStrikethrough: false }]);
              
              // Get AI response
              const { response } = await fetchAIResponse(messageText);
              
              // Add AI message
              const aiMessage = {
                content: response.blocks ? (
                  <div>
                    {response.blocks.map((block, index) => {
                      if (block.type === 'section') {
                        return <div key={index}>{block.text.text}</div>
                      }
                      if (block.type === 'file') {
                        return (
                          <div key={index} className="mt-2">
                            <a 
                              href={block.external_id}
                              download={block.title}
                              className="text-blue-600 hover:underline flex items-center cursor-pointer"
                            >
                              <Icons.File className="w-4 h-4 mr-1" />
                              {block.title}
                              <Icons.Download className="w-3 h-3 ml-2 text-gray-500" />
                            </a>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                ) : response,
                timestamp: new Date().toLocaleTimeString(),
                isAI: true
              };
              setAiMessages(prev => [...prev, aiMessage]);
            } catch (error) {
              // Add error message to chat
              const errorMessage = {
                content: "Sorry, I couldn't process your message. Please try again.",
                timestamp: new Date().toLocaleTimeString(),
                isAI: true,
                isError: true
              };
              setAiMessages(prev => [...prev, errorMessage]);
            } finally {
              setIsAILoading(false);
            }
          }}
          isTextBold={isTextBold}
          isTextItalic={isTextItalic}
          isTextStrikethrough={isTextStrikethrough}
          handleTextInput={handleThreadTextInput}
          getCombinedText={getThreadCombinedText}
          handleUtilityClick={handleUtilityClick}
          handleEmojiButtonClick={handleEmojiButtonClick}
          showEmojiPicker={showEmojiPicker}
          onEmojiClick={onEmojiClick}
          inputRef={aiChatInputRef}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          handleBoldClick={handleThreadBoldClick}
          handleItalicClick={handleThreadItalicClick}
          handleStrikethroughClick={handleThreadStrikethroughClick}
        />
      </div>

      {/* Profile Sidebar */}
      <ProfileSidebar
        showProfileSidebar={showProfileSidebar}
        setShowProfileSidebar={setShowProfileSidebar}
        userProfile={userProfile}
        user={user}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        editedName={editedName}
        setEditedName={setEditedName}
        handleNameEdit={handleNameEdit}
        handleNameKeyPress={handleNameKeyPress}
        nameInputRef={nameInputRef}
      />
    </div>
  )
}

export default App
