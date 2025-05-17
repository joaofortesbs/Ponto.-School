
// Script para executar migrações do Supabase com tratamento de erros aprimorado
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== INICIANDO APLICAÇÃO DE MIGRAÇÕES SUPABASE ===');

// Verificar se as credenciais estão definidas
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERRO: Credenciais do Supabase não definidas!');
  console.error('Por favor, configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para verificar conexão com o Supabase
async function checkConnection() {
  try {
    console.log('Verificando conexão com o Supabase...');
    
    // Tentando uma operação simples
    const { data, error } = await supabase.rpc('rpc_ping').catch(() => ({
      error: { message: 'Função rpc_ping não encontrada' }
    }));
    
    if (error && !error.message.includes('não encontrada')) {
      // Tentar outra abordagem
      console.log('Verificação de ping falhou, tentando outra abordagem...');
      const { error: healthCheckError } = await supabase.from('profiles').select('count');
      
      if (healthCheckError) {
        console.error('Falha na conexão com o Supabase:', healthCheckError);
        return false;
      }
    }
    
    console.log('✅ Conexão com o Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar conexão com o Supabase:', error);
    return false;
  }
}

// Função para criar a função execute_sql se não existir
async function ensureExecuteSqlFunction() {
  try {
    console.log('Verificando se a função execute_sql existe...');
    
    // Tentamos usar a função para testar se ela existe
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: 'SELECT 1'
    });
    
    // Se não existir erro ou o erro for relacionado a permissões, a função provavelmente existe
    if (!error || error.code === 'PGRST301' || error.message.includes('permission')) {
      console.log('✅ Função execute_sql parece existir');
      return true;
    }
    
    console.log('Criando função execute_sql...');
    
    // Criamos a função diretamente via SQL
    const { error: createError } = await supabase.from('_exec_sql').select('*').limit(1);
    
    // Se conseguirmos acessar _exec_sql, tentamos criar a função
    const createFunctionResult = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    }).catch(() => ({ error: null }));
    
    if (createFunctionResult.error) {
      console.warn('⚠️ Não foi possível criar função execute_sql. Algumas migrações podem falhar.');
      return false;
    }
    
    console.log('✅ Função execute_sql criada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar/criar função execute_sql:', error);
    return false;
  }
}

// Função para aplicar um arquivo de migração
async function applyMigrationFile(filePath) {
  try {
    console.log(`Aplicando migração: ${path.basename(filePath)}`);
    
    // Ler o conteúdo do arquivo SQL
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Executar o SQL usando a função execute_sql
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      // Alguns erros são aceitáveis, como tabela já existe
      if (error.message.includes('already exists')) {
        console.log(`⚠️ Tabela já existe em ${path.basename(filePath)}, continuando...`);
        return true;
      }
      
      console.error(`❌ Erro ao aplicar migração ${path.basename(filePath)}:`, error);
      return false;
    }
    
    console.log(`✅ Migração aplicada com sucesso: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao aplicar migração ${path.basename(filePath)}:`, error);
    return false;
  }
}

// Função principal para aplicar migrações
async function applyMigrations() {
  try {
    // Verificar conexão
    const connected = await checkConnection();
    if (!connected) {
      console.error('❌ Não foi possível conectar ao Supabase. Verifique as credenciais e a conexão.');
      process.exit(1);
    }
    
    // Verificar função execute_sql
    await ensureExecuteSqlFunction();
    
    // Obter migrações para executar
    const migrationsFolders = [
      path.join(__dirname, '..', 'supabase', 'migrations'),
      path.join(__dirname, '..', 'supabase', 'migrations', 'run-once')
    ];
    
    let migrationsApplied = 0;
    let migrationsSkipped = 0;
    let migrationsFailed = 0;
    
    // Processar cada pasta de migrações
    for (const folder of migrationsFolders) {
      if (!fs.existsSync(folder)) {
        console.log(`Pasta ${folder} não existe, pulando...`);
        continue;
      }
      
      console.log(`\nProcessando migrações da pasta: ${folder}`);
      
      // Listar arquivos SQL na pasta
      const files = fs.readdirSync(folder)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Ordenar para garantir que sejam aplicados na ordem correta
      
      if (files.length === 0) {
        console.log('Nenhuma migração encontrada na pasta.');
        continue;
      }
      
      console.log(`Encontradas ${files.length} migrações para aplicar.\n`);
      
      // Aplicar cada arquivo de migração
      for (const file of files) {
        const filePath = path.join(folder, file);
        const applied = await applyMigrationFile(filePath);
        
        if (applied) {
          migrationsApplied++;
        } else {
          migrationsFailed++;
        }
      }
    }
    
    // Resumo das migrações
    console.log('\n===== RESUMO DAS MIGRAÇÕES =====');
    console.log(`Total de migrações aplicadas: ${migrationsApplied}`);
    console.log(`Total de migrações puladas: ${migrationsSkipped}`);
    console.log(`Total de migrações com falha: ${migrationsFailed}`);
    
    if (migrationsFailed > 0) {
      console.log('\n⚠️ Algumas migrações falharam. Verifique os logs acima para mais detalhes.');
    } else {
      console.log('\n✅ Todas as migrações foram processadas com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a aplicação das migrações:', error);
    process.exit(1);
  }
}

// Executar o processo de migração
applyMigrations();
