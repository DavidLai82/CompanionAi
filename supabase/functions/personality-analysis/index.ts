import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PersonalityRequest {
  answers: Record<string, number>
  userId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { answers, userId }: PersonalityRequest = await req.json()

    // Calculate Big 5 scores
    const scores = {
      extraversion: calculateTraitScore(answers, ['extraversion_1', 'extraversion_2']),
      agreeableness: calculateTraitScore(answers, ['agreeableness_1', 'agreeableness_2']),
      conscientiousness: calculateTraitScore(answers, ['conscientiousness_1', 'conscientiousness_2']),
      neuroticism: calculateTraitScore(answers, ['neuroticism_1', 'neuroticism_2']),
      openness: calculateTraitScore(answers, ['openness_1', 'openness_2'])
    }

    // Generate AI insights using OpenAI
    const insights = await generatePersonalityInsights(scores)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Save to database
    const { data, error } = await supabaseClient
      .from('personality_assessments')
      .insert([{
        user_id: userId,
        assessment_type: 'big5',
        results: answers,
        scores: scores,
        ai_insights: insights
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        scores,
        insights,
        assessmentId: data.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in personality-analysis function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function calculateTraitScore(answers: Record<string, number>, questionIds: string[]): number {
  const sum = questionIds.reduce((total, id) => total + (answers[id] || 0), 0)
  return sum / questionIds.length
}

async function generatePersonalityInsights(scores: Record<string, number>): Promise<string> {
  try {
    const prompt = `Based on these Big 5 personality scores (1-5 scale), generate warm, encouraging insights for a dating/social app user:

Extraversion: ${scores.extraversion}
Agreeableness: ${scores.agreeableness}
Conscientiousness: ${scores.conscientiousness}
Neuroticism: ${scores.neuroticism}
Openness: ${scores.openness}

Write 2-3 positive, encouraging sentences about their personality strengths and what makes them attractive to potential partners. Be warm and supportive.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a supportive personality analyst for a social connection app. Generate warm, positive insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.choices[0]?.message?.content?.trim() || generateFallbackInsights(scores)
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
  }

  return generateFallbackInsights(scores)
}

function generateFallbackInsights(scores: Record<string, number>): string {
  const insights = []
  
  if (scores.extraversion > 3.5) {
    insights.push("You're naturally outgoing and energized by social interactions")
  }
  if (scores.agreeableness > 3.5) {
    insights.push("You have a caring, empathetic nature that draws people to you")
  }
  if (scores.conscientiousness > 3.5) {
    insights.push("You're organized and goal-oriented, qualities that make you a reliable partner")
  }
  if (scores.openness > 3.5) {
    insights.push("You're creative and open to new experiences, making you exciting to be around")
  }
  
  if (insights.length === 0) {
    insights.push("You have a unique personality that brings special qualities to relationships")
  }
  
  return insights.join('. ') + '. These traits make you an attractive potential partner!'
}