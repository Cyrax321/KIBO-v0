-- =============================================
-- KIBO COMPLETE DATABASE SCHEMA
-- As per PRD v4.2
-- =============================================

-- 1. Applications (Kanban Tracker)
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'wishlist' CHECK (status IN ('wishlist', 'applied', 'oa', 'technical', 'hr', 'offer')),
  notes TEXT,
  salary TEXT,
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  job_url TEXT,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Coding Problems (CS Arena)
CREATE TABLE public.coding_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  company_tags TEXT[] DEFAULT '{}',
  topic_tags TEXT[] DEFAULT '{}',
  starter_code JSONB DEFAULT '{"javascript": "", "python": "", "java": "", "cpp": ""}',
  sample_cases JSONB DEFAULT '[]',
  test_cases JSONB DEFAULT '[]',
  editorial_content TEXT,
  constraints TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Submissions (Code submissions)
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.coding_problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'runtime_error', 'time_limit', 'pending')),
  runtime_ms INTEGER,
  memory_kb INTEGER,
  test_results JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Assessments (Mock HackerRank tests)
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  problem_ids UUID[] DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT,
  success_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Assessment Attempts (User's test attempts)
CREATE TABLE public.assessment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  passed BOOLEAN DEFAULT false,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Contests (CodeChef style)
CREATE TABLE public.contests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  problem_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Contest Registrations
CREATE TABLE public.contest_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score INTEGER DEFAULT 0,
  finish_time TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, contest_id)
);

-- 8. Schedule Events (Calendar)
CREATE TABLE public.schedule_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type TEXT NOT NULL CHECK (event_type IN ('deadline', 'interview', 'contest', 'reminder', 'other')),
  related_application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Posts (Mini LinkedIn Feed)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'update' CHECK (post_type IN ('update', 'question', 'achievement')),
  upvotes INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Post Upvotes (Track who upvoted)
CREATE TABLE public.post_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 11. Comments
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Connections (Networking)
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- 13. Messages (Real-time Chat)
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. Achievements/Badges
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 15. User Achievements (Unlocked badges)
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Applications: Users manage their own
CREATE POLICY "Users can view their own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own applications" ON public.applications FOR DELETE USING (auth.uid() = user_id);

-- Coding Problems: Public read
CREATE POLICY "Anyone can view coding problems" ON public.coding_problems FOR SELECT USING (true);

-- Submissions: Users manage their own
CREATE POLICY "Users can view their own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Assessments: Public read
CREATE POLICY "Anyone can view assessments" ON public.assessments FOR SELECT USING (true);

-- Assessment Attempts: Users manage their own
CREATE POLICY "Users can view their own attempts" ON public.assessment_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create attempts" ON public.assessment_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attempts" ON public.assessment_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Contests: Public read
CREATE POLICY "Anyone can view contests" ON public.contests FOR SELECT USING (true);

-- Contest Registrations: Users manage their own
CREATE POLICY "Users can view their registrations" ON public.contest_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for contests" ON public.contest_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their registrations" ON public.contest_registrations FOR UPDATE USING (auth.uid() = user_id);

-- Schedule Events: Users manage their own
CREATE POLICY "Users can view their own events" ON public.schedule_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create events" ON public.schedule_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON public.schedule_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON public.schedule_events FOR DELETE USING (auth.uid() = user_id);

-- Posts: Public feed
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Post Upvotes
CREATE POLICY "Anyone can view upvotes" ON public.post_upvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upvote" ON public.post_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their upvotes" ON public.post_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Connections: Users can see their own connections
CREATE POLICY "Users can view their connections" ON public.connections 
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Authenticated users can send connection requests" ON public.connections 
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update connection requests they received" ON public.connections 
  FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "Users can delete their connections" ON public.connections 
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Messages: Users can see their own messages
CREATE POLICY "Users can view their messages" ON public.messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can mark messages as read" ON public.messages 
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Achievements: Public read
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User Achievements
CREATE POLICY "Anyone can view user achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "System can grant achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ENABLE REALTIME FOR MESSAGES
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- =============================================
-- SEED SOME INITIAL DATA
-- =============================================

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
  ('First Steps', 'Solve your first coding problem', 'trophy', 100, 'problems_solved', 1),
  ('Problem Solver', 'Solve 10 coding problems', 'award', 500, 'problems_solved', 10),
  ('Algorithm Master', 'Solve 50 coding problems', 'crown', 2000, 'problems_solved', 50),
  ('Job Hunter', 'Track your first application', 'target', 50, 'applications_sent', 1),
  ('Dedicated Applicant', 'Track 25 applications', 'briefcase', 500, 'applications_sent', 25),
  ('Streak Starter', 'Maintain a 7-day streak', 'flame', 500, 'streak_days', 7),
  ('Streak Champion', 'Maintain a 30-day streak', 'fire', 2000, 'streak_days', 30),
  ('Social Butterfly', 'Make 10 connections', 'users', 300, 'connections_count', 10),
  ('Community Helper', 'Help 5 people with answers', 'heart', 250, 'answers_accepted', 5);