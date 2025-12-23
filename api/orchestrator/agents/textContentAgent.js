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

const SECTION_CONTENT_PROMPT = `Você é um especialista em educação e criação de material de apoio para PROFESSORES.
Sua tarefa é gerar conteúdo que AJUDE O PROFESSOR a conduzir esta etapa da aula.

IMPORTANTE: O conteúdo é PARA O PROFESSOR, não para os alunos!
Escreva como se estivesse conversando diretamente com o professor, dando dicas, sugestões e orientações de como ele deve conduzir esta parte da aula.

CONTEXTO DA AULA:
- Template: {templateName}
- Assunto: {assunto}
- Contexto adicional: {contexto}

SEÇÃO A GERAR:
- Nome: {sectionName}
- ID: {sectionId}
- Propósito: {sectionPurpose}

INSTRUÇÕES:
1. Escreva PARA O PROFESSOR, usando "você" e dando orientações diretas
2. Inclua sugestões de como abordar o tema com os alunos
3. Dê dicas de perguntas que o professor pode fazer
4. Sugira formas de engajar a turma
5. Inclua exemplos práticos que o professor pode usar
6. O conteúdo deve ter entre 200-400 palavras
7. Use tom amigável e profissional, como um colega ajudando outro

EXEMPLO DE TOM:
"Professor, neste momento você pode começar perguntando aos alunos o que eles já sabem sobre o tema. Isso vai ajudar você a identificar o nível de conhecimento prévio da turma. Uma boa estratégia é..."

Responda APENAS com o conteúdo da seção, sem introduções ou conclusões extras.`;

const SECTION_PURPOSES = {
  'objective': 'Orientar o professor sobre como apresentar e contextualizar o objetivo da aula para os alunos',
  'contextualizacao': 'Ajudar o professor a conectar o tema com a realidade dos alunos e ativar conhecimentos prévios',
  'exploracao': 'Guiar o professor sobre como conduzir atividades de descoberta e investigação com a turma',
  'apresentacao': 'Orientar o professor sobre como expor o conteúdo de forma clara e engajante',
  'pratica-guiada': 'Ajudar o professor a conduzir exercícios acompanhados, dando suporte aos alunos',
  'pratica-independente': 'Orientar o professor sobre como configurar e monitorar atividades autônomas',
  'fechamento': 'Ajudar o professor a sintetizar os aprendizados e verificar a compreensão da turma',
  'demonstracao': 'Guiar o professor sobre como demonstrar exemplos práticos do conceito',
  'avaliacao': 'Orientar o professor sobre como avaliar o aprendizado da turma',
  'materiais': 'Sugerir recursos complementares que o professor pode usar ou indicar aos alunos',
  'observacoes': 'Dicas e lembretes importantes para o professor sobre a condução da aula',
  'bncc': 'Orientar o professor sobre as competências e habilidades da BNCC contempladas'
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
