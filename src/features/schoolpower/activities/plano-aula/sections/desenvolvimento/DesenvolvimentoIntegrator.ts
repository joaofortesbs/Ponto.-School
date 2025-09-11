/**
 * Integrador para sincronização de dados entre seções do plano de aula
 * e coleta de contexto para geração via IA
 */

export interface ContextoPlanoCompleto {
  // Dados básicos
  id?: string;
  titulo?: string;
  disciplina?: string;
  tema?: string;
  anoEscolaridade?: string;
  serie?: string;
  tempo?: string;
  tempoLimite?: string;

  // Dados das outras seções
  objetivos?: string[];
  materiais?: string[];
  recursos?: string[];
  metodologia?: string;
  competencias?: string[];
  habilidadesBNCC?: string[];

  // Dados específicos do contexto
  contextoAplicacao?: string;
  nivelComplexidade?: string;
  estrategiasEnsino?: string[];
  avaliacaoPlaneada?: string;

  // Metadados
  dataGeracao?: string;
  versao?: string;
}

// Interface para os dados de desenvolvimento, incluindo etapas e recursos
export interface DesenvolvimentoData {
  id: string;
  planoId: string;
  etapas: Array<{
    id: string;
    titulo: string;
    descricao: string;
    tempoEstimado: string;
    recursosUsados?: string[];
    instrucoes?: string[];
  }>;
  recursosUtilizados: string[];
  tempoTotalEstimado: string;
  timestamp: string;
}


export class DesenvolvimentoIntegrator {
  /**
   * Processa dados de desenvolvimento
   */
  static processarDados(data: any, planoId: string) {
    console.log('🔄 DesenvolvimentoIntegrator: Processando dados', { data, planoId });

    if (!data) return null;

    // Se já tem estrutura de desenvolvimento, usa ela
    if (data.desenvolvimento && Array.isArray(data.desenvolvimento)) {
      return data.desenvolvimento;
    }

    // Cria estrutura padrão
    return [
      {
        etapa: 1,
        titulo: 'Introdução',
        descricao: 'Apresentação do tema',
        tipo_interacao: 'Exposição',
        tempo_estimado: '15 min',
        recurso_gerado: 'Slides',
        nota_privada_professor: 'Contextualizar o tema'
      },
      {
        etapa: 2,
        titulo: 'Desenvolvimento',
        descricao: 'Explicação do conteúdo principal',
        tipo_interacao: 'Interativa',
        tempo_estimado: '25 min',
        recurso_gerado: 'Material didático',
        nota_privada_professor: 'Verificar compreensão'
      },
      {
        etapa: 3,
        titulo: 'Finalização',
        descricao: 'Síntese e avaliação',
        tipo_interacao: 'Avaliativa',
        tempo_estimado: '10 min',
        recurso_gerado: 'Atividade de fixação',
        nota_privada_professor: 'Aplicar avaliação'
      }
    ];
  }

  /**
   * Sincroniza dados com outras seções
   */
  static sincronizarComOutrasSecoes(data: any, planoId: string) {
    console.log('🔗 DesenvolvimentoIntegrator: Sincronizando com outras seções', { data, planoId });

    // Aqui pode implementar lógica de sincronização
    // Por exemplo, atualizar tempo total baseado nas etapas
    if (data && Array.isArray(data)) {
      const tempoTotal = data.reduce((total, etapa) => {
        const minutos = parseInt(etapa.tempo_estimado?.replace(/\D/g, '') || '0');
        return total + minutos;
      }, 0);

      console.log('⏱️ Tempo total calculado:', tempoTotal, 'minutos');
    }
  }

  /**
   * Coleta contexto completo
   */
  static coletarContextoCompleto(activityData: any, data: any) {
    console.log('📊 DesenvolvimentoIntegrator: Coletando contexto completo');

    return {
      planoData: data || activityData,
      originalData: activityData?.originalData,
      timestamp: new Date().toISOString()
    };
  }
}