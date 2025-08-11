-- Create profiles table for Irene Companion AI
-- This table stores user profile information

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  preferred_nickname text NOT NULL DEFAULT 'User',
  age integer,
  location text,
  bio text,
  gender text,
  seeking_gender text,
  interests text[],
  relationship_status text,
  education text,
  occupation text,
  height integer, -- in cm
  lifestyle_choices jsonb DEFAULT '{}',
  personality_traits jsonb DEFAULT '{}',
  social_preferences jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create personality_assessments table for the assessment feature
CREATE TABLE IF NOT EXISTS public.personality_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_data jsonb NOT NULL DEFAULT '{}',
  results jsonb NOT NULL DEFAULT '{}',
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for personality_assessments
ALTER TABLE public.personality_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for personality_assessments
CREATE POLICY "Users can view their own assessments"
ON public.personality_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
ON public.personality_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.personality_assessments FOR UPDATE
USING (auth.uid() = user_id);