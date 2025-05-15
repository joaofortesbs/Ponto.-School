// Script para sincronizar tabelas de grupos de estudo e códigos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para verificar e criar tabelas necessárias
async function verificarECriarTabelas() {
  console.log('Verificando e criando tabelas necessárias...');

  try {
    // Verificar se a função execute_sql existe
    const { data: functionExists, error: functionError } = await supabase.rpc('execute_sql', {
      sql_query: "SELECT 1"
    }).select();

    // Se a função não existir, criá-la
    if (functionError && functionError.message.includes('function "execute_sql" does not exist')) {
      console.log('Criando função execute_sql...');

      // Conectar com usuário admin para criar a função
      const adminClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Criar função diretamente via SQL (isso requer permissões elevadas)
      const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$;
      `;

      // Esta parte pode falhar se o usuário não tiver permissões suficientes
      try {
        await adminClient.rpc('execute_sql', { sql_query: createFunctionQuery });
        console.log('Função execute_sql criada com sucesso');
      } catch (err) {
        console.log('Não foi possível criar a função execute_sql. Continuando mesmo assim.');
        console.error(err);
      }
    }

    // Verificar e criar tabela grupos_estudo
    await verificarECriarTabelaGruposEstudo();

    // Verificar e criar tabela codigos_grupos_estudo
    await verificarECriarTabelaCodigosGrupos();

    // Verificar e criar tabela grupos_estudo_membros
    await verificarECriarTabelaGruposMembros();

    console.log('Verificação de tabelas concluída');
    return true;
  } catch (error) {
    console.error('Erro ao verificar e criar tabelas:', error);
    return false;
  }
}

// Função para verificar e criar tabela grupos_estudo
async function verificarECriarTabelaGruposEstudo() {
  try {
    // Tentar selecionar da tabela para verificar se existe
    const { error } = await supabase.from('grupos_estudo').select('id').limit(1);

    // Se a tabela não existir, criá-la
    if (error && error.code === '42P01') {
      console.log('Criando tabela grupos_estudo...');

      // Criar tabela usando a API fetch para o endpoint fix-tables
      const response = await fetch('/api/fix-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_grupos_estudo'
        })
      });

      if (!response.ok) {
        throw new Error(`Falha ao criar tabela grupos_estudo: ${response.statusText}`);
      }

      console.log('Tabela grupos_estudo criada com sucesso');
    } else {
      console.log('Tabela grupos_estudo já existe');
    }
  } catch (error) {
    console.error('Erro ao verificar/criar tabela grupos_estudo:', error);
    throw error;
  }
}

// Função para verificar e criar tabela codigos_grupos_estudo
async function verificarECriarTabelaCodigosGrupos() {
  try {
    // Tentar selecionar da tabela para verificar se existe
    const { error } = await supabase.from('codigos_grupos_estudo').select('id').limit(1);

    // Se a tabela não existir, criá-la
    if (error && error.code === '42P01') {
      console.log('Criando tabela codigos_grupos_estudo...');

      // Criar tabela usando a API fetch para o endpoint fix-tables
      const response = await fetch('/api/fix-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_codigos_grupos_estudo'
        })
      });

      if (!response.ok) {
        throw new Error(`Falha ao criar tabela codigos_grupos_estudo: ${response.statusText}`);
      }

      console.log('Tabela codigos_grupos_estudo criada com sucesso');
    } else {
      console.log('Tabela codigos_grupos_estudo já existe');
    }
  } catch (error) {
    console.error('Erro ao verificar/criar tabela codigos_grupos_estudo:', error);
    throw error;
  }
}

// Função para verificar e criar tabela grupos_estudo_membros
async function verificarECriarTabelaGruposMembros() {
  try {
    // Tentar selecionar da tabela para verificar se existe
    const { error } = await supabase.from('grupos_estudo_membros').select('id').limit(1);

    // Se a tabela não existir, já foi criada junto com grupos_estudo
    if (error && error.code === '42P01') {
      console.log('Tabela grupos_estudo_membros será criada junto com grupos_estudo');
    } else {
      console.log('Tabela grupos_estudo_membros já existe');
    }
  } catch (error) {
    console.error('Erro ao verificar tabela grupos_estudo_membros:', error);
    // Não lançar erro para não interromper o fluxo
  }
}

// Executar a verificação e criação de tabelas
verificarECriarTabelas()
  .then(() => {
    console.log('Processo de verificação e criação de tabelas concluído');
  })
  .catch(error => {
    console.error('Erro durante o processo:', error);
  });

module.exports = {
  verificarECriarTabelas
};