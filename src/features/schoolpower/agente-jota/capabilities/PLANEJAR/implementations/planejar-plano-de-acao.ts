import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import type { PlanejarPlanoAcaoInput } from '../schemas/planejar-schema';

function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function planejarPlanoDeAcao(params: PlanejarPlanoAcaoInput) {
  console.log('📋 [Capability:PLANEJAR] Montando plano de ação para:', params.objetivo);

  const planningPrompt = `
Você é o Agente Jota, assistente pedagógico do School Power.
O professor fez a seguinte solicitação: "${params.objetivo}"

${params.contexto ? `
CONTEXTO:
- Turma: ${params.contexto.turma_id || 'Não especificada'}
- Matéria: ${params.contexto.materia || 'Não especificada'}
- Nível: ${params.contexto.nivel_ensino || 'Não especificado'}
` : ''}

${params.preferencias ? `
PREFERÊNCIAS:
- Tipo preferido: ${params.preferencias.tipo_atividade_preferida || 'Qualquer'}
- Dificuldade: ${params.preferencias.dificuldade || 'Intermediário'}
` : ''}

Crie um plano de ação estruturado com 2-4 etapas para atender o objetivo.
As capabilities disponíveis são:
- pesquisar_atividades_disponiveis: Pesquisa atividades disponíveis na plataforma
- decidir_atividades_criar: Decide quais atividades criar baseado em critérios pedagógicos
- criar_atividades: Cria as atividades decididas

Retorne APENAS um JSON no formato:
{
  "etapas": [
    {
      "titulo": "Nome da etapa",
      "descricao": "O que será feito",
      "capability": "nome_da_capability",
      "justificativa": "Por que esta etapa é importante"
    }
  ]
}
  `.trim();

  const result = await executeWithCascadeFallback(planningPrompt);

  let etapas = [];
  
  if (result.success && result.data) {
    try {
      const cleanedText = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        etapas = parsed.etapas || [];
      }
    } catch (e) {
      console.warn('⚠️ [Capability:PLANEJAR] Falha ao parsear resposta da IA, usando fallback');
    }
  }

  if (etapas.length === 0) {
    etapas = [
      {
        titulo: 'Pesquisar atividades disponíveis',
        descricao: 'Vou pesquisar as atividades que posso criar para você',
        capability: 'pesquisar_atividades_disponiveis',
        justificativa: 'Primeiro preciso ver o que temos disponível'
      },
      {
        titulo: 'Decidir as melhores atividades',
        descricao: 'Vou escolher as atividades mais adequadas para seu objetivo',
        capability: 'decidir_atividades_criar',
        justificativa: 'Seleção estratégica baseada em critérios pedagógicos'
      },
      {
        titulo: 'Criar as atividades',
        descricao: 'Vou criar todas as atividades escolhidas',
        capability: 'criar_atividades',
        justificativa: 'Construção final das atividades'
      }
    ];
  }

  const plano = {
    id: generateId(),
    objetivo: params.objetivo,
    etapas: etapas.map((etapa: any, idx: number) => ({
      ordem: idx + 1,
      titulo: etapa.titulo,
      descricao: etapa.descricao,
      capability: etapa.capability,
      capabilities: [],
      status: 'pending' as const,
      justificativa: etapa.justificativa
    })),
    status: 'pending' as const,
    createdAt: Date.now()
  };

  console.log('✅ [Capability:PLANEJAR] Plano criado com', plano.etapas.length, 'etapas');

  return {
    success: true,
    plano,
    mensagem: 'Montei um plano de ação completo pra você! Dá uma olhada e clica em "APLICAR PLANO" quando estiver pronto.'
  };
}
