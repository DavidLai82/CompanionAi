import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PersonalityScores {
  extraversion: number
  agreeableness: number
  conscientiousness: number
  neuroticism: number
  openness: number
}

interface CompatibilityFactors {
  personality: number
  interests: number
  geography: number
  demographics: number
  activity: number
}

interface User {
  id: string
  age?: number
  location?: string
  gender?: string
  seeking_gender?: string
  last_active?: string
  personality_scores?: PersonalityScores
  interests: Array<{ interest_name: string, interest_level: number }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, maxResults = 20, includeExplanation = true } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get user profile with personality and interests
    const { data: currentUser, error: userError } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        personality_assessments(scores),
        user_interests(interest_name, interest_level)
      `)
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get potential matches (exclude self and already matched/passed users)
    const { data: excludedUsers } = await supabaseClient
      .from('matches')
      .select('user2_id')
      .eq('user1_id', userId)

    const excludedIds = [userId, ...(excludedUsers?.map(u => u.user2_id) || [])]

    const { data: potentialMatches, error: matchesError } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        personality_assessments(scores),
        user_interests(interest_name, interest_level)
      `)
      .not('id', 'in', `(${excludedIds.join(',')})`)
      .eq('is_online', true)
      .limit(100) // Get more than we need for better sorting

    if (matchesError) throw matchesError

    // Calculate compatibility scores
    const scoredMatches = potentialMatches.map(match => {
      const compatibility = calculateAdvancedCompatibility(currentUser, match)
      return {
        ...match,
        compatibility_score: compatibility.total,
        compatibility_breakdown: compatibility.breakdown,
        explanation: includeExplanation ? generateMatchExplanation(currentUser, match, compatibility) : null
      }
    })

    // Sort by compatibility and apply diversity bonus
    const rankedMatches = applyDiversityBonus(scoredMatches, currentUser)
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, maxResults)

    return new Response(
      JSON.stringify({ matches: rankedMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function calculateAdvancedCompatibility(user1: User, user2: User): { total: number, breakdown: CompatibilityFactors } {
  const factors: CompatibilityFactors = {
    personality: 0,
    interests: 0,
    geography: 0,
    demographics: 0,
    activity: 0
  }

  // 1. Personality Compatibility (40% weight)
  if (user1.personality_scores && user2.personality_scores) {
    factors.personality = calculatePersonalityCompatibility(user1.personality_scores, user2.personality_scores) * 40
  } else {
    factors.personality = 20 // Default moderate score
  }

  // 2. Interest Overlap (25% weight)
  factors.interests = calculateInterestCompatibility(user1.interests, user2.interests) * 25

  // 3. Geographic Proximity (20% weight)
  factors.geography = calculateGeographicCompatibility(user1.location, user2.location) * 20

  // 4. Demographic Compatibility (10% weight)
  factors.demographics = calculateDemographicCompatibility(user1, user2) * 10

  // 5. Activity Level (5% weight)
  factors.activity = calculateActivityCompatibility(user1.last_active, user2.last_active) * 5

  const total = Object.values(factors).reduce((sum, score) => sum + score, 0)

  return { total: Math.min(total, 100), breakdown: factors }
}

function calculatePersonalityCompatibility(scores1: PersonalityScores, scores2: PersonalityScores): number {
  // Advanced personality matching based on psychological research
  const weights = {
    extraversion: 0.2,    // Opposites can attract
    agreeableness: 0.3,   // High importance for relationship harmony
    conscientiousness: 0.2, // Moderate importance
    neuroticism: 0.15,    // Lower neuroticism difference is better
    openness: 0.15        // Similar openness levels work well
  }

  let compatibilityScore = 0

  // Extraversion: slight preference for complementary levels
  const extraversionDiff = Math.abs(scores1.extraversion - scores2.extraversion)
  compatibilityScore += weights.extraversion * (1 - Math.min(extraversionDiff / 2, 1))

  // Agreeableness: high mutual agreeableness is important
  const avgAgreeableness = (scores1.agreeableness + scores2.agreeableness) / 2
  compatibilityScore += weights.agreeableness * (avgAgreeableness / 5)

  // Conscientiousness: similar levels preferred
  const conscientiousnessDiff = Math.abs(scores1.conscientiousness - scores2.conscientiousness)
  compatibilityScore += weights.conscientiousness * (1 - conscientiousnessDiff / 5)

  // Neuroticism: lower combined neuroticism is better
  const avgNeuroticism = (scores1.neuroticism + scores2.neuroticism) / 2
  compatibilityScore += weights.neuroticism * (1 - avgNeuroticism / 5)

  // Openness: similar levels preferred
  const opennessDiff = Math.abs(scores1.openness - scores2.openness)
  compatibilityScore += weights.openness * (1 - opennessDiff / 5)

  return Math.max(0, Math.min(1, compatibilityScore))
}

function calculateInterestCompatibility(interests1: Array<{interest_name: string, interest_level: number}>, interests2: Array<{interest_name: string, interest_level: number}>): number {
  if (!interests1.length || !interests2.length) return 0.3 // Default moderate score

  const user1Interests = new Map(interests1.map(i => [i.interest_name, i.interest_level]))
  const user2Interests = new Map(interests2.map(i => [i.interest_name, i.interest_level]))

  let overlapScore = 0
  let totalPossibleOverlap = 0

  // Calculate weighted overlap
  for (const [interest, level1] of user1Interests) {
    const level2 = user2Interests.get(interest)
    totalPossibleOverlap += level1
    
    if (level2) {
      // Both users have this interest - calculate compatibility based on levels
      const levelCompatibility = 1 - Math.abs(level1 - level2) / 5
      overlapScore += Math.min(level1, level2) * levelCompatibility
    }
  }

  // Add bonus for total number of shared interests
  const sharedInterests = interests1.filter(i1 => 
    interests2.some(i2 => i2.interest_name === i1.interest_name)
  ).length

  const diversityBonus = Math.min(sharedInterests / Math.max(interests1.length, interests2.length), 0.5)

  return Math.min(1, (overlapScore / totalPossibleOverlap) + diversityBonus)
}

function calculateGeographicCompatibility(location1?: string, location2?: string): number {
  if (!location1 || !location2) return 0.5 // Default moderate score

  // Simple city/country matching - in production, use actual distance calculation
  const loc1Parts = location1.toLowerCase().split(',').map(s => s.trim())
  const loc2Parts = location2.toLowerCase().split(',').map(s => s.trim())

  // Same city
  if (loc1Parts[0] === loc2Parts[0]) return 1.0

  // Same country/region
  if (loc1Parts.length > 1 && loc2Parts.length > 1 && 
      loc1Parts[loc1Parts.length - 1] === loc2Parts[loc2Parts.length - 1]) {
    return 0.7
  }

  // Different locations
  return 0.3
}

function calculateDemographicCompatibility(user1: User, user2: User): number {
  let score = 0.5 // Base score

  // Age compatibility
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age)
    const ageCompatibility = Math.max(0, 1 - ageDiff / 20) // Penalty increases with age difference
    score = score * 0.5 + ageCompatibility * 0.5
  }

  // Gender preference matching
  if (user1.gender && user1.seeking_gender && user2.gender && user2.seeking_gender) {
    const user1SeeksUser2 = user1.seeking_gender === 'Everyone' || 
                           (user1.seeking_gender === 'Men' && user2.gender === 'Man') ||
                           (user1.seeking_gender === 'Women' && user2.gender === 'Woman')
    
    const user2SeeksUser1 = user2.seeking_gender === 'Everyone' || 
                           (user2.seeking_gender === 'Men' && user1.gender === 'Man') ||
                           (user2.seeking_gender === 'Women' && user1.gender === 'Woman')

    if (user1SeeksUser2 && user2SeeksUser1) {
      score = Math.min(1, score * 1.2) // Boost for mutual preference
    } else if (!user1SeeksUser2 || !user2SeeksUser1) {
      score = score * 0.1 // Major penalty for incompatible preferences
    }
  }

  return Math.max(0, Math.min(1, score))
}

function calculateActivityCompatibility(lastActive1?: string, lastActive2?: string): number {
  if (!lastActive1 || !lastActive2) return 0.5

  const now = new Date()
  const active1 = new Date(lastActive1)
  const active2 = new Date(lastActive2)

  const hours1 = (now.getTime() - active1.getTime()) / (1000 * 60 * 60)
  const hours2 = (now.getTime() - active2.getTime()) / (1000 * 60 * 60)

  // Both active recently
  if (hours1 < 24 && hours2 < 24) return 1.0
  if (hours1 < 72 && hours2 < 72) return 0.8
  if (hours1 < 168 && hours2 < 168) return 0.6 // Within a week

  return 0.3
}

function applyDiversityBonus(matches: any[], currentUser: User): any[] {
  // Apply small random bonus to prevent always showing same users first
  return matches.map(match => ({
    ...match,
    compatibility_score: match.compatibility_score + (Math.random() * 5)
  }))
}

function generateMatchExplanation(user1: User, user2: User, compatibility: { breakdown: CompatibilityFactors }): string {
  const explanations = []

  if (compatibility.breakdown.personality > 30) {
    explanations.push("You have complementary personalities that could create great chemistry")
  }

  if (compatibility.breakdown.interests > 20) {
    explanations.push("You share several interests and hobbies")
  }

  if (compatibility.breakdown.geography > 15) {
    explanations.push("You're in the same area, making it easy to meet up")
  }

  if (explanations.length === 0) {
    explanations.push("You might discover new things about each other")
  }

  return explanations.join('. ') + '.'
}