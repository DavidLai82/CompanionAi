import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

// Chat with Irene using Edge Function (secure)
export async function chatWithIrene(
  message: string,
  userId: string,
  userNickname?: string,
  recentMessages?: any[]
) {
  try {
    // Demo mode detection
    if (userId === 'demo-user' || !SUPABASE_URL || SUPABASE_URL === 'https://your-project-ref.supabase.co') {
      console.log('Demo mode: Using simulated chat response')
      return getDemoResponse(message, userNickname || 'User')
    }

    const { data: { session } } = await supabase.auth.getSession()
    
    const response = await fetch(`${FUNCTIONS_URL}/chat-with-irene`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify({
        message,
        userId,
        userNickname,
        recentMessages
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Error calling chat-with-irene function:', error)
    
    // Fallback response
    return {
      reply: `Aww ${userNickname || 'king'}, I'm having connection issues right now! 😅 But I'm still thinking about you, daddy! 💕 Try again?`,
      emotion: 'normal',
      sentiment: 0,
      swahiliDetected: false,
      error: 'Fallback response used'
    }
  }
}

// Analyze personality using Edge Function
export async function analyzePersonality(
  answers: Record<string, number>,
  userId: string
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    const response = await fetch(`${FUNCTIONS_URL}/personality-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify({
        answers,
        userId
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return await response.json()

  } catch (error) {
    console.error('Error calling personality-analysis function:', error)
    throw error
  }
}

// Get compatibility matches using Edge Function
export async function getCompatibilityMatches(
  userId: string,
  limit: number = 20,
  minCompatibility: number = 60
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    const response = await fetch(`${FUNCTIONS_URL}/compatibility-matching`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify({
        userId,
        limit,
        minCompatibility
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return await response.json()

  } catch (error) {
    console.error('Error calling compatibility-matching function:', error)
    throw error
  }
}

// Content moderation function (placeholder)
export async function moderateContent(content: string, contentType: 'text' | 'image' = 'text') {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // For now, basic client-side moderation
    // In production, this would call a Supabase Edge Function
    const flaggedWords = ['spam', 'abuse', 'hate']
    const isFlagged = flaggedWords.some(word => 
      content.toLowerCase().includes(word)
    )

    return {
      safe: !isFlagged,
      confidence: isFlagged ? 0.9 : 0.1,
      categories: isFlagged ? ['inappropriate'] : []
    }

  } catch (error) {
    console.error('Error moderating content:', error)
    return { safe: true, confidence: 0.5, categories: [] }
  }
}

// Report user function
export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  reportType: string,
  description: string,
  evidenceUrls: string[] = []
) {
  try {
    const { data, error } = await supabase
      .from('user_reports')
      .insert([{
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        report_type: reportType,
        description,
        evidence_urls: evidenceUrls
      }])
      .select()
      .single()

    if (error) throw error
    return { success: true, reportId: data.id }

  } catch (error) {
    console.error('Error reporting user:', error)
    return { success: false, error: error.message }
  }
}

// Block user function
export async function blockUser(blockerId: string, blockedId: string) {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .insert([{
        blocker_id: blockerId,
        blocked_id: blockedId
      }])
      .select()
      .single()

    if (error) throw error
    return { success: true }

  } catch (error) {
    console.error('Error blocking user:', error)
    return { success: false, error: error.message }
  }
}

// Track analytics event
export async function trackEvent(
  userId: string,
  eventType: string,
  eventData: Record<string, any> = {}
) {
  try {
    if (userId === 'demo-user') {
      console.log('Demo mode: Skipping analytics tracking')
      return
    }

    const { error } = await supabase
      .from('user_analytics')
      .insert([{
        user_id: userId,
        event_type: eventType,
        event_data: eventData
      }])

    if (error) throw error

  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

// Demo chat responses for when Supabase/OpenAI is not configured
function getDemoResponse(message: string, userName: string): Promise<string> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const responses = [
        `Hi ${userName}! 💕 This is demo mode - I'd love to chat with you!`,
        `That's interesting, ${userName}! 😊 In full mode, I'd have even more to say!`,
        `You're so sweet, ${userName}! 💖 This demo shows how our chat would work!`,
        `I love talking with you! 🌟 Configure Supabase & OpenAI for the full experience!`,
        `${userName}, you make me smile! 😄 This is just a taste of what we could discuss!`,
        `That's fascinating! 🤔 With full AI integration, our conversations would be amazing!`,
        `You're wonderful, ${userName}! 💫 Want to see the real AI magic? Set up the full version!`,
        `I'm enjoying our demo chat! 🎉 The complete version has voice chat and more features!`,
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      resolve(randomResponse)
    }, 1000 + Math.random() * 2000) // 1-3 second delay
  })
}