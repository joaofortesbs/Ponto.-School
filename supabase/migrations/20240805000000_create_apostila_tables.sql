
-- Criação das tabelas para a integração Caderno → Apostila Inteligente

-- Tabela para anotações do caderno
CREATE TABLE IF NOT EXISTS public.caderno_anotacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  modelo_anotacao TEXT,
  tags TEXT[] DEFAULT '{}',
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'rascunho' -- 'rascunho', 'exportado', etc.
);

-- Tabela para pastas da apostila
CREATE TABLE IF NOT EXISTS public.apostila_pastas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#42C5F5',
  descricao TEXT,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para anotações da apostila
CREATE TABLE IF NOT EXISTS public.apostila_anotacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  pasta_id UUID REFERENCES public.apostila_pastas(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  modelo_anotacao TEXT,
  tags TEXT[] DEFAULT '{}',
  favorito BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_exportacao TIMESTAMPTZ DEFAULT NOW(),
  origem TEXT DEFAULT 'criado_na_apostila', -- 'caderno' ou 'criado_na_apostila'
  visualizacoes INTEGER DEFAULT 0
);

-- Tabela para log de atividades
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  acao TEXT NOT NULL,
  anotacao_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  detalhes TEXT
);

-- Índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_caderno_anotacoes_user_id ON public.caderno_anotacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_apostila_pastas_user_id ON public.apostila_pastas(user_id);
CREATE INDEX IF NOT EXISTS idx_apostila_anotacoes_user_id ON public.apostila_anotacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_apostila_anotacoes_pasta_id ON public.apostila_anotacoes(pasta_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_anotacao_id ON public.user_activity_logs(anotacao_id);

-- Políticas de segurança para RLS (Row Level Security)
ALTER TABLE public.caderno_anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apostila_pastas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apostila_anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para caderno_anotacoes
CREATE POLICY "Usuários podem ver suas próprias anotações do caderno" 
ON public.caderno_anotacoes FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem criar suas próprias anotações do caderno" 
ON public.caderno_anotacoes FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias anotações do caderno" 
ON public.caderno_anotacoes FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem excluir suas próprias anotações do caderno" 
ON public.caderno_anotacoes FOR DELETE 
USING (auth.uid()::text = user_id);

-- Políticas para apostila_pastas
CREATE POLICY "Usuários podem ver suas próprias pastas da apostila" 
ON public.apostila_pastas FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem criar suas próprias pastas da apostila" 
ON public.apostila_pastas FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias pastas da apostila" 
ON public.apostila_pastas FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem excluir suas próprias pastas da apostila" 
ON public.apostila_pastas FOR DELETE 
USING (auth.uid()::text = user_id);

-- Políticas para apostila_anotacoes
CREATE POLICY "Usuários podem ver suas próprias anotações da apostila" 
ON public.apostila_anotacoes FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem criar suas próprias anotações da apostila" 
ON public.apostila_anotacoes FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias anotações da apostila" 
ON public.apostila_anotacoes FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem excluir suas próprias anotações da apostila" 
ON public.apostila_anotacoes FOR DELETE 
USING (auth.uid()::text = user_id);

-- Políticas para user_activity_logs
CREATE POLICY "Usuários podem ver seus próprios logs de atividade" 
ON public.user_activity_logs FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem criar seus próprios logs de atividade" 
ON public.user_activity_logs FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);
