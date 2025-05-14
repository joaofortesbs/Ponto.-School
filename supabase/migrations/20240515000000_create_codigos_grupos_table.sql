
-- Tabela para códigos únicos de grupos de estudo
CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
  codigo VARCHAR(10) PRIMARY KEY,
  grupo_id UUID NOT NULL REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  descricao TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  privado BOOLEAN DEFAULT false,
  membros INTEGER DEFAULT 1,
  visibilidade VARCHAR,
  disciplina VARCHAR,
  cor VARCHAR DEFAULT '#FF6B00',
  membros_ids JSONB DEFAULT '[]'::jsonb,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);

-- Função para atualizar o timestamp de última atualização
CREATE OR REPLACE FUNCTION update_codigos_grupos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualização automática do timestamp
CREATE TRIGGER update_codigos_grupos_timestamp
BEFORE UPDATE ON public.codigos_grupos_estudo
FOR EACH ROW EXECUTE FUNCTION update_codigos_grupos_timestamp();

-- Função para sincronizar automaticamente os dados do grupo de estudo com a tabela de códigos
CREATE OR REPLACE FUNCTION sync_grupo_to_codigo()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o grupo tem um código, atualize a tabela de códigos
  IF NEW.codigo IS NOT NULL THEN
    INSERT INTO public.codigos_grupos_estudo(
      codigo, 
      grupo_id, 
      nome, 
      descricao, 
      user_id, 
      privado, 
      membros, 
      visibilidade, 
      disciplina, 
      cor, 
      membros_ids
    ) VALUES (
      NEW.codigo,
      NEW.id,
      NEW.nome,
      NEW.descricao,
      NEW.user_id,
      NEW.privado,
      NEW.membros,
      NEW.visibilidade,
      NEW.disciplina,
      NEW.cor,
      COALESCE(NEW.membros_ids, '[]'::jsonb)
    )
    ON CONFLICT (codigo) 
    DO UPDATE SET
      nome = EXCLUDED.nome,
      descricao = EXCLUDED.descricao,
      user_id = EXCLUDED.user_id,
      privado = EXCLUDED.privado,
      membros = EXCLUDED.membros,
      visibilidade = EXCLUDED.visibilidade,
      disciplina = EXCLUDED.disciplina,
      cor = EXCLUDED.cor,
      membros_ids = EXCLUDED.membros_ids,
      ultima_atualizacao = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar os dados automaticamente
CREATE TRIGGER sync_grupo_to_codigo
AFTER INSERT OR UPDATE ON public.grupos_estudo
FOR EACH ROW EXECUTE FUNCTION sync_grupo_to_codigo();

-- Políticas de segurança para a tabela de códigos
ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;

-- Política para leitura universal dentro da plataforma
CREATE POLICY "Todos os usuários podem visualizar códigos de grupos"
  ON public.codigos_grupos_estudo FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para inserção de códigos
CREATE POLICY "Usuários podem inserir novos códigos de grupos"
  ON public.codigos_grupos_estudo FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização de códigos apenas pelo criador do grupo
CREATE POLICY "Apenas criadores podem atualizar informações de códigos"
  ON public.codigos_grupos_estudo FOR UPDATE
  USING (auth.uid() = user_id);
