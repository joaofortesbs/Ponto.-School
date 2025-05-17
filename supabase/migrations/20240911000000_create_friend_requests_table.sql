
-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS friend_requests_sender_id_idx ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS friend_requests_receiver_id_idx ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS friend_requests_status_idx ON public.friend_requests(status);

-- Create a unique constraint to prevent duplicate friend requests
CREATE UNIQUE INDEX IF NOT EXISTS unique_friend_requests_idx ON public.friend_requests(sender_id, receiver_id) 
WHERE status = 'pending' OR status = 'accepted';

-- Enable Row Level Security
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Insert: only the sender can create requests
CREATE POLICY friend_requests_insert_policy ON public.friend_requests 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = sender_id);

-- Select: Only the sender or receiver can view their requests
CREATE POLICY friend_requests_select_policy ON public.friend_requests 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Certifique-se de que a política de visualização de perfis existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow profiles select for all authenticated users'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow profiles select for all authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true)';
    END IF;
END
$$;

-- Update: Only the receiver can update a request (to accept/reject)
CREATE POLICY friend_requests_update_policy ON public.friend_requests 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- Delete: Only the sender or receiver can delete a request
CREATE POLICY friend_requests_delete_policy ON public.friend_requests 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create a function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
