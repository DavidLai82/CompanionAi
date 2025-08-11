import { useEffect, useState } from 'react'
// Removed direct chat UI imports; chat is accessed via Navigation
import AuthComponent from './components/AuthComponent'
import LandingPage from './components/LandingPage'
import Navigation from './components/Navigation'
import PersonalityAssessment from './components/PersonalityAssessment'
import { supabase, getCurrentUser, getProfile, createProfile } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './lib/supabase'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  // const [isChatOpen, setIsChatOpen] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  // const [useWhatsAppStyle, setUseWhatsAppStyle] = useState(true)
  const [showPersonalityAssessment, setShowPersonalityAssessment] = useState(false)

  useEffect(() => {
    // Check if environment variables are configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://your-project-ref.supabase.co' || 
        supabaseKey === 'your-supabase-anon-key') {
      // Environment not configured, show landing page
      setLoading(false)
      return
    }

    // Environment is configured, try to connect to Supabase
    setLoading(true)
    getCurrentUser().then((user) => {
      setUser(user)
      if (user) {
        loadProfile(user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Error connecting to Supabase:', error)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          setLoading(true)
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await getProfile(userId)
      
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await createProfile(userId, {
          preferred_nickname: 'king'
        })
        
        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          setProfile(newProfile)
          // Do not block with personality assessment; user can navigate to Profile tab
        }
      } else if (error) {
        console.error('Error loading profile:', error)
      } else {
        setProfile(data)
        // Do not block with personality assessment; user can navigate to Profile tab
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPersonalityAssessment = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('personality_assessments')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (!error && (!data || data.length === 0)) {
        setShowPersonalityAssessment(true)
      }
    } catch (error) {
      console.error('Error checking personality assessment:', error)
    }
  }

  const handlePersonalityComplete = (_results: any) => {
    setShowPersonalityAssessment(false)
    // Refresh profile data if needed
    if (user) {
      loadProfile(user.id)
    }
  }

  // Show landing page for first-time visitors immediately
  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />
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

  if (!user) {
    return <AuthComponent />
  }

  // Personality assessment is optional and accessible later; do not block navigation
  // Use new navigation system if user has completed setup
  if (user && profile) {
    return <Navigation user={user} profile={profile} />
  }

  // If user is authenticated but profile isn't ready yet, show a spinner
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-romantic-500 border-t-transparent mb-4"></div>
          <p className="text-romantic-700 text-lg font-medium">Preparing your experience...</p>
        </div>
      </div>
    )
  }

  // Fallback: nothing to render
  return null
}

export default App
