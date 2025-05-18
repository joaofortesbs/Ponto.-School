
-- Criação da tabela para armazenar as tarefas dos usuários
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance de consultas por user_id
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks(user_id);

-- Permissões da tabela
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (apenas o próprio usuário pode acessar seus dados)
CREATE POLICY "Usuários podem visualizar suas próprias tarefas"
  ON public.user_tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias tarefas"
  ON public.user_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
  ON public.user_tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias tarefas"
  ON public.user_tasks
  FOR DELETE
  USING (auth.uid() = user_id);
