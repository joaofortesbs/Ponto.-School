
-- Criar tabela para bloqueios de membros em grupos
CREATE TABLE IF NOT EXISTS blocked_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create indexes for better performance
CREATE INDEX idx_blocked_group_members_group_id ON blocked_group_members(group_id);
CREATE INDEX idx_blocked_group_members_blocked_user_id ON blocked_group_members(blocked_user_id);

-- Enable Realtime for blocked_group_members table
ALTER PUBLICATION supabase_realtime ADD TABLE blocked_group_members;
