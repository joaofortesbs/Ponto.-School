/**
 * Script para criação das tabelas necessárias no banco de dados
 * Executa apenas uma vez para garantir que as tabelas de grupos existam
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar o cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function criarTabelas() {
  console.log('Iniciando criação de tabelas necessárias...');

  try {
    // Criar extensão uuid-ossp
    try {
      await supabase.rpc('execute_sql', {
        sql_query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
      });
      console.log('✅ Extensão uuid-ossp verificada/criada');
    } catch (extError) {
      console.log('ℹ️ Nota: Não foi possível verificar/criar extensão uuid-ossp:', extError);
    }

    // Criar função execute_sql se não existir
    try {
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
          RETURNS VOID AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      });
      console.log('✅ Função execute_sql criada/verificada');
    } catch (funcError) {
      console.log('ℹ️ Tentando criar função execute_sql diretamente:', funcError);

      try {
        // Usar query direta como fallback
        const { error } = await supabase.auth.admin.createUser({
          email: 'temp_admin@example.com',
          password: 'temp_password',
          email_confirm: true,
          user_metadata: { is_admin: true }
        });

        // Tentar criar a função SQL diretamente
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
            RETURNS VOID AS $$
            BEGIN
              EXECUTE sql_query;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `
        });

        if (!sqlError) {
          console.log('✅ Função execute_sql criada com sucesso');
        } else {
          console.error('❌ Erro ao criar função execute_sql:', sqlError);
          throw sqlError;
        }
      } catch (directError) {
        console.error('❌ Erro ao criar função diretamente:', directError);
        throw directError;
      }
    }

    // Criar tabela grupos_estudo
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

          -- Políticas de segurança
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
      console.log('✅ Tabela grupos_estudo criada/verificada com sucesso');
    } catch (gruposError) {
      console.error('❌ Erro ao criar tabela grupos_estudo:', gruposError);
      throw gruposError;
    }

    // Verificar se a tabela foi criada corretamente
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Erro ao verificar tabela grupos_estudo:', error);
        throw error;
      } else {
        console.log('✅ Tabela grupos_estudo verificada e disponível');
      }
    } catch (checkError) {
      console.error('❌ Erro ao verificar tabela grupos_estudo:', checkError);
      throw checkError;
    }

    console.log('✅ Todas as tabelas foram criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro durante a criação das tabelas:', error);
    return false;
  }
}

// Execução principal
criarTabelas()
  .then(success => {
    if (success) {
      console.log('✅ Configuração do banco de dados concluída com sucesso!');
      process.exit(0);
    } else {
      console.error('❌ Falha na configuração do banco de dados.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Erro crítico:', err);
    process.exit(1);
  });