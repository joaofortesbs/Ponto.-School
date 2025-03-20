-- Drop the existing constraint if it exists
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS profiles_user_id_unique;

-- Add the constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_unique' AND conrelid = 'profiles'::regclass
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
    END IF;
END
$$;
