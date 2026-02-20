import type { ArtifactType, ArtifactData } from '../capabilities/CRIAR_ARQUIVO/types';
import { generateArtifact } from '../capabilities/CRIAR_ARQUIVO/artifact-generator';
import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';

export interface FlowDocumentoLivrePlan {
  titulo: string;
  solicitacao: string;
  prioridade: 'obrigatorio' | 'recomendado' | 'opcional';
  razao: string;
}

export interface FlowPackage {
  artifacts: ArtifactData[];
  flowType: FlowType;
  totalGenerated: number;
  totalFailed: number;
  generationTimeMs: number;
}

export type FlowType = 'completo' | 'essencial' | 'minimo';

export interface FlowArtifactPlan {
  tipo: ArtifactType;
  titulo: string;
  prioridade: 'obrigatorio' | 'recomendado' | 'opcional';
  razao: string;
}

const FLOW_PROFILES: Record<FlowType, ArtifactType[]> = {
  completo: ['guia_aplicacao', 'mensagem_pais', 'relatorio_coordenacao', 'mensagem_alunos'],
  essencial: ['guia_aplicacao', 'mensagem_pais', 'relatorio_coordenacao'],
  minimo: ['guia_aplicacao', 'mensagem_pais'],
};

const ARTIFACT_CATALOG: Record<string, { tipo: ArtifactType; titulo: string }> = {
  guia_aplicacao: { tipo: 'guia_aplicacao', titulo: 'Guia de Aplicação em Sala de Aula' },
  mensagem_pais: { tipo: 'mensagem_pais', titulo: 'Mensagem Explicativa para os Pais' },
  relatorio_coordenacao: { tipo: 'relatorio_coordenacao', titulo: 'Relatório de Criação para Coordenadores' },
  mensagem_alunos: { tipo: 'mensagem_alunos', titulo: 'Mensagens Motivacionais para os Alunos' },
  roteiro_aula: { tipo: 'roteiro_aula', titulo: 'Roteiro Detalhado de Aula' },
  resumo_executivo: { tipo: 'resumo_executivo', titulo: 'Resumo Executivo da Sessão' },
  dossie_pedagogico: { tipo: 'dossie_pedagogico', titulo: 'Dossiê Pedagógico Completo' },
  relatorio_progresso: { tipo: 'relatorio_progresso', titulo: 'Relatório de Progresso' },
};

const AI_SELECTION_SYSTEM_PROMPT = `Você é o Jota, agente de IA pedagógico do Ponto School. Sua missão é antecipar as necessidades do professor ANTES que ele precise pedir. Você usa a Metodologia de Antecipação de Dor (MAD): para cada atividade criada, pense nos próximos passos burocráticos e pedagógicos que o professor enfrentará e gere documentos que resolvam essas tarefas antecipadamente.`;

function buildAISelectionPrompt(
  activityCount: number,
  activityNames: string[],
  userPrompt: string,
): string {
  const minDocs = activityCount >= 4 ? 3 : (activityCount >= 2 ? 3 : 2);
  const maxDocs = activityCount >= 4 ? 4 : (activityCount >= 2 ? 3 : 2);

  return `
CONTEXTO:
O professor pediu: "${userPrompt}"
Foram criadas ${activityCount} atividade(s): ${activityNames.join(', ')}

DOCUMENTOS COMPLEMENTARES DISPONÍVEIS (escolha ${minDocs} a ${maxDocs}):
1. guia_aplicacao — Manual prático de como aplicar as atividades em sala, com cronograma, dicas de mediação e materiais necessários
2. mensagem_pais — Comunicação pronta para enviar aos pais/responsáveis em 3 versões (formal, WhatsApp, objetiva)
3. relatorio_coordenacao — Relatório formal com justificativa pedagógica, alinhamento BNCC e cronograma para apresentar à coordenação
4. mensagem_alunos — Mensagens de motivação e engajamento para apresentar as atividades aos alunos
5. roteiro_aula — Roteiro cronológico minuto a minuto para aplicar as atividades em sala
6. resumo_executivo — Síntese rápida de tudo que foi criado para o professor ter uma visão geral
7. dossie_pedagogico — Documento completo com análise pedagógica, alinhamento BNCC e recomendações
8. relatorio_progresso — Análise detalhada do que foi construído e próximos passos

SUA TAREFA:
Analise o pedido do professor e as atividades criadas. Pense como um consultor pedagógico experiente:
- Quais tarefas burocráticas o professor vai precisar resolver DEPOIS de receber as atividades?
- Que comunicações ele vai precisar enviar?
- Que documentação a escola vai exigir?
- Que apoio prático ele precisa para aplicar o material em sala?

Escolha entre ${minDocs} e ${maxDocs} documentos que MAIS AJUDAM esse professor específico nesse contexto específico.

RESPONDA EXCLUSIVAMENTE em formato JSON válido (sem markdown, sem texto antes/depois):
{
  "documentos": [
    {
      "tipo": "identificador_do_documento",
      "razao": "Explicação de 1-2 frases do porquê esse documento é estratégico para esse professor nesse contexto"
    }
  ]
}

REGRAS:
- Escolha EXATAMENTE entre ${minDocs} e ${maxDocs} documentos
- NÃO repita o mesmo tipo
- Cada "tipo" deve ser um dos identificadores listados acima (guia_aplicacao, mensagem_pais, etc.)
- A "razao" deve ser ESPECÍFICA ao contexto do professor, não genérica
- RETORNE APENAS o JSON, sem nenhum texto adicional`.trim();
}

interface AIDocumentChoice {
  tipo: string;
  razao: string;
}

function parseAIResponse(rawResponse: string, minDocs: number, maxDocs: number): AIDocumentChoice[] | null {
  try {
    let cleaned = rawResponse.trim();
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    console.log(`🔍 [PontoFlow-AI] Resposta bruta (primeiros 500 chars): ${cleaned.substring(0, 500)}`);

    const jsonMatch = cleaned.match(/\{[\s\S]*"documentos"[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ [PontoFlow-AI] Nenhum JSON com "documentos" encontrado na resposta');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.documentos || !Array.isArray(parsed.documentos)) {
      console.warn('⚠️ [PontoFlow-AI] Campo "documentos" ausente ou não é array');
      return null;
    }

    const validChoices: AIDocumentChoice[] = [];
    const seenTypes = new Set<string>();

    for (const doc of parsed.documentos) {
      if (!doc.tipo || typeof doc.tipo !== 'string') continue;
      const tipoClean = doc.tipo.toLowerCase().trim().replace(/[^a-z_]/g, '');
      if (!ARTIFACT_CATALOG[tipoClean]) {
        console.warn(`⚠️ [PontoFlow-AI] Tipo desconhecido ignorado: "${doc.tipo}"`);
        continue;
      }
      if (seenTypes.has(tipoClean)) continue;
      seenTypes.add(tipoClean);
      validChoices.push({
        tipo: tipoClean,
        razao: typeof doc.razao === 'string' ? doc.razao : '',
      });
    }

    if (validChoices.length < minDocs) {
      console.warn(`⚠️ [PontoFlow-AI] IA retornou ${validChoices.length} documentos, mínimo exigido: ${minDocs} — rejeitando`);
      return null;
    }

    return validChoices.slice(0, maxDocs);
  } catch (error) {
    console.warn('⚠️ [PontoFlow-AI] Erro ao parsear resposta da IA:', error);
    return null;
  }
}

function determineFallbackArtifacts(
  activityCount: number,
  userPrompt: string,
): FlowArtifactPlan[] {
  const plan: FlowArtifactPlan[] = [];
  const addedTypes = new Set<ArtifactType>();

  function addArtifact(tipo: ArtifactType, prioridade: 'obrigatorio' | 'recomendado', razao: string) {
    if (addedTypes.has(tipo)) return;
    const cat = ARTIFACT_CATALOG[tipo];
    if (!cat) return;
    addedTypes.add(tipo);
    plan.push({ tipo: cat.tipo, titulo: cat.titulo, prioridade, razao });
  }

  addArtifact('guia_aplicacao', 'obrigatorio', 'Orientação prática para aplicar as atividades em sala');

  const lower = userPrompt.toLowerCase();
  if (/\b(pais|responsáveis|responsaveis|família|familia)\b/.test(lower)) {
    addArtifact('mensagem_pais', 'obrigatorio', 'Professor mencionou pais/responsáveis');
  }
  if (/\b(coordena|diretor|gestão|gestao|institucional)\b/.test(lower)) {
    addArtifact('relatorio_coordenacao', 'obrigatorio', 'Professor mencionou coordenação/gestão');
  }

  const minArtifacts = activityCount >= 2 ? 3 : 2;
  const fallbackOrder: ArtifactType[] = ['mensagem_pais', 'relatorio_coordenacao', 'mensagem_alunos', 'roteiro_aula', 'resumo_executivo'];
  for (const tipo of fallbackOrder) {
    if (plan.length >= minArtifacts) break;
    addArtifact(tipo, 'recomendado', 'Documento complementar estratégico para o professor');
  }

  const maxArtifacts = activityCount >= 4 ? 4 : (activityCount >= 2 ? 3 : 2);
  return plan.slice(0, maxArtifacts);
}

export async function determineFlowArtifactsWithAI(
  activityCount: number,
  activityNames: string[],
  userPrompt: string,
): Promise<FlowArtifactPlan[]> {
  if (activityCount === 0) return [];

  const minDocs = activityCount >= 4 ? 3 : (activityCount >= 2 ? 3 : 2);
  const maxDocs = activityCount >= 4 ? 4 : (activityCount >= 2 ? 3 : 2);

  console.log(`\n🧠 [PontoFlow-AI] Solicitando à IA seleção de ${minDocs}-${maxDocs} documentos complementares...`);

  try {
    const prompt = buildAISelectionPrompt(activityCount, activityNames, userPrompt);
    const result = await executeWithCascadeFallback(prompt, {
      systemPrompt: AI_SELECTION_SYSTEM_PROMPT,
    });

    if (result.success && result.data) {
      const choices = parseAIResponse(result.data, minDocs, maxDocs);

      if (choices && choices.length >= minDocs) {
        const finalChoices = choices;
        const plan: FlowArtifactPlan[] = finalChoices.map(choice => {
          const cat = ARTIFACT_CATALOG[choice.tipo];
          return {
            tipo: cat.tipo,
            titulo: cat.titulo,
            prioridade: 'recomendado' as const,
            razao: choice.razao || 'Selecionado pela IA com base no contexto pedagógico',
          };
        });

        console.log(`✅ [PontoFlow-AI] IA selecionou ${plan.length} documentos: ${plan.map(p => p.tipo).join(', ')}`);
        plan.forEach(p => console.log(`   📄 ${p.tipo}: ${p.razao}`));
        return plan;
      }

      console.warn('⚠️ [PontoFlow-AI] Resposta da IA inválida ou insuficiente, usando fallback...');
    }
  } catch (error) {
    console.warn('⚠️ [PontoFlow-AI] Erro na chamada de IA, usando fallback:', error);
  }

  console.log('🔄 [PontoFlow-AI] Usando fallback determinístico...');
  return determineFallbackArtifacts(activityCount, userPrompt);
}

export function determineFlowArtifacts(
  activityCount: number,
  userPrompt: string,
  _sessionContext?: string
): FlowArtifactPlan[] {
  return determineFallbackArtifacts(activityCount, userPrompt);
}

export function getFlowType(activityCount: number, userPrompt: string): FlowType {
  const lower = userPrompt.toLowerCase();
  const isWeekPlan = lower.includes('semana') || lower.includes('semanal');

  if (isWeekPlan || activityCount >= 4) return 'completo';
  if (activityCount >= 2) return 'essencial';
  return 'minimo';
}

export function getFlowProfileArtifacts(flowType: FlowType): ArtifactType[] {
  return FLOW_PROFILES[flowType];
}

export async function executeFlowPackage(
  sessionId: string,
  artifactPlan: FlowArtifactPlan[],
  onProgress?: (update: { artifact: string; status: string; index: number; total: number }) => void
): Promise<FlowPackage> {
  const startTime = Date.now();
  const artifacts: ArtifactData[] = [];
  let totalFailed = 0;

  console.log(`\n🌊 [PontoFlow] Iniciando geração de pacote Flow com ${artifactPlan.length} artefatos`);
  console.log(`🌊 [PontoFlow] Artefatos planejados: ${artifactPlan.map(a => a.tipo).join(', ')}`);

  for (let i = 0; i < artifactPlan.length; i++) {
    const plan = artifactPlan[i];

    console.log(`\n🌊 [PontoFlow] [${i + 1}/${artifactPlan.length}] Gerando: ${plan.titulo} (${plan.tipo})`);

    onProgress?.({
      artifact: plan.titulo,
      status: 'gerando',
      index: i,
      total: artifactPlan.length,
    });

    try {
      const artifact = await generateArtifact(sessionId, plan.tipo);

      if (artifact) {
        artifact.metadata.titulo = plan.titulo;
        artifacts.push(artifact);
        console.log(`✅ [PontoFlow] [${i + 1}/${artifactPlan.length}] ${plan.titulo} gerado com sucesso`);

        onProgress?.({
          artifact: plan.titulo,
          status: 'concluido',
          index: i,
          total: artifactPlan.length,
        });
      } else {
        totalFailed++;
        console.warn(`⚠️ [PontoFlow] [${i + 1}/${artifactPlan.length}] ${plan.titulo} retornou null`);

        onProgress?.({
          artifact: plan.titulo,
          status: 'falhou',
          index: i,
          total: artifactPlan.length,
        });
      }
    } catch (error) {
      totalFailed++;
      console.error(`❌ [PontoFlow] [${i + 1}/${artifactPlan.length}] Erro ao gerar ${plan.titulo}:`, error);

      onProgress?.({
        artifact: plan.titulo,
        status: 'erro',
        index: i,
        total: artifactPlan.length,
      });
    }
  }

  const generationTimeMs = Date.now() - startTime;
  const flowType = artifactPlan.length >= 4 ? 'completo' : artifactPlan.length >= 2 ? 'essencial' : 'minimo';

  console.log(`\n🌊 [PontoFlow] Pacote concluído: ${artifacts.length} gerados, ${totalFailed} falhas, ${generationTimeMs}ms`);

  return {
    artifacts,
    flowType: flowType as FlowType,
    totalGenerated: artifacts.length,
    totalFailed,
    generationTimeMs,
  };
}
