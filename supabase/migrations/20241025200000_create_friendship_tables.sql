
-- Função auxiliar para obter o ID do usuário atual a partir do token JWT
CREATE OR REPLACE FUNCTION current_user_id() 
RETURNS UUID 
LANGUAGE SQL STABLE
AS $$
  SELECT auth.uid();
$$;

-- Tabela de solicitações de amizade
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)
);

-- Tabela de amizades
CREATE TABLE IF NOT EXISTS public.friendships (
  id SERIAL PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id),
  user2_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_friendship UNIQUE (user1_id, user2_id)
);

-- Habilitando RLS (Row Level Security)
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para solicitações de amizade
CREATE POLICY "user_requests_select" ON public.friend_requests
  FOR SELECT USING (sender_id = current_user_id() OR receiver_id = current_user_id());

CREATE POLICY "user_requests_insert" ON public.friend_requests
  FOR INSERT WITH CHECK (sender_id = current_user_id());

CREATE POLICY "user_requests_update" ON public.friend_requests
  FOR UPDATE USING (
    (sender_id = current_user_id() AND OLD.status = 'pending') OR 
    (receiver_id = current_user_id() AND OLD.status = 'pending')
  );

CREATE POLICY "user_requests_delete" ON public.friend_requests
  FOR DELETE USING (sender_id = current_user_id() OR receiver_id = current_user_id());

-- Políticas de RLS para amizades
CREATE POLICY "user_friendships_select" ON public.friendships
  FOR SELECT USING (user1_id = current_user_id() OR user2_id = current_user_id());

CREATE POLICY "user_friendships_insert" ON public.friendships
  FOR INSERT WITH CHECK (
    user1_id = current_user_id() OR user2_id = current_user_id()
  );

CREATE POLICY "user_friendships_update" ON public.friendships
  FOR UPDATE USING (
    user1_id = current_user_id() OR user2_id = current_user_id()
  );

CREATE POLICY "user_friendships_delete" ON public.friendships
  FOR DELETE USING (
    user1_id = current_user_id() OR user2_id = current_user_id()
  );

-- Índices para otimização de consultas
CREATE INDEX idx_friend_requests ON public.friend_requests (sender_id, receiver_id);
CREATE INDEX idx_friendships ON public.friendships (user1_id, user2_id);

-- Trigger para criar amizade automaticamente quando uma solicitação é aceita
CREATE OR REPLACE FUNCTION handle_accepted_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Insere na tabela de amizades apenas se ainda não existir
    INSERT INTO public.friendships (user1_id, user2_id)
    VALUES (NEW.sender_id, NEW.receiver_id)
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
    
    -- Tenta também com os IDs invertidos para garantir que não exista duplicidade
    INSERT INTO public.friendships (user1_id, user2_id)
    VALUES (NEW.receiver_id, NEW.sender_id)
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friend_request_accepted
  AFTER UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_accepted_friend_request();

-- Habilitar realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
