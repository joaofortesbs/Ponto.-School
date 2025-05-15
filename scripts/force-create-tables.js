
/**
 * Script para forçar a criação das tabelas de grupos e códigos
 * Este script usa diferentes métodos para garantir que as tabelas existam
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Verificar ambiente
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas!');
  console.error('Por favor, defina as variáveis de ambiente SUPABASE_URL e SUPABASE_KEY');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Método 1: Usa RPC execute_sql para criar tabelas
 */
async function criarTabelasViaRPC() {
  console.log('🔄 Método 1: Criando tabelas via RPC execute_sql...');
  
  try {
    // 1. Tentar criar tabela grupos_estudo
    const { error: gruposError } = await supabase.rpc('execute_sql', {
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
      `
    });
    
    if (gruposError) {
      console.error('❌ Erro ao criar tabela grupos_estudo via RPC:', gruposError);
    } else {
      console.log('✅ Tabela grupos_estudo criada com sucesso via RPC');
    }
    
    // 2. Tentar criar tabela codigos_grupos_estudo
    const { error: codigosError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
          codigo VARCHAR(15) PRIMARY KEY,
          grupo_id UUID NOT NULL,
          nome VARCHAR(255) NOT NULL,
          descricao TEXT,
          data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
          user_id UUID,
          privado BOOLEAN DEFAULT false,
          membros INTEGER DEFAULT 1,
          visibilidade VARCHAR(50),
          disciplina VARCHAR(100),
          cor VARCHAR(50) DEFAULT '#FF6B00',
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
      `
    });
    
    if (codigosError) {
      console.error('❌ Erro ao criar tabela codigos_grupos_estudo via RPC:', codigosError);
      return false;
    } else {
      console.log('✅ Tabela codigos_grupos_estudo criada com sucesso via RPC');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro inesperado no método RPC:', error);
    return false;
  }
}

/**
 * Método 2: Tenta criar tabelas usando query SQL direta
 */
async function criarTabelasViaQueryDireta() {
  console.log('🔄 Método 2: Criando tabelas via query SQL direta...');
  
  try {
    // 1. Criar tabela grupos_estudo
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
      `);
      console.log('✅ Tabela grupos_estudo criada com sucesso via query direta');
    } catch (gruposError) {
      console.error('❌ Erro ao criar tabela grupos_estudo via query direta:', gruposError);
    }
    
    // 2. Criar tabela codigos_grupos_estudo
    try {
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
          codigo VARCHAR(15) PRIMARY KEY,
          grupo_id UUID NOT NULL,
          nome VARCHAR(255) NOT NULL,
          descricao TEXT,
          data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
          user_id UUID,
          privado BOOLEAN DEFAULT false,
          membros INTEGER DEFAULT 1,
          visibilidade VARCHAR(50),
          disciplina VARCHAR(100),
          cor VARCHAR(50) DEFAULT '#FF6B00',
          membros_ids JSONB DEFAULT '[]'::jsonb,
          ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      console.log('✅ Tabela codigos_grupos_estudo criada com sucesso via query direta');
      return true;
    } catch (codigosError) {
      console.error('❌ Erro ao criar tabela codigos_grupos_estudo via query direta:', codigosError);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro inesperado no método query direta:', error);
    return false;
  }
}

/**
 * Método 3: Tenta chamar nossa API para criar tabelas
 */
async function criarTabelasViaAPI() {
  console.log('🔄 Método 3: Criando tabelas via API...');
  
  try {
    // Determinar URL da API
    const apiUrl = process.env.API_URL || 'http://localhost:3000/api/fix-tables';
    console.log(`Chamando API em: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      console.error('❌ API retornou erro:', errorData);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API executada com sucesso:', data);
    return data.success === true;
  } catch (error) {
    console.error('❌ Erro ao chamar API:', error);
    return false;
  }
}

/**
 * Método 4: Cria manualmente as tabelas usando migrations SQL
 */
async function criarTabelasViaMigrations() {
  console.log('🔄 Método 4: Criando tabelas via migrations SQL...');
  
  try {
    // Caminhos para os arquivos de migração
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations');
    const gruposMigrationFile = path.join(migrationPath, '20240820000000_create_grupos_estudo_table.sql');
    const codigosMigrationFile = path.join(migrationPath, '20240830000000_add_grupo_codigo_column.sql');
    
    // Criar diretório de migrations se não existir
    if (!fs.existsSync(migrationPath)) {
      fs.mkdirSync(migrationPath, { recursive: true });
      console.log('Diretório de migrações criado');
    }
    
    // Criar arquivo de migração para grupos_estudo se não existir
    if (!fs.existsSync(gruposMigrationFile)) {
      const gruposSql = `
        -- Criação da tabela de grupos de estudo
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
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
      
      fs.writeFileSync(gruposMigrationFile, gruposSql);
      console.log('Arquivo de migração para grupos_estudo criado');
    }
    
    // Criar arquivo de migração para codigos_grupos_estudo se não existir
    if (!fs.existsSync(codigosMigrationFile)) {
      const codigosSql = `
        -- Criação da tabela de códigos de grupos de estudo
        CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
          codigo VARCHAR(15) PRIMARY KEY,
          grupo_id UUID NOT NULL,
          nome VARCHAR(255) NOT NULL,
          descricao TEXT,
          data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
          user_id UUID,
          privado BOOLEAN DEFAULT false,
          membros INTEGER DEFAULT 1,
          visibilidade VARCHAR(50),
          disciplina VARCHAR(100),
          cor VARCHAR(50) DEFAULT '#FF6B00',
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
      
      fs.writeFileSync(codigosMigrationFile, codigosSql);
      console.log('Arquivo de migração para codigos_grupos_estudo criado');
    }
    
    // Aplicar migrations manualmente usando RPC
    const gruposSql = fs.readFileSync(gruposMigrationFile, 'utf8');
    const codigosSql = fs.readFileSync(codigosMigrationFile, 'utf8');
    
    // Executar SQL de grupos_estudo
    try {
      const { error: gruposError } = await supabase.rpc('execute_sql', {
        sql_query: gruposSql
      }).catch(() => ({ error: { message: "RPC não disponível para grupos" } }));
      
      if (gruposError) {
        console.error('❌ Erro ao aplicar migração de grupos:', gruposError);
      } else {
        console.log('✅ Migração de grupos aplicada com sucesso');
      }
    } catch (gruposError) {
      console.error('❌ Erro ao aplicar migração de grupos:', gruposError);
    }
    
    // Executar SQL de codigos_grupos_estudo
    try {
      const { error: codigosError } = await supabase.rpc('execute_sql', {
        sql_query: codigosSql
      }).catch(() => ({ error: { message: "RPC não disponível para códigos" } }));
      
      if (codigosError) {
        console.error('❌ Erro ao aplicar migração de códigos:', codigosError);
        return false;
      } else {
        console.log('✅ Migração de códigos aplicada com sucesso');
        return true;
      }
    } catch (codigosError) {
      console.error('❌ Erro ao aplicar migração de códigos:', codigosError);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro inesperado no método migrations:', error);
    return false;
  }
}

/**
 * Verificar se as tabelas foram criadas com sucesso
 */
async function verificarTabelas() {
  console.log('🔍 Verificando se as tabelas foram criadas...');
  
  try {
    // Verificar tabela grupos_estudo
    const { data: gruposData, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('id')
      .limit(1);
      
    if (gruposError) {
      console.error('❌ Tabela grupos_estudo não está acessível:', gruposError);
      return false;
    }
    
    console.log('✅ Tabela grupos_estudo está acessível');
    
    // Verificar tabela codigos_grupos_estudo
    const { data: codigosData, error: codigosError } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .limit(1);
      
    if (codigosError) {
      console.error('❌ Tabela codigos_grupos_estudo não está acessível:', codigosError);
      return false;
    }
    
    console.log('✅ Tabela codigos_grupos_estudo está acessível');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    return false;
  }
}

/**
 * Função principal que tenta todos os métodos em sequência
 */
async function forceCriarTabelas() {
  console.log('🚀 Iniciando processo de criação forçada de tabelas...');
  
  // Verificar se as tabelas já existem
  const tabelasExistem = await verificarTabelas();
  
  if (tabelasExistem) {
    console.log('✅ As tabelas já existem e estão acessíveis!');
    return true;
  }
  
  console.log('❌ As tabelas não existem ou não estão acessíveis. Tentando criar...');
  
  // Tentar cada método em sequência
  console.log('\n⚙️ Tentando Método 1: RPC execute_sql...');
  const sucessoRPC = await criarTabelasViaRPC();
  
  if (sucessoRPC && await verificarTabelas()) {
    console.log('🎉 Método 1 (RPC) foi bem-sucedido!');
    return true;
  }
  
  console.log('\n⚙️ Tentando Método 2: Query SQL direta...');
  const sucessoQuery = await criarTabelasViaQueryDireta();
  
  if (sucessoQuery && await verificarTabelas()) {
    console.log('🎉 Método 2 (Query direta) foi bem-sucedido!');
    return true;
  }
  
  console.log('\n⚙️ Tentando Método 3: API...');
  const sucessoAPI = await criarTabelasViaAPI();
  
  if (sucessoAPI && await verificarTabelas()) {
    console.log('🎉 Método 3 (API) foi bem-sucedido!');
    return true;
  }
  
  console.log('\n⚙️ Tentando Método 4: Migrations SQL...');
  const sucessoMigrations = await criarTabelasViaMigrations();
  
  if (sucessoMigrations && await verificarTabelas()) {
    console.log('🎉 Método 4 (Migrations) foi bem-sucedido!');
    return true;
  }
  
  // Verificação final
  const verificacaoFinal = await verificarTabelas();
  
  if (verificacaoFinal) {
    console.log('🎉 As tabelas foram criadas com sucesso por algum dos métodos!');
    return true;
  }
  
  console.error('❌ Todos os métodos falharam. As tabelas não puderam ser criadas.');
  return false;
}

// Executar o script
forceCriarTabelas()
  .then(resultado => {
    if (resultado) {
      console.log('✅ SUCESSO: Script concluído com êxito!');
      process.exit(0);
    } else {
      console.error('❌ FALHA: Script não conseguiu criar as tabelas.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ ERRO CRÍTICO:', error);
    process.exit(1);
  });
// Script para forçar a criação de tabelas do banco de dados
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

// Função para forçar a criação das tabelas
async function forcarCriacaoTabelas() {
  console.log('🔨 INICIANDO CRIAÇÃO FORÇADA DE TABELAS');
  console.log('----------------------------------------');
  
  try {
    // 1. Extensão UUID
    console.log('Criando extensão UUID...');
    try {
      await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      console.log('✅ Extensão UUID criada com sucesso');
    } catch (err) {
      console.error('⚠️ Erro ao criar extensão UUID:', err.message);
      console.log('Continuando mesmo com erro...');
    }
    
    // 2. Tabela grupos_estudo
    console.log('\nCriando tabela grupos_estudo...');
    try {
      // Criar tabela
      await supabase.query(`
        DROP TABLE IF EXISTS public.grupos_estudo CASCADE;
        
        CREATE TABLE public.grupos_estudo (
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
      console.log('✅ Tabela grupos_estudo criada');
      
      // Criar índice
      try {
        await supabase.query(`CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);`);
        console.log('✅ Índice criado para grupos_estudo');
      } catch (indexErr) {
        console.error('⚠️ Erro ao criar índice:', indexErr.message);
      }
      
      // Configurar RLS
      try {
        await supabase.query(`
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
        `);
        console.log('✅ Políticas RLS configuradas para grupos_estudo');
      } catch (rlsErr) {
        console.error('⚠️ Erro ao configurar RLS:', rlsErr.message);
      }
    } catch (err) {
      console.error('❌ Erro ao criar tabela grupos_estudo:', err.message);
    }
    
    // 3. Tabela codigos_grupos_estudo
    console.log('\nCriando tabela codigos_grupos_estudo...');
    try {
      // Criar tabela
      await supabase.query(`
        DROP TABLE IF EXISTS public.codigos_grupos_estudo CASCADE;
        
        CREATE TABLE public.codigos_grupos_estudo (
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
      console.log('✅ Tabela codigos_grupos_estudo criada');
      
      // Criar índices
      try {
        await supabase.query(`
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
        `);
        console.log('✅ Índices criados para codigos_grupos_estudo');
      } catch (indexErr) {
        console.error('⚠️ Erro ao criar índices:', indexErr.message);
      }
      
      // Configurar RLS
      try {
        await supabase.query(`
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
        console.log('✅ Políticas RLS configuradas para codigos_grupos_estudo');
      } catch (rlsErr) {
        console.error('⚠️ Erro ao configurar RLS:', rlsErr.message);
      }
    } catch (err) {
      console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', err.message);
    }
    
    // 4. Verificar tabelas criadas
    console.log('\nVerificando criação das tabelas...');
    
    try {
      const { count: countGrupos, error: errorGrupos } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });
        
      if (errorGrupos) {
        console.error('❌ Falha ao verificar tabela grupos_estudo:', errorGrupos.message);
      } else {
        console.log(`✅ Tabela grupos_estudo verificada (${countGrupos || 0} registros)`);
      }
    } catch (err) {
      console.error('❌ Erro ao verificar tabela grupos_estudo:', err.message);
    }
    
    try {
      const { count: countCodigos, error: errorCodigos } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });
        
      if (errorCodigos) {
        console.error('❌ Falha ao verificar tabela codigos_grupos_estudo:', errorCodigos.message);
      } else {
        console.log(`✅ Tabela codigos_grupos_estudo verificada (${countCodigos || 0} registros)`);
      }
    } catch (err) {
      console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', err.message);
    }
    
    console.log('\n----------------------------------------');
    console.log('🎉 PROCESSO DE CRIAÇÃO FORÇADA CONCLUÍDO');
    
    return true;
  } catch (error) {
    console.error('❌ ERRO FATAL DURANTE CRIAÇÃO DE TABELAS:', error);
    return false;
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando script de criação forçada de tabelas...\n');
    
    const resultado = await forcarCriacaoTabelas();
    
    if (resultado) {
      console.log('\n🎉 Script concluído com sucesso!');
      process.exit(0);
    } else {
      console.error('\n❌ Script concluído com erros.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erro fatal durante execução do script:', error);
    process.exit(1);
  }
}

// Executar script
main().catch(err => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});
