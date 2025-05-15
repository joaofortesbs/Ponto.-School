// API endpoint para executar a correção de tabelas do banco de dados
const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    console.log('Iniciando correção de tabelas...');

    // Inicializar cliente Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // Verificar conexão
    const { data: connectionTest, error: connectionError } = await supabase.auth.getSession();
    if (connectionError) {
      console.error('❌ Erro de conexão com Supabase:', connectionError);
      return res.status(500).json({ success: false, error: 'Erro de conexão com o banco de dados' });
    }

    console.log('✅ Conexão com Supabase estabelecida');

    // 1. Criar tabela grupos_estudo se não existir
    try {
      const { error } = await supabase.from('grupos_estudo').select('id').limit(1);

      if (error && error.code === '42P01') {
        // Tabela não existe, vamos criá-la
        console.log('Criando tabela grupos_estudo...');

        // Usar RPC execute_sql se disponível
        try {
          await supabase.rpc('execute_sql', {
            sql_query: `
              CREATE TABLE IF NOT EXISTS public.grupos_estudo (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL,
                nome TEXT NOT NULL,
                descricao TEXT,
                cor TEXT NOT NULL DEFAULT '#FF6B00',
                membros INTEGER NOT NULL DEFAULT 1,
                membros_ids JSONB DEFAULT '[]'::jsonb,
                topico TEXT,
                topico_nome TEXT,
                topico_icon TEXT,
                privado BOOLEAN DEFAULT false,
                visibilidade TEXT DEFAULT 'todos',
                codigo TEXT,
                disciplina TEXT DEFAULT 'Geral',
                data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
              );

              CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
              CREATE INDEX IF NOT EXISTS grupos_estudo_codigo_idx ON public.grupos_estudo(codigo);

              ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;

              DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
              CREATE POLICY "Usuários podem visualizar grupos"
                ON public.grupos_estudo FOR SELECT
                USING (true);

              DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
              CREATE POLICY "Usuários podem inserir grupos"
                ON public.grupos_estudo FOR INSERT
                WITH CHECK (true);

              DROP POLICY IF EXISTS "Usuários podem atualizar grupos" ON public.grupos_estudo;
              CREATE POLICY "Usuários podem atualizar grupos"
                ON public.grupos_estudo FOR UPDATE
                USING (true);
            `
          });
          console.log('✅ Tabela grupos_estudo criada com sucesso via RPC');
        } catch (rpcError) {
          console.error('❌ Erro ao usar RPC para criar tabela grupos_estudo:', rpcError);

          // Tentar fazer manualmente usando SQL via API de funções se o RPC falhar
          // (este é um caso de fallback, não deve ser necessário na maioria dos casos)
          return res.status(500).json({ 
            success: false, 
            error: 'Erro ao criar tabelas. Execute o workflow "Corrigir Tabelas de Grupos".'
          });
        }
      } else if (error) {
        console.error('❌ Erro ao verificar tabela grupos_estudo:', error);
        return res.status(500).json({ success: false, error: 'Erro ao verificar tabela grupos_estudo' });
      } else {
        console.log('✅ Tabela grupos_estudo já existe');
      }
    } catch (tableError) {
      console.error('❌ Exceção ao verificar/criar tabela grupos_estudo:', tableError);
      return res.status(500).json({ success: false, error: 'Erro ao verificar/criar tabela grupos_estudo' });
    }

    // Verificar se a tabela foi criada corretamente
    try {
      const { data, error } = await supabase.from('grupos_estudo').select('id').limit(1);

      if (error) {
        console.error('❌ Verificação da tabela grupos_estudo falhou:', error);
        return res.status(500).json({ success: false, error: 'Verificação da tabela grupos_estudo falhou' });
      }

      console.log('✅ Tabela grupos_estudo verificada com sucesso');
    } catch (verifyError) {
      console.error('❌ Erro ao verificar tabela após criação:', verifyError);
      return res.status(500).json({ success: false, error: 'Erro ao verificar tabela após criação' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Tabelas corrigidas com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro no endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Erro no endpoint: ${error.message}`,
      error: error.toString() 
    });
  }
}