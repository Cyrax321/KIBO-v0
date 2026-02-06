-- Fix the init_daily_activity function - v_streak_result record issue
CREATE OR REPLACE FUNCTION public.init_daily_activity(p_user_id uuid)
RETURNS TABLE(streak integer, daily_xp integer, is_new_day boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_active date;
  v_current_streak integer;
  v_daily_xp integer;
  v_is_new boolean;
BEGIN
  -- Get last active date and current streak
  SELECT last_active, p.streak INTO v_last_active, v_current_streak
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  v_is_new := v_last_active IS NULL OR v_last_active < CURRENT_DATE;
  
  -- Update streak if new day
  IF v_is_new THEN
    PERFORM public.update_streak(p_user_id);
    
    -- Award daily login XP
    PERFORM public.award_xp(p_user_id, 'daily_login', NULL);
  END IF;
  
  -- Ensure daily activity record exists
  INSERT INTO public.daily_activities (user_id, activity_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, activity_date) DO NOTHING;
  
  -- Get today's XP
  SELECT xp_earned INTO v_daily_xp
  FROM public.daily_activities
  WHERE user_id = p_user_id AND activity_date = CURRENT_DATE;
  
  -- Get updated streak from profile
  SELECT p.streak INTO v_current_streak
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  RETURN QUERY SELECT COALESCE(v_current_streak, 1), COALESCE(v_daily_xp, 0), v_is_new;
END;
$$;

-- Also fix update_streak to handle edge cases better
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
  SELECT last_active, p.streak INTO v_last_active, v_current_streak
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  -- Calculate new streak
  IF v_last_active IS NULL THEN
    -- First activity ever
    v_new_streak := 1;
  ELSIF v_last_active = CURRENT_DATE THEN
    -- Already active today, no change
    v_new_streak := COALESCE(v_current_streak, 1);
  ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    -- Streak broken, reset to 1
    v_new_streak := 1;
  END IF;
  
  -- Calculate streak bonuses
  IF v_new_streak = 7 THEN
    v_bonus := COALESCE(public.get_xp_value('streak_bonus_7'), 50);
  ELSIF v_new_streak = 30 THEN
    v_bonus := COALESCE(public.get_xp_value('streak_bonus_30'), 200);
  ELSIF v_new_streak > 0 AND v_new_streak % 7 = 0 THEN
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

-- Fix award_xp to handle null custom_xp parameter properly
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
  IF p_custom_xp IS NOT NULL THEN
    v_xp_to_add := p_custom_xp;
  ELSE
    v_xp_to_add := COALESCE(public.get_xp_value(p_action), 10);
  END IF;
  
  -- Get current XP and level
  SELECT xp, level INTO v_old_xp, v_old_level
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Handle case where profile doesn't exist yet
  IF v_old_xp IS NULL THEN
    v_old_xp := 0;
    v_old_level := 1;
  END IF;
  
  -- Calculate new values
  v_new_xp := v_old_xp + v_xp_to_add;
  v_new_level := public.calculate_level(v_new_xp);
  
  -- Update profile
  UPDATE public.profiles
  SET 
    xp = v_new_xp,
    level = v_new_level,
    last_active = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record in daily activities (upsert)
  INSERT INTO public.daily_activities (user_id, activity_date, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, v_xp_to_add)
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET xp_earned = daily_activities.xp_earned + v_xp_to_add;
  
  RETURN QUERY SELECT v_new_xp, v_new_level, v_xp_to_add, (v_new_level > v_old_level);
END;
$$;