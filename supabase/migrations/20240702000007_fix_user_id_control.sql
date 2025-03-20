-- Drop the existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS user_id_control;

-- Create the user_id_control table
CREATE TABLE IF NOT EXISTS user_id_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_id INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial record if none exists
INSERT INTO user_id_control (last_id)
SELECT 1000
WHERE NOT EXISTS (SELECT 1 FROM user_id_control);

-- Enable row level security
ALTER TABLE user_id_control ENABLE ROW LEVEL SECURITY;

-- Create policy for administrators
DROP POLICY IF EXISTS "Administrators can manage user_id_control" ON user_id_control;
CREATE POLICY "Administrators can manage user_id_control"
ON user_id_control
FOR ALL
USING (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.uid() = auth.uid()));

-- Enable realtime
alter publication supabase_realtime add table user_id_control;
