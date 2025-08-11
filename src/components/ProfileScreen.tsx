import React, { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { 
  Camera, 
  Edit, 
  Settings, 
  Heart, 
  MessageCircle, 
  User as UserIcon,
  MapPin,
  Calendar,
  Shield,
  Star,
  Trophy,
  LogOut,
  Plus
} from 'lucide-react'

interface ProfileScreenProps {
  user: User
  profile: Profile
}

interface UserPhoto {
  id: string
  photo_url: string
  is_primary: boolean
  upload_order: number
}

interface UserInterest {
  id: string
  interest_category: string
  interest_name: string
  interest_level: number
}

interface ProfileStats {
  matches_count: number
  messages_sent: number
  profile_views: number
  likes_received: number
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, profile }) => {
  const [photos, setPhotos] = useState<UserPhoto[]>([])
  const [interests, setInterests] = useState<UserInterest[]>([])
  const [stats, setStats] = useState<ProfileStats>({
    matches_count: 0,
    messages_sent: 0,
    profile_views: 0,
    likes_received: 0
  })
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')

  useEffect(() => {
    loadProfileData()
  }, [user.id])

  const loadProfileData = async () => {
    try {
      // Load user photos
      const { data: photosData } = await supabase
        .from('user_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_order')

      // Load user interests  
      const { data: interestsData } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', user.id)

      // Load profile stats
      const { data: matchesCount } = await supabase
        .from('matches')
        .select('id', { count: 'exact' })
        .eq('match_status', 'matched')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

      const { data: messagesCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('sender', 'user')

      setPhotos(photosData || [])
      setInterests(interestsData || [])
      setStats({
        matches_count: matchesCount?.length || 0,
        messages_sent: messagesCount?.length || 0,
        profile_views: Math.floor(Math.random() * 100) + 10, // Mock data
        likes_received: Math.floor(Math.random() * 50) + 5   // Mock data
      })
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const handleSaveField = async (field: string) => {
    if (!tempValue.trim()) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: tempValue })
        .eq('id', user.id)

      if (error) throw error
      
      // Update local profile state would require props update from parent
      setEditingField(null)
      setTempValue('')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const addPhoto = () => {
    // Mock photo addition - in real app would open photo picker
    console.log('Add photo clicked')
  }

  const addInterest = () => {
    // Mock interest addition - in real app would open interest selector
    console.log('Add interest clicked')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-romantic-500 border-t-transparent mb-4"></div>
          <p className="text-romantic-700 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-romantic-gradient">
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-romantic-800">My Profile</h1>
            <div className="flex gap-2">
              <button className="p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors duration-200">
                <Settings className="w-5 h-5 text-romantic-600" />
              </button>
              <button 
                onClick={handleSignOut}
                className="p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 text-romantic-600" />
              </button>
            </div>
          </div>

          {/* Profile Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/90 rounded-xl p-4 text-center">
              <Heart className="w-6 h-6 text-pink-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-romantic-800">{stats.matches_count}</div>
              <div className="text-xs text-romantic-600">Matches</div>
            </div>
            
            <div className="bg-white/90 rounded-xl p-4 text-center">
              <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-romantic-800">{stats.messages_sent}</div>
              <div className="text-xs text-romantic-600">Messages</div>
            </div>
            
            <div className="bg-white/90 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-romantic-800">{stats.profile_views}</div>
              <div className="text-xs text-romantic-600">Profile Views</div>
            </div>
            
            <div className="bg-white/90 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-romantic-800">{stats.likes_received}</div>
              <div className="text-xs text-romantic-600">Likes Received</div>
            </div>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Profile Header */}
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-romantic-400 to-purple-romantic-500"></div>
              
              {/* Profile Picture */}
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-romantic-400 to-purple-romantic-500 overflow-hidden">
                  {photos.find(p => p.is_primary) ? (
                    <img
                      src={photos.find(p => p.is_primary)!.photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                      <UserIcon />
                    </div>
                  )}
                  <button 
                    onClick={addPhoto}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-romantic-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-romantic-600 transition-colors duration-200"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 p-6 space-y-4">
              {/* Name */}
              <div className="flex items-center justify-between">
                {editingField === 'full_name' ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="flex-1 px-3 py-1 border border-romantic-300 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleSaveField('full_name')}
                      className="px-3 py-1 bg-romantic-500 text-white rounded-lg text-sm"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-romantic-800">
                      {profile.full_name || 'Add your name'}
                    </h2>
                    <button
                      onClick={() => handleEditField('full_name', profile.full_name || '')}
                      className="p-1 hover:bg-romantic-100 rounded"
                    >
                      <Edit className="w-4 h-4 text-romantic-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Age and Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-romantic-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {profile.age ? `${profile.age} years old` : 'Add your age'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-romantic-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {profile.location || 'Add your location'}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="font-semibold text-romantic-800 mb-2">About Me</h3>
                {editingField === 'bio' ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full px-3 py-2 border border-romantic-300 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent resize-none h-24"
                      placeholder="Tell people about yourself..."
                    />
                    <button
                      onClick={() => handleSaveField('bio')}
                      className="px-4 py-2 bg-romantic-500 text-white rounded-lg text-sm"
                    >
                      Save Bio
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleEditField('bio', profile.bio || '')}
                    className="p-3 bg-romantic-50 rounded-lg cursor-pointer hover:bg-romantic-100 transition-colors duration-200 min-h-[60px] flex items-center"
                  >
                    <p className="text-romantic-700 text-sm">
                      {profile.bio || 'Tap to add your bio...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-romantic-800">My Photos</h3>
              <button
                onClick={addPhoto}
                className="flex items-center gap-1 px-3 py-1 bg-romantic-100 text-romantic-700 rounded-full text-sm hover:bg-romantic-200 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {photos.slice(0, 6).map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={photo.photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {photo.is_primary && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-romantic-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {photos.length < 6 && (
                <button
                  onClick={addPhoto}
                  className="aspect-square border-2 border-dashed border-romantic-300 rounded-lg flex items-center justify-center text-romantic-500 hover:border-romantic-400 hover:text-romantic-600 transition-colors duration-200"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Interests Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-romantic-800">My Interests</h3>
              <button
                onClick={addInterest}
                className="flex items-center gap-1 px-3 py-1 bg-romantic-100 text-romantic-700 rounded-full text-sm hover:bg-romantic-200 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest.id}
                    className="px-3 py-1 bg-romantic-100 text-romantic-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {interest.interest_name}
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ml-0.5 ${
                            i < interest.interest_level ? 'bg-romantic-500' : 'bg-romantic-200'
                          }`}
                        />
                      ))}
                    </div>
                  </span>
                ))}
              </div>
            ) : (
              <div
                onClick={addInterest}
                className="p-4 bg-romantic-50 rounded-lg cursor-pointer hover:bg-romantic-100 transition-colors duration-200 text-center"
              >
                <p className="text-romantic-600 text-sm">Tap to add your interests...</p>
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                profile.verification_status === 'verified' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                <Shield className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-romantic-800">Account Verification</h3>
                <p className="text-sm text-romantic-600">
                  {profile.verification_status === 'verified' 
                    ? 'Your account is verified' 
                    : 'Verify your account for more matches'}
                </p>
              </div>
              
              {profile.verification_status !== 'verified' && (
                <button className="px-4 py-2 bg-romantic-500 text-white rounded-full text-sm font-medium hover:bg-romantic-600 transition-colors duration-200">
                  Verify
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileScreen