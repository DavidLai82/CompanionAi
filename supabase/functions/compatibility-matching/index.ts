import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MatchingRequest {
  userId: string
  limit?: number
  minCompatibility?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, limit = 20, minCompatibility = 60 }: MatchingRequest = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user's personality and interests
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        personality_assessments(*),
        user_interests(*)
      `)
      .eq('id', userId)
      .single()

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Get potential matches (users not already matched/passed)
    const { data: potentialMatches } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        personality_assessments(*),
        user_interests(*),
        user_photos(photo_url, is_primary)
      `)
      .neq('id', userId)
      .limit(limit * 2) // Get more to filter later

    if (!potentialMatches) {
      return new Response(
        JSON.stringify({ matches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate compatibility for each potential match
    const matchesWithScores = await Promise.all(
      potentialMatches.map(async (profile) => {
        const compatibility = await calculateAdvancedCompatibility(
          userProfile,
          profile,
          supabaseClient
        )
        
        return {
          ...profile,
          compatibility_score: compatibility.score,
          match_reasons: compatibility.reasons
        }
      })
    )

    // Filter and sort matches
    const filteredMatches = matchesWithScores
      .filter(match => match.compatibility_score >= minCompatibility)
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, limit)

    // Save potential matches to database for tracking
    for (const match of filteredMatches) {
      await supabaseClient
        .from('matches')
        .upsert({
          user1_id: userId,
          user2_id: match.id,
          compatibility_score: match.compatibility_score,
          match_status: 'pending',
          user1_action: 'pending',
          user2_action: 'pending',
          ai_match_reason: match.match_reasons.join('; ')
        })
    }

    return new Response(
      JSON.stringify({ matches: filteredMatches }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in compatibility-matching function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function calculateAdvancedCompatibility(user1: any, user2: any, supabase: any) {
  let score = 0
  const reasons = []

  // 1. Interest overlap (0-30 points)
  const user1Interests = user1.user_interests?.map((i: any) => i.interest_name) || []
  const user2Interests = user2.user_interests?.map((i: any) => i.interest_name) || []
  const commonInterests = user1Interests.filter((interest: string) => 
    user2Interests.includes(interest)
  )
  
  const interestScore = Math.min(commonInterests.length * 6, 30)
  score += interestScore
  
  if (commonInterests.length > 0) {
    reasons.push(`You both enjoy ${commonInterests.slice(0, 2).join(' and ')}`)
  }

  // 2. Personality compatibility (0-40 points)
  const user1Personality = user1.personality_assessments?.[0]?.scores
  const user2Personality = user2.personality_assessments?.[0]?.scores

  if (user1Personality && user2Personality) {
    const personalityScore = calculatePersonalityCompatibility(user1Personality, user2Personality)
    score += personalityScore.score
    reasons.push(...personalityScore.reasons)
  } else {
    score += 20 // Default score if personality data missing
  }

  // 3. Age compatibility (0-15 points)
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age)
    const ageScore = Math.max(15 - ageDiff, 0)
    score += ageScore
    
    if (ageDiff <= 3) {
      reasons.push("You're close in age")
    }
  }

  // 4. Location proximity (0-15 points)
  if (user1.location && user2.location) {
    const locationScore = user1.location === user2.location ? 15 : 8
    score += locationScore
    
    if (user1.location === user2.location) {
      reasons.push("You're in the same area")
    }
  }

  // Cap the score at 100
  score = Math.min(score, 100)

  return {
    score: Math.round(score),
    reasons: reasons.slice(0, 3) // Limit to top 3 reasons
  }
}

function calculatePersonalityCompatibility(p1: any, p2: any) {
  let score = 0
  const reasons = []

  // Extraversion - moderate similarity preferred
  const extraversionDiff = Math.abs(p1.extraversion - p2.extraversion)
  if (extraversionDiff < 1) {
    score += 10
    if (p1.extraversion > 3.5) {
      reasons.push("You're both outgoing and social")
    } else {
      reasons.push("You both appreciate quieter moments")
    }
  } else if (extraversionDiff < 2) {
    score += 6
  }

  // Agreeableness - high similarity preferred
  const agreeablenessDiff = Math.abs(p1.agreeableness - p2.agreeableness)
  if (agreeablenessDiff < 0.8) {
    score += 12
    if (p1.agreeableness > 3.5) {
      reasons.push("You're both caring and empathetic")
    }
  } else if (agreeablenessDiff < 1.5) {
    score += 7
  }

  // Conscientiousness - moderate similarity
  const conscientiousnessDiff = Math.abs(p1.conscientiousness - p2.conscientiousness)
  if (conscientiousnessDiff < 1) {
    score += 8
    if (p1.conscientiousness > 3.5) {
      reasons.push("You're both organized and goal-oriented")
    }
  }

  // Neuroticism - low values preferred for both
  const neuroticismAvg = (p1.neuroticism + p2.neuroticism) / 2
  if (neuroticismAvg < 2.5) {
    score += 10
    reasons.push("You both handle stress well")
  } else if (neuroticismAvg < 3.5) {
    score += 5
  }

  // Openness - complementary or similar
  const opennessDiff = Math.abs(p1.openness - p2.openness)
  if (opennessDiff < 1 || (p1.openness > 4 && p2.openness > 4)) {
    score += 10
    if (p1.openness > 4) {
      reasons.push("You're both creative and adventurous")
    }
  }

  return {
    score: Math.min(score, 40),
    reasons
  }
}