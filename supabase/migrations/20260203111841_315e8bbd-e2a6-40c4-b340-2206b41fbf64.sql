-- =============================================
-- GAMIFICATION SYSTEM - XP, Levels, Streaks, Achievements
-- =============================================

-- XP Configuration Constants (stored in a config table for easy tuning)
CREATE TABLE IF NOT EXISTS public.xp_config (
  id text PRIMARY KEY,
  xp_value integer NOT NULL,
  description text
);

-- Insert XP values for different actions
INSERT INTO public.xp_config (id, xp_value, description) VALUES
  ('problem_solved_easy', 10, 'Solving an easy problem'),
  ('problem_solved_medium', 25, 'Solving a medium problem'),
  ('problem_solved_hard', 50, 'Solving a hard problem'),
  ('quiz_completed', 15, 'Completing a quiz'),
  ('quiz_passed', 30, 'Passing a quiz (70%+)'),
  ('assessment_completed', 50, 'Completing a mock assessment'),
  ('assessment_passed', 100, 'Passing a mock assessment'),
  ('application_sent', 5, 'Sending a job application'),
  ('application_offer', 200, 'Receiving a job offer'),
  ('daily_login', 5, 'Daily login bonus'),
  ('streak_bonus_7', 50, 'Week streak bonus'),
  ('streak_bonus_30', 200, 'Month streak bonus'),
  ('first_problem', 25, 'Solving first problem'),
  ('first_application', 25, 'First application sent'),
  ('post_created', 5, 'Creating a post'),
  ('connection_made', 10, 'Making a new connection')
ON CONFLICT (id) DO NOTHING;

-- Level thresholds table
CREATE TABLE IF NOT EXISTS public.level_thresholds (
  level integer PRIMARY KEY,
  xp_required integer NOT NULL,
  title text
);

-- Insert level thresholds (exponential curve)
INSERT INTO public.level_thresholds (level, xp_required, title) VALUES
  (1, 0, 'Novice'),
  (2, 100, 'Beginner'),
  (3, 250, 'Apprentice'),
  (4, 500, 'Junior'),
  (5, 1000, 'Developer'),
  (6, 2000, 'Senior'),
  (7, 4000, 'Expert'),
  (8, 7500, 'Master'),
  (9, 12000, 'Grandmaster'),
  (10, 20000, 'Legend')
ON CONFLICT (level) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.xp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_thresholds ENABLE ROW LEVEL SECURITY;

-- Anyone can read config tables
CREATE POLICY "Anyone can view xp_config" ON public.xp_config FOR SELECT USING (true);
CREATE POLICY "Anyone can view level_thresholds" ON public.level_thresholds FOR SELECT USING (true);

-- =============================================
-- CORE GAMIFICATION FUNCTIONS
-- =============================================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount integer)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT level FROM public.level_thresholds 
     WHERE xp_required <= xp_amount 
     ORDER BY level DESC 
     LIMIT 1),
    1
  );
$$;

-- Function to get XP value for an action
CREATE OR REPLACE FUNCTION public.get_xp_value(action_id text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT xp_value FROM public.xp_config WHERE id = action_id),
    0
  );
$$;

-- Main function to award XP to a user
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid,
  p_action text,
  p_custom_xp integer DEFAULT NULL
)
RETURNS TABLE(new_xp integer, new_level integer, xp_gained integer, leveled_up boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_to_add integer;
  v_old_xp integer;
  v_old_level integer;
  v_new_xp integer;
  v_new_level integer;
BEGIN
  -- Get XP value for action (use custom if provided)
  v_xp_to_add := COALESCE(p_custom_xp, public.get_xp_value(p_action));
  
  -- Get current XP and level
  SELECT xp, level INTO v_old_xp, v_old_level
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Calculate new values
  v_new_xp := COALESCE(v_old_xp, 0) + v_xp_to_add;
  v_new_level := public.calculate_level(v_new_xp);
  
  -- Update profile
  UPDATE public.profiles
  SET 
    xp = v_new_xp,
    level = v_new_level,
    last_active = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record in daily activities
  INSERT INTO public.daily_activities (user_id, activity_date, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, v_xp_to_add)
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET xp_earned = daily_activities.xp_earned + v_xp_to_add;
  
  RETURN QUERY SELECT v_new_xp, v_new_level, v_xp_to_add, (v_new_level > COALESCE(v_old_level, 1));
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id uuid)
RETURNS TABLE(new_streak integer, streak_bonus integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_active date;
  v_current_streak integer;
  v_new_streak integer;
  v_bonus integer := 0;
BEGIN
  -- Get current streak and last active date
  SELECT last_active, streak INTO v_last_active, v_current_streak
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Calculate new streak
  IF v_last_active = CURRENT_DATE THEN
    -- Already active today, no change
    v_new_streak := v_current_streak;
  ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    -- Streak broken, reset to 1
    v_new_streak := 1;
  END IF;
  
  -- Calculate streak bonuses
  IF v_new_streak = 7 THEN
    v_bonus := public.get_xp_value('streak_bonus_7');
  ELSIF v_new_streak = 30 THEN
    v_bonus := public.get_xp_value('streak_bonus_30');
  ELSIF v_new_streak % 7 = 0 AND v_new_streak > 0 THEN
    v_bonus := 25; -- Weekly bonus
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    streak = v_new_streak,
    last_active = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Award streak bonus if any
  IF v_bonus > 0 THEN
    PERFORM public.award_xp(p_user_id, 'streak_bonus', v_bonus);
  END IF;
  
  RETURN QUERY SELECT v_new_streak, v_bonus;
END;
$$;

-- Function to record problem solved
CREATE OR REPLACE FUNCTION public.record_problem_solved(
  p_user_id uuid,
  p_difficulty text
)
RETURNS TABLE(new_xp integer, new_level integer, xp_gained integer, leveled_up boolean, new_problems_solved integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_result record;
  v_problems_count integer;
BEGIN
  -- Determine XP action based on difficulty
  v_action := 'problem_solved_' || LOWER(p_difficulty);
  
  -- Award XP
  SELECT * INTO v_result FROM public.award_xp(p_user_id, v_action);
  
  -- Update problems solved count
  UPDATE public.profiles
  SET problems_solved = problems_solved + 1
  WHERE user_id = p_user_id
  RETURNING problems_solved INTO v_problems_count;
  
  -- Update daily activities
  UPDATE public.daily_activities
  SET problems_solved = problems_solved + 1
  WHERE user_id = p_user_id AND activity_date = CURRENT_DATE;
  
  -- Update streak
  PERFORM public.update_streak(p_user_id);
  
  RETURN QUERY SELECT v_result.new_xp, v_result.new_level, v_result.xp_gained, v_result.leveled_up, v_problems_count;
END;
$$;

-- Function to record quiz/assessment completion
CREATE OR REPLACE FUNCTION public.record_assessment_completed(
  p_user_id uuid,
  p_assessment_id uuid,
  p_score integer,
  p_passed boolean,
  p_time_taken integer
)
RETURNS TABLE(new_xp integer, new_level integer, xp_gained integer, leveled_up boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_result record;
BEGIN
  -- Determine XP action
  IF p_passed THEN
    v_action := 'assessment_passed';
  ELSE
    v_action := 'assessment_completed';
  END IF;
  
  -- Record attempt
  INSERT INTO public.assessment_attempts (
    user_id, assessment_id, score, passed, time_taken_seconds, completed_at
  ) VALUES (
    p_user_id, p_assessment_id, p_score, p_passed, p_time_taken, NOW()
  );
  
  -- Award XP
  SELECT * INTO v_result FROM public.award_xp(p_user_id, v_action);
  
  -- Update daily activities
  UPDATE public.daily_activities
  SET assessments_completed = assessments_completed + 1
  WHERE user_id = p_user_id AND activity_date = CURRENT_DATE;
  
  -- Update streak
  PERFORM public.update_streak(p_user_id);
  
  RETURN QUERY SELECT v_result.new_xp, v_result.new_level, v_result.xp_gained, v_result.leveled_up;
END;
$$;

-- Function to record application status change
CREATE OR REPLACE FUNCTION public.record_application_update(
  p_user_id uuid,
  p_old_status text,
  p_new_status text
)
RETURNS TABLE(new_xp integer, xp_gained integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result record;
  v_xp integer := 0;
BEGIN
  -- Award XP for specific status changes
  IF p_old_status = 'wishlist' AND p_new_status = 'applied' THEN
    SELECT * INTO v_result FROM public.award_xp(p_user_id, 'application_sent');
    v_xp := v_result.xp_gained;
    
    -- Update applications count
    UPDATE public.profiles
    SET applications_count = applications_count + 1
    WHERE user_id = p_user_id;
    
    -- Update daily activities
    INSERT INTO public.daily_activities (user_id, activity_date, applications_sent)
    VALUES (p_user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, activity_date) 
    DO UPDATE SET applications_sent = daily_activities.applications_sent + 1;
    
  ELSIF p_new_status = 'offer' THEN
    SELECT * INTO v_result FROM public.award_xp(p_user_id, 'application_offer');
    v_xp := v_result.xp_gained;
  END IF;
  
  -- Update streak
  PERFORM public.update_streak(p_user_id);
  
  RETURN QUERY SELECT COALESCE(v_result.new_xp, 0), v_xp;
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id uuid)
RETURNS TABLE(achievement_id uuid, achievement_name text, xp_reward integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile record;
  v_achievement record;
  v_count integer;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
  
  -- Check each achievement
  FOR v_achievement IN 
    SELECT a.* FROM public.achievements a
    WHERE a.id NOT IN (
      SELECT ua.achievement_id FROM public.user_achievements ua WHERE ua.user_id = p_user_id
    )
  LOOP
    -- Check if requirement is met
    CASE v_achievement.requirement_type
      WHEN 'problems_solved' THEN
        IF v_profile.problems_solved >= v_achievement.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id)
          VALUES (p_user_id, v_achievement.id);
          
          -- Award XP
          IF v_achievement.xp_reward > 0 THEN
            PERFORM public.award_xp(p_user_id, 'achievement', v_achievement.xp_reward);
          END IF;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, v_achievement.xp_reward;
        END IF;
        
      WHEN 'streak' THEN
        IF v_profile.streak >= v_achievement.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id)
          VALUES (p_user_id, v_achievement.id);
          
          IF v_achievement.xp_reward > 0 THEN
            PERFORM public.award_xp(p_user_id, 'achievement', v_achievement.xp_reward);
          END IF;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, v_achievement.xp_reward;
        END IF;
        
      WHEN 'level' THEN
        IF v_profile.level >= v_achievement.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id)
          VALUES (p_user_id, v_achievement.id);
          
          IF v_achievement.xp_reward > 0 THEN
            PERFORM public.award_xp(p_user_id, 'achievement', v_achievement.xp_reward);
          END IF;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, v_achievement.xp_reward;
        END IF;
        
      WHEN 'applications' THEN
        IF v_profile.applications_count >= v_achievement.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id)
          VALUES (p_user_id, v_achievement.id);
          
          IF v_achievement.xp_reward > 0 THEN
            PERFORM public.award_xp(p_user_id, 'achievement', v_achievement.xp_reward);
          END IF;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, v_achievement.xp_reward;
        END IF;
        
      ELSE
        -- Skip unknown types
        NULL;
    END CASE;
  END LOOP;
END;
$$;

-- Function to initialize daily activity (called on login)
CREATE OR REPLACE FUNCTION public.init_daily_activity(p_user_id uuid)
RETURNS TABLE(streak integer, daily_xp integer, is_new_day boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_active date;
  v_streak_result record;
  v_daily_xp integer;
  v_is_new boolean;
BEGIN
  -- Get last active date
  SELECT last_active INTO v_last_active
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  v_is_new := v_last_active IS NULL OR v_last_active < CURRENT_DATE;
  
  -- Update streak if new day
  IF v_is_new THEN
    SELECT * INTO v_streak_result FROM public.update_streak(p_user_id);
    
    -- Award daily login XP
    PERFORM public.award_xp(p_user_id, 'daily_login');
  END IF;
  
  -- Ensure daily activity record exists
  INSERT INTO public.daily_activities (user_id, activity_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, activity_date) DO NOTHING;
  
  -- Get today's XP
  SELECT xp_earned INTO v_daily_xp
  FROM public.daily_activities
  WHERE user_id = p_user_id AND activity_date = CURRENT_DATE;
  
  -- Get current streak
  SELECT p.streak INTO v_streak_result.new_streak
  FROM public.profiles p
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT COALESCE(v_streak_result.new_streak, 1), COALESCE(v_daily_xp, 0), v_is_new;
END;
$$;

-- Add unique constraint for daily_activities if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_activities_user_date_unique'
  ) THEN
    ALTER TABLE public.daily_activities 
    ADD CONSTRAINT daily_activities_user_date_unique UNIQUE (user_id, activity_date);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Seed default achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
  ('First Steps', 'Solve your first coding problem', '🎯', 'problems_solved', 1, 25),
  ('Problem Solver', 'Solve 10 coding problems', '💡', 'problems_solved', 10, 100),
  ('Code Warrior', 'Solve 50 coding problems', '⚔️', 'problems_solved', 50, 250),
  ('Algorithm Master', 'Solve 100 coding problems', '👑', 'problems_solved', 100, 500),
  ('Consistent', 'Maintain a 7-day streak', '🔥', 'streak', 7, 75),
  ('Dedicated', 'Maintain a 30-day streak', '💪', 'streak', 30, 300),
  ('Unstoppable', 'Maintain a 100-day streak', '🚀', 'streak', 100, 1000),
  ('Rising Star', 'Reach level 5', '⭐', 'level', 5, 150),
  ('Expert', 'Reach level 8', '🌟', 'level', 8, 400),
  ('Legend', 'Reach level 10', '🏆', 'level', 10, 1000),
  ('Job Hunter', 'Send 10 applications', '📝', 'applications', 10, 100),
  ('Persistent', 'Send 50 applications', '🎯', 'applications', 50, 300),
  ('Determined', 'Send 100 applications', '💼', 'applications', 100, 500)
ON CONFLICT DO NOTHING;