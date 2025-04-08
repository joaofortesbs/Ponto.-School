
-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the function with all fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username, 
    email,
    display_name,
    institution,
    birth_date,
    plan_type,
    level,
    rank
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name', 
      NEW.raw_user_meta_data->>'username', 
      NEW.raw_user_meta_data->>'full_name', 
      NEW.email
    ),
    NEW.raw_user_meta_data->>'institution',
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    NEW.raw_user_meta_data->>'plan_type',
    1,
    'Aprendiz'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
