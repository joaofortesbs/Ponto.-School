
// Script para inicializar a aplicação com verificações
require('dotenv').config();
const { spawn, exec } = require('child_process');

console.log('Iniciando verificação do ambiente...');

// Verificar arquivo .env
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('\n❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('Por favor, verifique o arquivo .env com as seguintes variáveis:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  console.error('- SUPABASE_SERVICE_ROLE_KEY (opcional)');
  process.exit(1);
}

// Verificar se as dependências estão instaladas
function checkDependencies() {
  return new Promise((resolve) => {
    console.log('Verificando dependências instaladas...');
    
    exec('npm list --depth=0', (error, stdout, stderr) => {
      if (error) {
        console.warn('Aviso: Algumas dependências podem estar faltando');
        console.log('Executando instalação de dependências...');
        
        const install = spawn('npm', ['install'], { stdio: 'inherit' });
        
        install.on('close', (code) => {
          if (code !== 0) {
            console.error(`\n❌ Erro ao instalar dependências (código ${code})`);
            console.log('Continuando mesmo assim...');
          }
          resolve();
        });
      } else {
        console.log('✅ Dependências instaladas corretamente!');
        resolve();
      }
    });
  });
}

// Verificar configuração do Supabase
function setupSupabase() {
  return new Promise((resolve) => {
    console.log('\nConfigurando banco de dados Supabase...');
    
    const setup = spawn('node', ['scripts/setup-supabase.js'], { stdio: 'inherit' });
    
    setup.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n⚠️ Configuração do Supabase concluída com erros (código ${code})`);
        console.log('A aplicação continuará, mas podem ocorrer erros de conexão.');
      } else {
        console.log('\n✅ Configuração do Supabase concluída com sucesso!');
      }
      resolve();
    });
  });
}

// Verificar saúde da aplicação
function checkHealth() {
  return new Promise((resolve) => {
    console.log('\nVerificando saúde da aplicação...');
    
    const healthCheck = spawn('node', ['scripts/app-health-check.js'], { stdio: 'inherit' });
    
    healthCheck.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n⚠️ Verificação de saúde concluída com erros (código ${code})`);
        console.log('A aplicação continuará, mas podem ocorrer erros durante o uso.');
      } else {
        console.log('\n✅ Verificação de saúde concluída com sucesso!');
      }
      resolve();
    });
  });
}

// Iniciar aplicação
function startApp() {
  console.log('\nIniciando aplicação...');
  
  const start = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  start.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Aplicação encerrada com código ${code}`);
      process.exit(code);
    }
  });
}

// Executar passos em sequência
async function main() {
  try {
    await checkDependencies();
    await setupSupabase();
    await checkHealth();
    startApp();
  } catch (error) {
    console.error('\n❌ Erro durante a inicialização:', error);
    process.exit(1);
  }
}

main();
