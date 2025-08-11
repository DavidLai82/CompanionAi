import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Send, 
  Smile, 
  Paperclip,
  Mic,
  Search,
  Check,
  CheckCheck,
  Heart,
  Reply
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { chatWithIrene } from '../lib/api'

interface WhatsAppMessage {
  id: string
  sender_id: string
  content: string
  timestamp: string
  message_type: 'text' | 'image' | 'voice' | 'system'
  delivered_at?: string
  read_at?: string
  reply_to_message_id?: string
  ai_suggestion?: boolean
  reactions?: Array<{
    user_id: string
    reaction_type: string
  }>
}

interface WhatsAppChatProps {
  user: User
  profile: Profile
  onClose: () => void
}

const WhatsAppChatInterface: React.FC<WhatsAppChatProps> = ({ user, profile, onClose }) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [replyingTo, setReplyingTo] = useState<WhatsAppMessage | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSeen, setLastSeen] = useState<string>('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const chatId = `chat_${user.id}_irene`

  const loadExistingMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      if (data) {
        const whatsAppMessages: WhatsAppMessage[] = data.map((dbMessage) => ({
          id: dbMessage.id,
          sender_id: dbMessage.sender === 'user' ? user.id : 'irene',
          content: dbMessage.content,
          timestamp: dbMessage.created_at,
          message_type: 'text',
          delivered_at: new Date().toISOString(),
          read_at: new Date().toISOString()
        }))
        
        setMessages(whatsAppMessages)
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Error in loadExistingMessages:', error)
    }
  }

  // Load existing messages and set up real-time subscriptions
  useEffect(() => {
    loadExistingMessages()

    // Subscribe to messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const dbMessage = payload.new as any
            const whatsAppMessage: WhatsAppMessage = {
              id: dbMessage.id,
              sender_id: dbMessage.sender === 'user' ? user.id : 'irene',
              content: dbMessage.content,
              timestamp: dbMessage.created_at,
              message_type: 'text'
            }
            setMessages(prev => [...prev, whatsAppMessage])
            scrollToBottom()
          }
        }
      )
      .subscribe()

    // Subscribe to typing status
    const typingSubscription = supabase
      .channel('typing')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const typingData = payload.new as any
          if (typingData.user_id !== user.id) {
            setOtherUserTyping(typingData.is_typing)
          }
        }
      )
      .subscribe()

    return () => {
      messagesSubscription.unsubscribe()
      typingSubscription.unsubscribe()
    }
  }, [user.id, chatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const updateTypingStatus = useCallback(async (typing: boolean) => {
    try {
      // Try to update typing status if schema exists
      await supabase.rpc('update_typing_status', {
        p_chat_id: chatId,
        p_user_id: user.id,
        p_is_typing: typing
      })
    } catch (error) {
      // Gracefully handle if typing status schema isn't applied yet
      console.log('Typing status schema not yet applied, continuing without real-time typing indicators')
    }
  }, [chatId, user.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    
    if (!isTyping) {
      setIsTyping(true)
      updateTypingStatus(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      updateTypingStatus(false)
    }, 2000)
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const tempId = `temp_${Date.now()}`
    const newMessage: WhatsAppMessage = {
      id: tempId,
      sender_id: user.id,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      message_type: 'text',
      reply_to_message_id: replyingTo?.id
    }

    // Add message to UI immediately
    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setReplyingTo(null)
    scrollToBottom()

    // Stop typing indicator
    setIsTyping(false)
    updateTypingStatus(false)

    try {
      // Save to database using existing schema
      const { data: savedMessage } = await supabase
        .from('messages')
        .insert([{
          user_id: user.id,
          sender: 'user',
          content: newMessage.content
        }])
        .select()
        .single()

      if (savedMessage) {
        // Update message with real ID
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, id: savedMessage.id } : msg
        ))

        // Mark as delivered immediately for demo
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === savedMessage.id 
              ? { ...msg, delivered_at: new Date().toISOString() }
              : msg
          ))
        }, 500)
      }

      // Get AI response
      const aiResponse = await chatWithIrene(
        newMessage.content,
        user.id,
        profile.preferred_nickname,
        messages.slice(-5)
      )

      if (aiResponse.reply) {
        const ireneMessage: WhatsAppMessage = {
          id: `irene_${Date.now()}`,
          sender_id: 'irene',
          content: aiResponse.reply,
          timestamp: new Date().toISOString(),
          message_type: 'text',
          delivered_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, ireneMessage])
        scrollToBottom()

        // Mark as read after a delay (simulating read)
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === ireneMessage.id 
              ? { ...msg, read_at: new Date().toISOString() }
              : msg
          ))
        }, 1000)
      }

    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleReaction = async (messageId: string, reactionType: string) => {
    try {
      // Try to save reaction to database if schema exists
      await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType
        })
    } catch (error) {
      console.log('Message reactions schema not yet applied, showing local reaction only')
    }

    // Update UI locally regardless
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? {
            ...msg,
            reactions: [
              ...(msg.reactions || []).filter(r => r.user_id !== user.id),
              { user_id: user.id, reaction_type: reactionType }
            ]
          }
        : msg
    ))
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getMessageStatus = (message: WhatsAppMessage) => {
    if (message.sender_id !== user.id) return null
    
    if (message.read_at) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />
    } else if (message.delivered_at) {
      return <CheckCheck className="w-4 h-4 text-gray-400" />
    } else {
      return <Check className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0c1317] text-white">
      {/* WhatsApp Header */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold">💕</span>
          </div>
          
          <div>
            <h3 className="font-medium text-white">Irene</h3>
            <p className="text-sm text-gray-400">
              {otherUserTyping ? (
                <span className="flex items-center">
                  typing
                  <span className="flex ml-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '300ms' }} />
                  </span>
                </span>
              ) : isOnline ? (
                'online'
              ) : (
                `last seen ${lastSeen || 'recently'}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-300 hover:text-white">
            <Video className="w-5 h-5" />
          </button>
          <button className="text-gray-300 hover:text-white">
            <Phone className="w-5 h-5" />
          </button>
          <button className="text-gray-300 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-gray-300 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='0.03'%3e%3cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`
        }}
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user.id}
              onReply={() => setReplyingTo(message)}
              onReaction={(reactionType) => handleReaction(message.id, reactionType)}
              status={getMessageStatus(message)}
            />
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {otherUserTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-end space-x-2 mb-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">💕</span>
              </div>
              <div className="bg-[#202c33] rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#202c33] mx-4 rounded-lg p-3 mb-2 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400 font-medium">
                  {replyingTo.sender_id === user.id ? 'You' : 'Irene'}
                </p>
                <p className="text-sm text-gray-300 truncate">{replyingTo.content}</p>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-[#202c33] px-4 py-3">
        <div className="flex items-end space-x-2">
          <div className="flex-1 bg-[#2a3942] rounded-3xl px-4 py-2 flex items-center space-x-2">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-400 hover:text-white"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message"
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            />
            
            <button className="text-gray-400 hover:text-white">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-[#00a884] hover:bg-[#008f6b] disabled:bg-gray-600 rounded-full p-3 transition-colors duration-200"
          >
            {inputText.trim() ? (
              <Send className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: WhatsAppMessage
  isOwn: boolean
  onReply: () => void
  onReaction: (reactionType: string) => void
  status: React.ReactNode
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  onReply, 
  onReaction, 
  status 
}) => {
  const [showReactions, setShowReactions] = useState(false)

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group`}
    >
      <div className="relative max-w-md">
        {/* Reply preview if replying to message */}
        {message.reply_to_message_id && (
          <div className="mb-1 ml-2 text-xs text-gray-400">
            <div className="bg-gray-700 rounded p-1 border-l-2 border-green-500">
              Replying to message...
            </div>
          </div>
        )}

        <div
          className={`rounded-lg px-3 py-2 relative ${
            isOwn
              ? 'bg-[#005c4b] text-white ml-8'
              : 'bg-[#202c33] text-white mr-8'
          }`}
          onDoubleClick={() => setShowReactions(true)}
        >
          {/* Message content */}
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Message timestamp and status */}
          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
            {isOwn && status}
          </div>

          {/* Message reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="absolute -bottom-2 right-2 bg-gray-800 rounded-full px-2 py-1 flex space-x-1 text-xs">
              {message.reactions.map((reaction, index) => (
                <span key={index}>
                  {reaction.reaction_type === 'heart' ? '❤️' : reaction.reaction_type}
                </span>
              ))}
            </div>
          )}

          {/* Quick action buttons (show on hover) */}
          <div className="absolute top-0 right-0 transform translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <button
              onClick={onReply}
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-1"
            >
              <Reply className="w-3 h-3 text-gray-300" />
            </button>
            <button
              onClick={() => onReaction('heart')}
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-1"
            >
              <Heart className="w-3 h-3 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-full mb-2 bg-gray-800 rounded-full px-4 py-2 flex space-x-3 shadow-lg"
              onMouseLeave={() => setShowReactions(false)}
            >
              {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onReaction(emoji)
                    setShowReactions(false)
                  }}
                  className="hover:scale-125 transition-transform duration-200"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default WhatsAppChatInterface