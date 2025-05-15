// Script para corrigir/criar tabelas necessárias para os grupos de estudo
const { createClient } = require('@supabase/supabase-js');

// Obter credenciais do ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function criarTabelasNecessarias() {
  console.log('Iniciando criação de tabelas necessárias para grupos de estudo...');

  try {
    // Verificar e criar extensão uuid se possível
    try {
      await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      console.log('✅ Extensão uuid-ossp verificada/criada');
    } catch (extError) {
      console.log('ℹ️ Não foi possível verificar/criar extensão uuid-ossp. Isso pode não ser um problema em alguns ambientes:', extError.message);
    }

    // Criar tabela grupos_estudo
    console.log('Criando tabela grupos_estudo...');
    try {
      await supabase.query(`
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
      `);
      console.log('✅ Tabela grupos_estudo criada com sucesso!');
    } catch (gruposError) {
      console.error('❌ Erro ao criar tabela grupos_estudo:', gruposError.message);
      throw gruposError;
    }

    // Criar tabela codigos_grupos_estudo
    console.log('Criando tabela codigos_grupos_estudo...');
    try {
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
          codigo VARCHAR(15) PRIMARY KEY,
          grupo_id UUID NOT NULL,
          nome VARCHAR NOT NULL,
          descricao TEXT,
          data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
          user_id UUID,
          privado BOOLEAN DEFAULT false,
          membros INTEGER DEFAULT 1,
          visibilidade VARCHAR,
          disciplina VARCHAR,
          cor VARCHAR DEFAULT '#FF6B00',
          membros_ids JSONB DEFAULT '[]'::jsonb,
          ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
        CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);

        ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem visualizar códigos"
          ON public.codigos_grupos_estudo FOR SELECT
          USING (true);

        DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem inserir códigos"
          ON public.codigos_grupos_estudo FOR INSERT
          WITH CHECK (true);

        DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem atualizar códigos"
          ON public.codigos_grupos_estudo FOR UPDATE
          USING (true);
      `);
      console.log('✅ Tabela codigos_grupos_estudo criada com sucesso!');
    } catch (codigosError) {
      console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', codigosError.message);
      throw codigosError;
    }

    // Verificar se foi possível criar as tabelas
    try {
      const { count: gruposCount, error: gruposError } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (gruposError) {
        console.error('❌ Erro ao verificar tabela grupos_estudo:', gruposError.message);
      } else {
        console.log(`✅ Verificação concluída: Tabela grupos_estudo existe com ${gruposCount || 0} registros`);
      }

      const { count: codigosCount, error: codigosError } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (codigosError) {
        console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', codigosError.message);
      } else {
        console.log(`✅ Verificação concluída: Tabela codigos_grupos_estudo existe com ${codigosCount || 0} registros`);
      }
    } catch (verifyError) {
      console.error('❌ Erro ao verificar tabelas:', verifyError.message);
    }

    console.log('🎉 Processo de criação de tabelas finalizado!');
    return true;
  } catch (error) {
    console.error('❌ Erro durante a criação das tabelas:', error.message);
    return false;
  }
}

// Executar o processo de criação de tabelas
criarTabelasNecessarias()
  .then(resultado => {
    if (resultado) {
      console.log('✅ SUCESSO: Tabelas criadas/verificadas com sucesso!');
      process.exit(0);
    } else {
      console.error('❌ ERRO: Falha na criação das tabelas.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ EXCEÇÃO:', err);
    process.exit(1);
  });