import React, { useState } from 'react'
import { Heart, MessageCircle, Search, User, Settings } from 'lucide-react'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { Profile } from '../lib/supabase'
import ChatInterface from './ChatInterface'
import WhatsAppChatInterface from './WhatsAppChatInterface'
import DiscoveryFeed from './DiscoveryFeed'
import MatchesScreen from './MatchesScreen'
import ProfileScreen from './ProfileScreen'

interface NavigationProps {
  user: AuthUser
  profile: Profile
}

type TabType = 'discover' | 'chats' | 'matches' | 'profile'

const Navigation: React.FC<NavigationProps> = ({ user, profile }) => {
  const [activeTab, setActiveTab] = useState<TabType>('discover')
  const [chatOpen, setChatOpen] = useState(false)
  const [useWhatsAppStyle, setUseWhatsAppStyle] = useState(true)

  const tabs = [
    {
      id: 'discover' as TabType,
      label: 'Discover',
      icon: Search,
      color: 'text-purple-500'
    },
    {
      id: 'chats' as TabType,
      label: 'Chats',
      icon: MessageCircle,
      color: 'text-blue-500'
    },
    {
      id: 'matches' as TabType,
      label: 'Matches',
      icon: Heart,
      color: 'text-pink-500'
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: User,
      color: 'text-green-500'
    }
  ]

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
    setChatOpen(false)
  }

  const handleMatchClick = (matchedUser: Profile) => {
    console.log('New match:', matchedUser)
    // Could show match celebration modal here
    setActiveTab('matches')
  }

  const renderTabContent = () => {
    if (chatOpen) {
      return useWhatsAppStyle ? (
        <WhatsAppChatInterface 
          user={user} 
          profile={profile}
          onClose={() => setChatOpen(false)}
        />
      ) : (
        <ChatInterface 
          user={user} 
          profile={profile}
          onClose={() => setChatOpen(false)}
        />
      )
    }

    switch (activeTab) {
      case 'discover':
        return <DiscoveryFeed user={user} onMatch={handleMatchClick} />
      case 'chats':
        return (
          <div className="min-h-screen bg-romantic-gradient flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-6">💬</div>
              <h2 className="text-2xl font-bold text-romantic-800 mb-4">
                Chat with Irene
              </h2>
              <p className="text-romantic-600 mb-6">
                Start a conversation with your AI companion or chat with your matches.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-romantic-500 to-purple-romantic-500 text-white rounded-full font-semibold hover:scale-105 transition-all duration-200"
                >
                  Chat with Irene 💕
                </button>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-romantic-600">Chat Style:</span>
                  <button
                    onClick={() => setUseWhatsAppStyle(false)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      !useWhatsAppStyle 
                        ? 'bg-romantic-500 text-white' 
                        : 'bg-romantic-200 text-romantic-700 hover:bg-romantic-300'
                    }`}
                  >
                    Classic
                  </button>
                  <button
                    onClick={() => setUseWhatsAppStyle(true)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      useWhatsAppStyle 
                        ? 'bg-romantic-500 text-white' 
                        : 'bg-romantic-200 text-romantic-700 hover:bg-romantic-300'
                    }`}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'matches':
        return <MatchesScreen user={user} />
      case 'profile':
        return <ProfileScreen user={user} profile={profile} />
      default:
        return <DiscoveryFeed user={user} onMatch={handleMatchClick} />
    }
  }

  return (
    <div className="min-h-screen bg-romantic-gradient">
      {/* Main Content */}
      <div className="pb-20">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-romantic-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-romantic-100' 
                    : 'hover:bg-romantic-50'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 ${
                    isActive ? tab.color : 'text-gray-500'
                  }`} 
                />
                <span className={`text-xs font-medium ${
                  isActive ? tab.color : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Navigation