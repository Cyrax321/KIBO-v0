-- Fix overly permissive INSERT policy on notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create proper INSERT policy - authenticated users can create notifications for others
CREATE POLICY "Authenticated users can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');