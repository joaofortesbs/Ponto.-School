import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './enviar-email.js';
import neonDBModule from './neon-db.js';
import perfilsHandler from './perfis.js';
import atividadesRoutes from './atividades.js';

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
app.use('/api/email', emailRoutes);  // Mover para prefixo específico para não interferir com outras rotas
app.use('/api/perfis', perfilsHandler);
app.use('/api/atividades-neon', atividadesRoutes); // Nova API de atividades no Neon

// =================
// FUNÇÃO PARA REGISTRAR ROTAS DE ATIVIDADES
// =================

function registerActivityRoutes() {
  console.log('🔧 Registrando rotas de atividades...');


  // Criar nova atividade
  app.post('/api/atividades', async (req, res) => {
  try {
    console.log('📝 POST /api/atividades - Nova atividade:', req.body);
    
    const { user_id, codigo_unico, tipo, titulo, descricao, conteudo } = req.body;

    // Validar campos obrigatórios
    if (!user_id || !codigo_unico || !tipo || !conteudo) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: user_id, codigo_unico, tipo, conteudo'
      });
    }

    // Verificar se código único já existe
    const codeExists = await neonDB.checkCodeExists(codigo_unico);
    if (codeExists) {
      return res.status(409).json({
        success: false,
        error: 'Código único já existe'
      });
    }

    // Criar atividade
    const result = await neonDB.createActivity({
      user_id,
      codigo_unico,
      tipo,
      titulo: titulo || `Atividade ${tipo}`,
      descricao: descricao || '',
      conteudo
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data[0]
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erro no endpoint POST /api/atividades:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar atividade existente
app.put('/api/atividades/:codigo_unico', async (req, res) => {
  try {
    const { codigo_unico } = req.params;
    const { titulo, descricao, conteudo } = req.body;

    console.log(`🔄 PUT /api/atividades/${codigo_unico} - Atualizando atividade`);

    // Validar campos obrigatórios
    if (!conteudo) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: conteudo'
      });
    }

    // Atualizar atividade
    const result = await neonDB.updateActivity(codigo_unico, {
      titulo,
      descricao,
      conteudo
    });

    if (result.success) {
      res.json({
        success: true,
        data: result.data[0]
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erro no endpoint PUT /api/atividades:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar atividades do usuário (histórico)
app.get('/api/atividades/usuario/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    console.log(`🔍 GET /api/atividades/usuario/${user_id} - Buscando atividades do usuário`);

    // Buscar atividades do usuário
    const result = await neonDB.getUserActivities(user_id);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erro no endpoint GET /api/atividades/usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar atividade por código único (para exibição pública)
app.get('/api/atividades/:codigo_unico', async (req, res) => {
  try {
    const { codigo_unico } = req.params;

    console.log(`🔍 GET /api/atividades/${codigo_unico} - Buscando atividade por código`);

    // Buscar atividade por código
    const result = await neonDB.getActivityByCode(codigo_unico);

    if (result.success) {
      res.json({
        success: true,
        data: result.data[0]
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erro no endpoint GET /api/atividades:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar atividade
app.delete('/api/atividades/:codigo_unico', async (req, res) => {
  try {
    const { codigo_unico } = req.params;
    const { user_id } = req.body;

    console.log(`🗑️ DELETE /api/atividades/${codigo_unico} - Deletando atividade`);

    // Validar user_id
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: user_id'
      });
    }

    // Deletar atividade
    const result = await neonDB.deleteActivity(codigo_unico, user_id);

    if (result.success) {
      res.json({
        success: true,
        message: 'Atividade deletada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Erro no endpoint DELETE /api/atividades:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

console.log('✅ Todas as rotas de atividades registradas com sucesso!');
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
          <p><strong>GET /api/perfis</strong> - Buscar perfil</p>
        </div>
        <div class="endpoint">
          <p><strong>POST /api/perfis</strong> - Criar perfil</p>
        </div>
        <h3>Endpoints de Atividades:</h3>
        <div class="endpoint">
          <p><strong>POST /api/atividades</strong> - Criar nova atividade</p>
        </div>
        <div class="endpoint">
          <p><strong>PUT /api/atividades/:codigo_unico</strong> - Atualizar atividade</p>
        </div>
        <div class="endpoint">
          <p><strong>GET /api/atividades/usuario/:user_id</strong> - Buscar atividades do usuário</p>
        </div>
        <div class="endpoint">
          <p><strong>GET /api/atividades/:codigo_unico</strong> - Buscar atividade por código</p>
        </div>
        <div class="endpoint">
          <p><strong>DELETE /api/atividades/:codigo_unico</strong> - Deletar atividade</p>
        </div>
      </body>
    </html>
  `);
});

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({ status: 'Servidor de API funcionando corretamente!' });
});

// Rotas de atividades foram registradas com sucesso na função registerActivityRoutes()

// Inicializar banco de dados e iniciar servidor
async function startServer() {
  try {
    // Inicializar banco de dados
    console.log('🔄 Inicializando banco de dados...');
    await neonDB.initializeDatabase();

    // REGISTRAR ROTAS APÓS INICIALIZAÇÃO DO BANCO
    registerActivityRoutes();

    // Iniciar servidor
    app.listen(PORT, 'localhost', () => {
      console.log(`🚀 Servidor de API rodando na porta ${PORT}`);
      console.log(`🌐 Acesse em: http://localhost:${PORT}/api/status`);
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