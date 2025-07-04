
-- Drop and recreate the block_user_from_group function with correct parameter names
DROP FUNCTION IF EXISTS block_user_from_group(uuid, uuid, text);

CREATE OR REPLACE FUNCTION block_user_from_group(
  p_group_id UUID,
  p_user_to_block_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  group_creator_id UUID;
BEGIN
  -- Check if the current user is the group creator
  SELECT ge.criador_id INTO group_creator_id 
  FROM grupos_estudo ge 
  WHERE ge.id = p_group_id;
  
  IF group_creator_id != auth.uid() THEN
    RAISE EXCEPTION 'Only group creators can block members';
  END IF;
  
  -- Insert the block record with explicit column references
  INSERT INTO blocked_group_members (group_id, blocked_user_id, blocked_by_user_id, reason)
  VALUES (p_group_id, p_user_to_block_id, auth.uid(), p_reason)
  ON CONFLICT (group_id, blocked_user_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also recreate the is_user_blocked_from_group function with explicit parameters
DROP FUNCTION IF EXISTS is_user_blocked_from_group(uuid, uuid);

CREATE OR REPLACE FUNCTION is_user_blocked_from_group(p_user_id UUID, p_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_group_members bgm
    WHERE bgm.blocked_user_id = p_user_id 
    AND bgm.group_id = p_group_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
