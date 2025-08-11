import React, { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/supabase'
import { supabase } from '../lib/supabase'

interface DiscoveryFeedProps {
  user: User
  onMatch: (matchedUser: Profile) => void
}

interface PotentialMatch extends Profile {
  compatibility_score?: number
  user_photos?: Array<{ photo_url: string, is_primary: boolean }>
  user_interests?: Array<{ interest_name: string, interest_category: string }>
  personality_insights?: string
}

const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({ user, onMatch }) => {
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPotentialMatches()
  }, [user.id])

  const loadPotentialMatches = async () => {
    try {
      // Get users not already matched/passed
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_photos!inner(photo_url, is_primary),
          user_interests(interest_name, interest_category),
          personality_assessments(ai_insights)
        `)
        .neq('id', user.id)
        .limit(20)

      if (error) throw error

      // Calculate compatibility scores and filter
      const matchesWithScores = await Promise.all(
        (profiles || []).map(async (profile) => {
          const compatibility = await calculateCompatibility(user.id, profile.id)
          return {
            ...profile,
            compatibility_score: compatibility,
            personality_insights: (profile as any).personality_assessments?.[0]?.ai_insights
          }
        })
      )

      // Sort by compatibility score
      matchesWithScores.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0))
      
      setPotentialMatches(matchesWithScores)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCompatibility = async (userId1: string, userId2: string) => {
    // Simple compatibility calculation - in production use the SQL function
    try {
      const { data, error } = await supabase
        .rpc('calculate_compatibility_score', {
          user1_id: userId1,
          user2_id: userId2
        })

      if (error) throw error
      return data || Math.random() * 100 // Fallback to random for demo
    } catch {
      return Math.random() * 100 // Fallback for demo
    }
  }

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (swiping || currentIndex >= potentialMatches.length) return
    
    setSwiping(true)
    const currentMatch = potentialMatches[currentIndex]

    try {
      // Record the swipe action
      const { error } = await supabase
        .from('matches')
        .upsert([{
          user1_id: user.id,
          user2_id: currentMatch.id,
          user1_action: direction,
          compatibility_score: currentMatch.compatibility_score || 0,
          match_status: direction === 'like' ? 'liked' : 'passed'
        }])
        .select()
        .single()

      if (error) throw error

      // Check if this creates a mutual match
      if (direction === 'like') {
        const { data: existingMatch } = await supabase
          .from('matches')
          .select()
          .eq('user1_id', currentMatch.id)
          .eq('user2_id', user.id)
          .eq('user1_action', 'like')
          .single()

        if (existingMatch) {
          // It's a match!
          await supabase
            .from('matches')
            .update({ match_status: 'matched', matched_at: new Date().toISOString() })
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${currentMatch.id}),and(user1_id.eq.${currentMatch.id},user2_id.eq.${user.id})`)

          onMatch(currentMatch)
        }
      }

      // Move to next profile
      setCurrentIndex(currentIndex + 1)

    } catch (error) {
      console.error('Error recording swipe:', error)
    } finally {
      setSwiping(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-romantic-500 border-t-transparent mb-4"></div>
          <p className="text-romantic-700 text-lg font-medium">Finding your matches...</p>
        </div>
      </div>
    )
  }

  if (currentIndex >= potentialMatches.length) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">💕</div>
          <h2 className="text-2xl font-bold text-romantic-800 mb-4">
            You've seen everyone for now!
          </h2>
          <p className="text-romantic-600 mb-6">
            Check back later for new potential matches, or expand your search preferences.
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0)
              loadPotentialMatches()
            }}
            className="px-6 py-3 bg-gradient-to-r from-romantic-500 to-purple-romantic-500 text-white rounded-full font-semibold hover:scale-105 transition-all duration-200"
          >
            Search Again
          </button>
        </div>
      </div>
    )
  }

  const currentMatch = potentialMatches[currentIndex]

  return (
    <div className="min-h-screen bg-romantic-gradient p-4">
      <div className="max-w-sm mx-auto pt-safe">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-romantic-800">Discover</h1>
          <div className="text-sm text-romantic-600">
            {potentialMatches.length - currentIndex} potential matches
          </div>
        </div>

        {/* Profile Card */}
        <div 
          ref={cardRef}
          className="relative w-full h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Main photo */}
          <div className="relative h-3/5 bg-gradient-to-br from-romantic-400 to-purple-romantic-500">
            {currentMatch.user_photos?.[0] ? (
              <img
                src={currentMatch.user_photos[0].photo_url}
                alt={currentMatch.full_name || 'Profile photo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                👤
              </div>
            )}
            
            {/* Compatibility badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-romantic-800">
                  {Math.round(currentMatch.compatibility_score || 0)}% match
                </span>
                <span className="text-romantic-500">💕</span>
              </div>
            </div>

            {/* Name and age */}
            <div className="absolute bottom-4 left-4">
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentMatch.full_name || 'Anonymous'} 
                {currentMatch.age && `, ${currentMatch.age}`}
              </h2>
              {currentMatch.location && (
                <p className="text-white/80 flex items-center gap-1">
                  📍 {currentMatch.location}
                </p>
              )}
            </div>
          </div>

          {/* Profile info */}
          <div className="h-2/5 p-6 overflow-y-auto">
            {currentMatch.bio && (
              <p className="text-romantic-700 mb-4">{currentMatch.bio}</p>
            )}

            {/* Interests */}
            {currentMatch.user_interests && currentMatch.user_interests.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-romantic-800 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {currentMatch.user_interests.slice(0, 6).map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-romantic-100 text-romantic-700 rounded-full text-sm"
                    >
                      {interest.interest_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI insights */}
            {currentMatch.personality_insights && (
              <div>
                <h3 className="text-sm font-semibold text-romantic-800 mb-2">Personality</h3>
                <p className="text-romantic-600 text-sm">{currentMatch.personality_insights}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={() => handleSwipe('pass')}
            disabled={swiping}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-all duration-200 disabled:opacity-50"
          >
            ❌
          </button>
          
          <button
            onClick={() => handleSwipe('like')}
            disabled={swiping}
            className="w-16 h-16 bg-gradient-to-r from-romantic-500 to-purple-romantic-500 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-all duration-200 disabled:opacity-50"
          >
            💕
          </button>
        </div>

        {/* Swipe hint */}
        <div className="text-center mt-4 text-romantic-600 text-sm">
          Tap ❌ to pass • Tap 💕 to like
        </div>
      </div>
    </div>
  )
}

export default DiscoveryFeed