-- Create table for storing user conversations
CREATE TABLE IF NOT EXISTS public.user_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  conversation JSONB NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own conversations
CREATE POLICY "Users can view own conversations" ON public.user_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own conversations
CREATE POLICY "Users can insert own conversations" ON public.user_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own conversations
CREATE POLICY "Users can update own conversations" ON public.user_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own conversations
CREATE POLICY "Users can delete own conversations" ON public.user_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster querying
CREATE INDEX idx_user_conversations_user_id ON public.user_conversations(user_id);
CREATE INDEX idx_user_conversations_session_id ON public.user_conversations(session_id);
CREATE INDEX idx_user_conversations_created_at ON public.user_conversations(created_at DESC);