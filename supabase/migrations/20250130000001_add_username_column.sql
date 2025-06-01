
-- Add username column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Create unique index on username (allowing null values)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique 
ON profiles (username) 
WHERE username IS NOT NULL;

-- Update existing profiles to set username from display_name or email if username is null
UPDATE profiles 
SET username = COALESCE(
  CASE 
    WHEN display_name IS NOT NULL AND display_name != '' AND display_name != 'Usuário' 
    THEN lower(replace(display_name, ' ', ''))
    WHEN email IS NOT NULL 
    THEN split_part(email, '@', 1)
    ELSE 'user_' || substr(id::text, 1, 8)
  END
)
WHERE username IS NULL OR username = '';

-- Add constraint to ensure username uniqueness
ALTER TABLE profiles 
ADD CONSTRAINT profiles_username_key UNIQUE (username);
