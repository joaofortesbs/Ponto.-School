
-- Fix the block_user_from_group function to avoid column ambiguity
CREATE OR REPLACE FUNCTION block_user_from_group(
  p_group_id UUID,
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
  WHERE grupos_estudo.id = p_group_id;
  
  IF group_creator_id != auth.uid() THEN
    RAISE EXCEPTION 'Only group creators can block members';
  END IF;
  
  -- Insert the block record with explicit column references
  INSERT INTO blocked_group_members (group_id, blocked_user_id, blocked_by_user_id, reason)
  VALUES (p_group_id, user_to_block_id, auth.uid(), reason)
  ON CONFLICT (group_id, blocked_user_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix the is_user_blocked_from_group function
CREATE OR REPLACE FUNCTION is_user_blocked_from_group(p_user_id UUID, p_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_group_members 
    WHERE blocked_group_members.blocked_user_id = p_user_id 
    AND blocked_group_members.group_id = p_group_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
