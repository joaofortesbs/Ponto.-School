import { executeWithCascadeFallback } from '../../../services/controle-APIs-gerais-school-power';
import { getContextManager } from '../../context/context-manager';
import { sanitizeContextForPrompt } from '../../context/output-sanitizer';
import type { ArtifactData, ArtifactSection, ArtifactType, ArtifactTypeConfig } from './types';
import { ARTIFACT_TYPE_CONFIGS } from './types';

function generateArtifactId(): string {
  return `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
}

function detectBestArtifactType(contexto: string): ArtifactType {
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
  
  const atividadeCount = (lower.match(/atividade/g) || []).length;
  if (atividadeCount >= 3) {
    return 'dossie_pedagogico';
  }
  
  return 'resumo_executivo';
}

function parseMarkdownSections(rawText: string, config: ArtifactTypeConfig): ArtifactSection[] {
  const sections: ArtifactSection[] = [];
  const headerRegex = /^##\s+(.+)$/gm;
  const matches: { titulo: string; startIndex: number }[] = [];
  
  let match;
  while ((match = headerRegex.exec(rawText)) !== null) {
    matches.push({
      titulo: match[1].trim(),
      startIndex: match.index + match[0].length,
    });
  }
  
  if (matches.length === 0) {
    sections.push({
      id: `section-0`,
      titulo: config.secoesEsperadas[0] || 'Conteúdo',
      conteudo: rawText.trim(),
      ordem: 0,
    });
    return sections;
  }
  
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].startIndex;
    const end = i + 1 < matches.length ? rawText.lastIndexOf('##', matches[i + 1].startIndex) : rawText.length;
    const conteudo = rawText.substring(start, end).trim();
    
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

export async function generateArtifact(
  sessionId: string,
  tipoForce?: ArtifactType
): Promise<ArtifactData | null> {
  const startTime = Date.now();
  
  console.log(`📄 [ArtifactGenerator] Iniciando geração de artefato para sessão: ${sessionId}`);
  
  const contextManager = getContextManager(sessionId);
  const contexto = contextManager.obterContexto();
  
  if (!contexto) {
    console.warn(`⚠️ [ArtifactGenerator] Contexto não encontrado para sessão: ${sessionId}`);
    return null;
  }
  
  const rawContext = contextManager.gerarContextoParaChamada('final');
  const sanitizedContext = sanitizeContextForPrompt(rawContext);
  
  const tipo = tipoForce || detectBestArtifactType(sanitizedContext);
  const config = ARTIFACT_TYPE_CONFIGS[tipo];
  
  console.log(`📄 [ArtifactGenerator] Tipo detectado: ${tipo} (${config.nome})`);
  
  const prompt = config.promptTemplate.replace('{contexto}', sanitizedContext);
  
  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`📄 [ArtifactGenerator] ${status}`),
    });
    
    if (!result.success || !result.data) {
      console.error(`❌ [ArtifactGenerator] Falha na geração LLM`);
      return generateFallbackArtifact(sessionId, tipo, config, sanitizedContext);
    }
    
    const rawText = result.data.trim();
    const secoes = parseMarkdownSections(rawText, config);
    const totalWords = countWords(rawText);
    const tempoGeracao = Date.now() - startTime;
    
    const artifact: ArtifactData = {
      id: generateArtifactId(),
      metadata: {
        tipo,
        titulo: config.nome,
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
    return generateFallbackArtifact(sessionId, tipo, config, sanitizedContext);
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
  if (contexto.resumoProgressivo.etapasCompletas === 0) return false;
  
  return true;
}
