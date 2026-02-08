import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import emailRoutes from './enviar-email.js';
import neonDB from './neon-db.js';
import perfilsHandler from './perfis.js';
import atividadesRoutes from './atividades.js';
import uploadAvatarRoutes from './upload-avatar.js';
import visitantesRoutes from './visitantes.js';
import translateRoutes from './translate.js';
import { runConversion, getConversionStats, deletePngFiles } from '../scripts/convert-images-to-webp.js';
import groqService from './groq.js';
import lessonGenerator from './ai/lesson-generator.js';
import orchestrator from './orchestrator/lessonOrchestrator.js';
import { loadActivitiesCatalog } from './orchestrator/agents/activitySuggestionAgent.js';
import { log as orchestratorLog, LOG_PREFIXES } from './orchestrator/debugLogger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Detectar ambiente
const isProduction = process.env.REPLIT_DEPLOYMENT === '1' || 
                     process.env.NODE_ENV === 'production' ||
                     process.env.REPL_DEPLOYMENT === '1';

// Em produção usa porta 5000 (porta única), em dev usa 3001 (backend separado)
const PORT = isProduction ? 5000 : (process.env.PORT || 3001);

console.log(`🌍 Ambiente: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

// Middleware
app.use(cors({
  origin: isProduction ? true : ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://0.0.0.0:5000', 'http://localhost:3000', 'http://0.0.0.0:3000'],
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

// Middleware para tratamento de erros JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Erro de JSON malformado:', err);
    return res.status(400).json({ error: 'JSON malformado na requisição' });
  }
  next();
});

// Middleware de cache para assets estáticos
const cacheMiddleware = (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
  
  if (staticExtensions.includes(ext)) {
    // Assets com hash no nome: cache agressivo (1 ano)
    if (req.path.includes('-') && /\.[a-f0-9]{8,}\./.test(req.path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // Assets sem hash: cache moderado (1 dia)
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  } else if (ext === '.html' || req.path === '/') {
    // HTML: sem cache ou cache muito curto
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
};

// Middleware de compressão headers
const compressionHeaders = (req, res, next) => {
  // Vary header para CDN e proxy caching
  res.setHeader('Vary', 'Accept-Encoding');
  next();
};

// Em produção, servir arquivos estáticos do build com cache otimizado
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  console.log(`📁 Servindo arquivos estáticos de: ${distPath}`);
  
  app.use(compressionHeaders);
  app.use(cacheMiddleware);
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
}

// Rotas API
app.use('/api/enviar-email', emailRoutes);
app.use('/api/perfis', perfilsHandler);
app.use('/api/upload-avatar', uploadAvatarRoutes);
app.use('/api/atividades-neon', atividadesRoutes);
app.use('/api/visitantes', visitantesRoutes);
app.use('/api/translate', translateRoutes);

// ========================================
// ROTAS DE IA GROQ
// ========================================

app.get('/api/groq/test', async (req, res) => {
  try {
    console.log('🧪 Testando conexão com Groq...');
    const result = await groqService.testGroqConnection();
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao testar conexão Groq:', error);
    res.status(500).json({
      success: false,
      message: `❌ Erro: ${error.message}`
    });
  }
});

app.post('/api/groq/generate', async (req, res) => {
  try {
    const { prompt, activityType } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: prompt'
      });
    }
    
    console.log(`🤖 Processando prompt: "${prompt.substring(0, 50)}..." (tipo: ${activityType || 'auto'})`);
    
    const result = await groqService.processUserPrompt(prompt, activityType);
    
    console.log(`✅ Resposta gerada: tipo=${result.type}, sucesso=${result.success}`);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao gerar conteúdo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

app.post('/api/groq/flashcards', async (req, res) => {
  try {
    const { topic, quantity = 5 } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: topic'
      });
    }
    
    console.log(`📚 Gerando ${quantity} flashcards sobre: "${topic}"`);
    
    const flashcards = await groqService.generateFlashcards(topic, quantity);
    
    res.json({
      success: true,
      type: 'flashcards',
      data: flashcards
    });
  } catch (error) {
    console.error('❌ Erro ao gerar flashcards:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

app.post('/api/groq/quiz', async (req, res) => {
  try {
    const { topic, questions = 5 } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: topic'
      });
    }
    
    console.log(`🧠 Gerando quiz com ${questions} questões sobre: "${topic}"`);
    
    const quiz = await groqService.generateQuiz(topic, questions);
    
    res.json({
      success: true,
      type: 'quiz',
      data: quiz
    });
  } catch (error) {
    console.error('❌ Erro ao gerar quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

app.post('/api/groq/test', async (req, res) => {
  try {
    const { topic, questions = 10, difficulty = 'médio' } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: topic'
      });
    }
    
    console.log(`📝 Gerando prova com ${questions} questões (${difficulty}) sobre: "${topic}"`);
    
    const test = await groqService.generateTest(topic, questions, difficulty);
    
    res.json({
      success: true,
      type: 'test',
      data: test
    });
  } catch (error) {
    console.error('❌ Erro ao gerar prova:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

app.post('/api/groq/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: message'
      });
    }
    
    console.log(`💬 Chat: "${message.substring(0, 50)}..."`);
    
    const response = await groqService.chat(message, conversationHistory);
    
    res.json({
      success: true,
      type: 'chat',
      data: response
    });
  } catch (error) {
    console.error('❌ Erro no chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// ========================================
// ROTAS DE GERAÇÃO DE AULAS COM IA
// ========================================
// Sistema dedicado para geração automática de conteúdo de aulas
// Fluxo: Modal → Template → Assunto/Contexto → IA → Campos preenchidos
// ========================================

app.get('/api/lesson-generator/test', async (req, res) => {
  try {
    console.log('🧪 [LESSON-GENERATOR] Testando conexão...');
    const result = await lessonGenerator.testConnection();
    res.json(result);
  } catch (error) {
    console.error('❌ [LESSON-GENERATOR] Erro no teste:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/lesson-generator/generate', async (req, res) => {
  try {
    console.log('🎓 [LESSON-GENERATOR] ========================================');
    console.log('🎓 [LESSON-GENERATOR] NOVA REQUISIÇÃO DE GERAÇÃO DE AULA');
    console.log('🎓 [LESSON-GENERATOR] ========================================');
    console.log('🎓 [LESSON-GENERATOR] Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { templateId, templateName, assunto, contexto, sectionOrder } = req.body;
    
    if (!templateId || !templateName || !assunto || !sectionOrder) {
      console.log('❌ [LESSON-GENERATOR] Validação falhou - campos obrigatórios faltando');
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: templateId, templateName, assunto, sectionOrder'
      });
    }
    
    console.log('🎓 [LESSON-GENERATOR] Validação OK - iniciando geração...');
    console.log(`🎓 [LESSON-GENERATOR] Template: ${templateName} (${templateId})`);
    console.log(`🎓 [LESSON-GENERATOR] Assunto: ${assunto}`);
    console.log(`🎓 [LESSON-GENERATOR] Contexto: ${contexto || '[não fornecido]'}`);
    console.log(`🎓 [LESSON-GENERATOR] Seções: ${sectionOrder.length} seções`);
    
    const result = await lessonGenerator.generateLesson({
      templateId,
      templateName,
      assunto,
      contexto: contexto || '',
      sectionOrder
    });
    
    console.log('🎓 [LESSON-GENERATOR] Resultado:', result.success ? '✅ SUCESSO' : '❌ FALHA');
    console.log(`🎓 [LESSON-GENERATOR] Request ID: ${result.requestId}`);
    
    if (result.success) {
      console.log(`🎓 [LESSON-GENERATOR] Título gerado: ${result.data.titulo}`);
      console.log(`🎓 [LESSON-GENERATOR] Seções geradas: ${Object.keys(result.data.secoes).length}`);
    }
    
    console.log('🎓 [LESSON-GENERATOR] ========================================');
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ [LESSON-GENERATOR] Erro fatal:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

app.post('/api/lesson-generator/regenerate-section', async (req, res) => {
  try {
    console.log('🔄 [LESSON-GENERATOR] Regenerando seção...');
    console.log('🔄 [LESSON-GENERATOR] Dados:', JSON.stringify(req.body, null, 2));
    
    const { sectionId, sectionName, assunto, contexto, currentContent, instruction } = req.body;
    
    if (!sectionId || !sectionName || !assunto) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: sectionId, sectionName, assunto'
      });
    }
    
    const result = await lessonGenerator.regenerateSection({
      sectionId,
      sectionName,
      assunto,
      contexto,
      currentContent,
      instruction
    });
    
    console.log('🔄 [LESSON-GENERATOR] Regeneração:', result.success ? '✅ SUCESSO' : '❌ FALHA');
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ [LESSON-GENERATOR] Erro na regeneração:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

app.post('/api/lesson-generator/generate-titles', async (req, res) => {
  try {
    console.log('📝 [LESSON-GENERATOR] Gerando opções de títulos...');
    
    const { assunto, contexto } = req.body;
    
    if (!assunto) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: assunto'
      });
    }
    
    const result = await lessonGenerator.generateTitleOptions(assunto, contexto);
    
    console.log('📝 [LESSON-GENERATOR] Títulos gerados:', result.success ? '✅' : '❌');
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ [LESSON-GENERATOR] Erro ao gerar títulos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// ========================================
// ROTAS DO ORQUESTRADOR DE AULAS
// ========================================

app.get('/api/orchestrator/health', (req, res) => {
  orchestratorLog(LOG_PREFIXES.API, 'Health check do orquestrador');
  res.json({ 
    status: 'ok', 
    service: 'lesson-orchestrator',
    timestamp: new Date().toISOString(),
    groqConfigured: !!process.env.GROQ_API_KEY
  });
});

app.post('/api/orchestrator/orchestrate', async (req, res) => {
  orchestratorLog(LOG_PREFIXES.API, 'Nova requisição de orquestração recebida');
  
  const { lessonContext, options = {} } = req.body;

  if (!lessonContext) {
    return res.status(400).json({ 
      success: false, 
      error: 'lessonContext é obrigatório' 
    });
  }

  try {
    const result = await orchestrator.orchestrate(lessonContext, options);
    
    res.json({
      success: result.success,
      requestId: result.requestId,
      lesson: result.lesson,
      activities: result.activities,
      timing: result.timing,
      errors: result.errors
    });

  } catch (error) {
    orchestratorLog(LOG_PREFIXES.ERROR, `Erro na orquestração: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/orchestrator/status/:requestId', (req, res) => {
  const { requestId } = req.params;
  const state = orchestrator.getWorkflowState(requestId);

  if (!state) {
    return res.status(404).json({ 
      success: false, 
      error: 'Workflow não encontrado ou já finalizado' 
    });
  }

  res.json({ success: true, ...state });
});

app.get('/api/orchestrator/activities-catalog', (req, res) => {
  try {
    const catalog = loadActivitiesCatalog();
    res.json({ success: true, catalog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SSE Stream para progresso em tempo real
const sseClients = new Map();

app.get('/api/orchestrator/stream/:requestId', (req, res) => {
  const { requestId } = req.params;
  
  orchestratorLog(LOG_PREFIXES.API, `SSE: Cliente conectado para ${requestId}`);
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (eventType, data) => {
    const payload = { type: eventType, ...data, timestamp: Date.now() };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent('connected', { requestId });

  sseClients.set(requestId, sendEvent);
  
  orchestrator.registerSSEClient(requestId, sendEvent);

  req.on('close', () => {
    sseClients.delete(requestId);
    orchestrator.unregisterSSEClient(requestId);
    orchestratorLog(LOG_PREFIXES.API, `SSE: Cliente desconectado de ${requestId}`);
  });
});

app.get('/api/orchestrator/logs/:requestId', (req, res) => {
  const { requestId } = req.params;
  const stepId = req.query.step ? parseInt(String(req.query.step)) : undefined;
  
  const logs = orchestrator.getStepLogs(requestId, stepId);
  
  if (!logs) {
    return res.status(404).json({ 
      success: false, 
      error: 'Logs não encontrados para este requestId' 
    });
  }
  
  res.json({ success: true, logs });
});

app.post('/api/orchestrator/orchestrate-stream', async (req, res) => {
  orchestratorLog(LOG_PREFIXES.API, 'Nova requisição de orquestração com streaming');
  
  const { lessonContext, options = {} } = req.body;

  if (!lessonContext) {
    return res.status(400).json({ 
      success: false, 
      error: 'lessonContext é obrigatório' 
    });
  }

  const requestId = lessonContext.requestId;
  orchestratorLog(LOG_PREFIXES.API, `RequestId recebido: ${requestId}`);

  try {
    const onProgress = (state) => {
      const sendEvent = sseClients.get(requestId);
      if (sendEvent) {
        sendEvent('progress', { 
          ...state,
          requestId
        });
      }
    };

    const result = await orchestrator.orchestrate(lessonContext, {
      ...options,
      onProgress
    });
    
    const sendEvent = sseClients.get(requestId);
    if (sendEvent) {
      sendEvent(result.success ? 'complete' : 'failed', {
        success: result.success,
        lesson: result.lesson,
        activities: result.activities,
        timing: result.timing,
        errors: result.errors,
        logs: result.logs,
        validationSummary: result.validationSummary,
        requestId: result.requestId
      });
    }
    
    res.json({
      success: result.success,
      requestId: result.requestId,
      lesson: result.lesson,
      activities: result.activities,
      timing: result.timing,
      errors: result.errors,
      logs: result.logs,
      validationSummary: result.validationSummary
    });

  } catch (error) {
    orchestratorLog(LOG_PREFIXES.ERROR, `Erro na orquestração com streaming: ${error.message}`);
    
    const sendEvent = sseClients.get(requestId);
    if (sendEvent) {
      sendEvent('error', { 
        message: error.message,
        requestId
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rota de teste de conexão com banco de dados (simples)
app.get('/api/test-db-connection', async (req, res) => {
  try {
    console.log('🔍 [TEST] Testando conexão com banco de dados Neon...');
    
    // Detectar ambiente
    const isDeployment = process.env.REPLIT_DEPLOYMENT === '1' || 
                         process.env.NODE_ENV === 'production' ||
                         process.env.REPL_DEPLOYMENT === '1' ||
                         process.env.REPLIT_ENV === 'production';
    
    const environmentInfo = {
      ambiente: isDeployment ? 'DEPLOYMENT (Publicado)' : 'DEVELOPMENT (Replit)',
      REPLIT_DEPLOYMENT: process.env.REPLIT_DEPLOYMENT || 'não definido',
      NODE_ENV: process.env.NODE_ENV || 'não definido',
      REPL_DEPLOYMENT: process.env.REPL_DEPLOYMENT || 'não definido',
      REPLIT_ENV: process.env.REPLIT_ENV || 'não definido',
      hasDeploymentSecret: !!process.env.DEPLOYMENT_DB_URL,
      hasProductionSecret: !!process.env.PRODUCTION_DB_URL
    };
    
    // Tentar consulta simples
    const result = await neonDB.executeQuery('SELECT NOW() as current_time, current_database() as database_name');
    
    if (result.success) {
      console.log('✅ [TEST] Conexão bem-sucedida!');
      console.log('✅ [TEST] Database:', result.data[0]?.database_name);
      
      res.json({
        success: true,
        message: 'Conexão com banco de dados Neon estabelecida com sucesso!',
        environmentInfo,
        databaseInfo: {
          currentTime: result.data[0]?.current_time,
          databaseName: result.data[0]?.database_name
        }
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ [TEST] Erro ao conectar com banco:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha ao conectar com banco de dados',
      message: error.message
    });
  }
});

// Endpoint /db-status - HEALTH CHECK COMPLETO com monitoring
app.get('/api/db-status', async (req, res) => {
  try {
    console.log('🏥 [HEALTH CHECK] Verificando status do banco de dados...');
    
    // Detectar ambiente
    const isDeployment = process.env.REPLIT_DEPLOYMENT === '1' || 
                         process.env.NODE_ENV === 'production' ||
                         process.env.REPL_DEPLOYMENT === '1' ||
                         process.env.REPLIT_ENV === 'production';
    
    // 1. Teste de conexão básico (SELECT 1)
    const testQuery = await neonDB.executeQuery('SELECT 1 as test');
    
    if (!testQuery.success) {
      throw new Error(`Teste de conexão falhou: ${testQuery.error}`);
    }
    
    // 2. Consultar conexões ativas no banco
    const activeConnectionsQuery = await neonDB.executeQuery(
      `SELECT COUNT(*) as count FROM pg_stat_activity WHERE datname = $1`,
      [process.env.PGDATABASE || 'neondb']
    );
    
    // 3. Consultar max_connections permitido
    const maxConnectionsQuery = await neonDB.executeQuery('SHOW max_connections');
    
    // 4. Informações do banco
    const dbInfoQuery = await neonDB.executeQuery(
      `SELECT current_database() as database_name, 
              current_user as user_name,
              version() as postgres_version,
              NOW() as server_time`
    );
    
    // 5. Verificar tabelas principais
    const tablesQuery = await neonDB.executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesQuery.success ? tablesQuery.data.map(t => t.table_name) : [];
    
    // Montar resposta completa
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: isDeployment ? 'PRODUCTION (Deployment)' : 'DEVELOPMENT (Local)',
      test_query: testQuery.data,
      database_info: dbInfoQuery.success ? dbInfoQuery.data[0] : null,
      connections: {
        active: activeConnectionsQuery.success ? parseInt(activeConnectionsQuery.data[0].count) : 'unknown',
        max_allowed: maxConnectionsQuery.success ? maxConnectionsQuery.data[0].max_connections : 'unknown'
      },
      tables: tables,
      env_vars: {
        PRODUCTION_DB_URL: process.env.PRODUCTION_DB_URL ? 'configurado ✅' : 'não configurado',
        DATABASE_URL: process.env.DATABASE_URL ? 'configurado ✅' : 'não configurado',
        DEPLOYMENT_DB_URL: process.env.DEPLOYMENT_DB_URL ? 'configurado ✅' : 'não configurado',
        PGDATABASE: process.env.PGDATABASE || 'não definido',
        NODE_ENV: process.env.NODE_ENV || 'não definido'
      }
    };
    
    console.log('✅ [HEALTH CHECK] Status: OK');
    console.log(`   - Conexões ativas: ${healthStatus.connections.active}/${healthStatus.connections.max_allowed}`);
    console.log(`   - Tabelas: ${tables.length} encontradas`);
    
    res.json(healthStatus);
    
  } catch (error) {
    console.error('❌ [HEALTH CHECK] Erro:', error.message);
    res.status(500).json({
      status: 'ERRO',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

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
        <div class="endpoint">
          <p><strong>POST /api/upload-avatar</strong> - Upload de avatar</p>
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

// ========================================
// ROTAS DE CONVERSÃO DE IMAGENS PNG → WebP
// ========================================

app.get('/api/image-conversion-status', (req, res) => {
  try {
    const stats = getConversionStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erro ao obter status de conversão:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/convert-images', async (req, res) => {
  if (isProduction) {
    return res.status(403).json({
      success: false,
      error: 'Esta operação não é permitida em produção'
    });
  }
  
  try {
    console.log('🖼️ Iniciando conversão de imagens PNG → WebP...');
    const stats = await runConversion();
    res.json({
      success: true,
      message: 'Conversão concluída com sucesso!',
      data: stats
    });
  } catch (error) {
    console.error('❌ Erro durante conversão de imagens:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/delete-png-originals', async (req, res) => {
  if (isProduction) {
    return res.status(403).json({
      success: false,
      error: 'Esta operação não é permitida em produção'
    });
  }
  
  try {
    console.log('🗑️ Deletando arquivos PNG originais...');
    const deletedCount = await deletePngFiles();
    res.json({
      success: true,
      message: `${deletedCount} arquivos PNG deletados com sucesso!`,
      deletedCount
    });
  } catch (error) {
    console.error('❌ Erro ao deletar arquivos PNG:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
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

    // SPA Fallback - Servir index.html para todas as rotas não-API em produção
    // IMPORTANTE: Deve ser a ÚLTIMA rota registrada!
    if (isProduction) {
      // Usando middleware ao invés de wildcard route para evitar problemas com path-to-regexp
      app.use((req, res, next) => {
        // Se a rota não for de API, servir index.html
        if (!req.path.startsWith('/api')) {
          const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
          console.log(`📄 Servindo index.html de: ${indexPath} para rota: ${req.path}`);
          res.sendFile(indexPath);
        } else {
          next();
        }
      });
      console.log('✅ SPA Fallback configurado (servindo index.html para rotas não-API)');
    }

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor de API rodando na porta ${PORT}`);
      console.log(`🌐 Acesse em: http://localhost:${PORT}/api/status`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();

// SHUTDOWN HANDLER - Fechar pool de conexões ao desligar servidor
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM recebido, encerrando servidor graciosamente...');
  try {
    await neonDB.closePool();
    console.log('✅ Pool de conexões encerrado com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar pool:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('⚠️ SIGINT recebido, encerrando servidor graciosamente...');
  try {
    await neonDB.closePool();
    console.log('✅ Pool de conexões encerrado com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar pool:', error);
    process.exit(1);
  }
});

// Tratamento global de erros para evitar que o servidor caia
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado no servidor:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
});