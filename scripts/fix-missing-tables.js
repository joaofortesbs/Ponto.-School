
/**
 * Script para verificar e criar tabelas de grupos se não existirem
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co',
  process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY'
);

async function checkAndCreateTables() {
  console.log('Verificando e criando tabelas ausentes...');
  
  try {
    // Verificar diretamente se as tabelas existem
    console.log('Verificando se a tabela grupos_estudo existe...');
    
    // Primeiro método: tentar buscar dados da tabela
    try {
      const { error } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });
        
      if (error && error.code === '42P01') { // Tabela não existe
        console.log('Tabela grupos_estudo não existe, criando...');
        await createGruposEstudoTable();
      } else if (error) {
        console.error('Erro ao verificar tabela grupos_estudo:', error);
      } else {
        console.log('Tabela grupos_estudo existe!');
      }
    } catch (e) {
      console.error('Exceção ao verificar tabela grupos_estudo, tentando criar:', e);
      await createGruposEstudoTable();
    }
    
    // Verificar tabela codigos_grupos_estudo
    console.log('Verificando se a tabela codigos_grupos_estudo existe...');
    try {
      const { error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });
        
      if (error && error.code === '42P01') { // Tabela não existe
        console.log('Tabela codigos_grupos_estudo não existe, criando...');
        await createCodigosGruposTable();
      } else if (error) {
        console.error('Erro ao verificar tabela codigos_grupos_estudo:', error);
      } else {
        console.log('Tabela codigos_grupos_estudo existe!');
      }
    } catch (e) {
      console.error('Exceção ao verificar tabela codigos_grupos_estudo, tentando criar:', e);
      await createCodigosGruposTable();
    }
    
    console.log('Verificação de tabelas concluída!');
  } catch (error) {
    console.error('Erro durante a verificação/criação de tabelas:', error);
  }
}

async function createGruposEstudoTable() {
  console.log('Criando tabela grupos_estudo...');
  try {
    const { error } = await supabase.query(`
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
      
      DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios grupos" ON public.grupos_estudo;
      CREATE POLICY "Usuários podem visualizar seus próprios grupos"
        ON public.grupos_estudo FOR SELECT
        USING (true);
      
      DROP POLICY IF EXISTS "Usuários podem inserir seus próprios grupos" ON public.grupos_estudo;
      CREATE POLICY "Usuários podem inserir seus próprios grupos"
        ON public.grupos_estudo FOR INSERT
        WITH CHECK (true);
      
      DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios grupos" ON public.grupos_estudo;
      CREATE POLICY "Usuários podem atualizar seus próprios grupos"
        ON public.grupos_estudo FOR UPDATE
        USING (true);
      
      DROP POLICY IF EXISTS "Usuários podem excluir seus próprios grupos" ON public.grupos_estudo;
      CREATE POLICY "Usuários podem excluir seus próprios grupos"
        ON public.grupos_estudo FOR DELETE
        USING (true);
    `);

    if (error) {
      console.error('Erro ao criar tabela grupos_estudo:', error);
      
      // Tentar método alternativo se o primeiro falhar
      console.log('Tentando método alternativo para criar tabela grupos_estudo...');
      
      // Executar comando separadamente
      const createTableResult = await supabase.query(`
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
      `);
      
      if (createTableResult.error) {
        console.error('Erro também no método alternativo:', createTableResult.error);
      } else {
        console.log('Tabela grupos_estudo criada com sucesso via método alternativo!');
        
        // Adicionar índice separadamente
        await supabase.query(`
          CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
        `);
        
        // Habilitar RLS e políticas separadamente
        await supabase.query(`
          ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios grupos" ON public.grupos_estudo;
          CREATE POLICY "Usuários podem visualizar seus próprios grupos"
            ON public.grupos_estudo FOR SELECT
            USING (true);
        `);
      }
    } else {
      console.log('Tabela grupos_estudo criada com sucesso!');
    }
  } catch (createError) {
    console.error('Exceção ao criar tabela grupos_estudo:', createError);
  }
}

async function createCodigosGruposTable() {
  console.log('Criando tabela codigos_grupos_estudo...');
  try {
    const { error } = await supabase.query(`
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
      
      CREATE OR REPLACE FUNCTION update_codigos_grupos_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.ultima_atualizacao = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS update_codigos_grupos_timestamp ON public.codigos_grupos_estudo;
      CREATE TRIGGER update_codigos_grupos_timestamp
      BEFORE UPDATE ON public.codigos_grupos_estudo
      FOR EACH ROW EXECUTE FUNCTION update_codigos_grupos_timestamp();
      
      ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Todos os usuários podem visualizar códigos de grupos" ON public.codigos_grupos_estudo;
      CREATE POLICY "Todos os usuários podem visualizar códigos de grupos"
        ON public.codigos_grupos_estudo FOR SELECT
        USING (true);
      
      DROP POLICY IF EXISTS "Usuários podem inserir novos códigos de grupos" ON public.codigos_grupos_estudo;
      CREATE POLICY "Usuários podem inserir novos códigos de grupos"
        ON public.codigos_grupos_estudo FOR INSERT
        WITH CHECK (true);
      
      DROP POLICY IF EXISTS "Usuários podem atualizar códigos de grupos" ON public.codigos_grupos_estudo;
      CREATE POLICY "Usuários podem atualizar códigos de grupos"
        ON public.codigos_grupos_estudo FOR UPDATE
        USING (true);
    `);

    if (error) {
      console.error('Erro ao criar tabela codigos_grupos_estudo:', error);
      
      // Tentar método alternativo se o primeiro falhar
      console.log('Tentando método alternativo para criar tabela codigos_grupos_estudo...');
      
      // Executar comando separadamente
      const createTableResult = await supabase.query(`
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
      `);
      
      if (createTableResult.error) {
        console.error('Erro também no método alternativo:', createTableResult.error);
      } else {
        console.log('Tabela codigos_grupos_estudo criada com sucesso via método alternativo!');
        
        // Adicionar índices separadamente
        await supabase.query(`
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
        `);
        
        // Habilitar RLS e políticas separadamente
        await supabase.query(`
          ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
          CREATE POLICY "Todos podem visualizar códigos"
            ON public.codigos_grupos_estudo FOR SELECT
            USING (true);
        `);
      }
    } else {
      console.log('Tabela codigos_grupos_estudo criada com sucesso!');
    }
  } catch (createError) {
    console.error('Exceção ao criar tabela codigos_grupos_estudo:', createError);
  }
}

// Executar o script
checkAndCreateTables()
  .then(() => {
    console.log('Verificação e criação de tabelas concluída!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Falha na verificação e criação de tabelas:', err);
    process.exit(1);
  });
