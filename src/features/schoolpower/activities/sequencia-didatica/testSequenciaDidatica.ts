
export const testSequenciaDidaticaFlow = () => {
  console.log('🧪 Iniciando teste da funcionalidade de Sequência Didática');
  
  // Dados de teste
  const testFormData = {
    tituloTemaAssunto: 'Substantivos Próprios e Verbos',
    disciplina: 'Língua Portuguesa',
    anoSerie: '6º Ano do Ensino Fundamental',
    bnccCompetencias: 'EF06LP01, EF06LP02',
    publicoAlvo: 'Estudantes do 6º ano do ensino fundamental',
    objetivosAprendizagem: 'Identificar e classificar substantivos próprios e verbos em diferentes contextos textuais',
    quantidadeAulas: '4',
    quantidadeDiagnosticos: '1',
    quantidadeAvaliacoes: '2',
    cronograma: 'Sequência a ser desenvolvida ao longo de duas semanas'
  };

  // Simular dados gerados
  const mockGeneratedData = {
    tituloTemaAssunto: testFormData.tituloTemaAssunto,
    anoSerie: testFormData.anoSerie,
    disciplina: testFormData.disciplina,
    bnccCompetencias: testFormData.bnccCompetencias,
    publicoAlvo: testFormData.publicoAlvo,
    objetivosAprendizagem: testFormData.objetivosAprendizagem,
    quantidadeAulas: testFormData.quantidadeAulas,
    quantidadeDiagnosticos: testFormData.quantidadeDiagnosticos,
    quantidadeAvaliacoes: testFormData.quantidadeAvaliacoes,
    cronograma: testFormData.cronograma,
    duracaoTotal: '4 aulas de 50 minutos',
    materiaisNecessarios: ['Quadro', 'Livro didático', 'Textos diversos'],
    competenciasDesenvolvidas: ['Leitura', 'Análise linguística', 'Compreensão textual'],
    aulas: [
      {
        numero: 1,
        titulo: 'Aula 1: Reconhecendo Substantivos Próprios',
        objetivo: 'Identificar substantivos próprios em textos',
        conteudo: 'Conceito de substantivos próprios e sua função',
        metodologia: 'Aula expositiva com exemplos práticos',
        recursos: ['Quadro', 'Textos'],
        atividadePratica: 'Exercícios de identificação',
        avaliacao: 'Participação e acertos nos exercícios',
        tempoEstimado: '50 minutos'
      },
      {
        numero: 2,
        titulo: 'Aula 2: Explorando os Verbos',
        objetivo: 'Compreender o conceito e uso dos verbos',
        conteudo: 'Verbos de ação, estado e fenômeno',
        metodologia: 'Atividades práticas e dinâmicas',
        recursos: ['Material didático', 'Projetor'],
        atividadePratica: 'Criação de frases com verbos',
        avaliacao: 'Correção coletiva das atividades',
        tempoEstimado: '50 minutos'
      },
      {
        numero: 3,
        titulo: 'Aula 3: Aplicação Prática',
        objetivo: 'Aplicar conhecimentos em contextos reais',
        conteudo: 'Análise textual com foco em substantivos e verbos',
        metodologia: 'Trabalho em grupos',
        recursos: ['Textos variados', 'Fichas de trabalho'],
        atividadePratica: 'Análise textual em grupos',
        avaliacao: 'Apresentação dos grupos',
        tempoEstimado: '50 minutos'
      },
      {
        numero: 4,
        titulo: 'Aula 4: Síntese e Avaliação',
        objetivo: 'Consolidar aprendizagens',
        conteudo: 'Revisão e síntese dos conteúdos',
        metodologia: 'Revisão participativa',
        recursos: ['Quadro', 'Material de apoio'],
        atividadePratica: 'Atividade de síntese',
        avaliacao: 'Avaliação formativa',
        tempoEstimado: '50 minutos'
      }
    ],
    diagnosticos: [
      {
        numero: 1,
        titulo: 'Diagnóstico Inicial',
        objetivo: 'Avaliar conhecimentos prévios',
        questoes: [
          'O que você sabe sobre substantivos?',
          'Consegue dar exemplos de verbos?',
          'Qual a diferença entre nome próprio e comum?'
        ],
        criteriosAvaliacao: 'Identificar o nível de conhecimento prévio',
        tempoEstimado: '30 minutos'
      }
    ],
    avaliacoes: [
      {
        numero: 1,
        titulo: 'Avaliação Formativa',
        objetivo: 'Verificar progresso da aprendizagem',
        formato: 'Atividades práticas',
        criterios: ['Identificação correta', 'Aplicação adequada'],
        tempoEstimado: '40 minutos'
      },
      {
        numero: 2,
        titulo: 'Avaliação Somativa',
        objetivo: 'Avaliar aprendizagem final',
        formato: 'Prova escrita',
        criterios: ['Conceitos', 'Aplicação', 'Análise'],
        tempoEstimado: '50 minutos'
      }
    ],
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: true
  };

  // Salvar nos locais corretos
  const chaves = [
    'constructed_sequencia-didatica_sequencia-didatica',
    'schoolpower_sequencia-didatica_content',
    'activity_sequencia-didatica'
  ];

  chaves.forEach(chave => {
    localStorage.setItem(chave, JSON.stringify(mockGeneratedData));
    console.log(`✅ Dados de teste salvos com chave: ${chave}`);
  });

  // Verificar se foi salvo corretamente
  chaves.forEach(chave => {
    const saved = localStorage.getItem(chave);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log(`✅ Verificação da chave ${chave}:`, {
          hasAulas: !!parsed.aulas,
          aulasCount: parsed.aulas?.length || 0,
          hasTitle: !!parsed.tituloTemaAssunto
        });
      } catch (error) {
        console.error(`❌ Erro ao verificar chave ${chave}:`, error);
      }
    }
  });

  console.log('🎯 Teste concluído! Agora abra o modal de Sequência Didática para verificar.');
  return mockGeneratedData;
};

// Função para limpar dados de teste
export const limparTestesSequenciaDidatica = () => {
  const chaves = [
    'constructed_sequencia-didatica_sequencia-didatica',
    'schoolpower_sequencia-didatica_content',
    'activity_sequencia-didatica',
    'constructedActivities'
  ];

  chaves.forEach(chave => {
    localStorage.removeItem(chave);
    console.log(`🗑️ Chave removida: ${chave}`);
  });

  console.log('🧹 Dados de teste limpos!');
};

// Disponibilizar globalmente para teste no console
if (typeof window !== 'undefined') {
  (window as any).testSequenciaDidatica = testSequenciaDidaticaFlow;
  (window as any).limparTestesSequenciaDidatica = limparTestesSequenciaDidatica;
  console.log('🔧 Funções de teste disponíveis: testSequenciaDidatica() e limparTestesSequenciaDidatica()');
}
