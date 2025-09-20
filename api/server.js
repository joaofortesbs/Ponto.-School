
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './enviar-email.js';
import authRoutes from './auth-routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : true, // Para desenvolvimento, permite qualquer origem
  credentials: true
}));

// Limite de tamanho do JSON para prevenir ataques DoS
app.use(express.json({ limit: '10mb' }));

// Headers de segurança básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

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
        <div class="endpoint">
          <p><strong>POST /api/auth/register</strong> - Registrar novo usuário</p>
        </div>
        <div class="endpoint">
          <p><strong>POST /api/auth/login</strong> - Fazer login</p>
        </div>
        <div class="endpoint">
          <p><strong>GET /api/auth/verify</strong> - Verificar token</p>
        </div>
        <div class="endpoint">
          <p><strong>GET /api/auth/profile</strong> - Buscar perfil do usuário</p>
        </div>
        <div class="endpoint">
          <p><strong>PUT /api/auth/profile</strong> - Atualizar perfil do usuário</p>
        </div>
        <div class="endpoint">
          <p><strong>POST /api/auth/logout</strong> - Fazer logout</p>
        </div>
        <div class="endpoint">
          <p><strong>GET /api/auth/test-db</strong> - Testar conexão com banco Neon</p>
        </div>
      </body>
    </html>
  `);
});

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({ status: 'Servidor de API funcionando corretamente!' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de API rodando na porta ${PORT}`);
  console.log(`Acesse em: http://0.0.0.0:${PORT}/api/status`);
});

// Tratamento global de erros para evitar que o servidor caia
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado no servidor:', error);
});
