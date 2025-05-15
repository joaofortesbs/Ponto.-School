/**
 * Script para verificar e corrigir tabelas de grupos e códigos
 * Versão simplificada e melhorada
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Obter variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY não definidas');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Função principal para verificar e corrigir as tabelas
 */
async function verificarECorrigirTabelas() {
  console.log('🔍 Iniciando verificação e correção de tabelas de grupos...');

  try {
    // 1. Verificar extensão UUID
    console.log('Verificando extensão uuid-ossp...');
    try {
      await supabase.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      console.log('✅ Extensão uuid-ossp verificada/criada com sucesso');
    } catch (extError) {
      console.log('ℹ️ Informação: Não foi possível verificar extensão uuid-ossp (isto pode ser normal)');
    }

    // 2. Verificar e criar tabela grupos_estudo
    console.log('Verificando tabela grupos_estudo...');
    let gruposExistem = false;

    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('id', { count: 'exact', head: true })
        .limit(1);

      if (!error) {
        gruposExistem = true;
        console.log('✅ Tabela grupos_estudo existe');
      }
    } catch (checkError) {
      console.log('Tabela grupos_estudo não detectada, será criada');
    }

    if (!gruposExistem) {
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
        console.log('✅ Tabela grupos_estudo criada com sucesso');
      } catch (createError) {
        console.error('❌ Erro ao criar tabela grupos_estudo:', createError);
        return false;
      }
    }

    // 3. Verificar e criar tabela codigos_grupos_estudo
    console.log('Verificando tabela codigos_grupos_estudo...');
    let codigosExistem = false;

    try {
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo', { count: 'exact', head: true })
        .limit(1);

      if (!error) {
        codigosExistem = true;
        console.log('✅ Tabela codigos_grupos_estudo existe');
      }
    } catch (checkError) {
      console.log('Tabela codigos_grupos_estudo não detectada, será criada');
    }

    if (!codigosExistem) {
      console.log('Criando tabela codigos_grupos_estudo...');
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
            codigo TEXT PRIMARY KEY,
            grupo_id UUID NOT NULL,
            nome TEXT NOT NULL,
            descricao TEXT,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
            user_id UUID,
            privado BOOLEAN DEFAULT false,
            membros INTEGER DEFAULT 1,
            visibilidade TEXT DEFAULT 'todos',
            disciplina TEXT DEFAULT 'Geral',
            cor TEXT DEFAULT '#FF6B00',
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
        console.log('✅ Tabela codigos_grupos_estudo criada com sucesso');
      } catch (createError) {
        console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', createError);
        return false;
      }
    }

    // 4. Testar acesso às tabelas para confirmar que estão funcionando
    console.log('Testando acesso às tabelas...');
    try {
      // Teste de acesso a grupos_estudo
      const { error: gruposError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);

      if (gruposError) {
        console.error('❌ Erro ao acessar tabela grupos_estudo:', gruposError);
        return false;
      }

      // Teste de acesso a codigos_grupos_estudo
      const { error: codigosError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);

      if (codigosError) {
        console.error('❌ Erro ao acessar tabela codigos_grupos_estudo:', codigosError);
        return false;
      }

      console.log('✅ Acesso às tabelas confirmado com sucesso');
    } catch (testError) {
      console.error('❌ Erro ao testar acesso às tabelas:', testError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Erro durante a verificação e correção de tabelas:', error);
    return false;
  }
}

// Executar a função principal
verificarECorrigirTabelas()
  .then(success => {
    if (success) {
      console.log('🎉 Verificação e correção de tabelas concluída com SUCESSO!');

      // Perguntar se deseja sincronizar códigos
      console.log('\n💡 DICA: Execute o workflow "Sincronizar Códigos de Grupos" para garantir que todos os códigos estejam sincronizados.');

      process.exit(0);
    } else {
      console.error('⚠️ Verificação e correção de tabelas concluída com ERROS.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Erro fatal durante a execução:', err);
    process.exit(1);
  });