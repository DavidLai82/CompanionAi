-- Additional Schema for Social Matching Platform
-- Run this AFTER the existing irene schema

-- Extended user profiles for social matching
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seeking_gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Personality assessments
CREATE TABLE IF NOT EXISTS public.personality_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL, -- 'big5', 'mbti', 'custom'
  results JSONB NOT NULL,
  scores JSONB NOT NULL, -- normalized compatibility scores
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_insights TEXT -- Claude-generated personality insights
);

-- User interests and hobbies
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_category TEXT NOT NULL,
  interest_name TEXT NOT NULL,
  interest_level INTEGER CHECK (interest_level >= 1 AND interest_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User photos and media
CREATE TABLE IF NOT EXISTS public.user_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending',
  upload_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches and compatibility
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  compatibility_score FLOAT NOT NULL,
  match_status TEXT CHECK (match_status IN ('pending', 'liked', 'passed', 'matched', 'unmatched')),
  user1_action TEXT CHECK (user1_action IN ('pending', 'like', 'pass')),
  user2_action TEXT CHECK (user2_action IN ('pending', 'like', 'pass')),
  matched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_match_reason TEXT, -- Claude explanation of why they match
  UNIQUE(user1_id, user2_id)
);

-- Group chats and events
CREATE TABLE IF NOT EXISTS public.group_chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_event BOOLEAN DEFAULT FALSE,
  event_date TIMESTAMP WITH TIME ZONE,
  event_location TEXT,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group chat participants
CREATE TABLE IF NOT EXISTS public.group_chat_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Reports and safety
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'inappropriate', 'fake', 'harassment', 'spam'
  description TEXT,
  evidence_urls TEXT[], -- screenshots, etc
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User blocks
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Analytics and engagement
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'profile_view', 'like', 'message_sent', 'chat_opened'
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation feedback (for AI improvement)
CREATE TABLE IF NOT EXISTS public.conversation_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID, -- can reference messages or group chats
  feedback_type TEXT NOT NULL, -- 'ai_suggestion_helpful', 'match_quality', 'conversation_flow'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_personality_assessments_user_id ON public.personality_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON public.user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_compatibility_score ON public.matches(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON public.user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON public.user_analytics(event_type);

-- RLS Policies
ALTER TABLE public.personality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_feedback ENABLE ROW LEVEL SECURITY;

-- Personality assessments policies
CREATE POLICY "Users can manage their own assessments" ON public.personality_assessments
  FOR ALL USING (auth.uid() = user_id);

-- User interests policies
CREATE POLICY "Users can manage their own interests" ON public.user_interests
  FOR ALL USING (auth.uid() = user_id);

-- User photos policies
CREATE POLICY "Users can manage their own photos" ON public.user_photos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' verified photos" ON public.user_photos
  FOR SELECT USING (verification_status = 'verified');

-- Matches policies
CREATE POLICY "Users can view their own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own match actions" ON public.matches
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Group chats policies
CREATE POLICY "Users can view groups they belong to" ON public.group_chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_chat_participants 
      WHERE group_id = public.group_chats.id AND user_id = auth.uid()
    )
  );

-- Analytics policies (users can only see their own)
CREATE POLICY "Users can manage their own analytics" ON public.user_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Functions for compatibility scoring
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
  user1_id UUID,
  user2_id UUID
) RETURNS FLOAT AS $$
DECLARE
  score FLOAT := 0;
  interest_overlap INTEGER := 0;
  personality_score FLOAT := 0;
BEGIN
  -- Calculate interest overlap (0-40 points)
  SELECT COUNT(*) INTO interest_overlap
  FROM public.user_interests ui1
  JOIN public.user_interests ui2 ON ui1.interest_name = ui2.interest_name
  WHERE ui1.user_id = user1_id AND ui2.user_id = user2_id;
  
  score := LEAST(interest_overlap * 5, 40); -- Max 40 points for interests
  
  -- Add personality compatibility (0-60 points) - simplified version
  -- In real implementation, this would use complex personality analysis
  personality_score := 30 + (RANDOM() * 30); -- Placeholder
  score := score + personality_score;
  
  RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create mutual match when both users like each other
CREATE OR REPLACE FUNCTION check_mutual_match() RETURNS TRIGGER AS $$
BEGIN
  -- Check if this creates a mutual match
  IF NEW.user1_action = 'like' AND NEW.user2_action = 'like' THEN
    NEW.match_status := 'matched';
    NEW.matched_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_mutual_match_trigger
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION check_mutual_match();