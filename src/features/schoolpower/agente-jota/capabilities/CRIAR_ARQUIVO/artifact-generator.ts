import { executeWithCascadeFallback } from '../../../services/controle-APIs-gerais-school-power';
import { getContextManager } from '../../context/context-manager';
import { sanitizeContextForPrompt } from '../../context/output-sanitizer';
import type { ArtifactData, ArtifactSection, ArtifactType, ArtifactTypeConfig } from './types';
import { ARTIFACT_TYPE_CONFIGS } from './types';
import { routeActivityRequest, isTextActivity, getPromptForRoute } from './text-activities';
import type { TextActivityRouterResult } from './text-activities';

function generateArtifactId(): string {
  return `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
}

function normalizeArtifactType(rawType: string): ArtifactType {
  const lower = rawType.toLowerCase().trim();
  
  const mappings: Record<string, ArtifactType> = {
    'dossie_pedagogico': 'dossie_pedagogico',
    'dossiê pedagógico': 'dossie_pedagogico',
    'dossie': 'dossie_pedagogico',
    'resumo_executivo': 'resumo_executivo',
    'resumo executivo': 'resumo_executivo',
    'resumo': 'resumo_executivo',
    'roteiro_aula': 'roteiro_aula',
    'roteiro de aula': 'roteiro_aula',
    'plano de aula': 'roteiro_aula',
    'roteiro': 'roteiro_aula',
    'relatorio_progresso': 'relatorio_progresso',
    'relatório de progresso': 'relatorio_progresso',
    'relatório': 'relatorio_progresso',
    'relatorio': 'relatorio_progresso',
    'guia_aplicacao': 'guia_aplicacao',
    'guia de aplicação': 'guia_aplicacao',
    'guia de aplicacao': 'guia_aplicacao',
    'guia': 'guia_aplicacao',
    'mensagem_pais': 'mensagem_pais',
    'mensagem para pais': 'mensagem_pais',
    'mensagens para pais': 'mensagem_pais',
    'mensagem pais': 'mensagem_pais',
    'comunicado pais': 'mensagem_pais',
    'mensagem_alunos': 'mensagem_alunos',
    'mensagem para alunos': 'mensagem_alunos',
    'mensagens para alunos': 'mensagem_alunos',
    'mensagem alunos': 'mensagem_alunos',
    'motivação alunos': 'mensagem_alunos',
    'relatorio_coordenacao': 'relatorio_coordenacao',
    'relatório para coordenação': 'relatorio_coordenacao',
    'relatório coordenação': 'relatorio_coordenacao',
    'relatorio coordenacao': 'relatorio_coordenacao',
    'relatório para coordenadores': 'relatorio_coordenacao',
    'relatorio coordenadores': 'relatorio_coordenacao',
    'documento_livre': 'documento_livre',
    'documento livre': 'documento_livre',
    'documento': 'documento_livre',
    'texto livre': 'documento_livre',
    'texto': 'documento_livre',
    'livre': 'documento_livre',
  };

  if (mappings[lower]) return mappings[lower];

  for (const [key, value] of Object.entries(mappings)) {
    if (lower.includes(key)) return value;
  }

  if (lower.includes('explicação') || lower.includes('explicar') || lower.includes('explicativo')) {
    return 'documento_livre';
  }
  if (lower.includes('plano') || lower.includes('sequência') || lower.includes('sequencia')) {
    return 'roteiro_aula';
  }
  if (lower.includes('progresso') || lower.includes('avaliação') || lower.includes('análise')) {
    return 'relatorio_progresso';
  }
  if (lower.includes('como usar') || lower.includes('aplicar') || lower.includes('manual')) {
    return 'guia_aplicacao';
  }
  if (lower.includes('pais') || lower.includes('responsáveis') || lower.includes('responsaveis') || lower.includes('família') || lower.includes('comunicado')) {
    return 'mensagem_pais';
  }
  if (lower.includes('alunos') || lower.includes('estudantes') || lower.includes('motivação') || lower.includes('motivar')) {
    return 'mensagem_alunos';
  }
  if (lower.includes('coordena') || lower.includes('diretor') || lower.includes('gestão') || lower.includes('gestao') || lower.includes('institucional')) {
    return 'relatorio_coordenacao';
  }

  return 'documento_livre';
}

function detectBestArtifactType(contexto: string, solicitacao?: string): ArtifactType {
  const solLower = (solicitacao || '').toLowerCase();
  
  if (solLower) {
    const specificTypePatterns: Array<{ pattern: RegExp; type: ArtifactType }> = [
      { pattern: /\b(?:plano de aula|roteiro de aula|sequência didática|sequencia didática)\b/, type: 'roteiro_aula' },
      { pattern: /\b(?:dossiê|dossie|dossiê pedagógico)\b/, type: 'dossie_pedagogico' },
      { pattern: /\b(?:relatório|relatorio)\s+(?:de\s+)?(?:progresso|avaliação|diagnóstic)/, type: 'relatorio_progresso' },
      { pattern: /\b(?:guia de aplicação|guia de aplicacao|como usar|manual)\b/, type: 'guia_aplicacao' },
      { pattern: /\b(?:resumo executivo)\b/, type: 'resumo_executivo' },
      { pattern: /\b(?:mensagem|comunicado|carta)\s+(?:para\s+)?(?:os\s+)?pais\b/, type: 'mensagem_pais' },
      { pattern: /\b(?:mensagem|motivação|carta)\s+(?:para\s+)?(?:os\s+)?alunos\b/, type: 'mensagem_alunos' },
      { pattern: /\b(?:relatório|relatorio)\s+(?:para\s+)?(?:a\s+)?coordena/, type: 'relatorio_coordenacao' },
    ];
    
    for (const { pattern, type } of specificTypePatterns) {
      if (pattern.test(solLower)) {
        console.log(`📄 [detectBestArtifactType] Tipo específico detectado na solicitação: ${type}`);
        return type;
      }
    }
    
    console.log(`📄 [detectBestArtifactType] Nenhum tipo específico na solicitação — usando documento_livre`);
    return 'documento_livre';
  }
  
  const lower = contexto.toLowerCase();
  
  if (lower.includes('plano de aula') || lower.includes('plano-aula') || lower.includes('sequencia didática') || lower.includes('sequência didática')) {
    return 'roteiro_aula';
  }
  
  if (lower.includes('avaliação') || lower.includes('diagnóstic') || lower.includes('progresso')) {
    return 'relatorio_progresso';
  }
  
  if (lower.includes('como usar') || lower.includes('aplicar') || lower.includes('guia')) {
    return 'guia_aplicacao';
  }
  
  return 'documento_livre';
}

function parseMarkdownSections(rawText: string, config: ArtifactTypeConfig): ArtifactSection[] {
  const sections: ArtifactSection[] = [];
  
  let textToParse = rawText;
  if (config.tipo === 'documento_livre' || config.tipo === 'atividade_textual') {
    textToParse = rawText.replace(/^#\s+.+$/m, '').trim();
  }
  
  const headerRegex = /^##\s+(.+)$/gm;
  const matches: { titulo: string; startIndex: number }[] = [];
  
  let match;
  while ((match = headerRegex.exec(textToParse)) !== null) {
    matches.push({
      titulo: match[1].trim(),
      startIndex: match.index + match[0].length,
    });
  }
  
  if (matches.length === 0) {
    sections.push({
      id: `section-0`,
      titulo: config.secoesEsperadas[0] || 'Conteúdo',
      conteudo: textToParse.trim(),
      ordem: 0,
    });
    return sections;
  }
  
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].startIndex;
    const end = i + 1 < matches.length ? textToParse.lastIndexOf('##', matches[i + 1].startIndex) : textToParse.length;
    const conteudo = textToParse.substring(start, end).trim();
    
    sections.push({
      id: `section-${i}`,
      titulo: matches[i].titulo,
      conteudo,
      ordem: i,
    });
  }
  
  return sections;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function generatePreview(sections: ArtifactSection[]): string {
  if (sections.length === 0) return 'Documento gerado com sucesso.';
  const firstContent = sections[0].conteudo;
  const sentences = firstContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return (sentences.slice(0, 2).join('. ') + '.').substring(0, 200);
}

function extractTitleFromMarkdown(rawText: string): string | null {
  const h1Match = rawText.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  const h2Match = rawText.match(/^##\s+(.+)$/m);
  if (h2Match) return h2Match[1].trim();
  return null;
}

export interface BnccContextData {
  habilidades: any[];
  componentes: string[];
  anos: string[];
  prompt_context: string;
  count: number;
}

export async function generateArtifact(
  sessionId: string,
  tipoForce?: string,
  solicitacao?: string,
  bnccContext?: BnccContextData
): Promise<ArtifactData | null> {
  const startTime = Date.now();
  
  console.log(`📄 [ArtifactGenerator] Iniciando geração de artefato para sessão: ${sessionId}${bnccContext ? ` | BNCC: ${bnccContext.count} habilidade(s)` : ''}`);
  
  const contextManager = getContextManager(sessionId);
  const contexto = contextManager.obterContexto();
  
  if (!contexto) {
    console.warn(`⚠️ [ArtifactGenerator] Contexto não encontrado para sessão: ${sessionId}`);
    return null;
  }
  
  const rawContext = contextManager.gerarContextoParaChamada('final');
  const sanitizedContext = sanitizeContextForPrompt(rawContext);
  
  const userRequest = solicitacao || contexto.inputOriginal?.texto || '';

  // T003: Enriquecer {contexto} com disciplina e turma extraídas para que o LLM receba dados pedagógicos explícitos
  const disciplinaEnriquecida = (contexto as any).disciplina || (contexto as any).inputOriginal?.disciplina || '';
  const turmaEnriquecida = (contexto as any).turma || (contexto as any).inputOriginal?.turma || '';
  const enrichedContext = [
    disciplinaEnriquecida ? `DISCIPLINA: ${disciplinaEnriquecida}` : '',
    turmaEnriquecida ? `TURMA/ANO: ${turmaEnriquecida}` : '',
    sanitizedContext ? `CONTEXTO DA SESSÃO:\n${sanitizedContext.substring(0, 800)}` : '',
  ].filter(Boolean).join('\n\n');
  console.log(`📄 [ArtifactGenerator] Contexto enriquecido: disciplina="${disciplinaEnriquecida}", turma="${turmaEnriquecida}", bncc=${bnccContext?.count || 0} habilidades, contexto_total=${enrichedContext.length} chars`);

  let routerResult: TextActivityRouterResult | null = null;
  let useTextActivityPrompt = false;

  if (tipoForce === 'atividade_textual' || (!tipoForce && userRequest)) {
    try {
      routerResult = await routeActivityRequest(userRequest, sanitizedContext);
      if (isTextActivity(routerResult)) {
        useTextActivityPrompt = true;
        console.log(`📄 [ArtifactGenerator] 🎯 Roteamento: atividade textual detectada → ${routerResult.templateId} (origem: ${routerResult.origem})`);
      }
    } catch (error) {
      console.warn(`⚠️ [ArtifactGenerator] Erro no text-activity-router, usando fluxo padrão:`, error);
    }
  }

  const tipoNormalized = useTextActivityPrompt 
    ? 'atividade_textual' as ArtifactType
    : (tipoForce ? normalizeArtifactType(tipoForce) : detectBestArtifactType(sanitizedContext, solicitacao));
  const config = ARTIFACT_TYPE_CONFIGS[tipoNormalized];
  
  if (!config) {
    console.error(`❌ [ArtifactGenerator] Config não encontrado para tipo: ${tipoNormalized} (original: ${tipoForce})`);
    return null;
  }
  
  console.log(`📄 [ArtifactGenerator] Tipo detectado: ${tipoNormalized} (${config.nome})${tipoForce ? ` [original: ${tipoForce}]` : ''}${useTextActivityPrompt ? ` [template: ${routerResult?.templateId}]` : ''}`);
  
  let prompt: string;
  
  const bnccPromptSection = bnccContext?.prompt_context ? `

## ALINHAMENTO CURRICULAR — BNCC (Base Nacional Comum Curricular)
As seguintes habilidades da BNCC foram identificadas como relevantes para este documento.
Você DEVE incorporar essas habilidades no conteúdo gerado:
- Referencie os CÓDIGOS BNCC (ex: EF07CI02) quando mencionar objetivos, competências ou habilidades
- Alinhe o conteúdo pedagógico às descrições dessas habilidades
- Cite os códigos BNCC de forma natural no texto do documento

${bnccContext.prompt_context}
` : '';

  // T003: BNCC inserido ANTES do restante do template (maior peso para o LLM)
  if (useTextActivityPrompt && routerResult) {
    const textPrompt = getPromptForRoute(routerResult, userRequest, enrichedContext);
    if (textPrompt) {
      prompt = bnccPromptSection + textPrompt;
      console.log(`📄 [ArtifactGenerator] Usando prompt especializado do template: ${routerResult.templateId}${bnccContext ? ' + BNCC (posicionado no início)' : ''}`);
    } else {
      prompt = bnccPromptSection + config.promptTemplate
        .replace('{contexto}', enrichedContext)
        .replace('{solicitacao}', userRequest);
    }
  } else {
    prompt = bnccPromptSection + config.promptTemplate
      .replace('{contexto}', enrichedContext)
      .replace('{solicitacao}', userRequest);
  }
  
  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`📄 [ArtifactGenerator] ${status}`),
    });
    
    if (!result.success || !result.data) {
      console.error(`❌ [ArtifactGenerator] Falha na geração LLM`);
      return generateFallbackArtifact(sessionId, tipoNormalized, config, sanitizedContext);
    }
    
    const rawText = result.data.trim();
    const secoes = parseMarkdownSections(rawText, config);
    const totalWords = countWords(rawText);
    const tempoGeracao = Date.now() - startTime;
    
    let titulo = config.nome;
    if (tipoNormalized === 'documento_livre' || tipoNormalized === 'atividade_textual') {
      const aiTitle = extractTitleFromMarkdown(rawText);
      if (aiTitle) {
        titulo = aiTitle;
      } else if (useTextActivityPrompt && routerResult?.template) {
        titulo = routerResult.template.nome;
      } else if (userRequest.length > 0) {
        titulo = userRequest.length > 60 ? userRequest.substring(0, 57) + '...' : userRequest;
      }
    }
    
    const artifact: ArtifactData = {
      id: generateArtifactId(),
      metadata: {
        tipo: tipoNormalized,
        titulo,
        subtitulo: contexto.objetivoGeral || contexto.inputOriginal.texto.substring(0, 80),
        geradoEm: Date.now(),
        sessaoId: sessionId,
        versao: '1.0',
        tags: extractTags(contexto),
        estatisticas: {
          palavras: totalWords,
          secoes: secoes.length,
          tempoGeracao,
        },
      },
      secoes,
      resumoPreview: generatePreview(secoes),
    };
    
    console.log(`✅ [ArtifactGenerator] Artefato gerado: ${artifact.id} | ${secoes.length} seções | ${totalWords} palavras | ${tempoGeracao}ms`);
    
    return artifact;
  } catch (error) {
    console.error(`❌ [ArtifactGenerator] Erro na geração:`, error);
    return generateFallbackArtifact(sessionId, tipoNormalized, config, sanitizedContext);
  }
}

function extractTags(contexto: any): string[] {
  const tags: string[] = [];
  if (contexto.resumoProgressivo?.atividadesCriadas?.length > 0) {
    tags.push('atividades');
  }
  if (contexto.objetivoGeral) {
    const lower = contexto.objetivoGeral.toLowerCase();
    if (lower.includes('matemática')) tags.push('matemática');
    if (lower.includes('português')) tags.push('português');
    if (lower.includes('ciências')) tags.push('ciências');
    if (lower.includes('história')) tags.push('história');
    if (lower.includes('geografia')) tags.push('geografia');
  }
  return tags;
}

function generateFallbackArtifact(
  sessionId: string,
  tipo: ArtifactType,
  config: ArtifactTypeConfig,
  contexto: string
): ArtifactData {
  console.log(`🔄 [ArtifactGenerator] Gerando artefato fallback para: ${tipo}`);
  
  const secoes: ArtifactSection[] = config.secoesEsperadas.map((titulo, idx) => ({
    id: `section-${idx}`,
    titulo,
    conteudo: `Informações sobre "${titulo}" serão preenchidas com base nos dados da sessão. Contexto disponível: ${contexto.substring(0, 300)}...`,
    ordem: idx,
  }));
  
  return {
    id: generateArtifactId(),
    metadata: {
      tipo,
      titulo: config.nome,
      subtitulo: 'Gerado automaticamente',
      geradoEm: Date.now(),
      sessaoId: sessionId,
      versao: '1.0',
      tags: ['fallback'],
      estatisticas: {
        palavras: countWords(secoes.map(s => s.conteudo).join(' ')),
        secoes: secoes.length,
        tempoGeracao: 0,
      },
    },
    secoes,
    resumoPreview: `${config.nome} gerado com ${secoes.length} seções.`,
  };
}

export function shouldGenerateArtifact(sessionId: string): boolean {
  const contextManager = getContextManager(sessionId);
  const contexto = contextManager.obterContexto();
  
  if (!contexto) return false;
  
  return true;
}
