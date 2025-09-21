
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

// Middleware para logs detalhados
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body keys: ${Object.keys(req.body).join(', ')}`);
  }
  
  next();
});

// Middleware para CORS adicional
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
    return res.status(400).json({ 
      success: false,
      error: 'JSON malformado na requisição',
      details: err.message 
    });
  }
  next();
});

// Health check route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Servidor de API funcionando corretamente!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'Neon PostgreSQL'
  });
});

// Rotas
app.use('/api', emailRoutes);
app.use('/api/perfis', perfilsHandler);

// Rota raiz com informações do servidor
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>API Ponto.School</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #f5f5f5;
          }
          .header { 
            background: linear-gradient(135deg, #FF6B00, #29335C);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
          }
          h1 { color: #FF6B00; margin: 0; }
          .endpoint { 
            background: white; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 10px;
            border-left: 4px solid #FF6B00;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          code { 
            background: #e0e0e0; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-family: monospace;
          }
          .status { 
            background: #4CAF50; 
            color: white; 
            padding: 10px; 
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚀 API Ponto.School</h1>
          <p>Servidor backend para plataforma educacional</p>
        </div>
        
        <div class="status">
          ✅ Servidor funcionando normalmente - ${new Date().toLocaleString('pt-BR')}
        </div>
        
        <h2>📡 Endpoints Disponíveis:</h2>
        
        <div class="endpoint">
          <p><strong>GET /api/status</strong> - Verificar status do servidor</p>
          <p>Exemplo: <code>${req.protocol}://${req.get('host')}/api/status</code></p>
        </div>
        
        <div class="endpoint">
          <p><strong>POST /api/perfis</strong> - Criar novo perfil de usuário</p>
          <p>Body: nome_completo, nome_usuario, email, senha, tipo_conta, pais, estado, instituicao_ensino</p>
        </div>
        
        <div class="endpoint">
          <p><strong>POST /api/perfis/login</strong> - Fazer login</p>
          <p>Body: email, senha</p>
        </div>
        
        <div class="endpoint">
          <p><strong>GET /api/perfis?id={userId}</strong> - Buscar perfil por ID</p>
        </div>
        
        <div class="endpoint">
          <p><strong>POST /api/enviar-email</strong> - Enviar email</p>
        </div>
        
        <h2>🔧 Informações do Sistema:</h2>
        <ul>
          <li><strong>Porta:</strong> ${PORT}</li>
          <li><strong>Banco de dados:</strong> Neon PostgreSQL</li>
          <li><strong>CORS:</strong> Habilitado</li>
          <li><strong>Limite de upload:</strong> 50MB</li>
          <li><strong>Uptime:</strong> ${Math.floor(process.uptime())} segundos</li>
        </ul>
      </body>
    </html>
  `);
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Inicializar banco de dados e iniciar servidor
async function startServer() {
  try {
    console.log('🔄 Inicializando servidor da API...');
    
    // Inicializar banco de dados
    console.log('🔄 Inicializando banco de dados...');
    await neonDB.initializeDatabase();
    console.log('✅ Banco de dados inicializado!');

    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor de API rodando na porta ${PORT}`);
      console.log(`🌐 Acesse em: http://0.0.0.0:${PORT}/api/status`);
      console.log(`📊 Dashboard: http://0.0.0.0:${PORT}/`);
      console.log('✅ Servidor pronto para receber requisições!');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 Recebido SIGTERM, fechando servidor...');
      server.close(() => {
        console.log('✅ Servidor fechado com sucesso');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

startServer();

// Tratamento global de erros para evitar que o servidor caia
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado no servidor:', error);
  console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  console.error('Promise:', promise);
});
