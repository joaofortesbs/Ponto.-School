/**
 * CRIAR ATIVIDADE - Função para criar atividades educacionais
 */

import { executeWithCascadeFallback } from '../../../services/controle-APIs-gerais-school-power';
import schoolPowerActivities from '../../../data/schoolPowerActivities.json';

interface CriarAtividadeParams {
  tipo: string;
  tema: string;
  serie?: string;
  disciplina?: string;
  quantidade?: number;
  dificuldade?: string;
  contexto?: string;
}

interface AtividadeCriada {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  metadata: {
    tema: string;
    serie: string;
    disciplina: string;
    dificuldade: string;
    quantidade: number;
  };
  criadoEm: number;
}

export async function criarAtividade(params: CriarAtividadeParams): Promise<AtividadeCriada> {
  console.log('📝 [CriarAtividade] Criando atividade:', params);

  const activityInfo = (schoolPowerActivities as any[]).find(
    (a: any) => a.id === params.tipo || a.name?.toLowerCase().includes(params.tipo.toLowerCase())
  );

  const prompt = `
Você é um especialista em educação. Crie uma atividade educacional com as seguintes especificações:

TIPO: ${params.tipo}
TEMA: ${params.tema}
SÉRIE: ${params.serie || 'Fundamental II'}
DISCIPLINA: ${params.disciplina || 'Geral'}
QUANTIDADE DE ITENS: ${params.quantidade || 10}
DIFICULDADE: ${params.dificuldade || 'Médio'}
${params.contexto ? `CONTEXTO ADICIONAL: ${params.contexto}` : ''}

${activityInfo ? `
INFORMAÇÕES SOBRE O TIPO DE ATIVIDADE:
Nome: ${activityInfo.name}
Descrição: ${activityInfo.description}
` : ''}

INSTRUÇÕES:
1. Crie um título atraente e descritivo
2. Elabore uma descrição clara do objetivo
3. Desenvolva o conteúdo completo da atividade
4. Inclua ${params.quantidade || 10} itens/questões/elementos
5. Adapte a linguagem para a série especificada
6. Use exemplos práticos quando possível

Formate a resposta de forma clara e organizada, pronta para uso pelo professor.
  `.trim();

  const result = await executeWithCascadeFallback(prompt);

  const titulo = `${params.tipo.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${params.tema}`;

  return {
    id: `ativ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tipo: params.tipo,
    titulo,
    descricao: `Atividade de ${params.tipo} sobre ${params.tema} para ${params.serie || 'Fundamental II'}`,
    conteudo: result.data || 'Conteúdo gerado com sucesso',
    metadata: {
      tema: params.tema,
      serie: params.serie || 'Fundamental II',
      disciplina: params.disciplina || 'Geral',
      dificuldade: params.dificuldade || 'Médio',
      quantidade: params.quantidade || 10,
    },
    criadoEm: Date.now(),
  };
}

export default criarAtividade;
