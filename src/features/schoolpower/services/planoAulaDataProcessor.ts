
export interface EtapaDesenvolvimento {
  id: string;
  titulo: string;
  descricao: string;
  tipo_interacao: string;
  tempo_estimado: string;
  recursos_usados: string[];
  metodologia?: string;
  objetivos_especificos?: string[];
  atividades_praticas?: string;
  avaliacao?: string;
  observacoes?: string;
}

export interface PlanoAulaData {
  titulo: string;
  tema: string;
  disciplina: string;
  serie: string;
  tempo: string;
  objetivos: string;
  materiais: string;
  metodologia: string;
  observacoes: string;
  competencias: string;
  contexto: string;
  etapas_desenvolvimento: EtapaDesenvolvimento[];
  [key: string]: any;
}

/**
 * Extrai etapas de desenvolvimento de diferentes estruturas de dados da IA
 */
export function extractEtapasFromAIData(rawData: any): EtapaDesenvolvimento[] {
  console.log('🔍 Extraindo etapas de desenvolvimento dos dados da IA:', rawData);

  let etapas: any[] = [];

  // Múltiplas tentativas de localizar etapas nos dados da IA
  const possiblePaths = [
    rawData.etapas_desenvolvimento,
    rawData.desenvolvimento,
    rawData.etapas,
    rawData.steps,
    rawData.development_steps,
    rawData.lesson_steps,
    rawData.class_development,
    rawData.atividades_desenvolvimento,
    rawData.sequencia_didatica
  ];

  for (const path of possiblePaths) {
    if (path && Array.isArray(path) && path.length > 0) {
      etapas = path;
      console.log('✅ Etapas encontradas em:', path);
      break;
    }
  }

  // Se não encontrou etapas em arrays, procurar em objetos aninhados
  if (etapas.length === 0) {
    const nestedPaths = [
      rawData.plano?.etapas_desenvolvimento,
      rawData.plano?.desenvolvimento,
      rawData.conteudo?.etapas,
      rawData.lesson_plan?.steps,
      rawData.aula?.desenvolvimento
    ];

    for (const path of nestedPaths) {
      if (path && Array.isArray(path) && path.length > 0) {
        etapas = path;
        console.log('✅ Etapas encontradas em objeto aninhado');
        break;
      }
    }
  }

  // Normalizar e processar etapas encontradas
  const processedEtapas = etapas.map((etapa, index) => {
    return {
      id: etapa.id || etapa.etapa_id || `etapa-${index + 1}`,
      titulo: etapa.titulo || etapa.title || etapa.nome || etapa.name || `${index + 1}. Etapa ${index + 1}`,
      descricao: etapa.descricao || etapa.description || etapa.desc || etapa.conteudo || 'Descrição não disponível',
      tipo_interacao: etapa.tipo_interacao || etapa.tipoInteracao || etapa.interaction_type || etapa.tipo || 'Aula expositiva',
      tempo_estimado: etapa.tempo_estimado || etapa.tempoEstimado || etapa.duration || etapa.tempo || '10 minutos',
      recursos_usados: normalizeRecursos(etapa.recursos_usados || etapa.recursos || etapa.resources || etapa.materiais),
      metodologia: etapa.metodologia || etapa.methodology || etapa.metodo || '',
      objetivos_especificos: normalizeArray(etapa.objetivos_especificos || etapa.objetivos || etapa.objectives),
      atividades_praticas: etapa.atividades_praticas || etapa.atividades || etapa.activities || '',
      avaliacao: etapa.avaliacao || etapa.evaluation || etapa.assessment || 'Participação',
      observacoes: etapa.observacoes || etapa.notes || etapa.obs || ''
    };
  });

  console.log('✅ Etapas processadas:', processedEtapas);
  return processedEtapas;
}

/**
 * Normaliza recursos para array de strings
 */
function normalizeRecursos(recursos: any): string[] {
  if (!recursos) return ['Quadro'];
  if (Array.isArray(recursos)) return recursos.filter(r => r && typeof r === 'string');
  if (typeof recursos === 'string') return recursos.split(',').map(r => r.trim()).filter(r => r);
  return ['Quadro'];
}

/**
 * Normaliza qualquer valor para array de strings
 */
function normalizeArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => v && typeof v === 'string');
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(v => v);
  return [];
}

/**
 * Processa e valida dados de plano de aula gerados pela IA
 */
export function processPlanoAulaData(rawData: any): PlanoAulaData {
  console.log('🔄 Processando dados do plano de aula:', rawData);

  // Usar a nova função de extração de etapas
  let etapas_desenvolvimento = extractEtapasFromAIData(rawData);

  // Se ainda não temos etapas da IA, gerar etapas baseadas no contexto fornecido
  if (!etapas_desenvolvimento || etapas_desenvolvimento.length === 0) {
    console.log('⚠️ Nenhuma etapa da IA encontrada, gerando etapas contextualizadas');
    
    const tema = rawData.tema || rawData['Tema ou Tópico Central'] || 'Tema da Aula';
    const disciplina = rawData.disciplina || rawData['Componente Curricular'] || 'Matemática';
    const objetivos = rawData.objetivos || rawData['Objetivo Geral'] || 'Objetivo não especificado';
    const serie = rawData.serie || rawData['Ano/Série Escolar'] || 'Série não especificada';
    
    etapas_desenvolvimento = generateContextualizedSteps(tema, disciplina, objetivos, serie);
  }

  console.log('✅ Etapas de desenvolvimento processadas:', etapas_desenvolvimento);

  const processedData: PlanoAulaData = {
    titulo: rawData.titulo || rawData.title || rawData['Tema ou Tópico Central'] || 'Plano de Aula',
    tema: rawData.tema || rawData['Tema ou Tópico Central'] || 'Tema da Aula',
    disciplina: rawData.disciplina || rawData['Componente Curricular'] || 'Matemática',
    serie: rawData.serie || rawData['Ano/Série Escolar'] || '9º Ano',
    tempo: rawData.tempo || rawData['Carga Horária'] || '50 minutos',
    objetivos: rawData.objetivos || rawData['Objetivo Geral'] || 'Compreender o conteúdo proposto',
    materiais: rawData.materiais || rawData['Materiais/Recursos'] || 'Material didático',
    metodologia: rawData.metodologia || rawData['Tipo de Aula'] || 'Aula Expositiva',
    observacoes: rawData.observacoes || rawData['Observações do Professor'] || 'Observações do professor',
    competencias: rawData.competencias || rawData['Habilidades BNCC'] || 'Competências da BNCC',
    contexto: rawData.contexto || rawData['Perfil da Turma'] || 'Turma regular',
    etapas_desenvolvimento,
    // Preservar todos os outros campos
    ...rawData
  };

  console.log('✅ Dados do plano de aula processados com sucesso:', processedData);
  return processedData;
}

/**
 * Gera etapas contextualizadas baseadas nos dados fornecidos
 */
function generateContextualizedSteps(tema: string, disciplina: string, objetivos: string, serie: string): EtapaDesenvolvimento[] {
  console.log('🎯 Gerando etapas contextualizadas para:', { tema, disciplina, objetivos, serie });

  return [
    {
      id: 'etapa-contextualizada-1',
      titulo: `1. Introdução: ${tema}`,
      descricao: `Apresentação contextualizada do tema "${tema}" para ${serie} de ${disciplina}. Conectar com conhecimentos prévios dos alunos e estabelecer a importância do conteúdo no contexto da disciplina. ${objetivos}`,
      tipo_interacao: 'Apresentação dialogada',
      tempo_estimado: '15 minutos',
      recursos_usados: ['Slides contextualizados', 'Quadro interativo', 'Exemplos do cotidiano'],
      metodologia: 'Aula expositiva dialogada',
      objetivos_especificos: [`Contextualizar ${tema}`, 'Ativar conhecimentos prévios', 'Despertar interesse pelo conteúdo'],
      atividades_praticas: `Discussão inicial sobre experiências dos alunos relacionadas a ${tema}`,
      avaliacao: 'Participação ativa nas discussões iniciais',
      observacoes: `Adaptar exemplos para o nível de ${serie} e realidade local`
    },
    {
      id: 'etapa-contextualizada-2',
      titulo: `2. Desenvolvimento: Conceitos de ${tema}`,
      descricao: `Exposição sistemática dos conceitos fundamentais de ${tema} em ${disciplina}, adequada para ${serie}. Utilizar metodologias ativas e exemplos práticos para facilitar a compreensão.`,
      tipo_interacao: 'Explicação interativa + demonstração',
      tempo_estimado: '20 minutos',
      recursos_usados: ['Material didático específico', 'Recursos visuais', 'Exemplos práticos'],
      metodologia: 'Metodologia ativa com demonstrações',
      objetivos_especificos: ['Compreender conceitos fundamentais', 'Relacionar teoria e prática', 'Desenvolver raciocínio crítico'],
      atividades_praticas: `Resolução de problemas contextualizados sobre ${tema}`,
      avaliacao: 'Acompanhamento da compreensão através de perguntas direcionadas',
      observacoes: 'Pausar para esclarecimentos e verificar compreensão individual'
    },
    {
      id: 'etapa-contextualizada-3',
      titulo: `3. Aplicação Prática: ${tema} na Prática`,
      descricao: `Aplicação dos conceitos de ${tema} através de atividades práticas adequadas para ${serie}. Promover a fixação do aprendizado através de exercícios contextualizados.`,
      tipo_interacao: 'Atividade prática individual/grupo',
      tempo_estimado: '12 minutos',
      recursos_usados: ['Exercícios contextualizados', 'Material de apoio', 'Ferramentas específicas'],
      metodologia: 'Aprendizagem baseada em problemas',
      objetivos_especificos: ['Aplicar conhecimentos adquiridos', 'Desenvolver autonomia', 'Consolidar aprendizado'],
      atividades_praticas: `Resolução de situações-problema envolvendo ${tema}`,
      avaliacao: 'Avaliação formativa através da correção das atividades',
      observacoes: 'Circular pela sala oferecendo apoio individualizado'
    },
    {
      id: 'etapa-contextualizada-4',
      titulo: `4. Síntese e Avaliação: ${tema}`,
      descricao: `Consolidação dos principais conceitos sobre ${tema} estudados em ${disciplina}. Verificação da aprendizagem e esclarecimento de dúvidas finais.`,
      tipo_interacao: 'Síntese colaborativa + avaliação',
      tempo_estimado: '8 minutos',
      recursos_usados: ['Síntese visual', 'Quadro de resumo'],
      metodologia: 'Síntese colaborativa',
      objetivos_especificos: ['Consolidar aprendizado', 'Esclarecer dúvidas', 'Conectar com próximos conteúdos'],
      atividades_praticas: `Elaboração coletiva de síntese sobre ${tema}`,
      avaliacao: 'Verificação da compreensão geral através de questões-síntese',
      observacoes: 'Registrar dúvidas para retomada na próxima aula'
    }
  ];
}

/**
 * Salva dados processados do plano de aula no localStorage
 */
export function savePlanoAulaData(activityId: string, data: PlanoAulaData): void {
  try {
    // Salvar no cache específico do plano construído
    localStorage.setItem(`constructed_plano-aula_${activityId}`, JSON.stringify(data));
    
    // Salvar também no cache da atividade
    localStorage.setItem(`activity_${activityId}`, JSON.stringify(data));
    
    // Salvar no cache geral do plano-aula
    localStorage.setItem('schoolpower_plano-aula_content', JSON.stringify(data));
    
    console.log('✅ Dados do plano de aula salvos com sucesso:', activityId);
  } catch (error) {
    console.error('❌ Erro ao salvar dados do plano de aula:', error);
  }
}
