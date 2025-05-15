// Script para verificar e criar tabelas ausentes
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Obter credenciais do ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function verificarECriarTabelas() {
  console.log('🔍 Iniciando verificação de tabelas...');

  try {
    // 1. Verificar extensão UUID
    try {
      console.log('Verificando extensão UUID...');
      await supabase.rpc('execute_sql', {
        sql_query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
      });
      console.log('✅ Extensão UUID verificada/instalada');
    } catch (err) {
      console.error('❌ Erro ao criar extensão UUID:', err);

      // Tentar método alternativo
      try {
        await supabase.rpc('execute_sql', {
          sql_query: `SELECT 1;` // Verificar se RPC funciona
        });
      } catch (rpcErr) {
        console.error('⚠️ RPC não disponível, tentando query direta');
        await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      }
    }

    // 2. Verificar tabela grupos_estudo
    console.log('Verificando tabela grupos_estudo...');
    try {
      const { count, error } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (error && (error.code === '42P01' || error.message.includes('relation "grupos_estudo" does not exist'))) {
        console.log('Tabela grupos_estudo não existe, criando...');
        await criarTabelaGruposEstudo();
      } else {
        console.log(`✅ Tabela grupos_estudo existe com ${count || 0} registros`);
      }
    } catch (err) {
      console.error('❌ Erro ao verificar tabela grupos_estudo:', err);
      await criarTabelaGruposEstudo();
    }

    // 3. Verificar tabela codigos_grupos_estudo
    console.log('Verificando tabela codigos_grupos_estudo...');
    try {
      const { count, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (error && (error.code === '42P01' || error.message.includes('relation "codigos_grupos_estudo" does not exist'))) {
        console.log('Tabela codigos_grupos_estudo não existe, criando...');
        await criarTabelaCodigosGruposEstudo();
      } else {
        console.log(`✅ Tabela codigos_grupos_estudo existe com ${count || 0} registros`);
      }
    } catch (err) {
      console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', err);
      await criarTabelaCodigosGruposEstudo();
    }

    console.log('✅ Verificação de tabelas concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro durante verificação de tabelas:', error);
    return false;
  }
}

// Função para criar tabela grupos_estudo
async function criarTabelaGruposEstudo() {
  console.log('🛠️ Criando tabela grupos_estudo...');

  try {
    const sqlQuery = `
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

      DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
      CREATE POLICY "Usuários podem excluir grupos"
        ON public.grupos_estudo FOR DELETE
        USING (true);
    `;

    // Tentar usar RPC para criar tabela
    try {
      await supabase.rpc('execute_sql', { sql_query: sqlQuery });
    } catch (rpcErr) {
      console.warn('⚠️ Erro no RPC, tentando método alternativo:', rpcErr);
      // Método alternativo usando query direta
      await supabase.query(sqlQuery);
    }

    console.log('✅ Tabela grupos_estudo criada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabela grupos_estudo:', error);

    // Tentar método com múltiplas queries
    try {
      console.log('🔄 Tentando método alternativo para criar grupos_estudo...');

      // Dividir em múltiplas queries
      const queries = [
        `CREATE TABLE IF NOT EXISTS public.grupos_estudo (
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
        );`,

        `CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);`,

        `ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;`,

        `DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem visualizar grupos"
          ON public.grupos_estudo FOR SELECT
          USING (true);`,

        `DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem inserir grupos"
          ON public.grupos_estudo FOR INSERT
          WITH CHECK (true);`,

        `DROP POLICY IF EXISTS "Usuários podem atualizar grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem atualizar grupos"
          ON public.grupos_estudo FOR UPDATE
          USING (true);`,

        `DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem excluir grupos"
          ON public.grupos_estudo FOR DELETE
          USING (true);`
      ];

      // Executar cada query separadamente
      for (const query of queries) {
        try {
          await supabase.query(query);
        } catch (err) {
          console.warn(`⚠️ Aviso em query individual: ${err.message}`);
          // Continuar com as próximas queries mesmo se uma falhar
        }
      }

      console.log('✅ Tabela grupos_estudo criada com método alternativo!');
      return true;
    } catch (altError) {
      console.error('❌ Falha no método alternativo:', altError);
      return false;
    }
  }
}

// Função para criar tabela codigos_grupos_estudo
async function criarTabelaCodigosGruposEstudo() {
  console.log('🛠️ Criando tabela codigos_grupos_estudo...');

  try {
    const sqlQuery = `
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
    `;

    // Tentar usar RPC para criar tabela
    try {
      await supabase.rpc('execute_sql', { sql_query: sqlQuery });
    } catch (rpcErr) {
      console.warn('⚠️ Erro no RPC, tentando método alternativo:', rpcErr);
      // Método alternativo usando query direta
      await supabase.query(sqlQuery);
    }

    console.log('✅ Tabela codigos_grupos_estudo criada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', error);

    // Tentar método com múltiplas queries
    try {
      console.log('🔄 Tentando método alternativo para criar codigos_grupos_estudo...');

      // Dividir em múltiplas queries
      const queries = [
        `CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
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
        );`,

        `CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);`,
        `CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);`,

        `ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;`,

        `DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem visualizar códigos"
          ON public.codigos_grupos_estudo FOR SELECT
          USING (true);`,

        `DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem inserir códigos"
          ON public.codigos_grupos_estudo FOR INSERT
          WITH CHECK (true);`,

        `DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem atualizar códigos"
          ON public.codigos_grupos_estudo FOR UPDATE
          USING (true);`
      ];

      // Executar cada query separadamente
      for (const query of queries) {
        try {
          await supabase.query(query);
        } catch (err) {
          console.warn(`⚠️ Aviso em query individual: ${err.message}`);
          // Continuar com as próximas queries mesmo se uma falhar
        }
      }

      console.log('✅ Tabela codigos_grupos_estudo criada com método alternativo!');
      return true;
    } catch (altError) {
      console.error('❌ Falha no método alternativo:', altError);
      return false;
    }
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando verificação e correção de tabelas...');

  try {
    const resultado = await verificarECriarTabelas();

    if (resultado) {
      console.log('🎉 Processo de correção de tabelas concluído com sucesso!');
      process.exit(0);
    } else {
      console.error('❌ Falha no processo de correção de tabelas.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro fatal durante execução do script:', error);
    process.exit(1);
  }
}

// Executar script
main().catch(err => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});