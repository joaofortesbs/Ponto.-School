
-- Cria a tabela user_streak para armazenar sequências de estudos dos usuários
CREATE TABLE IF NOT EXISTS public.user_streak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dias_consecutivos INTEGER NOT NULL DEFAULT 0,
  recorde_dias INTEGER NOT NULL DEFAULT 0,
  dias_para_proximo_nivel INTEGER NOT NULL DEFAULT 3,
  meta_diaria INTEGER NOT NULL DEFAULT 5,
  proxima_recompensa TEXT NOT NULL DEFAULT 'Badge Iniciante',
  ultimo_check_in TIMESTAMP WITH TIME ZONE,
  eventos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Cria índice para otimizar consultas por user_id
CREATE INDEX IF NOT EXISTS idx_user_streak_user_id ON public.user_streak(user_id);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_user_streak_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp quando a tabela for atualizada
DROP TRIGGER IF EXISTS trigger_update_user_streak_timestamp ON public.user_streak;
CREATE TRIGGER trigger_update_user_streak_timestamp
BEFORE UPDATE ON public.user_streak
FOR EACH ROW
EXECUTE FUNCTION update_user_streak_updated_at();

-- RLS (Row Level Security) para proteger os dados
ALTER TABLE public.user_streak ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Usuários podem ver apenas seus próprios dados de sequência"
  ON public.user_streak
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas seus próprios dados
CREATE POLICY "Usuários podem atualizar apenas seus próprios dados de sequência"
  ON public.user_streak
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios dados
CREATE POLICY "Usuários podem inserir apenas seus próprios dados de sequência"
  ON public.user_streak
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários excluam apenas seus próprios dados
CREATE POLICY "Usuários podem excluir apenas seus próprios dados de sequência"
  ON public.user_streak
  FOR DELETE
  USING (auth.uid() = user_id);

-- Adiciona permissões para funções anônimas e autenticadas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_streak TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.user_streak_id_seq TO anon, authenticated;
