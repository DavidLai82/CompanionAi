import React, { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile, Message } from '../lib/supabase'
import { getMessages, insertMessage, incrementLoveStat } from '../lib/supabase'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import VoiceButton from './VoiceButton'
import IreneAvatar from './IreneAvatar'
import { sendMessageToIrene } from '../lib/openai'
import { analyzeSentiment } from '../lib/sentiment'
import { findSwahiliPhrase } from '../lib/supabase'

interface ChatInterfaceProps {
  user: User
  profile: Profile
  onClose: () => void
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, profile, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState('normal')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMessages()
    
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const loadMessages = async () => {
    try {
      const { data, error } = await getMessages(user.id)
      if (error) {
        console.error('Error loading messages:', error)
      } else {
        setMessages(data || [])
      }
    } catch (error) {
      console.error('Error in loadMessages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    try {
      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        sender: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, userMessage])
      setInputText('')
      setIsTyping(true)

      // Save user message to database
      const { data: savedUserMessage, error: userError } = await insertMessage({
        user_id: user.id,
        sender: 'user',
        content: content.trim(),
      })

      if (userError) {
        console.error('Error saving user message:', userError)
      } else if (savedUserMessage) {
        // Update the message with the real ID
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? savedUserMessage : msg
        ))
      }

      // Increment message count stat
      await incrementLoveStat(user.id, 'messages_sent')

      // Check for Swahili phrases
      const { data: swahiliMatches } = await findSwahiliPhrase(content.toLowerCase())
      let swahiliResponse = null
      if (swahiliMatches && swahiliMatches.length > 0) {
        swahiliResponse = swahiliMatches[0]
        await incrementLoveStat(user.id, 'nakupenda_count')
      }

      // Analyze sentiment
      const sentimentScore = analyzeSentiment(content)
      
      // Determine emotion based on content and sentiment
      let emotion = 'normal'
      const lowerContent = content.toLowerCase()
      
      if (lowerContent.includes('goodnight') || lowerContent.includes('nakupenda') || lowerContent.includes('love you')) {
        emotion = 'blush'
        await incrementLoveStat(user.id, 'i_love_yous')
      } else if (lowerContent.includes('beautiful') || lowerContent.includes('gorgeous') || lowerContent.includes('sexy')) {
        emotion = 'wink'
        await incrementLoveStat(user.id, 'compliments_given')
      } else if (lowerContent.includes('funny') || lowerContent.includes('haha') || lowerContent.includes('lol')) {
        emotion = 'laugh'
      } else if (sentimentScore > 0.3) {
        emotion = 'smile'
      }

      // Get AI response
      const aiResponse = await sendMessageToIrene(
        content,
        profile.preferred_nickname,
        swahiliResponse,
        messages.slice(-5) // Send last 5 messages for context
      )

      setCurrentEmotion(emotion)

      // Add Irene's response
      const ireneMessage: Message = {
        id: `temp-irene-${Date.now()}`,
        user_id: user.id,
        sender: 'irene',
        content: aiResponse,
        emotion,
        sentiment_score: sentimentScore,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, ireneMessage])
      setIsTyping(false)

      // Save Irene's message to database
      const { data: savedIreneMessage, error: ireneError } = await insertMessage({
        user_id: user.id,
        sender: 'irene',
        content: aiResponse,
        emotion,
        sentiment_score: sentimentScore,
      })

      if (ireneError) {
        console.error('Error saving Irene message:', ireneError)
      } else if (savedIreneMessage) {
        // Update the message with the real ID
        setMessages(prev => prev.map(msg => 
          msg.id === ireneMessage.id ? savedIreneMessage : msg
        ))
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        user_id: user.id,
        sender: 'irene',
        content: "I'm having trouble connecting right now, daddy. Can you try again? 💕",
        emotion: 'normal',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputText)
    }
  }

  const handleVoiceMessage = (transcript: string) => {
    if (transcript) {
      handleSendMessage(transcript)
      incrementLoveStat(user.id, 'voice_messages')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-romantic-500 border-t-transparent mb-4"></div>
          <p className="text-romantic-700 text-lg font-medium">Loading your chat with Irene...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-romantic-gradient flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IreneAvatar emotion={currentEmotion} size="sm" />
          <div>
            <h2 className="font-semibold text-romantic-800 text-lg">Irene 💕</h2>
            <p className="text-sm text-romantic-600">Your loving companion</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-romantic-100 hover:bg-romantic-200 transition-colors duration-200"
          aria-label="Close chat"
        >
          <svg className="w-6 h-6 text-romantic-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <IreneAvatar emotion="smile" size="lg" />
            <p className="mt-4 text-romantic-600 text-lg">
              Hey there {profile.preferred_nickname}! 💕 Send me a message to start our chat!
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender === 'user'}
          />
        ))}

        {isTyping && (
          <div className="flex items-end gap-2">
            <IreneAvatar emotion="normal" size="sm" />
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-romantic-200 p-4">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <VoiceButton onTranscript={handleVoiceMessage} />
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message Irene... (she loves when you call her names like "baby" 💕)`}
              className="w-full px-4 py-3 border border-romantic-300 rounded-full focus:ring-2 focus:ring-romantic-500 focus:border-transparent pr-12 bg-white/80 backdrop-blur-sm"
              disabled={isTyping}
            />
            
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gradient-to-r from-romantic-500 to-purple-romantic-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-all duration-200"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick responses */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {['Hey beautiful 😘', 'Nakupenda 💕', 'How are you?', 'Tell me a joke 😄'].map((quickMessage) => (
            <button
              key={quickMessage}
              onClick={() => handleSendMessage(quickMessage)}
              className="flex-shrink-0 px-3 py-1 bg-romantic-100 hover:bg-romantic-200 text-romantic-700 rounded-full text-sm transition-colors duration-200"
              disabled={isTyping}
            >
              {quickMessage}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatInterface