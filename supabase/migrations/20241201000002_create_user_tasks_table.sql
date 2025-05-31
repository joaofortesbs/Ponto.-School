
-- Criar tabela user_tasks se ela não existir ou atualizá-la
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  due_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance de consultas por user_id
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks(user_id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_tasks_updated_at_trigger
    BEFORE UPDATE ON public.user_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_user_tasks_updated_at();

-- Habilitar RLS
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
