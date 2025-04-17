
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

console.log('======================================');
console.log('Iniciando servidor de API...');
console.log('======================================');

// Verificar se os arquivos existem
const serverPath = path.join(process.cwd(), 'api', 'server.js');
const emailPath = path.join(process.cwd(), 'api', 'enviar-email.js');

if (!fs.existsSync(serverPath)) {
  console.error('Erro: arquivo server.js não encontrado em api/server.js');
  process.exit(1);
}

if (!fs.existsSync(emailPath)) {
  console.error('Erro: arquivo enviar-email.js não encontrado em api/enviar-email.js');
  process.exit(1);
}

// Executar o servidor
try {
  console.log('Comando: node api/server.js');
  console.log('Acesse o servidor em: http://0.0.0.0:3001');
  
  // Adicionando mais informações úteis
  console.log('\nEndpoints disponíveis:');
  console.log('- GET  / - Página inicial da API');
  console.log('- GET  /api/status - Verificar status do servidor');
  console.log('- POST /api/enviar-email - Enviar email');
  console.log('\n======================================');
  
  execSync('node api/server.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao iniciar o servidor API:', error.message);
  process.exit(1);
}
