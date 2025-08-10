import React from 'react'

interface FloatingChatButtonProps {
  onClick: () => void
  hasUnreadMessages?: boolean
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  onClick, 
  hasUnreadMessages = false 
}) => {
  return (
    <button
      onClick={onClick}
      className="floating-chat-btn w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl relative"
      aria-label="Open chat with Irene"
    >
      {/* Unread message indicator */}
      {hasUnreadMessages && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          !
        </div>
      )}
      
      {/* Heart icon with floating animation */}
      <div className="animate-heart-float">
        💕
      </div>
      
      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
    </button>
  )
}

export default FloatingChatButton