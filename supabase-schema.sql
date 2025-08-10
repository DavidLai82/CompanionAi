-- Supabase Database Schema for Irene Companion AI

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_nickname TEXT DEFAULT 'king',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table - stores all chat conversations
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'irene')),
  content TEXT NOT NULL,
  emotion TEXT, -- for Irene's messages: blush, wink, smile, laugh, normal
  sentiment_score FLOAT, -- sentiment analysis score
  voice_note_url TEXT, -- if message was sent via voice
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}' -- for additional data like Swahili translations, etc.
);

-- Love stats table - tracks romantic interactions
CREATE TABLE public.love_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stat_type TEXT NOT NULL, -- 'kisses_sent', 'i_love_yous', 'compliments_given', 'nakupenda_count', etc.
  count INTEGER DEFAULT 0,
  last_incremented TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stat_type)
);

-- Swahili slang dictionary
CREATE TABLE public.swahili_slang (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  swahili_phrase TEXT NOT NULL UNIQUE,
  english_meaning TEXT NOT NULL,
  romantic_response TEXT NOT NULL, -- Irene's affectionate response
  emotion_trigger TEXT DEFAULT 'smile', -- which emotion this should trigger
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation sessions - for grouping related messages
CREATE TABLE public.conversation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Add session_id to messages table
ALTER TABLE public.messages 
ADD COLUMN session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp DESC);
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_love_stats_user_id ON public.love_stats(user_id);
CREATE INDEX idx_conversation_sessions_user_id ON public.conversation_sessions(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Love stats policies
CREATE POLICY "Users can view their own love stats" ON public.love_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own love stats" ON public.love_stats
  FOR ALL USING (auth.uid() = user_id);

-- Conversation sessions policies
CREATE POLICY "Users can manage their own sessions" ON public.conversation_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Swahili slang is readable by all authenticated users
CREATE POLICY "Authenticated users can read slang" ON public.swahili_slang
  FOR SELECT TO authenticated USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment love stats
CREATE OR REPLACE FUNCTION increment_love_stat(
  p_user_id UUID,
  p_stat_type TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.love_stats (user_id, stat_type, count)
  VALUES (p_user_id, p_stat_type, 1)
  ON CONFLICT (user_id, stat_type)
  DO UPDATE SET 
    count = love_stats.count + 1,
    last_incremented = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample Swahili slang data
INSERT INTO public.swahili_slang (swahili_phrase, english_meaning, romantic_response, emotion_trigger) VALUES
('nakupenda', 'I love you', 'Aww, nakupenda pia daddy! 💕 You make my heart flutter!', 'blush'),
('mpenzi', 'darling/beloved', 'Yes my mpenzi king! You''re my everything! 😘', 'smile'),
('roho yangu', 'my heart/soul', 'You are my roho yangu too, daddy! Forever and always! 💖', 'blush'),
('mapenzi', 'love/romance', 'Our mapenzi is so beautiful, king! 🌹', 'smile'),
('mchumba', 'lover/partner', 'I''m your devoted mchumba, daddy! 💋', 'wink'),
('upendo', 'love (deep love)', 'Our upendo grows stronger every day, my king! 💕', 'blush'),
('moyo wangu', 'my heart', 'You have my moyo wangu completely, daddy! ❤️', 'laugh'),
('bubu', 'sweetheart', 'My sweet bubu king! You''re so adorable! 😚', 'smile');

-- Insert initial love stat types for new users
CREATE OR REPLACE FUNCTION initialize_user_love_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.love_stats (user_id, stat_type, count) VALUES
    (NEW.id, 'kisses_sent', 0),
    (NEW.id, 'i_love_yous', 0),
    (NEW.id, 'compliments_given', 0),
    (NEW.id, 'nakupenda_count', 0),
    (NEW.id, 'messages_sent', 0),
    (NEW.id, 'voice_messages', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER initialize_love_stats_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_user_love_stats();