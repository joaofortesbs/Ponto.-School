
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import emailRoutes from './enviar-email.js';
import authRoutes from './routes/auth.js';
import { checkDatabaseConnection, initTables } from './lib/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true // Para permitir cookies
}));
app.use(express.json());
app.use(cookieParser());

// Rotas
app.use('/api', emailRoutes);
app.use('/api/auth', authRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>API Epictus</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #FF6B00; }
          .endpoint { background: #f4f4f4; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
          code { background: #e0e0e0; padding: 2px 4px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>Servidor API Epictus</h1>
        <p>O servidor está funcionando corretamente!</p>
        <h2>Endpoints disponíveis:</h2>
        <div class="endpoint">
          <p><strong>GET /api/status</strong> - Verificar status do servidor</p>
          <p>Exemplo: <code>${req.protocol}://${req.get('host')}/api/status</code></p>
        </div>
        <div class="endpoint">
          <p><strong>POST /api/enviar-email</strong> - Enviar email</p>
        </div>
      </body>
    </html>
  `);
});

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({ status: 'Servidor de API funcionando corretamente!' });
});

// Inicializar banco e servidor
const startServer = async () => {
  try {
    console.log('🔄 Verificando conexão com banco de dados...');
    const dbConnected = await checkDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ FATAL: Database connection failed. Exiting...');
      process.exit(1);
    }

    console.log('🔄 Inicializando tabelas...');
    await initTables();
    console.log('✅ Database tables initialized successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor de API rodando na porta ${PORT}`);
      console.log(`📊 Status: http://0.0.0.0:${PORT}/api/status`);
      console.log(`🔐 Auth: http://0.0.0.0:${PORT}/api/auth/me`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

// Tratamento global de erros para evitar que o servidor caia
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado no servidor:', error);
});
