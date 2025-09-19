
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import das rotas
let emailRoutes;
let publicActivityRouter;

try {
  emailRoutes = require('./enviar-email.js');
} catch (error) {
  console.warn('Módulo enviar-email.js não encontrado:', error.message);
}

try {
  publicActivityRouter = require('./publicActivity.js');
} catch (error) {
  console.warn('Módulo publicActivity.js não encontrado:', error.message);
}

// Rotas
if (emailRoutes) {
  app.use('/api', emailRoutes);
}

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
          <p><strong>GET /api/publicActivity/:activityId</strong> - Obter atividade pública por ID</p>
        </div>
      </body>
    </html>
  `);
});

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas de atividades públicas
if (publicActivityRouter) {
  app.use('/api/publicActivity', publicActivityRouter);
} else {
  // Fallback para quando o módulo não existir
  app.get('/api/publicActivity/:id', (req, res) => {
    const { id } = req.params;
    
    // Mock data de exemplo
    const mockActivity = {
      id: id,
      title: 'Atividade Educacional',
      description: 'Atividade gerada pela Ponto School',
      subject: 'Geral',
      activityType: 'atividade-geral',
      content: 'Conteúdo da atividade será carregado aqui.',
      createdAt: new Date().toISOString(),
      isPublic: true
    };
    
    res.json({
      success: true,
      data: mockActivity
    });
  });
}

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de API rodando na porta ${PORT}`);
  console.log(`Acesse em: http://0.0.0.0:${PORT}/api/status`);
});

// Tratamento global de erros para evitar que o servidor caia
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado no servidor:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejection não tratada em:', promise, 'razão:', reason);
});
