-- Ensure the profiles table has a display_name column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing profiles to use full_name as display_name if it's null
UPDATE profiles SET display_name = full_name WHERE display_name IS NULL;

-- Enable row level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Skip adding to realtime publication since it's already a member
-- alter publication supabase_realtime add table profiles;