
-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure a user cannot send multiple requests to the same person
  CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)
);

-- Add indexes for better performance
CREATE INDEX friend_requests_sender_id_idx ON public.friend_requests (sender_id);
CREATE INDEX friend_requests_receiver_id_idx ON public.friend_requests (receiver_id);
CREATE INDEX friend_requests_status_idx ON public.friend_requests (status);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only insert requests where they are the sender
CREATE POLICY friend_requests_insert_policy
  ON public.friend_requests
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can only select requests where they are the sender or receiver
CREATE POLICY friend_requests_select_policy
  ON public.friend_requests
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can only update their own received requests
CREATE POLICY friend_requests_update_policy
  ON public.friend_requests
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Policy: Users can only delete their own sent requests
CREATE POLICY friend_requests_delete_policy
  ON public.friend_requests
  FOR DELETE
  USING (auth.uid() = sender_id);

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_friend_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friend_requests_timestamp
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW
EXECUTE FUNCTION update_friend_requests_updated_at();
