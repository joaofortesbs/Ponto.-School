
-- Create a table for managing group access requests
CREATE TABLE IF NOT EXISTS public.grupos_solicitacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grupo_id UUID NOT NULL REFERENCES public.grupos_estudo(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_resposta TIMESTAMP WITH TIME ZONE,
  respondido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  motivo_resposta TEXT,
  UNIQUE(grupo_id, user_id, status)
);

-- Create indexes for performance
CREATE INDEX idx_grupos_solicitacoes_grupo_id ON public.grupos_solicitacoes(grupo_id);
CREATE INDEX idx_grupos_solicitacoes_user_id ON public.grupos_solicitacoes(user_id);
CREATE INDEX idx_grupos_solicitacoes_status ON public.grupos_solicitacoes(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.grupos_solicitacoes ENABLE ROW LEVEL SECURITY;

-- Policy for admin of the group (can see all requests for their groups)
CREATE POLICY "Administradores podem ver todas solicitações de seus grupos" 
ON public.grupos_solicitacoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.grupos_estudo 
    WHERE grupos_estudo.id = grupos_solicitacoes.grupo_id 
    AND grupos_estudo.user_id = auth.uid()
  )
);

-- Policy for user to see their own requests
CREATE POLICY "Usuários podem ver suas próprias solicitações" 
ON public.grupos_solicitacoes 
FOR SELECT 
USING (
  user_id = auth.uid()
);

-- Policy for admins to update request status
CREATE POLICY "Administradores podem responder solicitações" 
ON public.grupos_solicitacoes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.grupos_estudo 
    WHERE grupos_estudo.id = grupos_solicitacoes.grupo_id 
    AND grupos_estudo.user_id = auth.uid()
  )
);

-- Policy for users to create requests
CREATE POLICY "Usuários podem criar solicitações" 
ON public.grupos_solicitacoes 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid()
);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.grupos_solicitacoes TO authenticated;
