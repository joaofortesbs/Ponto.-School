
-- Adicionar campos para armazenar atividades geradas e campos dinâmicos
ALTER TABLE school_power_templates 
ADD COLUMN IF NOT EXISTS fields JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_generated_preview TEXT,
ADD COLUMN IF NOT EXISTS last_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS generation_count INTEGER DEFAULT 0;

-- Criar tabela para armazenar atividades geradas
CREATE TABLE IF NOT EXISTS generated_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT REFERENCES school_power_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  form_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'in_construction', 'completed', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar RLS
ALTER TABLE generated_activities ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver suas atividades" ON generated_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar atividades" ON generated_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas atividades" ON generated_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas atividades" ON generated_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_generated_activities_template_id ON generated_activities(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_activities_user_id ON generated_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_activities_status ON generated_activities(status);
CREATE INDEX IF NOT EXISTS idx_generated_activities_created_at ON generated_activities(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_generated_activities_updated_at 
  BEFORE UPDATE ON generated_activities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
