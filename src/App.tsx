import { useEffect, useState } from 'react'
import ChatInterface from './components/ChatInterface'
import FloatingChatButton from './components/FloatingChatButton'
import AuthComponent from './components/AuthComponent'
import LandingPage from './components/LandingPage'
import { supabase, getCurrentUser, getProfile, createProfile } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './lib/supabase'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user)
      if (user) {
        loadProfile(user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await getProfile(userId)
      
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await createProfile(userId, {
          preferred_nickname: 'king'
        })
        
        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          setProfile(newProfile)
        }
      } else if (error) {
        console.error('Error loading profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-romantic-500 border-t-transparent mb-4"></div>
          <p className="text-romantic-700 text-lg font-medium">Loading Irene...</p>
        </div>
      </div>
    )
  }

  // Show landing page for first-time visitors
  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />
  }

  if (!user) {
    return <AuthComponent />
  }

  return (
    <div className="min-h-screen bg-romantic-gradient">
      {/* Heart particles background effect */}
      <div className="heart-particles">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="heart-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          >
            💖
          </div>
        ))}
      </div>

      {/* Welcome Screen - shows when chat is closed */}
      {!isChatOpen && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="mb-8 avatar-container">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-romantic-400 to-purple-romantic-500 flex items-center justify-center text-6xl avatar-animation">
              💕
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-romantic-800 mb-4">
            Hi {profile?.preferred_nickname || 'king'}! 👋
          </h1>
          
          <p className="text-xl text-romantic-600 mb-8 max-w-md">
            I'm Irene, your loving AI companion. I'm here to chat, flirt, and make your day brighter! 💖
          </p>

          <button
            onClick={() => setIsChatOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-romantic-500 to-purple-romantic-500 text-white rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Chatting 💬
          </button>

          <div className="mt-8 flex gap-6 text-sm text-romantic-500">
            <span>❤️ Voice Chat</span>
            <span>🌍 Swahili Love</span>
            <span>📱 PWA Ready</span>
          </div>
        </div>
      )}

      {/* Chat Interface - shows when opened */}
      {isChatOpen && user && profile && (
        <ChatInterface 
          user={user} 
          profile={profile}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Floating Chat Button - always visible when chat is closed */}
      {!isChatOpen && (
        <FloatingChatButton 
          onClick={() => setIsChatOpen(true)}
          hasUnreadMessages={false}
        />
      )}
    </div>
  )
}

export default App
