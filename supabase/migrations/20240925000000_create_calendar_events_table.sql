
-- Create calendar events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  meeting_link TEXT,
  type TEXT,
  discipline TEXT,
  professor TEXT,
  reminders TEXT[],
  repeat TEXT,
  visibility TEXT DEFAULT 'private',
  attachments TEXT[],
  guests TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own events
CREATE POLICY "Users can manage their own events"
  ON public.calendar_events
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy for users to read public events
CREATE POLICY "Users can view public events"
  ON public.calendar_events
  FOR SELECT
  USING (visibility = 'public');

-- Index for performance
CREATE INDEX calendar_events_user_id_idx ON public.calendar_events(user_id);
CREATE INDEX calendar_events_start_date_idx ON public.calendar_events(start_date);
