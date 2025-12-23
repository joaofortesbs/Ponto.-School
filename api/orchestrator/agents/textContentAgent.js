/**
 * ====================================================================
 * AGENTE DE GERAÇÃO DE CONTEÚDO TEXTUAL
 * ====================================================================
 * 
 * Este agente é responsável por gerar o conteúdo textual de cada
 * seção da aula usando a API Groq.
 * 
 * RESPONSABILIDADES:
 * - Receber o contexto da aula (template, assunto, seções)
 * - Gerar conteúdo para cada seção
 * - Retornar textos formatados para popular os blocos
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import Groq from 'groq-sdk';
import { log, LOG_PREFIXES, logContentGeneration } from '../debugLogger.js';

const API_KEY = process.env.GROQ_API_KEY?.trim();
const MODEL = 'llama-3.3-70b-versatile';

let groqClient = null;

function getGroqClient() {
  if (!groqClient && API_KEY) {
    groqClient = new Groq({ apiKey: API_KEY });
  }
  return groqClient;
}

const SECTION_CONTENT_PROMPT = `Você é um especialista em educação e criação de conteúdo didático.
Sua tarefa é gerar conteúdo educacional de alta qualidade para uma seção específica de uma aula.

CONTEXTO DA AULA:
- Template: {templateName}
- Assunto: {assunto}
- Contexto adicional: {contexto}

SEÇÃO A GERAR:
- Nome: {sectionName}
- ID: {sectionId}
- Propósito: {sectionPurpose}

INSTRUÇÕES:
1. Gere conteúdo rico e educativo específico para esta seção
2. Use linguagem clara e acessível
3. Inclua exemplos práticos quando apropriado
4. O conteúdo deve ter entre 200-400 palavras
5. Seja criativo mas mantenha o rigor educacional

Responda APENAS com o conteúdo da seção, sem introduções ou conclusões extras.`;

const SECTION_PURPOSES = {
  'objective': 'Definir claramente o que os alunos aprenderão ao final da aula',
  'contextualizacao': 'Conectar o tema com o cotidiano e conhecimentos prévios dos alunos',
  'exploracao': 'Permitir que os alunos investiguem e descubram conceitos por conta própria',
  'apresentacao': 'Expor o conteúdo principal de forma clara e estruturada',
  'pratica-guiada': 'Exercícios acompanhados pelo professor para fixação',
  'pratica-independente': 'Atividades para os alunos realizarem sozinhos',
  'fechamento': 'Sintetizar os aprendizados e verificar compreensão',
  'demonstracao': 'Mostrar exemplos práticos do conceito',
  'avaliacao': 'Verificar o aprendizado dos alunos',
  'materiais': 'Listar recursos complementares para aprofundamento',
  'observacoes': 'Dicas para o professor sobre a condução da aula',
  'bncc': 'Competências e habilidades da BNCC contempladas'
};

async function generateSectionContent(requestId, sectionId, sectionName, lessonContext) {
  logContentGeneration(requestId, sectionId, sectionName);
  
  const client = getGroqClient();
  if (!client) {
    throw new Error('Cliente Groq não configurado - GROQ_API_KEY ausente');
  }

  const prompt = SECTION_CONTENT_PROMPT
    .replace('{templateName}', lessonContext.templateName)
    .replace('{assunto}', lessonContext.assunto)
    .replace('{contexto}', lessonContext.contexto)
    .replace('{sectionName}', sectionName)
    .replace('{sectionId}', sectionId)
    .replace('{sectionPurpose}', SECTION_PURPOSES[sectionId] || 'Seção educacional');

  try {
    const startTime = Date.now();
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Você é um especialista em educação que cria conteúdo didático de alta qualidade.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const duration = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content || '';

    log(LOG_PREFIXES.CONTENT, `[${requestId}] Seção ${sectionId} gerada em ${duration}ms (${content.length} chars)`);

    return {
      sectionId,
      sectionName,
      content,
      generatedAt: new Date().toISOString(),
      duration
    };
  } catch (error) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao gerar seção ${sectionId}:`, error.message);
    throw error;
  }
}

async function generateAllSectionsContent(requestId, lessonContext) {
  log(LOG_PREFIXES.CONTENT, `[${requestId}] Iniciando geração de ${lessonContext.sectionOrder.length} seções`);
  
  const results = [];
  const errors = [];

  for (const sectionId of lessonContext.sectionOrder) {
    if (sectionId === 'objective') continue;
    
    const sectionName = getSectionName(sectionId);
    
    try {
      const result = await generateSectionContent(requestId, sectionId, sectionName, lessonContext);
      results.push(result);
    } catch (error) {
      errors.push({ sectionId, error: error.message });
      log(LOG_PREFIXES.ERROR, `[${requestId}] Falha na seção ${sectionId}, continuando...`);
    }
  }

  log(LOG_PREFIXES.CONTENT, `[${requestId}] Geração concluída: ${results.length} sucesso, ${errors.length} erros`);

  return {
    sections: results,
    errors,
    totalGenerated: results.length,
    totalFailed: errors.length
  };
}

function getSectionName(sectionId) {
  const names = {
    'objective': 'Objetivo da Aula',
    'contextualizacao': 'Contextualização',
    'exploracao': 'Exploração',
    'apresentacao': 'Apresentação',
    'pratica-guiada': 'Prática Guiada',
    'pratica-independente': 'Prática Independente',
    'fechamento': 'Fechamento',
    'demonstracao': 'Demonstração',
    'avaliacao': 'Avaliação',
    'materiais': 'Materiais Complementares',
    'observacoes': 'Observações do Professor',
    'bncc': 'Critérios BNCC'
  };
  return names[sectionId] || sectionId;
}

export {
  generateSectionContent,
  generateAllSectionsContent,
  getSectionName,
  SECTION_PURPOSES
};
