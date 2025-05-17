
// Script unificado para configurar a tabela friend_requests
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

console.log('=== Script de configuração da tabela friend_requests ===');
console.log('Este script executará todos os passos necessários em sequência.');
console.log('-----------------------------------------------------------');

// Função para executar um script Node e verificar o resultado
function runScript(scriptName) {
  const scriptPath = path.join(__dirname, scriptName);
  console.log(`\nExecutando ${scriptName}...`);
  console.log('-----------------------------------------------------------');
  
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    console.log('-----------------------------------------------------------');
    console.log(`✅ ${scriptName} executado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar ${scriptName}:`, error.message);
    return false;
  }
}

// Executar os scripts em sequência
async function setupFriendRequests() {
  // Passo 1: Criar função execute_sql
  const step1 = runScript('create-execute-sql.js');
  if (!step1) {
    console.error('A função execute_sql não pôde ser criada. Verifique as permissões e credenciais.');
    return;
  }
  
  // Passo 2: Criar tabela friend_requests
  const step2 = runScript('create-friend-requests-table.js');
  if (!step2) {
    console.error('A tabela friend_requests não pôde ser criada. Verifique as permissões e credenciais.');
    return;
  }
  
  // Passo 3: Verificar a tabela
  const step3 = runScript('check-friend-requests-table.js');
  if (!step3) {
    console.error('A verificação da tabela friend_requests falhou. Isso pode indicar um problema com a criação.');
    return;
  }
  
  console.log('\n===================================================');
  console.log('🎉 Configuração da tabela friend_requests concluída com sucesso!');
  console.log('A funcionalidade de solicitações de amizade agora deve estar operacional.');
  console.log('===================================================');
}

// Iniciar o processo
setupFriendRequests();
