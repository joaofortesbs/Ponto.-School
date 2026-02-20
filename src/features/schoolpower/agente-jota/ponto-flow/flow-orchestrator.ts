import type { ArtifactType, ArtifactData } from '../capabilities/CRIAR_ARQUIVO/types';
import { generateArtifact } from '../capabilities/CRIAR_ARQUIVO/artifact-generator';

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

interface ContextSignals {
  isWeekPlan: boolean;
  isSubstantialBatch: boolean;
  isMultipleActivities: boolean;
  mentionsPais: boolean;
  mentionsAlunos: boolean;
  mentionsCoordenacao: boolean;
  mentionsAvaliacao: boolean;
  mentionsProjeto: boolean;
  mentionsInclusao: boolean;
  mentionsDificuldade: boolean;
  mentionsQuiz: boolean;
  mentionsPlanoAula: boolean;
  mentionsRedacao: boolean;
  mentionsExercicios: boolean;
  mentionsLaboratorio: boolean;
  mentionsApresentacao: boolean;
}

function extractContextSignals(userPrompt: string): ContextSignals {
  const lower = userPrompt.toLowerCase();
  return {
    isWeekPlan: /\b(semana|semanal|semanas)\b/.test(lower),
    isSubstantialBatch: false,
    isMultipleActivities: false,
    mentionsPais: /\b(pais|responsáveis|responsaveis|família|familia)\b/.test(lower),
    mentionsAlunos: /\b(alunos|estudantes|turma)\b/.test(lower),
    mentionsCoordenacao: /\b(coordena|diretor|gestão|gestao|institucional)\b/.test(lower),
    mentionsAvaliacao: /avalia[çc][aã]o\b|prova\s+(bimestral|mensal|final)|simulado|diagn[oó]stic/.test(lower),
    mentionsProjeto: /\bprojeto\b|pbl|maker|steam|interdisciplinar/.test(lower),
    mentionsInclusao: /inclus[aã]o|inclusiv|adaptad|diferencia[çc]|pei\b|iep\b|necessidades\s+especiais/.test(lower),
    mentionsDificuldade: /dificuldade|refor[çc]o|recupera[çc][aã]o|nivelamento|defasagem|lacuna/.test(lower),
    mentionsQuiz: /quiz|question[aá]rio|teste|prova|exerc[ií]cio/.test(lower),
    mentionsPlanoAula: /plano\s+de\s+aula|sequência\s+did[aá]tica|sequencia\s+did[aá]tica|roteiro/.test(lower),
    mentionsRedacao: /reda[çc][aã]o|escrita|texto|produ[çc][aã]o\s+textual|interpreta[çc][aã]o/.test(lower),
    mentionsExercicios: /exerc[ií]cio|lista|fixa[çc][aã]o|pr[aá]tica|treino/.test(lower),
    mentionsLaboratorio: /laborat[oó]rio|experimento|pr[aá]tica\s+experimental|investiga[çc][aã]o/.test(lower),
    mentionsApresentacao: /apresenta[çc][aã]o|semin[aá]rio|oral|exposi[çc][aã]o/.test(lower),
  };
}

export function determineFlowArtifacts(
  activityCount: number,
  userPrompt: string,
  _sessionContext?: string
): FlowArtifactPlan[] {
  if (activityCount === 0) return [];

  const signals = extractContextSignals(userPrompt);
  signals.isSubstantialBatch = activityCount >= 3;
  signals.isMultipleActivities = activityCount >= 2;

  const plan: FlowArtifactPlan[] = [];
  const addedTypes = new Set<ArtifactType>();

  function addArtifact(tipo: ArtifactType, titulo: string, prioridade: 'obrigatorio' | 'recomendado' | 'opcional', razao: string) {
    if (addedTypes.has(tipo)) return;
    addedTypes.add(tipo);
    plan.push({ tipo, titulo, prioridade, razao });
  }

  addArtifact(
    'guia_aplicacao',
    'Guia de Aplicação em Sala de Aula',
    'obrigatorio',
    'Documento essencial que orienta o professor passo a passo na aplicação prática das atividades criadas, com cronograma, dicas de mediação e materiais necessários',
  );

  if (signals.mentionsPais) {
    addArtifact('mensagem_pais', 'Mensagem Explicativa para os Pais', 'obrigatorio',
      'Professor mencionou pais/responsáveis — comunicação direta com 3 versões (formal, WhatsApp e objetiva) pronta para copiar e enviar');
  }
  if (signals.mentionsCoordenacao) {
    addArtifact('relatorio_coordenacao', 'Relatório de Criação para Coordenadores', 'obrigatorio',
      'Professor mencionou coordenação/gestão — relatório formal com justificativa pedagógica, alinhamento BNCC e cronograma');
  }
  if (signals.mentionsAlunos) {
    addArtifact('mensagem_alunos', 'Mensagens Motivacionais para os Alunos', 'obrigatorio',
      'Professor mencionou alunos diretamente — mensagens de engajamento, motivação e desafio para a turma');
  }

  if (signals.mentionsInclusao) {
    addArtifact('mensagem_pais', 'Mensagem Explicativa para os Pais', 'obrigatorio',
      'Atividades com diferenciação/inclusão exigem comunicação com os pais sobre as estratégias adaptativas aplicadas');
    addArtifact('relatorio_coordenacao', 'Relatório de Criação para Coordenadores', 'obrigatorio',
      'Estratégias de inclusão requerem documentação formal para a coordenação pedagógica acompanhar e validar');
  }

  if (signals.mentionsProjeto) {
    addArtifact('relatorio_coordenacao', 'Relatório de Criação para Coordenadores', 'obrigatorio',
      'Projetos (PBL/STEAM/Maker) exigem justificativa pedagógica formal para a coordenação aprovar e acompanhar');
    addArtifact('mensagem_pais', 'Mensagem Explicativa para os Pais', 'recomendado',
      'Projetos interdisciplinares se beneficiam do engajamento dos pais — comunicar o objetivo e como apoiar em casa');
  }

  if (signals.isWeekPlan) {
    addArtifact('mensagem_pais', 'Mensagem Explicativa para os Pais', 'obrigatorio',
      'Planejamento semanal completo requer comunicação com os pais sobre a sequência de atividades e como apoiar o aprendizado em casa');
    addArtifact('relatorio_coordenacao', 'Relatório de Criação para Coordenadores', 'obrigatorio',
      'Planejamento semanal requer documentação formal para alinhamento com a coordenação pedagógica');
    if (activityCount >= 3) {
      addArtifact('mensagem_alunos', 'Mensagens Motivacionais para os Alunos', 'recomendado',
        'Semana completa de atividades se beneficia de mensagens de motivação para manter o engajamento dos alunos ao longo dos dias');
    }
  }

  if (signals.mentionsAvaliacao) {
    addArtifact('mensagem_pais', 'Mensagem Explicativa para os Pais', 'recomendado',
      'Avaliações impactam os pais — comunicar o formato, conteúdo e como ajudar na preparação do aluno em casa');
    addArtifact('relatorio_coordenacao', 'Relatório de Criação para Coordenadores', 'recomendado',
      'Avaliações requerem alinhamento com a coordenação sobre critérios, formato e objetivos de aprendizagem');
  }

  if (signals.mentionsDificuldade) {
    addArtifact('mensagem_pais', 'Mensagem Explicativa para os Pais', 'recomendado',
      'Atividades de reforço/recuperação exigem parceria com os pais — comunicar as estratégias e como apoiar o aluno em casa');
  }

  if (signals.mentionsPlanoAula) {
    addArtifact('mensagem_pais', 'Mensagem Explicativa para os Pais', 'recomendado',
      'Plano de aula estruturado se complementa com comunicação para os pais sobre o que será trabalhado e como apoiar');
    addArtifact('relatorio_coordenacao', 'Relatório de Criação para Coordenadores', 'recomendado',
      'Plano de aula com justificativa pedagógica formal ajuda o professor a documentar seu trabalho para a coordenação');
  }

  const minArtifacts = activityCount >= 4 ? 3 : (activityCount >= 2 ? 3 : 2);
  const maxArtifacts = activityCount >= 4 ? 4 : (activityCount >= 2 ? 3 : 2);

  if (plan.length < minArtifacts) {
    const smartFillOptions: Array<{ tipo: ArtifactType; titulo: string; razao: string }> = [
      {
        tipo: 'mensagem_pais',
        titulo: 'Mensagem Explicativa para os Pais',
        razao: 'Todo trabalho pedagógico ganha mais impacto quando os pais entendem o que está sendo feito e como apoiar em casa — comunicação pronta em 3 versões (formal, WhatsApp e objetiva)',
      },
      {
        tipo: 'relatorio_coordenacao',
        titulo: 'Relatório de Criação para Coordenadores',
        razao: 'Documentação formal que valoriza o trabalho do professor — justificativa pedagógica, alinhamento curricular e cronograma prontos para apresentar à coordenação',
      },
      {
        tipo: 'mensagem_alunos',
        titulo: 'Mensagens Motivacionais para os Alunos',
        razao: 'Mensagens de engajamento e desafio que o professor pode usar para apresentar as atividades e motivar a turma — prontas para copiar e usar',
      },
      {
        tipo: 'roteiro_aula',
        titulo: 'Roteiro Detalhado de Aula',
        razao: 'Roteiro cronológico minuto a minuto para aplicar as atividades em sala — com tempos, transições e dicas de mediação pedagógica',
      },
      {
        tipo: 'resumo_executivo',
        titulo: 'Resumo Executivo da Sessão',
        razao: 'Síntese rápida de tudo que foi criado — perfeito para o professor ter uma visão geral e compartilhar com colegas',
      },
    ];

    for (const option of smartFillOptions) {
      if (plan.length >= minArtifacts) break;
      addArtifact(option.tipo, option.titulo, 'recomendado', option.razao);
    }
  }

  if (plan.length > maxArtifacts) {
    const sorted = plan.sort((a, b) => {
      const prioOrder = { obrigatorio: 0, recomendado: 1, opcional: 2 };
      return prioOrder[a.prioridade] - prioOrder[b.prioridade];
    });
    return sorted.slice(0, maxArtifacts);
  }

  return plan;
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
