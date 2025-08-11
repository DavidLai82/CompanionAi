import React, { useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Camera, MapPin, Calendar, User as UserIcon, Heart, ArrowRight, ArrowLeft } from 'lucide-react'

interface ProfileCreationProps {
  user: User
  onComplete: (profile: any) => void
}

interface ProfileData {
  full_name: string
  age: number | null
  location: string
  bio: string
  gender: string
  seeking_gender: string
  photos: string[]
  interests: Array<{ name: string, level: number }>
}

const ProfileCreation: React.FC<ProfileCreationProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    age: null,
    location: '',
    bio: '',
    gender: '',
    seeking_gender: '',
    photos: [],
    interests: []
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalSteps = 5

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          age: profileData.age,
          location: profileData.location,
          bio: profileData.bio,
          gender: profileData.gender,
          seeking_gender: profileData.seeking_gender
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Save interests
      if (profileData.interests.length > 0) {
        const interests = profileData.interests.map(interest => ({
          user_id: user.id,
          interest_category: 'general',
          interest_name: interest.name,
          interest_level: interest.level
        }))

        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interests)

        if (interestsError) throw interestsError
      }

      // In a real app, you'd also upload photos here
      
      onComplete(profileData)
    } catch (error) {
      console.error('Error creating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData({ ...profileData, ...updates })
  }

  const handlePhotoUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload to storage here
      console.log('Photos selected:', files)
    }
  }

  const toggleInterest = (interestName: string) => {
    const existing = profileData.interests.find(i => i.name === interestName)
    if (existing) {
      updateProfileData({
        interests: profileData.interests.filter(i => i.name !== interestName)
      })
    } else {
      updateProfileData({
        interests: [...profileData.interests, { name: interestName, level: 3 }]
      })
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profileData.full_name.trim().length > 0 && profileData.age && profileData.age >= 18
      case 2:
        return profileData.location.trim().length > 0 && profileData.gender && profileData.seeking_gender
      case 3:
        return profileData.bio.trim().length > 10
      case 4:
        return true // Photos are optional
      case 5:
        return profileData.interests.length >= 3
      default:
        return false
    }
  }

  const popularInterests = [
    'Travel', 'Photography', 'Music', 'Movies', 'Fitness', 'Cooking',
    'Reading', 'Art', 'Dancing', 'Gaming', 'Sports', 'Nature',
    'Technology', 'Food', 'Fashion', 'Yoga', 'Hiking', 'Coffee'
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-romantic-400 to-purple-romantic-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-romantic-800 mb-2">Tell us about yourself</h2>
              <p className="text-romantic-600">Let's start with the basics</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  What's your name?
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => updateProfileData({ full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-romantic-300 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  How old are you?
                </label>
                <input
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) => updateProfileData({ age: parseInt(e.target.value) || null })}
                  placeholder="Enter your age"
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 border border-romantic-300 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-romantic-400 to-purple-romantic-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-romantic-800 mb-2">Where are you?</h2>
              <p className="text-romantic-600">Help us find people near you</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  Your location
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => updateProfileData({ location: e.target.value })}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 border border-romantic-300 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  I am
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Woman', 'Man', 'Non-binary'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => updateProfileData({ gender })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        profileData.gender === gender
                          ? 'border-romantic-500 bg-romantic-50 text-romantic-700'
                          : 'border-romantic-200 text-romantic-600 hover:border-romantic-300'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-romantic-700 mb-2">
                  Looking for
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Women', 'Men', 'Everyone'].map((seeking) => (
                    <button
                      key={seeking}
                      onClick={() => updateProfileData({ seeking_gender: seeking })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        profileData.seeking_gender === seeking
                          ? 'border-romantic-500 bg-romantic-50 text-romantic-700'
                          : 'border-romantic-200 text-romantic-600 hover:border-romantic-300'
                      }`}
                    >
                      {seeking}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-romantic-400 to-purple-romantic-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-romantic-800 mb-2">About you</h2>
              <p className="text-romantic-600">Share what makes you unique</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Write your bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => updateProfileData({ bio: e.target.value })}
                placeholder="Tell people about yourself, your interests, what you're looking for..."
                className="w-full px-4 py-3 border border-romantic-300 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent resize-none h-32"
                maxLength={500}
              />
              <div className="text-right text-sm text-romantic-500 mt-1">
                {profileData.bio.length}/500
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-romantic-400 to-purple-romantic-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-romantic-800 mb-2">Add photos</h2>
              <p className="text-romantic-600">Show your best self</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square border-2 border-dashed border-romantic-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-romantic-400 transition-colors duration-200"
                  onClick={handlePhotoUpload}
                >
                  <div className="text-center text-romantic-500">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-xs">Add Photo</span>
                  </div>
                </div>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <p className="text-center text-sm text-romantic-500">
              You can skip this step and add photos later
            </p>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-romantic-400 to-purple-romantic-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-romantic-800 mb-2">Your interests</h2>
              <p className="text-romantic-600">Select at least 3 things you love</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {popularInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    profileData.interests.some(i => i.name === interest)
                      ? 'border-romantic-500 bg-romantic-500 text-white'
                      : 'border-romantic-200 text-romantic-600 hover:border-romantic-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="text-center text-sm text-romantic-500">
              Selected: {profileData.interests.length}/∞
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-romantic-gradient px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-romantic-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-romantic-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-romantic-500 to-purple-romantic-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 border border-romantic-300 text-romantic-600 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-romantic-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-romantic-500 to-purple-romantic-500 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              'Creating...'
            ) : currentStep === totalSteps ? (
              'Complete Profile'
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Skip option */}
        <div className="text-center mt-4">
          <button
            onClick={() => onComplete(null)}
            className="text-romantic-500 hover:text-romantic-600 text-sm"
          >
            Skip profile setup for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileCreation