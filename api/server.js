import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import emailRoutes from './enviar-email.js';
import neonDBModule from './neon-db.js';
import perfilsHandler from './perfis.js';

const { neonDB } = neonDBModule;

dotenv.config();

// Configuração do Supabase para verificação JWT
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;

// Cliente Supabase para verificação de tokens
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('⚠️ Configuração do Supabase não encontrada - autenticação desabilitada');
}

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

// =================
// MIDDLEWARE DE AUTENTICAÇÃO JWT
// =================

function authenticateSupabaseUser(req, res, next) {
  // FAIL-CLOSED: Negar acesso se Supabase não estiver configurado
  if (!supabase || !supabaseJwtSecret) {
    console.error('❌ CONFIGURAÇÃO DE SEGURANÇA AUSENTE - ACESSO NEGADO');
    return res.status(503).json({
      success: false,
      error: 'Serviço de autenticação indisponível'
    });
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação obrigatório'
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    // Verificar a assinatura do token JWT do Supabase
    if (!supabaseJwtSecret) {
      console.error('❌ SUPABASE_JWT_SECRET não configurado - falha de segurança crítica');
      return res.status(500).json({
        success: false,
        error: 'Configuração de segurança não encontrada'
      });
    }

    // Verificar token com assinatura usando o secret do Supabase
    const payload = jwt.verify(token, supabaseJwtSecret, { algorithms: ['HS256'] });
    
    if (!payload || !payload.sub) {
      return res.status(401).json({
        success: false,
        error: 'Token sem informações de usuário'
      });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: payload.sub,
      email: payload.email || null,
      aud: payload.aud || null
    };

    console.log(`🔒 Usuário autenticado: ${req.user.id} (${req.user.email || 'sem email'})`);
    next();
    
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error);
    return res.status(401).json({
      success: false,
      error: 'Erro na verificação do token'
    });
  }
}

// Rotas
app.use('/api/email', emailRoutes);  // Mover para prefixo específico para não interferir com outras rotas
app.use('/api/perfis', perfilsHandler);

// =================
// FUNÇÃO PARA REGISTRAR ROTAS DE ATIVIDADES
// =================

function registerActivityRoutes() {
  console.log('🔧 Registrando rotas de atividades...');


  // Criar nova atividade - ROTA PROTEGIDA
  app.post('/api/atividades', authenticateSupabaseUser, async (req, res) => {
  try {
    console.log('📝 POST /api/atividades - Nova atividade autenticada');
    console.log('🔒 Usuário autenticado:', req.user?.id);
    
    const { codigo_unico, tipo, titulo, descricao, conteudo } = req.body;
    
    // user_id agora vem da autenticação, não do body
    const user_id = req.user?.id;

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

// Atualizar atividade existente - ROTA PROTEGIDA
app.put('/api/atividades/:codigo_unico', authenticateSupabaseUser, async (req, res) => {
  try {
    const { codigo_unico } = req.params;
    const { titulo, descricao, conteudo } = req.body;
    const user_id = req.user?.id;

    console.log(`🔄 PUT /api/atividades/${codigo_unico} - Usuário autenticado: ${user_id}`);

    // Validar campos obrigatórios
    if (!conteudo) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: conteudo'
      });
    }

    // VERIFICAÇÃO DE PROPRIEDADE: Primeiro verificar se a atividade pertence ao usuário
    const existingActivity = await neonDB.getActivityByCode(codigo_unico);
    
    if (!existingActivity.success || !existingActivity.data || existingActivity.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }

    if (existingActivity.data[0].user_id !== user_id) {
      console.warn(`🚫 Acesso negado: usuário ${user_id} tentou atualizar atividade de ${existingActivity.data[0].user_id}`);
      return res.status(403).json({
        success: false,
        error: 'Acesso negado: você só pode atualizar suas próprias atividades'
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

// Buscar atividades do usuário (histórico) - ROTA PROTEGIDA
app.get('/api/atividades/usuario/:user_id', authenticateSupabaseUser, async (req, res) => {
  try {
    // user_id agora vem da autenticação, não dos parâmetros
    const user_id = req.user?.id;
    const requested_user_id = req.params.user_id;

    console.log(`🔍 GET /api/atividades/usuario/${requested_user_id} - Usuário autenticado: ${user_id}`);

    // Verificar se o usuário pode acessar apenas suas próprias atividades
    if (user_id !== requested_user_id) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado: você só pode ver suas próprias atividades'
      });
    }

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

// Buscar atividade por código único - ROTA PROTEGIDA
app.get('/api/atividades/:codigo_unico', authenticateSupabaseUser, async (req, res) => {
  try {
    const { codigo_unico } = req.params;
    const user_id = req.user?.id;

    console.log(`🔍 GET /api/atividades/${codigo_unico} - Usuário autenticado: ${user_id}`);

    // Buscar atividade por código
    const result = await neonDB.getActivityByCode(codigo_unico);

    if (result.success && result.data && result.data.length > 0) {
      const activity = result.data[0];
      
      // VERIFICAÇÃO DE PROPRIEDADE: Usuário só pode acessar suas próprias atividades
      if (activity.user_id !== user_id) {
        console.warn(`🚫 Acesso negado: usuário ${user_id} tentou acessar atividade de ${activity.user_id}`);
        return res.status(403).json({
          success: false,
          error: 'Acesso negado: você só pode acessar suas próprias atividades'
        });
      }
      
      res.json({
        success: true,
        data: activity
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error || 'Atividade não encontrada'
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

// Deletar atividade - ROTA PROTEGIDA
app.delete('/api/atividades/:codigo_unico', authenticateSupabaseUser, async (req, res) => {
  try {
    const { codigo_unico } = req.params;
    // user_id agora vem da autenticação, não do body
    const user_id = req.user?.id;

    console.log(`🗑️ DELETE /api/atividades/${codigo_unico} - Usuário autenticado: ${user_id}`);

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
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

  // Rota para atualizar coluna de ligação entre perfis e atividades
  app.post('/api/perfis/update-connection', authenticateSupabaseUser, async (req, res) => {
    try {
      console.log('🔗 POST /api/perfis/update-connection - Atualizando coluna de ligação');
      const { activity_id, activity_code, activity_title, activity_type, timestamp } = req.body;
      
      // user_id agora vem da autenticação, não do body
      const user_id = req.user?.id;
      
      console.log('📊 Dados recebidos:', {
        user_id,
        activity_id,
        activity_code,
        activity_title,
        activity_type,
        timestamp
      });

      if (!user_id || !activity_id) {
        return res.status(400).json({
          success: false,
          error: 'user_id e activity_id são obrigatórios'
        });
      }

      // Buscar o perfil atual para obter as conexões existentes
      const currentProfileResult = await neonDB.executeQuery(
        'SELECT activities_connection FROM perfis WHERE id = $1',
        [user_id]
      );

      if (!currentProfileResult.success || currentProfileResult.data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Perfil não encontrado'
        });
      }

      // Obter conexões atuais ou inicializar array vazio
      let currentConnections = currentProfileResult.data[0].activities_connection || [];
      
      // Adicionar nova conexão
      const newConnection = {
        activity_id,
        activity_code,
        activity_title,
        activity_type,
        created_at: timestamp,
        auto_saved: true
      };

      // Verificar se já existe uma conexão para esta atividade (evitar duplicatas)
      const existingIndex = currentConnections.findIndex(conn => conn.activity_id === activity_id);
      
      if (existingIndex >= 0) {
        // Atualizar conexão existente
        currentConnections[existingIndex] = newConnection;
        console.log('✏️ Atualizando conexão existente para atividade:', activity_id);
      } else {
        // Adicionar nova conexão
        currentConnections.push(newConnection);
        console.log('➕ Adicionando nova conexão para atividade:', activity_id);
      }

      // Atualizar o perfil com as novas conexões
      const updateResult = await neonDB.executeQuery(
        'UPDATE perfis SET activities_connection = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [JSON.stringify(currentConnections), user_id]
      );

      if (updateResult.success && updateResult.data.length > 0) {
        console.log('✅ Coluna de ligação atualizada com sucesso para perfil:', user_id);
        console.log('📈 Total de conexões:', currentConnections.length);
        
        res.json({
          success: true,
          data: {
            user_id,
            total_connections: currentConnections.length,
            updated_connection: newConnection
          }
        });
      } else {
        throw new Error('Falha ao atualizar o perfil');
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar coluna de ligação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor ao atualizar coluna de ligação',
        details: error.message
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