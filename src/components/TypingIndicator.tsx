import React from 'react'

const TypingIndicator: React.FC = () => {
  return (
    <div className="chat-bubble-irene px-4 py-3 mr-auto max-w-20">
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  )
}

export default TypingIndicator