import React, { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { Heart, MessageCircle, Clock, Sparkles, User as UserIcon } from 'lucide-react'

interface MatchesScreenProps {
  user: User
}

interface Match extends Profile {
  compatibility_score?: number
  matched_at?: string
  photos?: Array<{ photo_url: string, is_primary: boolean }>
  ai_match_reason?: string
  last_message?: {
    content: string
    timestamp: string
    sender: string
  }
}

const MatchesScreen: React.FC<MatchesScreenProps> = ({ user }) => {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  useEffect(() => {
    loadMatches()
  }, [user.id])

  const loadMatches = async () => {
    try {
      // Get mutual matches where both users liked each other
      const { data: matchData, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1_profile:profiles!matches_user1_id_fkey(
            *,
            user_photos(photo_url, is_primary)
          ),
          user2_profile:profiles!matches_user2_id_fkey(
            *,
            user_photos(photo_url, is_primary)
          )
        `)
        .eq('match_status', 'matched')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('matched_at', { ascending: false })

      if (error) throw error

      // Process matches to get the other user's profile
      const processedMatches = (matchData || []).map((match: any) => {
        const isUser1 = match.user1_id === user.id
        const otherUserProfile = isUser1 ? match.user2_profile : match.user1_profile
        
        return {
          ...otherUserProfile,
          compatibility_score: match.compatibility_score,
          matched_at: match.matched_at,
          ai_match_reason: match.ai_match_reason,
          photos: otherUserProfile.user_photos
        }
      })

      setMatches(processedMatches)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMatchTime = (timestamp: string) => {
    const now = new Date()
    const matchTime = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - matchTime.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-romantic-500 border-t-transparent mb-4"></div>
          <p className="text-romantic-700 text-lg font-medium">Loading your matches...</p>
        </div>
      </div>
    )
  }

  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-romantic-gradient">
        {/* Match Details */}
        <div className="px-4 py-6">
          <button
            onClick={() => setSelectedMatch(null)}
            className="mb-4 flex items-center text-romantic-600 hover:text-romantic-800"
          >
            ← Back to matches
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Hero Section */}
            <div className="relative h-64 bg-gradient-to-br from-romantic-400 to-purple-romantic-500">
              {selectedMatch.photos?.[0] ? (
                <img
                  src={selectedMatch.photos[0].photo_url}
                  alt={selectedMatch.full_name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                  <UserIcon />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-2xl font-bold">
                  {selectedMatch.full_name || 'Anonymous'}
                  {selectedMatch.age && `, ${selectedMatch.age}`}
                </h2>
                {selectedMatch.location && (
                  <p className="text-white/80 flex items-center gap-1">
                    📍 {selectedMatch.location}
                  </p>
                )}
              </div>

              {selectedMatch.compatibility_score && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-romantic-800">
                      {Math.round(selectedMatch.compatibility_score)}% match
                    </span>
                    <Heart className="w-4 h-4 text-romantic-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Match Info */}
            <div className="p-6 space-y-6">
              {/* Match celebration */}
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-semibold text-romantic-800 mb-2">
                  It's a Match!
                </h3>
                {selectedMatch.matched_at && (
                  <p className="text-romantic-600 text-sm">
                    Matched {formatMatchTime(selectedMatch.matched_at)}
                  </p>
                )}
              </div>

              {/* AI Match Reason */}
              {selectedMatch.ai_match_reason && (
                <div className="bg-romantic-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-romantic-500" />
                    <span className="font-semibold text-romantic-800">Why you matched</span>
                  </div>
                  <p className="text-romantic-700 text-sm">{selectedMatch.ai_match_reason}</p>
                </div>
              )}

              {/* Bio */}
              {selectedMatch.bio && (
                <div>
                  <h4 className="font-semibold text-romantic-800 mb-2">About</h4>
                  <p className="text-romantic-700">{selectedMatch.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-romantic-500 to-purple-romantic-500 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200">
                  <MessageCircle className="w-5 h-5" />
                  Send Message
                </button>
                <button className="px-6 py-3 border border-romantic-300 text-romantic-600 rounded-full hover:bg-romantic-50 transition-colors duration-200">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-romantic-gradient px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-romantic-800 mb-2">Your Matches</h1>
          <p className="text-romantic-600">
            {matches.length} {matches.length === 1 ? 'person likes' : 'people like'} you back
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-romantic-800 mb-2">
              No matches yet
            </h3>
            <p className="text-romantic-600 mb-6">
              Keep swiping! Your perfect match is waiting for you.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-romantic-500 to-purple-romantic-500 text-white rounded-full font-semibold hover:scale-105 transition-all duration-200">
              Start Discovering
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div
                key={match.id || index}
                onClick={() => setSelectedMatch(match)}
                className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Profile Photo */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-romantic-400 to-purple-romantic-500 flex-shrink-0">
                    {match.photos?.[0] ? (
                      <img
                        src={match.photos[0].photo_url}
                        alt={match.full_name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl">
                        <UserIcon />
                      </div>
                    )}
                  </div>

                  {/* Match Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-romantic-800 truncate">
                        {match.full_name || 'Anonymous'}
                        {match.age && `, ${match.age}`}
                      </h3>
                      {match.compatibility_score && (
                        <span className="text-xs bg-romantic-100 text-romantic-700 px-2 py-1 rounded-full flex-shrink-0">
                          {Math.round(match.compatibility_score)}%
                        </span>
                      )}
                    </div>
                    
                    {match.location && (
                      <p className="text-sm text-romantic-600 mb-1">📍 {match.location}</p>
                    )}
                    
                    {match.matched_at && (
                      <div className="flex items-center gap-1 text-xs text-romantic-500">
                        <Clock className="w-3 h-3" />
                        <span>Matched {formatMatchTime(match.matched_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Indicator */}
                  <div className="text-romantic-400">
                    <Heart className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchesScreen