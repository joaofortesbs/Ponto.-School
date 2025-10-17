#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting production server...');
console.log('📦 O servidor Express servirá a aplicação buildada e as APIs na porta 5000');

// Em produção, apenas o servidor Express é necessário
// Ele já serve os arquivos estáticos do dist/ e as rotas de API
const apiServer = spawn('node', [join(__dirname, '..', 'api', 'server.js')], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'production'
  }
});

apiServer.on('error', (error) => {
  console.error('❌ Failed to start production server:', error);
  process.exit(1);
});

apiServer.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Production server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
const cleanup = () => {
  console.log('\n🛑 Shutting down production server...');
  apiServer.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
