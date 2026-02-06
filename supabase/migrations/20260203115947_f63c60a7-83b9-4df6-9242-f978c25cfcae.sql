-- Add note column to connections table for connection request messages
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS note text;

-- Create notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'connection_request', 'connection_accepted', 'message', 'post_like', 'comment'
  title text NOT NULL,
  body text,
  from_user_id uuid,
  reference_id uuid, -- ID of related entity (connection_id, message_id, post_id, etc.)
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for notifications and messages
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;