import React from 'react'
import type { Message } from '../lib/supabase'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={`px-4 py-3 ${
            isOwn 
              ? 'chat-bubble-user ml-auto' 
              : 'chat-bubble-irene mr-auto'
          } text-white font-medium relative group`}
        >
          {/* Heart particles for Irene's messages */}
          {!isOwn && message.emotion && message.emotion !== 'normal' && (
            <div className="absolute -top-2 -right-2 text-sm animate-bounce">
              {message.emotion === 'blush' && '😊'}
              {message.emotion === 'wink' && '😉'}
              {message.emotion === 'laugh' && '😄'}
              {message.emotion === 'smile' && '😊'}
            </div>
          )}
          
          {message.content}
          
          {/* Timestamp */}
          <div className={`message-timestamp ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>

        {/* Voice note indicator */}
        {message.voice_note_url && (
          <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <svg className="w-4 h-4 text-romantic-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-xs text-romantic-500">Voice message</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble