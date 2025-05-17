
-- Criar tabela para armazenar as tarefas do usuário
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.user_tasks IS 'Armazena as tarefas dos usuários';
COMMENT ON COLUMN public.user_tasks.id IS 'ID único da entrada de tarefas';
COMMENT ON COLUMN public.user_tasks.user_id IS 'ID do usuário dono das tarefas';
COMMENT ON COLUMN public.user_tasks.tasks IS 'Array JSON contendo as tarefas do usuário';
COMMENT ON COLUMN public.user_tasks.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.user_tasks.updated_at IS 'Data da última atualização do registro';

-- Criar índice para otimizar consultas por user_id
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks (user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
-- Política para permitir que usuários vejam apenas suas próprias tarefas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias tarefas" ON public.user_tasks;
CREATE POLICY "Usuários podem ver suas próprias tarefas"
  ON public.user_tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Política para permitir que usuários criem suas próprias tarefas
DROP POLICY IF EXISTS "Usuários podem criar suas próprias tarefas" ON public.user_tasks;
CREATE POLICY "Usuários podem criar suas próprias tarefas"
  ON public.user_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias tarefas
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias tarefas" ON public.user_tasks;
CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
  ON public.user_tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam suas próprias tarefas
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias tarefas" ON public.user_tasks;
CREATE POLICY "Usuários podem excluir suas próprias tarefas"
  ON public.user_tasks FOR DELETE
  USING (auth.uid() = user_id);
