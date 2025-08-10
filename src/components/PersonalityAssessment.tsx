import React, { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface PersonalityAssessmentProps {
  user: User
  onComplete: (results: any) => void
}

const PersonalityAssessment: React.FC<PersonalityAssessmentProps> = ({ user, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const questions = [
    {
      id: 'extraversion_1',
      text: 'I am the life of the party',
      trait: 'extraversion'
    },
    {
      id: 'agreeableness_1', 
      text: 'I feel others\' emotions',
      trait: 'agreeableness'
    },
    {
      id: 'conscientiousness_1',
      text: 'I get chores done right away',
      trait: 'conscientiousness'
    },
    {
      id: 'neuroticism_1',
      text: 'I have frequent mood swings',
      trait: 'neuroticism'
    },
    {
      id: 'openness_1',
      text: 'I have a vivid imagination',
      trait: 'openness'
    },
    {
      id: 'extraversion_2',
      text: 'I start conversations with strangers',
      trait: 'extraversion'
    },
    {
      id: 'agreeableness_2',
      text: 'I am interested in people',
      trait: 'agreeableness'
    },
    {
      id: 'conscientiousness_2',
      text: 'I like order and routine',
      trait: 'conscientiousness'
    },
    {
      id: 'neuroticism_2',
      text: 'I get stressed out easily',
      trait: 'neuroticism'
    },
    {
      id: 'openness_2',
      text: 'I enjoy trying new things',
      trait: 'openness'
    }
  ]

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value })
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeAssessment({ ...answers, [questions[currentQuestion].id]: value })
    }
  }

  const completeAssessment = async (finalAnswers: Record<string, number>) => {
    setLoading(true)
    
    try {
      // Calculate Big 5 scores
      const scores = {
        extraversion: (finalAnswers.extraversion_1 + finalAnswers.extraversion_2) / 2,
        agreeableness: (finalAnswers.agreeableness_1 + finalAnswers.agreeableness_2) / 2,
        conscientiousness: (finalAnswers.conscientiousness_1 + finalAnswers.conscientiousness_2) / 2,
        neuroticism: (finalAnswers.neuroticism_1 + finalAnswers.neuroticism_2) / 2,
        openness: (finalAnswers.openness_1 + finalAnswers.openness_2) / 2
      }

      // Save to database
      const { error } = await supabase
        .from('personality_assessments')
        .insert([{
          user_id: user.id,
          assessment_type: 'big5',
          results: finalAnswers,
          scores: scores,
          ai_insights: generatePersonalityInsights(scores)
        }])

      if (error) throw error

      onComplete(scores)
    } catch (error) {
      console.error('Error saving assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePersonalityInsights = (scores: Record<string, number>) => {
    // Simple insights - in production, use Claude AI for deeper analysis
    const insights = []
    
    if (scores.extraversion > 3.5) {
      insights.push('You\'re naturally outgoing and energized by social interactions')
    }
    if (scores.agreeableness > 3.5) {
      insights.push('You have a caring, empathetic nature')
    }
    if (scores.conscientiousness > 3.5) {
      insights.push('You\'re organized and goal-oriented')
    }
    if (scores.openness > 3.5) {
      insights.push('You\'re creative and open to new experiences')
    }
    
    return insights.join('. ') + '.'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-romantic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-romantic-500 border-t-transparent mb-4"></div>
          <p className="text-romantic-700 text-lg font-medium">Analyzing your personality...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-romantic-gradient px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-romantic-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-romantic-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-romantic-500 to-purple-romantic-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-romantic-800 mb-2 text-center">
            Personality Assessment
          </h2>
          
          <p className="text-romantic-600 text-center mb-8">
            Help us understand you better to find your perfect matches
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-romantic-800 mb-6 text-center">
              "{questions[currentQuestion].text}"
            </h3>

            <p className="text-sm text-romantic-600 text-center mb-6">
              How much do you agree with this statement?
            </p>

            {/* Rating buttons */}
            <div className="space-y-3">
              {[
                { value: 1, label: 'Strongly Disagree' },
                { value: 2, label: 'Disagree' },
                { value: 3, label: 'Neutral' },
                { value: 4, label: 'Agree' },
                { value: 5, label: 'Strongly Agree' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 text-left bg-romantic-50 hover:bg-romantic-100 rounded-lg transition-colors duration-200 border-2 border-transparent hover:border-romantic-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-romantic-800">{option.label}</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < option.value ? 'bg-romantic-500' : 'bg-romantic-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            onClick={() => onComplete(null)}
            className="text-romantic-500 hover:text-romantic-600 text-sm"
          >
            Skip assessment for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default PersonalityAssessment