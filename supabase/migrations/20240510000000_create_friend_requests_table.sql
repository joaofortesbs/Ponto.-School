
-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
);

-- Add Row Level Security
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own friend requests
CREATE POLICY "Allow user to send request"
ON friend_requests
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Allow users to see requests they've sent or received
CREATE POLICY "Allow users to view their own requests"
ON friend_requests
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to update requests they're involved with
CREATE POLICY "Allow users to update request status"
ON friend_requests
FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
