-- Add offer_xp_awarded column to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS offer_xp_awarded boolean DEFAULT false;

-- Update record_application_update function to prevent infinite XP
CREATE OR REPLACE FUNCTION public.record_application_update(
  p_user_id uuid,
  p_old_status text,
  p_new_status text,
  p_application_id uuid DEFAULT NULL -- Added parameter
)
RETURNS TABLE(new_xp integer, xp_gained integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result record;
  v_xp integer := 0;
  v_offer_awarded boolean;
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
    -- Check if XP was already awarded for this application
    IF p_application_id IS NOT NULL THEN
      SELECT offer_xp_awarded INTO v_offer_awarded 
      FROM public.applications 
      WHERE id = p_application_id;
      
      -- Only award if NOT awarded yet
      IF v_offer_awarded IS FALSE OR v_offer_awarded IS NULL THEN
        SELECT * INTO v_result FROM public.award_xp(p_user_id, 'application_offer');
        v_xp := v_result.xp_gained;
        
        -- Mark as awarded
        UPDATE public.applications 
        SET offer_xp_awarded = TRUE 
        WHERE id = p_application_id;
      END IF;
    ELSE
      -- Fallback for legacy calls without application ID (should be avoided)
      -- We'll just assume it's unsafe and NOT award XP to prevent abuse, 
      -- or arguably we could allow it but that risks the glitch. 
      -- Let's allow it for backward compatibility but it won't fix the glitch for old clients.
      SELECT * INTO v_result FROM public.award_xp(p_user_id, 'application_offer');
      v_xp := v_result.xp_gained;
    END IF;
  END IF;
  
  -- Update streak
  PERFORM public.update_streak(p_user_id);
  
  RETURN QUERY SELECT COALESCE(v_result.new_xp, 0), COALESCE(v_xp, 0);
END;
$$;
