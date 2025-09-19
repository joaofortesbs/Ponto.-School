
-- Criar tabela para atividades compartilháveis
CREATE TABLE IF NOT EXISTS public.atividades_compartilhaveis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atividade_id VARCHAR(255) NOT NULL,
  titulo VARCHAR(500) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  dados JSONB NOT NULL DEFAULT '{}',
  criado_por VARCHAR(255) NOT NULL,
  codigo_unico VARCHAR(20) NOT NULL UNIQUE,
  link_publico TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  desativado_em TIMESTAMP WITH TIME ZONE NULL,
  
  -- Índices para performance
  CONSTRAINT uk_atividade_codigo UNIQUE (atividade_id, codigo_unico)
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_atividades_compartilhaveis_atividade_id 
ON public.atividades_compartilhaveis (atividade_id);

CREATE INDEX IF NOT EXISTS idx_atividades_compartilhaveis_codigo_unico 
ON public.atividades_compartilhaveis (codigo_unico);

CREATE INDEX IF NOT EXISTS idx_atividades_compartilhaveis_criado_por 
ON public.atividades_compartilhaveis (criado_por);

CREATE INDEX IF NOT EXISTS idx_atividades_compartilhaveis_ativo 
ON public.atividades_compartilhaveis (ativo);

CREATE INDEX IF NOT EXISTS idx_atividades_compartilhaveis_tipo 
ON public.atividades_compartilhaveis (tipo);

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_atividades_compartilhaveis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar automaticamente o campo atualizado_em
CREATE TRIGGER tr_atividades_compartilhaveis_updated_at
  BEFORE UPDATE ON public.atividades_compartilhaveis
  FOR EACH ROW
  EXECUTE FUNCTION update_atividades_compartilhaveis_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.atividades_compartilhaveis ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (qualquer pessoa pode ler atividades ativas)
CREATE POLICY "Atividades ativas são publicamente legíveis"
ON public.atividades_compartilhaveis
FOR SELECT
USING (ativo = true);

-- Política para inserção (usuários autenticados podem criar)
CREATE POLICY "Usuários podem criar atividades compartilháveis"
ON public.atividades_compartilhaveis
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Política para atualização (apenas o criador pode atualizar)
CREATE POLICY "Criadores podem atualizar suas atividades"
ON public.atividades_compartilhaveis
FOR UPDATE
USING (auth.uid()::text = criado_por OR auth.uid() IS NOT NULL);

-- Política para exclusão (apenas o criador pode deletar)
CREATE POLICY "Criadores podem deletar suas atividades"
ON public.atividades_compartilhaveis
FOR DELETE
USING (auth.uid()::text = criado_por OR auth.uid() IS NOT NULL);

-- Comentários na tabela
COMMENT ON TABLE public.atividades_compartilhaveis IS 'Tabela para armazenar atividades compartilháveis publicamente do School Power';
COMMENT ON COLUMN public.atividades_compartilhaveis.atividade_id IS 'ID único da atividade no sistema';
COMMENT ON COLUMN public.atividades_compartilhaveis.titulo IS 'Título da atividade';
COMMENT ON COLUMN public.atividades_compartilhaveis.tipo IS 'Tipo da atividade (plano-aula, flash-cards, etc.)';
COMMENT ON COLUMN public.atividades_compartilhaveis.dados IS 'Dados JSON da atividade';
COMMENT ON COLUMN public.atividades_compartilhaveis.criado_por IS 'ID do usuário que criou a atividade';
COMMENT ON COLUMN public.atividades_compartilhaveis.codigo_unico IS 'Código único para acesso público (Base62)';
COMMENT ON COLUMN public.atividades_compartilhaveis.link_publico IS 'Link público completo para a atividade';
COMMENT ON COLUMN public.atividades_compartilhaveis.ativo IS 'Se a atividade está ativa para compartilhamento público';
