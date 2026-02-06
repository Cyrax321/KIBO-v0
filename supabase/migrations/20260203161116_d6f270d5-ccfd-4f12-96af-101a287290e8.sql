-- Create quiz_attempts table to track all quiz attempts with full details
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id TEXT NOT NULL,
  quiz_title TEXT NOT NULL,
  quiz_topic TEXT NOT NULL,
  
  -- Results
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  
  -- Detailed answers (stores which option was selected for each question)
  answers JSONB NOT NULL DEFAULT '{}',
  
  -- XP earned
  xp_earned INTEGER NOT NULL DEFAULT 0,
  
  -- Timing
  time_taken_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own quiz attempts"
ON public.quiz_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts"
ON public.quiz_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz attempts"
ON public.quiz_attempts
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);

-- Update assessment_attempts to store more detailed info
ALTER TABLE public.assessment_attempts 
ADD COLUMN IF NOT EXISTS assessment_title TEXT,
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;