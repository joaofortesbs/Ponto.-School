#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting production server...');

// Start backend API server
const apiServer = spawn('node', [join(__dirname, '..', 'api', 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

apiServer.on('error', (error) => {
  console.error('❌ Failed to start API server:', error);
  process.exit(1);
});

// Wait a moment for backend to start
await new Promise(resolve => setTimeout(resolve, 2000));

// Start Vite preview server for frontend
const vitePreview = spawn('npx', ['vite', 'preview', '--host', '0.0.0.0', '--port', '5000'], {
  stdio: 'inherit',
  env: { ...process.env }
});

vitePreview.on('error', (error) => {
  console.error('❌ Failed to start frontend server:', error);
  apiServer.kill();
  process.exit(1);
});

// Handle process termination
const cleanup = () => {
  console.log('\n🛑 Shutting down servers...');
  apiServer.kill();
  vitePreview.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Wait for both processes
apiServer.on('close', (code) => {
  if (code !== 0) {
    console.error(`API server exited with code ${code}`);
    vitePreview.kill();
    process.exit(code);
  }
});

vitePreview.on('close', (code) => {
  if (code !== 0) {
    console.error(`Frontend server exited with code ${code}`);
    apiServer.kill();
    process.exit(code);
  }
});
