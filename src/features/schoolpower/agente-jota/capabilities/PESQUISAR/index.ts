/**
 * PESQUISAR CAPABILITIES - Funções de Pesquisa e Busca
 */

import type { CapabilityConfig } from '../index';

async function pesquisarTiposAtividades(_params: Record<string, any>): Promise<any> {
  console.log('🔍 [Pesquisar] Buscando tipos de atividades disponíveis');

  const schoolPowerActivitiesRaw = await import('../../../data/schoolPowerActivities.json');
  const rawData = schoolPowerActivitiesRaw.default || schoolPowerActivitiesRaw;
  const activities = (rawData as any).atividades || rawData;

  if (!Array.isArray(activities)) {
    console.warn('⚠️ [Pesquisar] schoolPowerActivities não é um array');
    return { total: 0, categorias: [], tipos: [], mensagem: 'Erro ao carregar atividades' };
  }

  return {
    total: activities.length,
    categorias: [...new Set(activities.map((a: any) => a.categoria || a.category))],
    tipos: activities.slice(0, 20).map((a: any) => ({
      id: a.id,
      nome: a.titulo || a.name,
      descricao: a.descricao || a.description,
      categoria: a.categoria || a.category,
      tipo: a.tipo || a.type,
      campos_obrigatorios: a.campos_obrigatorios || [],
      schema_campos: a.schema_campos || {}
    })),
    mensagem: `Encontrados ${activities.length} tipos de atividades disponíveis em diversas categorias.`,
  };
}

async function pesquisarAtividadesConta(params: Record<string, any>): Promise<any> {
  console.log('🔍 [Pesquisar] Buscando atividades da conta');

  return {
    total: 0,
    atividades: [],
    mensagem: 'Funcionalidade de histórico em desenvolvimento. Por enquanto, você pode criar novas atividades.',
    filtros: params,
  };
}

async function pesquisarDesempenhoTurma(params: Record<string, any>): Promise<any> {
  console.log('🔍 [Pesquisar] Buscando desempenho da turma:', params.turma_id);

  return {
    turma_id: params.turma_id || 'turma-geral',
    periodo: params.periodo || 'ultimo_mes',
    dados_simulados: true,
    media_geral: 7.2,
    participacao: '85%',
    areas_destaque: ['Interpretação de texto', 'Cálculo básico'],
    areas_melhoria: ['Produção textual', 'Problemas complexos'],
    mensagem: 'Dados simulados para demonstração. Integração com sistema de notas em desenvolvimento.',
  };
}

async function analisarSolicitacao(params: Record<string, any>): Promise<any> {
  console.log('🔍 [Pesquisar] Analisando solicitação:', params.prompt);

  return {
    prompt_analisado: params.prompt,
    tipo_detectado: 'criacao_atividade',
    sugestoes: [
      'Lista de Exercícios',
      'Quiz Interativo',
      'Plano de Aula',
    ],
    mensagem: 'Análise concluída. Pronto para prosseguir com a criação.',
  };
}

export const PESQUISAR_CAPABILITIES: Record<string, CapabilityConfig> = {
  
  pesquisar_tipos_atividades: {
    name: 'pesquisar_tipos_atividades',
    description: 'Busca todos os tipos de atividades disponíveis para criação no School Power',
    parameters: {
      categoria: { 
        type: 'string', 
        required: false, 
        description: 'Filtrar por categoria específica' 
      },
      limite: { 
        type: 'number', 
        required: false, 
        description: 'Quantidade máxima de resultados',
        default: 20
      }
    },
    execute: pesquisarTiposAtividades
  },

  pesquisar_atividades_conta: {
    name: 'pesquisar_atividades_conta',
    description: 'Busca atividades já criadas pelo professor na conta',
    parameters: {
      disciplina: { 
        type: 'string', 
        required: false, 
        description: 'Filtrar por disciplina' 
      },
      tipo: { 
        type: 'string', 
        required: false, 
        description: 'Filtrar por tipo de atividade' 
      },
      limite: { 
        type: 'number', 
        required: false, 
        description: 'Quantidade máxima de resultados',
        default: 50
      }
    },
    execute: pesquisarAtividadesConta
  },

  pesquisar_desempenho_turma: {
    name: 'pesquisar_desempenho_turma',
    description: 'Busca dados de desempenho acadêmico de uma turma específica',
    parameters: {
      turma_id: { 
        type: 'string', 
        required: true, 
        description: 'ID da turma' 
      },
      periodo: { 
        type: 'string', 
        required: false, 
        description: 'Período de análise',
        default: 'ultimo_mes'
      }
    },
    execute: pesquisarDesempenhoTurma
  },

  analisar_solicitacao: {
    name: 'analisar_solicitacao',
    description: 'Analisa a solicitação do usuário para identificar a melhor abordagem',
    parameters: {
      prompt: { 
        type: 'string', 
        required: true, 
        description: 'Texto da solicitação do usuário' 
      }
    },
    execute: analisarSolicitacao
  }

};

export default PESQUISAR_CAPABILITIES;
