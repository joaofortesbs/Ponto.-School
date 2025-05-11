CREATE TABLE IF NOT EXISTS public.grupos_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT NOT NULL DEFAULT '#FF6B00',
  membros INTEGER NOT NULL DEFAULT 1,
  topico TEXT,
  topico_nome TEXT,
  topico_icon TEXT,
  privado BOOLEAN DEFAULT false,
  visibilidade TEXT DEFAULT 'todos',
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_inicio TEXT,
  codigo TEXT UNIQUE -- Código único para compartilhamento do grupo
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);

-- Grant access to authenticated users
ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own grupos_estudo"
  ON public.grupos_estudo FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grupos_estudo"
  ON public.grupos_estudo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grupos_estudo"
  ON public.grupos_estudo FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grupos_estudo"
  ON public.grupos_estudo FOR DELETE
  USING (auth.uid() = user_id);