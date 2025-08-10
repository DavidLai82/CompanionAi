import React, { useEffect, useState } from 'react'

interface IreneAvatarProps {
  emotion: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const IreneAvatar: React.FC<IreneAvatarProps> = ({ 
  emotion, 
  size = 'md',
  className = ''
}) => {
  const [currentEmoji, setCurrentEmoji] = useState('💕')

  const sizeClasses = {
    sm: 'w-10 h-10 text-2xl',
    md: 'w-16 h-16 text-4xl', 
    lg: 'w-24 h-24 text-6xl'
  }

  const getEmoji = (emotion: string) => {
    switch (emotion) {
      case 'blush':
        return '😊'
      case 'wink':
        return '😉'
      case 'laugh':
        return '😄'
      case 'smile':
        return '😊'
      case 'kiss':
        return '😘'
      case 'love':
        return '🥰'
      default:
        return '💕'
    }
  }

  useEffect(() => {
    setCurrentEmoji(getEmoji(emotion))
  }, [emotion])

  return (
    <div className={`avatar-container ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]}
          rounded-full 
          bg-gradient-to-br from-romantic-400 to-purple-romantic-500 
          flex items-center justify-center 
          avatar-animation ${emotion}
          shadow-lg
          border-4 border-white/50
        `}
      >
        {currentEmoji}
      </div>
    </div>
  )
}

export default IreneAvatar