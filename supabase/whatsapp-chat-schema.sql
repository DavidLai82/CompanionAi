-- Enhanced WhatsApp-style chat schema
-- Run this AFTER the existing schemas

-- Enhanced messages table for WhatsApp features
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.messages(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS ai_suggestion BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type VARCHAR(20);

-- Typing status table
CREATE TABLE IF NOT EXISTS public.typing_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID, -- can reference conversation_sessions
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL, -- heart, laugh, wow, sad, angry
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- Chat participants (for group chats)
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID, -- references conversation_sessions
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Enhanced profiles for online status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_typing_status_chat_id ON public.typing_status(chat_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_updated_at ON public.typing_status(updated_at);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_message_id);

-- RLS Policies
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Typing status policies
CREATE POLICY "Users can manage typing status" ON public.typing_status
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view typing in their chats" ON public.typing_status
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.chat_id = typing_status.chat_id AND cp.user_id = auth.uid()
    )
  );

-- Message reactions policies
CREATE POLICY "Users can manage their own reactions" ON public.message_reactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view reactions on accessible messages" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_reactions.message_id AND m.user_id = auth.uid()
    )
  );

-- Chat participants policies
CREATE POLICY "Users can view their own chat participation" ON public.chat_participants
  FOR SELECT USING (auth.uid() = user_id);

-- Function to update typing status
CREATE OR REPLACE FUNCTION update_typing_status(
  p_chat_id UUID,
  p_user_id UUID,
  p_is_typing BOOLEAN
) RETURNS void AS $$
BEGIN
  INSERT INTO public.typing_status (chat_id, user_id, is_typing, updated_at)
  VALUES (p_chat_id, p_user_id, p_is_typing, NOW())
  ON CONFLICT (chat_id, user_id)
  DO UPDATE SET 
    is_typing = p_is_typing,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as delivered
CREATE OR REPLACE FUNCTION mark_messages_delivered(
  p_user_id UUID,
  p_chat_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE public.messages 
  SET delivered_at = NOW()
  WHERE sender_id != p_user_id 
    AND delivered_at IS NULL
    AND (p_chat_id IS NULL OR session_id = p_chat_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_user_id UUID,
  p_chat_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE public.messages 
  SET read_at = NOW()
  WHERE sender_id != p_user_id 
    AND read_at IS NULL
    AND (p_chat_id IS NULL OR session_id = p_chat_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user online status
CREATE OR REPLACE FUNCTION update_user_online_status(
  p_user_id UUID,
  p_is_online BOOLEAN
) RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    is_online = p_is_online,
    last_seen = CASE WHEN p_is_online = FALSE THEN NOW() ELSE last_seen END
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;