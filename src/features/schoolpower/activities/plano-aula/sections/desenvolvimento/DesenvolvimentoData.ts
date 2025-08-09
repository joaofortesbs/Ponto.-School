
export interface EtapaDesenvolvimento {
  etapa: number;
  titulo: string;
  descricao: string;
  tipo_interacao: string;
  tempo_estimado: string;
  recurso_gerado: string;
  nota_privada_professor?: string;
  objetivos_etapa?: string[];
  recursos_necessarios?: string[];
}

export interface DesenvolvimentoData {
  etapas: EtapaDesenvolvimento[];
  tempo_total_estimado: string;
  observacoes_gerais?: string;
  metodologia_aplicada?: string;
}

// Função para processar dados do desenvolvimento
export const processDesenvolvimentoData = (rawData: any): DesenvolvimentoData => {
  console.log('🔄 Processando dados de desenvolvimento:', rawData);

  // Se já tem estrutura de desenvolvimento, usa ela
  if (rawData?.desenvolvimento && Array.isArray(rawData.desenvolvimento)) {
    const etapas = rawData.desenvolvimento.map((etapa: any, index: number) => ({
      etapa: etapa.etapa || index + 1,
      titulo: etapa.titulo || `${index + 1}. Etapa ${index + 1}`,
      descricao: etapa.descricao || 'Descrição da etapa',
      tipo_interacao: etapa.tipo_interacao || 'Interativa',
      tempo_estimado: etapa.tempo_estimado || '15 min',
      recurso_gerado: etapa.recurso_gerado || 'Material didático',
      nota_privada_professor: etapa.nota_privada_professor,
      objetivos_etapa: etapa.objetivos_etapa || ['Engajar os alunos', 'Transmitir conhecimento'],
      recursos_necessarios: etapa.recursos_necessarios || ['Quadro', 'Material didático']
    }));

    return {
      etapas,
      tempo_total_estimado: calculateTotalTime(etapas),
      observacoes_gerais: rawData.observacoes_gerais,
      metodologia_aplicada: rawData.metodologia?.nome || rawData.metodologia
    };
  }

  // Criar estrutura básica se não existe
  const etapasDefault: EtapaDesenvolvimento[] = [
    {
      etapa: 1,
      titulo: '1. Introdução e Contextualização',
      descricao: 'Apresentação do tema da aula, contextualização histórica e ativação do conhecimento prévio dos alunos através de questionamentos dirigidos.',
      tipo_interacao: 'Apresentação + Debate',
      tempo_estimado: '15 min',
      recurso_gerado: 'Slides introdutórios',
      nota_privada_professor: 'Verificar conhecimento prévio através de perguntas abertas',
      objetivos_etapa: ['Engajar os alunos no tema', 'Ativar conhecimentos prévios', 'Estabelecer contexto'],
      recursos_necessarios: ['Slides', 'Quadro', 'Projetor']
    },
    {
      etapa: 2,
      titulo: '2. Desenvolvimento do Conteúdo',
      descricao: 'Explicação detalhada do conteúdo principal com exemplos práticos, demonstrações e participação ativa dos alunos.',
      tipo_interacao: 'Interativa',
      tempo_estimado: '25 min',
      recurso_gerado: 'Material didático',
      nota_privada_professor: 'Incentivar participação e esclarecer dúvidas durante a explicação',
      objetivos_etapa: ['Transmitir o conteúdo principal', 'Promover compreensão', 'Estimular participação'],
      recursos_necessarios: ['Material didático', 'Exemplos práticos', 'Quadro']
    },
    {
      etapa: 3,
      titulo: '3. Atividade Prática',
      descricao: 'Aplicação prática do conteúdo através de exercícios, discussões em grupo ou atividades hands-on.',
      tipo_interacao: 'Atividade Prática',
      tempo_estimado: '15 min',
      recurso_gerado: 'Lista de exercícios',
      nota_privada_professor: 'Circular pela sala para apoiar os alunos individualmente',
      objetivos_etapa: ['Fixar o conteúdo', 'Aplicar conhecimentos', 'Identificar dificuldades'],
      recursos_necessarios: ['Exercícios', 'Materiais para atividade', 'Cronômetro']
    },
    {
      etapa: 4,
      titulo: '4. Síntese e Avaliação',
      descricao: 'Fechamento da aula com resumo dos pontos principais, esclarecimento de dúvidas e avaliação da aprendizagem.',
      tipo_interacao: 'Avaliativa',
      tempo_estimado: '10 min',
      recurso_gerado: 'Atividade de síntese',
      nota_privada_professor: 'Verificar se os objetivos foram atingidos e ajustar próximas aulas',
      objetivos_etapa: ['Consolidar aprendizado', 'Avaliar compreensão', 'Planejar próximos passos'],
      recursos_necessarios: ['Resumo visual', 'Questões de verificação']
    }
  ];

  return {
    etapas: etapasDefault,
    tempo_total_estimado: calculateTotalTime(etapasDefault),
    observacoes_gerais: 'Plano estruturado para máximo engajamento e aprendizado',
    metodologia_aplicada: rawData?.metodologia?.nome || 'Metodologia Ativa'
  };
};

// Função para calcular tempo total
const calculateTotalTime = (etapas: EtapaDesenvolvimento[]): string => {
  const totalMinutos = etapas.reduce((total, etapa) => {
    const tempo = etapa.tempo_estimado.replace(/\D/g, '');
    return total + (parseInt(tempo) || 15);
  }, 0);

  if (totalMinutos < 60) {
    return `${totalMinutos} minutos`;
  } else {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas}h ${minutos}min`;
  }
};

// Função para validar dados de desenvolvimento
export const validateDesenvolvimentoData = (data: DesenvolvimentoData): boolean => {
  if (!data.etapas || !Array.isArray(data.etapas) || data.etapas.length === 0) {
    return false;
  }

  return data.etapas.every(etapa => 
    etapa.etapa && 
    etapa.titulo && 
    etapa.descricao && 
    etapa.tipo_interacao && 
    etapa.tempo_estimado
  );
};

export default {
  processDesenvolvimentoData,
  validateDesenvolvimentoData
};
