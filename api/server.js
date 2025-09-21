import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './enviar-email.js';
import neonDBModule from './neon-db.js';
import perfilsHandler from './perfis.js';

const { neonDB } = neonDBModule;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://0.0.0.0:5000', 'http://localhost:3000', 'http://0.0.0.0:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ 
  limit: '50mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb' 
}));

// Middleware para logs de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path === '/api/perfis') {
    console.log('📝 Dados recebidos para cadastro:', { ...req.body, senha: '[HIDDEN]' });
  }
  next();
});

// Middleware para adicionar headers CORS adicionais
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware para tratamento de erros JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Erro de JSON malformado:', err);
    return res.status(400).json({ error: 'JSON malformado na requisição' });
  }
  next();
});

// Rotas
app.use('/api', emailRoutes);
app.use('/api/perfis', perfilsHandler);

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
        <div class="endpoint">
          <p><strong>GET /api/perfis</strong> - Buscar perfil</p>
        </div>
        <div class="endpoint">
          <p><strong>POST /api/perfis</strong> - Criar perfil</p>
        </div>
      </body>
    </html>
  `);
});

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({ status: 'Servidor de API funcionando corretamente!' });
});

// Inicializar banco de dados e iniciar servidor
async function startServer() {
  try {
    // Inicializar banco de dados
    console.log('🔄 Inicializando banco de dados...');
    await neonDB.initializeDatabase();

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor de API rodando na porta ${PORT}`);
      console.log(`🌐 Acesse em: http://0.0.0.0:${PORT}/api/status`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();

// Tratamento global de erros para evitar que o servidor caia
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado no servidor:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
});