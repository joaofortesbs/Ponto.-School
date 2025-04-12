
-- Add index on user_id column to improve query performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_user_id'
    ) THEN
        CREATE INDEX idx_profiles_user_id ON profiles(user_id);
    END IF;
END
$$;
