
-- Criação da tabela de conversas
CREATE TABLE IF NOT EXISTS public.conversas (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resumo TEXT,
  favorito BOOLEAN DEFAULT FALSE,
  privado BOOLEAN DEFAULT FALSE,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar comentários à tabela
COMMENT ON TABLE public.conversas IS 'Tabela para armazenar as conversas da IA Epictus';
COMMENT ON COLUMN public.conversas.id IS 'ID único da conversa';
COMMENT ON COLUMN public.conversas.user_id IS 'ID do usuário que criou a conversa';
COMMENT ON COLUMN public.conversas.title IS 'Título da conversa';
COMMENT ON COLUMN public.conversas.resumo IS 'Resumo breve do conteúdo da conversa';
COMMENT ON COLUMN public.conversas.favorito IS 'Indica se a conversa foi marcada como favorita';
COMMENT ON COLUMN public.conversas.privado IS 'Indica se a conversa é privada (visível apenas para o criador)';
COMMENT ON COLUMN public.conversas.categoria IS 'Categoria da conversa (tecnologia, educação, etc.)';
COMMENT ON COLUMN public.conversas.created_at IS 'Data e hora de criação da conversa';
COMMENT ON COLUMN public.conversas.updated_at IS 'Data e hora da última atualização da conversa';

-- Criar índices para melhorar o desempenho das consultas
CREATE INDEX IF NOT EXISTS idx_conversas_user_id ON public.conversas(user_id);
CREATE INDEX IF NOT EXISTS idx_conversas_categoria ON public.conversas(categoria);
CREATE INDEX IF NOT EXISTS idx_conversas_favorito ON public.conversas(favorito);
CREATE INDEX IF NOT EXISTS idx_conversas_updated_at ON public.conversas(updated_at);

-- Criação da tabela de mensagens
CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversas(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isEdited BOOLEAN DEFAULT FALSE
);

-- Adicionar comentários à tabela
COMMENT ON TABLE public.mensagens IS 'Tabela para armazenar as mensagens das conversas da IA Epictus';
COMMENT ON COLUMN public.mensagens.id IS 'ID único da mensagem';
COMMENT ON COLUMN public.mensagens.conversation_id IS 'ID da conversa à qual a mensagem pertence';
COMMENT ON COLUMN public.mensagens.content IS 'Conteúdo da mensagem';
COMMENT ON COLUMN public.mensagens.sender IS 'Remetente da mensagem (usuário ou IA)';
COMMENT ON COLUMN public.mensagens.timestamp IS 'Data e hora em que a mensagem foi enviada';
COMMENT ON COLUMN public.mensagens.isEdited IS 'Indica se a mensagem foi editada';

-- Criar índices para melhorar o desempenho das consultas
CREATE INDEX IF NOT EXISTS idx_mensagens_conversation_id ON public.mensagens(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_timestamp ON public.mensagens(timestamp);

-- Criar uma função para atualizar o timestamp de updated_at na tabela conversas
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversas
  SET updated_at = NEW.timestamp
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar um trigger para chamar a função quando uma nova mensagem for inserida
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON public.mensagens;
CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON public.mensagens
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Configurar políticas de segurança (RLS) para proteger os dados
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Criar políticas para tabela conversas
CREATE POLICY "Usuários podem visualizar suas próprias conversas"
  ON public.conversas
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias conversas"
  ON public.conversas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias conversas"
  ON public.conversas
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias conversas"
  ON public.conversas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Criar políticas para tabela mensagens
CREATE POLICY "Usuários podem visualizar mensagens de suas próprias conversas"
  ON public.mensagens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversas
      WHERE conversas.id = mensagens.conversation_id
      AND conversas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir mensagens em suas próprias conversas"
  ON public.mensagens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversas
      WHERE conversas.id = mensagens.conversation_id
      AND conversas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar mensagens de suas próprias conversas"
  ON public.mensagens
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversas
      WHERE conversas.id = mensagens.conversation_id
      AND conversas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem excluir mensagens de suas próprias conversas"
  ON public.mensagens
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversas
      WHERE conversas.id = mensagens.conversation_id
      AND conversas.user_id = auth.uid()
    )
  );
