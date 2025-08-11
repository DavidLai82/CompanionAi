import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase project URL and anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  preferred_nickname: string
  age?: number
  location?: string
  bio?: string
  gender?: string
  seeking_gender?: string
  verification_status?: string
  last_active?: string
  is_online?: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  sender: 'user' | 'irene'
  content: string
  emotion?: string
  sentiment_score?: number
  voice_note_url?: string
  timestamp: string
  session_id?: string
  metadata?: Record<string, any>
}

export interface LoveStat {
  id: string
  user_id: string
  stat_type: string
  count: number
  last_incremented: string
  created_at: string
}

export interface SwahiliSlang {
  id: string
  swahili_phrase: string
  english_meaning: string
  romantic_response: string
  emotion_trigger: string
  usage_count: number
  created_at: string
}

export interface ConversationSession {
  id: string
  user_id: string
  title?: string
  started_at: string
  last_message_at: string
  is_archived: boolean
}

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export const createProfile = async (userId: string, profileData: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, ...profileData }])
    .select()
    .single()
  
  return { data, error }
}

export const getMessages = async (userId: string, sessionId?: string) => {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: true })

  if (sessionId) {
    query = query.eq('session_id', sessionId)
  }

  const { data, error } = await query
  return { data, error }
}

export const insertMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single()
  
  return { data, error }
}

export const getLoveStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('love_stats')
    .select('*')
    .eq('user_id', userId)
  
  return { data, error }
}

export const incrementLoveStat = async (userId: string, statType: string) => {
  const { data, error } = await supabase
    .rpc('increment_love_stat', {
      p_user_id: userId,
      p_stat_type: statType
    })
  
  return { data, error }
}

export const getSwahiliSlang = async () => {
  const { data, error } = await supabase
    .from('swahili_slang')
    .select('*')
    .order('usage_count', { ascending: false })
  
  return { data, error }
}

export const findSwahiliPhrase = async (phrase: string) => {
  const { data, error } = await supabase
    .from('swahili_slang')
    .select('*')
    .ilike('swahili_phrase', `%${phrase}%`)
  
  return { data, error }
}

export const createConversationSession = async (userId: string, title?: string) => {
  const { data, error } = await supabase
    .from('conversation_sessions')
    .insert([{ user_id: userId, title }])
    .select()
    .single()
  
  return { data, error }
}

export const getConversationSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversation_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('last_message_at', { ascending: false })
  
  return { data, error }
}