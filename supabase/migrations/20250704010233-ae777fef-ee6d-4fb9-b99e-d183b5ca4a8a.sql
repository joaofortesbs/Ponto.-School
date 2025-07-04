
-- Create table for blocked group members
CREATE TABLE IF NOT EXISTS blocked_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure a user can only be blocked once per group
  UNIQUE(group_id, blocked_user_id)
);

-- Enable Row Level Security
ALTER TABLE blocked_group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for blocked_group_members
CREATE POLICY "Group creators can view blocked members in their groups" 
  ON blocked_group_members FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM grupos_estudo 
    WHERE grupos_estudo.id = blocked_group_members.group_id 
    AND grupos_estudo.criador_id = auth.uid()
  ));

CREATE POLICY "Group creators can block members in their groups" 
  ON blocked_group_members FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM grupos_estudo 
    WHERE grupos_estudo.id = blocked_group_members.group_id 
    AND grupos_estudo.criador_id = auth.uid()
  ));

CREATE POLICY "Group creators can unblock members in their groups" 
  ON blocked_group_members FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM grupos_estudo 
    WHERE grupos_estudo.id = blocked_group_members.group_id 
    AND grupos_estudo.criador_id = auth.uid()
  ));

-- Create function to check if user is blocked from a group
CREATE OR REPLACE FUNCTION is_user_blocked_from_group(user_id UUID, group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_group_members 
    WHERE blocked_user_id = user_id AND group_id = group_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to block a user from a group
CREATE OR REPLACE FUNCTION block_user_from_group(
  group_id UUID,
  user_to_block_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  group_creator_id UUID;
BEGIN
  -- Check if the current user is the group creator
  SELECT criador_id INTO group_creator_id 
  FROM grupos_estudo 
  WHERE id = group_id;
  
  IF group_creator_id != auth.uid() THEN
    RAISE EXCEPTION 'Only group creators can block members';
  END IF;
  
  -- Insert the block record
  INSERT INTO blocked_group_members (group_id, blocked_user_id, blocked_by_user_id, reason)
  VALUES (group_id, user_to_block_id, auth.uid(), reason)
  ON CONFLICT (group_id, blocked_user_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_blocked_group_members_group_id ON blocked_group_members(group_id);
CREATE INDEX idx_blocked_group_members_blocked_user_id ON blocked_group_members(blocked_user_id);
