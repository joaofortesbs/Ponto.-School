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
  essencial: ['guia_aplicacao', 'mensagem_pais'],
  minimo: ['guia_aplicacao'],
};

export function determineFlowArtifacts(
  activityCount: number,
  userPrompt: string,
  _sessionContext?: string
): FlowArtifactPlan[] {
  const lower = userPrompt.toLowerCase();
  const plan: FlowArtifactPlan[] = [];

  const isWeekPlan = lower.includes('semana') || lower.includes('semanal') || lower.includes('semanas');
  const isMultipleActivities = activityCount >= 2;
  const mentionsPais = lower.includes('pais') || lower.includes('responsáveis') || lower.includes('família');
  const mentionsAlunos = lower.includes('alunos') || lower.includes('estudantes') || lower.includes('turma');
  const mentionsCoordenacao = lower.includes('coordena') || lower.includes('diretor') || lower.includes('gestão');
  const mentionsAvaliacao = /avalia[çc][aã]o|avaliar|avalia[çc]/.test(lower);
  const mentionsProjeto = /projeto|pbl|maker|steam/.test(lower);
  const mentionsInclusao = /inclus[aã]o|inclusiv|adaptad|diferencia|pei|iep/.test(lower);

  plan.push({
    tipo: 'guia_aplicacao',
    titulo: 'Guia de Aplicação em Sala de Aula',
    prioridade: 'obrigatorio',
    razao: 'Documento essencial que orienta o professor passo a passo na aplicação prática das atividades criadas em sala de aula',
  });

  const needsMensagemPais = isMultipleActivities || isWeekPlan || mentionsPais || mentionsInclusao;
  if (needsMensagemPais) {
    let razaoPais = 'Comunica aos pais sobre as atividades e como apoiar em casa';
    if (mentionsInclusao) {
      razaoPais = 'Pais precisam ser informados sobre estratégias de diferenciação e inclusão aplicadas às atividades dos seus filhos';
    } else if (isWeekPlan) {
      razaoPais = 'Planejamento semanal requer comunicação com os pais sobre a sequência de atividades e como apoiar o aprendizado em casa';
    } else if (mentionsPais) {
      razaoPais = 'Professor mencionou pais/responsáveis — comunicação direta solicitada';
    }
    plan.push({
      tipo: 'mensagem_pais',
      titulo: 'Mensagens para os Pais dos Alunos',
      prioridade: (isWeekPlan || mentionsInclusao) ? 'obrigatorio' : 'recomendado',
      razao: razaoPais,
    });
  }

  const needsRelatorioCoordenacao = isMultipleActivities || isWeekPlan || mentionsCoordenacao || mentionsProjeto;
  if (needsRelatorioCoordenacao) {
    let razaoCoordenacao = 'Documento formal justificando as atividades para a gestão escolar';
    if (mentionsProjeto) {
      razaoCoordenacao = 'Projetos (PBL/STEAM/Maker) exigem justificativa pedagógica formal para a coordenação aprovar e acompanhar';
    } else if (isWeekPlan) {
      razaoCoordenacao = 'Planejamento semanal completo requer documentação formal para alinhamento com a coordenação pedagógica';
    } else if (mentionsCoordenacao) {
      razaoCoordenacao = 'Professor mencionou coordenação/gestão — relatório formal solicitado';
    }
    plan.push({
      tipo: 'relatorio_coordenacao',
      titulo: 'Relatório para Coordenação Pedagógica',
      prioridade: (isWeekPlan || mentionsProjeto) ? 'obrigatorio' : 'recomendado',
      razao: razaoCoordenacao,
    });
  }

  const needsMensagemAlunos = (isMultipleActivities && mentionsAlunos) || isWeekPlan || mentionsAvaliacao;
  if (needsMensagemAlunos) {
    let razaoAlunos = 'Engaja e motiva os alunos a participarem das atividades';
    if (mentionsAvaliacao) {
      razaoAlunos = 'Atividades avaliativas se beneficiam de mensagens motivacionais que reduzem ansiedade e engajam os alunos';
    } else if (isWeekPlan) {
      razaoAlunos = 'Semana completa de atividades requer mensagens de motivação para manter o engajamento dos alunos ao longo dos dias';
    }
    plan.push({
      tipo: 'mensagem_alunos',
      titulo: 'Mensagens Motivacionais para os Alunos',
      prioridade: mentionsAvaliacao ? 'recomendado' : 'opcional',
      razao: razaoAlunos,
    });
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
