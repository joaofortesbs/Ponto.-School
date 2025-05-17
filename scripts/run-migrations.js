const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuração
const CONFIG = {
  migrationsPath: path.join(__dirname, '..', 'supabase', 'migrations'),
  runOncePath: path.join(__dirname, '..', 'supabase', 'migrations', 'run-once'),
  supabaseUrl: process.env.SUPABASE_URL || 'https://ysaqocvbujsmqmbfwkmt.supabase.co',
  maxRetries: 3,
  retryDelayMs: 2000
};

// Função para verificar se o diretório existe
const directoryExists = (directoryPath) => {
  try {
    return fs.statSync(directoryPath).isDirectory();
  } catch (err) {
    return false;
  }
};

// Função para executar um comando com retry
const execWithRetry = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryExec = () => {
      attempts++;
      console.log(`Executando comando (tentativa ${attempts}/${CONFIG.maxRetries}):`);
      console.log(`> ${command}`);

      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Erro na tentativa ${attempts}:`, error.message);
          if (attempts < CONFIG.maxRetries) {
            console.log(`Tentando novamente em ${CONFIG.retryDelayMs / 1000} segundos...`);
            setTimeout(tryExec, CONFIG.retryDelayMs);
          } else {
            console.error(`❌ Falha após ${CONFIG.maxRetries} tentativas.`);
            reject(error);
          }
          return;
        }

        if (stderr) {
          console.warn('Aviso:', stderr);
        }

        resolve(stdout);
      });
    };

    tryExec();
  });
};

// Função para executar migração via supabase CLI
const runMigrationViaCLI = async () => {
  try {
    console.log('🔄 Tentando executar migrações via Supabase CLI...');

    // Verificar se o CLI está disponível
    try {
      await execWithRetry('npx supabase --version');
      console.log('✅ Supabase CLI disponível');
    } catch (error) {
      console.error('❌ Supabase CLI não está disponível:', error.message);
      return false;
    }

    // Executar migração
    try {
      const result = await execWithRetry('npx supabase migration up');
      console.log('✅ Migração via CLI executada com sucesso:');
      console.log(result);
      return true;
    } catch (error) {
      console.error('❌ Falha ao executar migração via CLI:', error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao executar via CLI:', error.message);
    return false;
  }
};

// Função para executar a migração manualmente
const runMigrationManually = async (sqlFilePath) => {
  return new Promise((resolve, reject) => {
    console.log(`Executando migração: ${path.basename(sqlFilePath)}`);

    // Lê o arquivo SQL
    fs.readFile(sqlFilePath, 'utf8', (err, sqlContent) => {
      if (err) {
        console.error(`Erro ao ler arquivo de migração: ${err.message}`);
        reject(err);
        return;
      }

      // Executa o comando SQL via Supabase client
      // Usa uma abordagem diferente: cria um arquivo temporário JS que executa o SQL
      const tempJsPath = path.join(__dirname, 'temp-execute-sql.js');

      // Conteúdo do script temporário
      const scriptContent = `
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabaseUrl = '${CONFIG.supabaseUrl}';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Chave de serviço do Supabase não definida!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    // Executar SQL
    const sql = \`${sqlContent.replace(/`/g, '\\`')}\`;
    console.log('Executando SQL...');

    // Verifica se a função execute_sql existe
    const { data: functionExists, error: checkError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'execute_sql')
      .maybeSingle();

    if (checkError) {
      console.log('Aviso ao verificar função execute_sql:', checkError.message);
      console.log('Tentando executar SQL diretamente...');

      // Se não conseguimos verificar ou a função não existe, tenta executar diretamente
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

      if (error) {
        console.error('❌ Erro ao executar SQL:', error);
        process.exit(1);
      }

      console.log('✅ SQL executado com sucesso:', data);
    } else {
      console.log('Executando SQL via função auxiliar...');
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

      if (error) {
        console.error('❌ Erro ao executar SQL:', error);
        process.exit(1);
      }

      console.log('✅ SQL executado com sucesso:', data);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro geral:', err);
    process.exit(1);
  }
}

executeSQL();
      `;

      // Escreve o script temporário
      fs.writeFileSync(tempJsPath, scriptContent);

      // Executa o script
      execWithRetry(`node ${tempJsPath}`)
        .then(stdout => {
          // Remove o arquivo temporário
          try {
            fs.unlinkSync(tempJsPath);
          } catch (e) {
            console.warn('Aviso: Não foi possível remover o arquivo temporário', e);
          }

          console.log(stdout);
          console.log(`✅ Migração concluída: ${path.basename(sqlFilePath)}`);
          resolve();
        })
        .catch(error => {
          // Remove o arquivo temporário
          try {
            fs.unlinkSync(tempJsPath);
          } catch (e) {
            console.warn('Aviso: Não foi possível remover o arquivo temporário', e);
          }

          console.error(`❌ Erro ao executar migração: ${error.message}`);
          reject(error);
        });
    });
  });
};

// Função para executar migrações manualmente uma por uma
const runMigrationsManually = async () => {
  console.log('🔄 Executando migrações manualmente...');

  // Primeiro executa as migrações principais
  if (directoryExists(CONFIG.migrationsPath)) {
    const mainMigrationFiles = fs.readdirSync(CONFIG.migrationsPath)
      .filter(file => file.endsWith('.sql') && !fs.statSync(path.join(CONFIG.migrationsPath, file)).isDirectory())
      .sort();

    console.log(`📋 Encontradas ${mainMigrationFiles.length} migrações principais`);

    for (const file of mainMigrationFiles) {
      const filePath = path.join(CONFIG.migrationsPath, file);
      try {
        await runMigrationManually(filePath);
      } catch (err) {
        console.error(`❌ Falha na migração ${file}: ${err.message}`);
        return false;
      }
    }
  }

  // Depois executa as migrações "run-once"
  if (directoryExists(CONFIG.runOncePath)) {
    const runOnceMigrationFiles = fs.readdirSync(CONFIG.runOncePath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📋 Encontradas ${runOnceMigrationFiles.length} migrações "run-once"`);

    for (const file of runOnceMigrationFiles) {
      const filePath = path.join(CONFIG.runOncePath, file);
      try {
        await runMigrationManually(filePath);
      } catch (err) {
        console.error(`❌ Falha na migração run-once ${file}: ${err.message}`);
        return false;
      }
    }
  }

  return true;
};

// Função principal
async function main() {
  console.log('🚀 Iniciando execução de migrações SQL...');

  // Primeiro tenta via CLI
  const cliSuccess = await runMigrationViaCLI();

  // Se falhou via CLI, tenta manualmente
  if (!cliSuccess) {
    console.log('⚠️ Migração via CLI falhou, tentando método alternativo...');
    const manualSuccess = await runMigrationsManually();

    if (!manualSuccess) {
      console.error('❌ Falha em todos os métodos de migração!');
      process.exit(1);
    }
  }

  console.log('✅ Processo de migração concluído com sucesso!');
}

// Executa a função principal
main().catch(err => {
  console.error('❌ Erro no processo de migração:', err);
  process.exit(1);
});