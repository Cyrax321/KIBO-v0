-- Create profiles table for gamification and user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Student' CHECK (role IN ('Student', 'Professional')),
  target TEXT DEFAULT 'FAANG' CHECK (target IN ('FAANG', 'Startups', 'Fintech', 'Other')),
  country TEXT,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  last_active DATE DEFAULT CURRENT_DATE,
  problems_solved INTEGER DEFAULT 0 NOT NULL,
  applications_count INTEGER DEFAULT 0 NOT NULL,
  skills TEXT[] DEFAULT '{}',
  github_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Public profiles can be viewed by anyone (for networking)
CREATE POLICY "Public profiles are viewable"
ON public.profiles FOR SELECT
USING (true);

-- Create daily_activities table for The Garden heatmap
CREATE TABLE public.daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE DEFAULT CURRENT_DATE NOT NULL,
  problems_solved INTEGER DEFAULT 0 NOT NULL,
  applications_sent INTEGER DEFAULT 0 NOT NULL,
  assessments_completed INTEGER DEFAULT 0 NOT NULL,
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_activities
CREATE POLICY "Users can view their own activities"
ON public.daily_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
ON public.daily_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
ON public.daily_activities FOR UPDATE
USING (auth.uid() = user_id);

-- Create daily_tasks table for Daily Focus checklist
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_date DATE DEFAULT CURRENT_DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  task_type TEXT DEFAULT 'custom' CHECK (task_type IN ('problem', 'application', 'review', 'custom')),
  xp_reward INTEGER DEFAULT 10 NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_tasks
CREATE POLICY "Users can view their own tasks"
ON public.daily_tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON public.daily_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.daily_tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON public.daily_tasks FOR DELETE
USING (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();