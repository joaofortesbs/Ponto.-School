import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import publicActivityRouter from './publicActivity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000', 'https://*.replit.dev'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/publicActivity', publicActivityRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API funcionando corretamente!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server rodando na porta ${PORT}`);
  console.log(`📡 Endpoints disponíveis:`);
  console.log(`   - GET /api/health`);
  console.log(`   - GET /api/publicActivity/:id`);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado no servidor:', error);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejection não tratada em:', promise, 'razão:', reason);
});