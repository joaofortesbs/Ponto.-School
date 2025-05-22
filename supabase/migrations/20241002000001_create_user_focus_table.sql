-- Create user_focus table to store user's daily focus data
CREATE TABLE IF NOT EXISTS user_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  disciplines TEXT[] DEFAULT '{}',
  study_time INTEGER DEFAULT 120, -- in minutes
  tasks JSONB DEFAULT '[]',
  emotional_state TEXT,
  mentor_tip TEXT, -- Dica personalizada do mentor
  completed BOOLEAN DEFAULT FALSE,
  points_awarded BOOLEAN DEFAULT FALSE, -- Indica se pontos foram concedidos ao concluir
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to automatically update updated_at on any update
CREATE OR REPLACE FUNCTION update_user_focus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER user_focus_updated_at
BEFORE UPDATE ON user_focus
FOR EACH ROW
EXECUTE FUNCTION update_user_focus_updated_at();

-- Index to improve query performance
CREATE INDEX IF NOT EXISTS user_focus_user_id_idx ON user_focus(user_id);
CREATE INDEX IF NOT EXISTS user_focus_created_at_idx ON user_focus(created_at);
CREATE INDEX IF NOT EXISTS user_focus_completed_idx ON user_focus(completed);

-- Add RLS policies
ALTER TABLE user_focus ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own focus data
CREATE POLICY user_focus_select_policy ON user_focus 
  FOR SELECT USING (auth.uid() = user_id);

-- Only allow users to insert their own focus data
CREATE POLICY user_focus_insert_policy ON user_focus 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own focus data
CREATE POLICY user_focus_update_policy ON user_focus 
  FOR UPDATE USING (auth.uid() = user_id);

-- Only allow users to delete their own focus data
CREATE POLICY user_focus_delete_policy ON user_focus 
  FOR DELETE USING (auth.uid() = user_id);