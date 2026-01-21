/**
 * ====================================================================
 * PONTO. SCHOOL - GERADOR DE AULAS COM IA
 * ====================================================================
 * 
 * Este arquivo contém o fluxo completo de geração de aulas usando IA.
 * Implementa debugging milimétrico para rastreamento de cada etapa.
 * 
 * FLUXO DE EXECUÇÃO:
 * 1. [ENTRADA] Recebe dados do modal (template, assunto, contexto)
 * 2. [VALIDAÇÃO] Valida todos os campos obrigatórios
 * 3. [MAPEAMENTO] Mapeia seções do template para a IA
 * 4. [GERAÇÃO] Envia prompt para Groq API (com fallback para Gemini)
 * 5. [PARSING] Processa resposta JSON da IA
 * 6. [FORMATAÇÃO] Formata dados para a interface
 * 7. [RETORNO] Retorna dados prontos para popular os campos
 * 
 * VERSÃO: 2.0.0 - Com fallback para Gemini quando Groq atinge rate limit
 * ÚLTIMA ATUALIZAÇÃO: 2025-12-23
 * ====================================================================
 */

import { generateWithCascade, GROQ_MODELS_CASCADE, GEMINI_MODEL, getGroqClient } from '../groq.js';
import {
  SYSTEM_PROMPT,
  SECTION_DESCRIPTIONS,
  buildLessonGenerationPrompt,
  buildSectionRegenerationPrompt,
  buildTitleGenerationPrompt
} from './prompts.js';

/**
 * ====================================================================
 * CONFIGURAÇÃO E CONSTANTES
 * ====================================================================
 */
const MAX_RETRIES = 3;
const TIMEOUT_MS = 60000;
const GROQ_MODEL = GROQ_MODELS_CASCADE[0].id;

/**
 * ====================================================================
 * SISTEMA DE LOGGING MILIMÉTRICO
 * ====================================================================
 */
const LOG_PREFIX = {
  FLOW: '🔄 [LESSON-GEN:FLOW]',
  INPUT: '📥 [LESSON-GEN:INPUT]',
  VALIDATION: '✅ [LESSON-GEN:VALIDATION]',
  MAPPING: '🗺️ [LESSON-GEN:MAPPING]',
  API: '🤖 [LESSON-GEN:API]',
  PARSING: '📋 [LESSON-GEN:PARSING]',
  OUTPUT: '📤 [LESSON-GEN:OUTPUT]',
  ERROR: '❌ [LESSON-GEN:ERROR]',
  DEBUG: '🔍 [LESSON-GEN:DEBUG]',
  TIMING: '⏱️ [LESSON-GEN:TIMING]'
};

function log(prefix, message, data = null) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `${timestamp} ${prefix} ${message}`;
  
  if (data) {
    console.log(formattedMessage);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(formattedMessage);
  }
}

function logFlowStart(flowName, requestId) {
  log(LOG_PREFIX.FLOW, `========================================`);
  log(LOG_PREFIX.FLOW, `INICIANDO: ${flowName}`);
  log(LOG_PREFIX.FLOW, `Request ID: ${requestId}`);
  log(LOG_PREFIX.FLOW, `========================================`);
}

function logFlowEnd(flowName, requestId, success, duration) {
  log(LOG_PREFIX.FLOW, `========================================`);
  log(LOG_PREFIX.FLOW, `FINALIZANDO: ${flowName}`);
  log(LOG_PREFIX.FLOW, `Request ID: ${requestId}`);
  log(LOG_PREFIX.FLOW, `Status: ${success ? '✅ SUCESSO' : '❌ FALHA'}`);
  log(LOG_PREFIX.TIMING, `Duração total: ${duration}ms`);
  log(LOG_PREFIX.FLOW, `========================================`);
}

/**
 * ====================================================================
 * GERADOR DE REQUEST ID
 * ====================================================================
 */
function generateRequestId() {
  return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}



/**
 * ====================================================================
 * PARSER DE RESPOSTA JSON
 * ====================================================================
 */
function parseJsonResponse(content, requestId) {
  log(LOG_PREFIX.PARSING, `[${requestId}] Iniciando parse do JSON...`);
  log(LOG_PREFIX.DEBUG, `[${requestId}] Tamanho da resposta: ${content?.length || 0} caracteres`);
  
  if (!content || content.trim() === '') {
    log(LOG_PREFIX.ERROR, `[${requestId}] Resposta vazia da IA`);
    return null;
  }
  
  try {
    let jsonStr = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    // Sanitização robusta: substitui quebras de linha dentro de strings por espaço
    // Isso evita erros de "Bad control character in string literal"
    jsonStr = jsonStr.replace(/:\s*"([^"]*(?:\\.[^"]*)*)"/g, (match, content) => {
      const sanitized = content
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return `: "${sanitized}"`;
    });
    
    const parsed = JSON.parse(jsonStr);
    log(LOG_PREFIX.PARSING, `[${requestId}] ✅ JSON parseado com sucesso`);
    log(LOG_PREFIX.DEBUG, `[${requestId}] Campos encontrados:`, Object.keys(parsed));
    
    return parsed;
  } catch (err) {
    log(LOG_PREFIX.ERROR, `[${requestId}] Erro ao parsear JSON (tentativa 1):`, {
      error: err.message
    });
    
    // Tentativa 2: limpeza mais agressiva
    try {
      let jsonStr = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      // Remove todos os caracteres de controle exceto espaço
      jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, ' ');
      
      const parsed = JSON.parse(jsonStr);
      log(LOG_PREFIX.PARSING, `[${requestId}] ✅ JSON parseado com sucesso (tentativa 2 - limpeza agressiva)`);
      log(LOG_PREFIX.DEBUG, `[${requestId}] Campos encontrados:`, Object.keys(parsed));
      
      return parsed;
    } catch (err2) {
      log(LOG_PREFIX.ERROR, `[${requestId}] Erro ao parsear JSON (tentativa 2):`, {
        error: err2.message,
        contentPreview: content?.substring(0, 500)
      });
      return null;
    }
  }
}

/**
 * ====================================================================
 * VALIDAÇÃO DE ENTRADA
 * ====================================================================
 */
function validateInput(data, requestId) {
  log(LOG_PREFIX.VALIDATION, `[${requestId}] Validando dados de entrada...`);
  
  const errors = [];
  
  if (!data) {
    errors.push('Dados não fornecidos');
  } else {
    if (!data.templateId) {
      errors.push('templateId é obrigatório');
    }
    if (!data.templateName) {
      errors.push('templateName é obrigatório');
    }
    if (!data.assunto || data.assunto.trim() === '') {
      errors.push('assunto é obrigatório');
    }
    if (!data.sectionOrder || !Array.isArray(data.sectionOrder) || data.sectionOrder.length === 0) {
      errors.push('sectionOrder deve ser um array não vazio');
    }
  }
  
  if (errors.length > 0) {
    log(LOG_PREFIX.ERROR, `[${requestId}] Validação falhou:`, errors);
    return { valid: false, errors };
  }
  
  log(LOG_PREFIX.VALIDATION, `[${requestId}] ✅ Validação bem-sucedida`);
  log(LOG_PREFIX.DEBUG, `[${requestId}] Dados validados:`, {
    templateId: data.templateId,
    templateName: data.templateName,
    assunto: data.assunto?.substring(0, 100),
    contexto: data.contexto?.substring(0, 100) || '[vazio]',
    sectionCount: data.sectionOrder?.length
  });
  
  return { valid: true, errors: [] };
}

/**
 * ====================================================================
 * MAPEAMENTO DE SEÇÕES
 * ====================================================================
 */
function mapSectionsForAI(sectionOrder, requestId) {
  log(LOG_PREFIX.MAPPING, `[${requestId}] Mapeando ${sectionOrder.length} seções para a IA...`);
  
  const sectionDetails = {};
  
  const FALLBACK_SECTION_CONFIG = {
    'contextualizacao': { name: 'Contextualização', purpose: 'Conectar o conteúdo com a realidade dos alunos', guidelines: 'Use exemplos do cotidiano e perguntas provocativas' },
    'exploracao': { name: 'Exploração', purpose: 'Permitir investigação e descoberta', guidelines: 'Proponha atividades de pesquisa guiada' },
    'apresentacao': { name: 'Apresentação', purpose: 'Expor o conteúdo principal', guidelines: 'Estruture em tópicos com exemplos' },
    'pratica-guiada': { name: 'Prática Guiada', purpose: 'Orientar aplicação com suporte', guidelines: 'Descreva exercícios passo a passo' },
    'pratica-independente': { name: 'Prática Independente', purpose: 'Aplicação autônoma', guidelines: 'Proponha atividades individuais' },
    'fechamento': { name: 'Fechamento', purpose: 'Sintetizar aprendizado', guidelines: 'Inclua resumo e verificação' },
    'demonstracao': { name: 'Demonstração', purpose: 'Mostrar aplicação prática', guidelines: 'Descreva passo a passo' },
    'avaliacao': { name: 'Avaliação', purpose: 'Verificar aprendizado', guidelines: 'Proponha critérios claros' },
    'engajamento': { name: 'Engajamento', purpose: 'Motivar e capturar atenção', guidelines: 'Use dinâmicas e gamificação' },
    'colaboracao': { name: 'Colaboração', purpose: 'Trabalho em equipe', guidelines: 'Proponha atividades em grupo' },
    'reflexao': { name: 'Reflexão', purpose: 'Pensamento crítico', guidelines: 'Faça perguntas reflexivas' },
    'desenvolvimento': { name: 'Desenvolvimento', purpose: 'Aprofundar conteúdo', guidelines: 'Estruture em etapas progressivas' },
    'aplicacao': { name: 'Aplicação', purpose: 'Conectar teoria com prática', guidelines: 'Use casos reais' },
    'materiais': { name: 'Materiais Complementares', purpose: 'Recursos adicionais', guidelines: 'Liste vídeos, artigos, sites' },
    'observacoes': { name: 'Observações do Professor', purpose: 'Notas importantes', guidelines: 'Dicas de adaptação' },
    'bncc': { name: 'Critérios BNCC', purpose: 'Alinhamento curricular', guidelines: 'Liste códigos de habilidades' }
  };
  
  for (const sectionId of sectionOrder) {
    let description = SECTION_DESCRIPTIONS[sectionId];
    
    if (!description) {
      description = FALLBACK_SECTION_CONFIG[sectionId];
    }
    
    if (description) {
      sectionDetails[sectionId] = {
        name: description.name,
        purpose: description.purpose,
        guidelines: description.guidelines
      };
      log(LOG_PREFIX.DEBUG, `[${requestId}] Seção mapeada: ${sectionId} -> ${description.name}`);
    } else {
      const prettyName = sectionId
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      sectionDetails[sectionId] = {
        name: prettyName,
        purpose: 'Conteúdo educacional personalizado para esta seção',
        guidelines: 'Gere conteúdo relevante, didático e engajador relacionado ao tema da aula'
      };
      log(LOG_PREFIX.DEBUG, `[${requestId}] Seção com fallback genérico: ${sectionId} -> ${prettyName}`);
    }
  }
  
  log(LOG_PREFIX.MAPPING, `[${requestId}] ✅ Mapeamento concluído: ${Object.keys(sectionDetails).length} seções`);
  return sectionDetails;
}

/**
 * ====================================================================
 * FUNÇÃO PRINCIPAL: GERAR AULA COMPLETA
 * ====================================================================
 */
export async function generateLesson(data) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  logFlowStart('GERAÇÃO DE AULA COMPLETA', requestId);
  
  try {
    log(LOG_PREFIX.INPUT, `[${requestId}] Dados recebidos:`, {
      templateId: data.templateId,
      templateName: data.templateName,
      assunto: data.assunto,
      contexto: data.contexto?.substring(0, 200) || '[vazio]',
      sectionOrder: data.sectionOrder
    });
    
    const validation = validateInput(data, requestId);
    if (!validation.valid) {
      throw new Error(`Validação falhou: ${validation.errors.join(', ')}`);
    }
    
    const sectionDetails = mapSectionsForAI(data.sectionOrder, requestId);
    
    log(LOG_PREFIX.API, `[${requestId}] Construindo prompt para a IA...`);
    const prompt = buildLessonGenerationPrompt({
      templateId: data.templateId,
      templateName: data.templateName,
      assunto: data.assunto,
      contexto: data.contexto || '',
      sectionOrder: data.sectionOrder,
      sectionDetails
    });
    
    log(LOG_PREFIX.DEBUG, `[${requestId}] Tamanho do prompt: ${prompt.length} caracteres`);
    
    log(LOG_PREFIX.API, `[${requestId}] Enviando requisição com sistema de fallback multi-modelo...`);
    log(LOG_PREFIX.API, `[${requestId}] Modelos disponíveis: ${GROQ_MODELS_CASCADE.map(m => m.name).join(' → ')} → Gemini`);
    const apiStartTime = Date.now();
    
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];
    
    const result = await generateWithCascade(messages, {
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 0.9
    });
    
    const metadata = result._metadata || {};
    const usedFallback = metadata.usedFallback || false;
    const aiProvider = metadata.provider || 'groq';
    const modelUsed = metadata.modelName || metadata.model || 'unknown';
    
    const apiDuration = Date.now() - apiStartTime;
    log(LOG_PREFIX.TIMING, `[${requestId}] Tempo de resposta da API: ${apiDuration}ms`);
    log(LOG_PREFIX.API, `[${requestId}] ✅ Modelo usado: ${modelUsed} (${aiProvider})`);
    if (metadata.attempts > 1) {
      log(LOG_PREFIX.API, `[${requestId}] 📊 Tentativas: ${metadata.attempts}, Modelos tentados: ${metadata.totalModelsTriad}`);
    }
    
    const content = result.choices?.[0]?.message?.content;
    log(LOG_PREFIX.API, `[${requestId}] Resposta recebida:`, {
      tokensUsed: result.usage?.total_tokens,
      finishReason: result.choices?.[0]?.finish_reason,
      model: modelUsed,
      provider: aiProvider
    });
    
    const parsed = parseJsonResponse(content, requestId);
    
    if (!parsed) {
      throw new Error('Falha ao parsear resposta da IA');
    }
    
    const formattedResponse = {
      success: true,
      requestId,
      data: {
        titulo: parsed.titulo || `Aula sobre ${data.assunto}`,
        objetivo: parsed.objetivo || '',
        duracao_estimada: parsed.duracao_estimada || '50',
        nivel_ensino: parsed.nivel_ensino || '',
        secoes: parsed.secoes || {},
        tags: parsed.tags || [],
        competencias_bncc: parsed.competencias_bncc || []
      },
      metadata: {
        templateId: data.templateId,
        templateName: data.templateName,
        assunto: data.assunto,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        usedFallback: usedFallback,
        aiProvider: aiProvider,
        modelUsed: modelUsed,
        attempts: metadata.attempts || 1,
        totalModelsTriad: metadata.totalModelsTriad || 1
      }
    };
    
    log(LOG_PREFIX.OUTPUT, `[${requestId}] Resposta formatada:`, {
      titulo: formattedResponse.data.titulo,
      secoesGeradas: Object.keys(formattedResponse.data.secoes),
      tempoProcessamento: `${formattedResponse.metadata.processingTime}ms`
    });
    
    logFlowEnd('GERAÇÃO DE AULA COMPLETA', requestId, true, Date.now() - startTime);
    
    return formattedResponse;
    
  } catch (error) {
    log(LOG_PREFIX.ERROR, `[${requestId}] Erro fatal:`, {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
    
    logFlowEnd('GERAÇÃO DE AULA COMPLETA', requestId, false, Date.now() - startTime);
    
    return {
      success: false,
      requestId,
      error: error.message,
      data: null,
      metadata: {
        templateId: data?.templateId,
        failedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * ====================================================================
 * FUNÇÃO: REGENERAR SEÇÃO ESPECÍFICA
 * ====================================================================
 */
export async function regenerateSection(data) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  logFlowStart('REGENERAÇÃO DE SEÇÃO', requestId);
  
  try {
    log(LOG_PREFIX.INPUT, `[${requestId}] Dados de regeneração:`, {
      sectionId: data.sectionId,
      sectionName: data.sectionName,
      assunto: data.assunto
    });
    
    const prompt = buildSectionRegenerationPrompt({
      sectionId: data.sectionId,
      sectionName: data.sectionName,
      assunto: data.assunto,
      contexto: data.contexto,
      currentContent: data.currentContent,
      instruction: data.instruction
    });
    
    log(LOG_PREFIX.API, `[${requestId}] Enviando requisição de regeneração...`);
    
    const result = await withRetry(async () => {
      const client = getGroqClient();
      
      return await client.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        top_p: 0.9
      });
    }, MAX_RETRIES, requestId);
    
    const content = result.choices?.[0]?.message?.content;
    const parsed = parseJsonResponse(content, requestId);
    
    if (!parsed || !parsed.conteudo) {
      throw new Error('Resposta inválida para regeneração de seção');
    }
    
    logFlowEnd('REGENERAÇÃO DE SEÇÃO', requestId, true, Date.now() - startTime);
    
    return {
      success: true,
      requestId,
      data: {
        sectionId: data.sectionId,
        content: parsed.conteudo
      },
      metadata: {
        processingTime: Date.now() - startTime
      }
    };
    
  } catch (error) {
    log(LOG_PREFIX.ERROR, `[${requestId}] Erro na regeneração:`, { message: error.message });
    
    logFlowEnd('REGENERAÇÃO DE SEÇÃO', requestId, false, Date.now() - startTime);
    
    return {
      success: false,
      requestId,
      error: error.message,
      data: null
    };
  }
}

/**
 * ====================================================================
 * FUNÇÃO: GERAR OPÇÕES DE TÍTULO
 * ====================================================================
 */
export async function generateTitleOptions(assunto, contexto) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  logFlowStart('GERAÇÃO DE TÍTULOS', requestId);
  
  try {
    const prompt = buildTitleGenerationPrompt(assunto, contexto);
    
    const result = await withRetry(async () => {
      const client = getGroqClient();
      
      return await client.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 500,
        top_p: 0.9
      });
    }, MAX_RETRIES, requestId);
    
    const content = result.choices?.[0]?.message?.content;
    const parsed = parseJsonResponse(content, requestId);
    
    logFlowEnd('GERAÇÃO DE TÍTULOS', requestId, true, Date.now() - startTime);
    
    return {
      success: true,
      requestId,
      data: {
        titulos: parsed?.titulos || [`Aula sobre ${assunto}`]
      }
    };
    
  } catch (error) {
    log(LOG_PREFIX.ERROR, `[${requestId}] Erro ao gerar títulos:`, { message: error.message });
    
    logFlowEnd('GERAÇÃO DE TÍTULOS', requestId, false, Date.now() - startTime);
    
    return {
      success: false,
      requestId,
      error: error.message,
      data: { titulos: [`Aula sobre ${assunto}`] }
    };
  }
}

/**
 * ====================================================================
 * FUNÇÃO: TESTAR CONEXÃO
 * ====================================================================
 */
export async function testConnection() {
  const requestId = generateRequestId();
  
  log(LOG_PREFIX.API, `[${requestId}] Testando conexão com Groq API...`);
  
  try {
    const client = getGroqClient();
    
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: 'Responda apenas "OK"' }],
      max_tokens: 10,
      temperature: 0
    });
    
    if (response.choices?.[0]?.message?.content) {
      log(LOG_PREFIX.API, `[${requestId}] ✅ Conexão OK`);
      return { success: true, message: 'Conexão com Groq API funcionando' };
    }
    
    return { success: false, message: 'Resposta vazia do modelo' };
    
  } catch (error) {
    log(LOG_PREFIX.ERROR, `[${requestId}] Erro de conexão:`, { message: error.message });
    return { success: false, message: error.message };
  }
}

export default {
  generateLesson,
  regenerateSection,
  generateTitleOptions,
  testConnection
};
