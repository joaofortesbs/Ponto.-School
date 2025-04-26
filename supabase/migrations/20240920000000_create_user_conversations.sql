
-- Create user_conversations table
CREATE TABLE IF NOT EXISTS public.user_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tipo TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  preview TEXT,
  favorita BOOLEAN DEFAULT false,
  fixada BOOLEAN DEFAULT false,
  mensagens JSONB NOT NULL,
  analise JSONB,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add index for faster retrieval
CREATE INDEX user_conversations_user_id_idx ON public.user_conversations(user_id);

-- Add RLS policies
ALTER TABLE public.user_conversations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own conversations
CREATE POLICY user_conversations_select 
  ON public.user_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert only their own conversations
CREATE POLICY user_conversations_insert 
  ON public.user_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own conversations
CREATE POLICY user_conversations_update 
  ON public.user_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own conversations
CREATE POLICY user_conversations_delete 
  ON public.user_conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_conversations_updated_at
BEFORE UPDATE ON public.user_conversations
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
