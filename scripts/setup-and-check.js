
// Script para configurar e verificar Supabase
require('dotenv').config();
const { spawn } = require('child_process');

console.log('Iniciando configuração do banco de dados Supabase...');

// Verificando variáveis de ambiente
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Erro: Variáveis de ambiente do Supabase não configuradas!');
  console.error('Verifique se o arquivo .env contém:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  console.error('- SUPABASE_SERVICE_ROLE_KEY (opcional, para operações administrativas)');
  process.exit(1);
}

// Executar script de configuração
console.log('Executando script de configuração do Supabase...');
const setupProcess = spawn('node', ['scripts/setup-supabase.js']);

setupProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

setupProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

setupProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Configuração do Supabase concluída com sucesso!');
    console.log('Iniciando aplicação...');
  } else {
    console.error(`Erro na configuração do Supabase (código ${code})`);
    console.log('A aplicação continuará, mas podem ocorrer erros de conexão.');
  }
});
