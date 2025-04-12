
-- Atualiza o trigger de criação de perfil para incluir geração de ID de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  gen_user_id TEXT;
  user_plan TEXT;
BEGIN
  -- Define o plano padrão como 'lite' caso não esteja definido nos metadados
  user_plan := COALESCE(NEW.raw_user_meta_data->>'plan_type', 'lite');
  
  -- Gera um ID de usuário com formato BR + AnoMês + TipoConta(2=lite, 1=premium) + 6 dígitos aleatórios
  gen_user_id := 'BR' || 
                 to_char(NOW(), 'YYMM') || 
                 CASE WHEN user_plan = 'premium' THEN '1' ELSE '2' END ||
                 lpad(floor(random() * 1000000)::text, 6, '0');
  
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    full_name,
    username,
    institution,
    user_id,
    plan_type,
    role,
    birth_date
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'institution',
    gen_user_id,
    user_plan,
    'student',
    (NEW.raw_user_meta_data->>'birth_date')::DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualiza todos os perfis existentes que não têm ID
CREATE OR REPLACE FUNCTION update_missing_user_ids()
RETURNS void AS $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id, email, plan_type FROM profiles WHERE user_id IS NULL OR user_id = '' LOOP
    UPDATE profiles 
    SET user_id = 'BR' || 
                  to_char(NOW(), 'YYMM') || 
                  CASE WHEN profile_record.plan_type = 'premium' THEN '1' ELSE '2' END ||
                  lpad(floor(random() * 1000000)::text, 6, '0'),
        updated_at = NOW()
    WHERE id = profile_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute a função para atualizar perfis existentes
SELECT update_missing_user_ids();
