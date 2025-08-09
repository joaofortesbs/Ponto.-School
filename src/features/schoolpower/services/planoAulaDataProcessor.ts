
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
 * Processa e valida dados de plano de aula gerados pela IA
 */
export function processPlanoAulaData(rawData: any): PlanoAulaData {
  console.log('🔄 Processando dados do plano de aula:', rawData);

  // Extrair etapas de desenvolvimento
  let etapas_desenvolvimento: EtapaDesenvolvimento[] = [];

  // Tentar extrair etapas de diferentes possíveis localizações
  if (rawData.etapas_desenvolvimento && Array.isArray(rawData.etapas_desenvolvimento)) {
    etapas_desenvolvimento = rawData.etapas_desenvolvimento;
  } else if (rawData.desenvolvimento && Array.isArray(rawData.desenvolvimento)) {
    etapas_desenvolvimento = rawData.desenvolvimento;
  } else if (rawData.etapas && Array.isArray(rawData.etapas)) {
    etapas_desenvolvimento = rawData.etapas;
  } else if (rawData.steps && Array.isArray(rawData.steps)) {
    etapas_desenvolvimento = rawData.steps.map((step: any, index: number) => ({
      id: step.id || `etapa-${index + 1}`,
      titulo: step.titulo || step.title || `${index + 1}. Etapa ${index + 1}`,
      descricao: step.descricao || step.description || 'Descrição da etapa',
      tipo_interacao: step.tipo_interacao || step.interaction_type || 'Aula expositiva',
      tempo_estimado: step.tempo_estimado || step.duration || '10 minutos',
      recursos_usados: Array.isArray(step.recursos_usados) ? step.recursos_usados : 
                      Array.isArray(step.resources) ? step.resources : ['Quadro'],
      metodologia: step.metodologia || step.methodology || 'Aula tradicional',
      objetivos_especificos: step.objetivos_especificos || step.specific_objectives || [],
      atividades_praticas: step.atividades_praticas || step.practical_activities || '',
      avaliacao: step.avaliacao || step.evaluation || 'Participação',
      observacoes: step.observacoes || step.notes || ''
    }));
  }

  // Se ainda não temos etapas, gerar etapas padrão baseadas no contexto
  if (!etapas_desenvolvimento || etapas_desenvolvimento.length === 0) {
    console.log('⚠️ Nenhuma etapa encontrada, gerando etapas padrão baseadas no contexto');
    
    const tema = rawData.tema || rawData['Tema ou Tópico Central'] || 'Tema da Aula';
    const disciplina = rawData.disciplina || rawData['Componente Curricular'] || 'Matemática';
    
    etapas_desenvolvimento = [
      {
        id: 'etapa-1',
        titulo: '1. Introdução e Contextualização',
        descricao: `Apresentação do tema "${tema}" de forma contextualizada, conectando com conhecimentos prévios dos alunos e estabelecendo a relevância do conteúdo.`,
        tipo_interacao: 'Apresentação dialogada',
        tempo_estimado: '15 minutos',
        recursos_usados: ['Quadro', 'Slides'],
        metodologia: 'Aula expositiva dialogada',
        objetivos_especificos: ['Contextualizar o tema', 'Ativar conhecimentos prévios'],
        atividades_praticas: 'Discussão inicial sobre o tema',
        avaliacao: 'Participação nas discussões',
        observacoes: 'Adaptar linguagem conforme a turma'
      },
      {
        id: 'etapa-2',
        titulo: '2. Desenvolvimento do Conteúdo',
        descricao: `Exposição sistemática do conteúdo de ${disciplina} relacionado ao tema "${tema}", com exemplos práticos e demonstrações.`,
        tipo_interacao: 'Explicação + demonstração',
        tempo_estimado: '20 minutos',
        recursos_usados: ['Livro didático', 'Material manipulativo'],
        metodologia: 'Demonstração prática',
        objetivos_especificos: ['Compreender conceitos fundamentais', 'Aplicar conhecimentos'],
        atividades_praticas: 'Resolução de exemplos no quadro',
        avaliacao: 'Acompanhamento da compreensão',
        observacoes: 'Dar tempo para anotações'
      },
      {
        id: 'etapa-3',
        titulo: '3. Atividade Prática',
        descricao: `Aplicação prática dos conceitos apresentados através de exercícios e atividades relacionadas ao tema "${tema}".`,
        tipo_interacao: 'Atividade individual/grupo',
        tempo_estimado: '10 minutos',
        recursos_usados: ['Exercícios', 'Material de apoio'],
        metodologia: 'Aprendizagem ativa',
        objetivos_especificos: ['Fixar aprendizado', 'Desenvolver autonomia'],
        atividades_praticas: 'Resolução de exercícios propostos',
        avaliacao: 'Correção dos exercícios',
        observacoes: 'Circular pela sala auxiliando os alunos'
      },
      {
        id: 'etapa-4',
        titulo: '4. Síntese e Fechamento',
        descricao: `Consolidação dos principais conceitos abordados sobre "${tema}" e esclarecimento de dúvidas finais.`,
        tipo_interacao: 'Discussão + síntese',
        tempo_estimado: '5 minutos',
        recursos_usados: ['Quadro'],
        metodologia: 'Síntese colaborativa',
        objetivos_especificos: ['Consolidar aprendizado', 'Esclarecer dúvidas'],
        atividades_praticas: 'Resumo coletivo dos pontos principais',
        avaliacao: 'Verificação da compreensão geral',
        observacoes: 'Anotar dúvidas para próxima aula'
      }
    ];
  }

  // Validar e normalizar cada etapa
  etapas_desenvolvimento = etapas_desenvolvimento.map((etapa, index) => ({
    id: etapa.id || `etapa-${index + 1}`,
    titulo: etapa.titulo || `${index + 1}. Etapa ${index + 1}`,
    descricao: etapa.descricao || 'Descrição da etapa',
    tipo_interacao: etapa.tipo_interacao || 'Aula expositiva',
    tempo_estimado: etapa.tempo_estimado || '10 minutos',
    recursos_usados: Array.isArray(etapa.recursos_usados) ? etapa.recursos_usados : ['Quadro'],
    metodologia: etapa.metodologia || 'Aula tradicional',
    objetivos_especificos: Array.isArray(etapa.objetivos_especificos) ? etapa.objetivos_especificos : [],
    atividades_praticas: etapa.atividades_praticas || '',
    avaliacao: etapa.avaliacao || 'Participação',
    observacoes: etapa.observacoes || ''
  }));

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
