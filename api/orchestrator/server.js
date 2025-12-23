/**
 * ====================================================================
 * SERVIDOR DO ORQUESTRADOR DE AULAS - PORTA 3001
 * ====================================================================
 * 
 * Servidor Express dedicado para o orquestrador de criação de aulas.
 * Roda separadamente do servidor principal para isolamento.
 * 
 * ENDPOINTS:
 * - POST /orchestrate - Inicia orquestração completa
 * - GET /status/:requestId - Verifica status do workflow
 * - GET /health - Health check
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import express from 'express';
import cors from 'cors';
import orchestrator from './lessonOrchestrator.js';
import { log, LOG_PREFIXES, logApiCall } from './debugLogger.js';

const app = express();
const PORT = process.env.ORCHESTRATOR_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logApiCall('SERVER', `${req.method} ${req.path}`, req.method, `${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'lesson-orchestrator',
    timestamp: new Date().toISOString(),
    groqConfigured: !!process.env.GROQ_API_KEY
  });
});

app.post('/orchestrate', async (req, res) => {
  log(LOG_PREFIXES.API, `Nova requisição de orquestração recebida`);
  
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
    log(LOG_PREFIXES.ERROR, `Erro na orquestração:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/status/:requestId', (req, res) => {
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

app.get('/activities-catalog', (req, res) => {
  try {
    const { loadActivitiesCatalog } = require('./agents/activitySuggestionAgent.js');
    const catalog = loadActivitiesCatalog();
    res.json({ success: true, catalog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n`);
  console.log(`╔════════════════════════════════════════════════════════════╗`);
  console.log(`║     🎭 ORQUESTRADOR DE AULAS - SERVIDOR ATIVO              ║`);
  console.log(`╠════════════════════════════════════════════════════════════╣`);
  console.log(`║  Porta: ${String(PORT).padEnd(49)}║`);
  console.log(`║  Endpoints:                                                ║`);
  console.log(`║    POST /orchestrate - Inicia criação de aula              ║`);
  console.log(`║    GET  /status/:id  - Verifica status do workflow         ║`);
  console.log(`║    GET  /health      - Health check                        ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
  console.log(`\n`);
});

export default app;
