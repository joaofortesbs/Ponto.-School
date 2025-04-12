/**
 * Script para corrigir IDs de usuários no banco de dados
 * Este script verifica todos os perfis sem um ID válido e gera novos IDs sequenciais
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Verifica se um ID de usuário está no formato correto
 * [UF][AnoMês][TipoConta][Sequencial]
 */
function isValidUserId(id) {
  // Verifica se corresponde ao padrão: 2 letras + 4 números + 1 número + 6 números
  return /^[A-Z]{2}\d{4}[1-2]\d{6}$/.test(id);
}

/**
 * Executa a migração de todos os IDs para o novo formato sequencial
 */
async function migrateAllUserIds() {
  console.log('Iniciando migração de IDs para o novo formato sequencial...');

  try {
    // Chamar a função SQL que faz a migração completa
    const { data, error } = await supabase.rpc('migrate_to_sequential_user_ids');

    if (error) {
      console.error('Erro ao executar migração de IDs:', error);
      return;
    }

    console.log('Resultado da migração:', data);

    // Verificar se ainda existem perfis sem ID válido
    const { data: invalidProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('id, user_id, email, state')
      .filter('user_id', 'is', null)
      .or('user_id.eq.,user_id.not.match.^[A-Z]{2}\\d{4}[1-2]\\d{6}$');

    if (checkError) {
      console.error('Erro ao verificar perfis inválidos:', checkError);
      return;
    }

    if (invalidProfiles && invalidProfiles.length > 0) {
      console.log(`Ainda existem ${invalidProfiles.length} perfis com IDs inválidos ou faltando:`);

      for (const profile of invalidProfiles) {
        console.log(`- Perfil ID: ${profile.id}, Email: ${profile.email || 'N/A'}, Estado: ${profile.state || 'N/A'}, User ID: ${profile.user_id || 'N/A'}`);
      }

      console.log('Estes perfis precisam ter seus estados (UF) corrigidos manualmente antes de gerar IDs válidos.');
    } else {
      console.log('Todos os perfis agora possuem IDs válidos no formato sequencial!');
    }

  } catch (error) {
    console.error('Erro inesperado durante a migração:', error);
  }
}

/**
 * Função para executar SQL personalizado
 */
async function executeSql(sql) {
  try {
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao executar SQL:', error);
    return false;
  }
}

/**
 * Verifica e cria a nova estrutura de controle de sequencial
 */
async function setupSequenceControl() {
  console.log('Verificando estrutura de controle de sequencial...');

  try {
    // Verificar se a tabela de controle de sequência existe
    const tableCheck = `
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_id_sequence_control'
      );
    `;

    const { data: tableExists, error: tableError } = await supabase.rpc('execute_sql', { 
      sql_query: tableCheck 
    });

    if (tableError) {
      console.error('Erro ao verificar tabela de controle:', tableError);

      // Tentar criar a estrutura completa via arquivo de migração
      console.log('Tentando aplicar migração via arquivo...');

      // Esta chamada depende da estrutura real do seu projeto
      const { error: migrationError } = await supabase.rpc('apply_migration', { 
        migration_name: '20240815000000_user_id_sequential_control.sql'
      });

      if (migrationError) {
        console.error('Falha ao aplicar migração automaticamente:', migrationError);
        console.log('Execute a migração manualmente via painel do Supabase');
      } else {
        console.log('Migração aplicada com sucesso!');
      }
    } else {
      console.log('Estrutura de controle de sequencial já está configurada.');
    }

  } catch (error) {
    console.error('Erro ao configurar controle de sequencial:', error);
  }
}

// Executar as funções principais
async function main() {
  try {
    // 1. Verificar e configurar estrutura
    await setupSequenceControl();

    // 2. Migrar todos os IDs existentes
    await migrateAllUserIds();

    console.log('Script finalizado com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro inesperado no script:', error);
    process.exit(1);
  }
}

main();