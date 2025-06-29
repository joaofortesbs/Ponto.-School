
-- Criar tabela para mensagens dos grupos
CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL,
  user_id UUID NOT NULL,
  conteudo TEXT NOT NULL CHECK (length(conteudo) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_grupo_id ON public.mensagens(grupo_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON public.mensagens(created_at);

-- Habilitar RLS
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas membros do grupo podem ver/enviar mensagens
CREATE POLICY "Membros podem ver mensagens do grupo" ON public.mensagens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.membros_grupos 
      WHERE grupo_id = mensagens.grupo_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Membros podem enviar mensagens" ON public.mensagens
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.membros_grupos 
      WHERE grupo_id = mensagens.grupo_id 
      AND user_id = auth.uid()
    )
  );

-- Habilitar Realtime para a tabela
ALTER TABLE public.mensagens REPLICA IDENTITY FULL;
