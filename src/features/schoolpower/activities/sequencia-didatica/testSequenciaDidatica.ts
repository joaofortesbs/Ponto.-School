
import { sequenciaDidaticaBuilder } from './SequenciaDidaticaBuilder';
import { ActivityFormData } from '../../construction/types/ActivityTypes';

// Função de teste para verificar se a sequência didática está funcionando
export async function testarSequenciaDidatica() {
  console.log('🧪 Iniciando teste da Sequência Didática');

  const dadosTeste: ActivityFormData = {
    title: 'Substantivos e Adjetivos',
    description: 'Sequência didática sobre classificação de substantivos e adjetivos',
    tituloTemaAssunto: 'Substantivos e Adjetivos',
    anoSerie: '6º Ano do Ensino Fundamental',
    disciplina: 'Língua Portuguesa',
    bnccCompetencias: 'EF06LP04, EF06LP05',
    publicoAlvo: 'Estudantes do 6º ano com conhecimentos básicos de gramática',
    objetivosAprendizagem: 'Identificar e classificar substantivos e adjetivos em textos, compreendendo suas funções na construção do sentido',
    quantidadeAulas: '4',
    quantidadeDiagnosticos: '1',
    quantidadeAvaliacoes: '2',
    cronograma: 'Uma aula por semana, ao longo de um mês',
    // Campos obrigatórios do formulário
    subject: 'Língua Portuguesa',
    theme: 'Substantivos e Adjetivos',
    schoolYear: '6º Ano',
    numberOfQuestions: '10',
    difficultyLevel: 'Médio',
    questionModel: 'Múltipla escolha e análise textual',
    sources: 'Livro didático e textos complementares',
    objectives: 'Identificar e classificar substantivos e adjetivos',
    materials: 'Quadro, livro didático, textos de apoio',
    instructions: 'Atividades práticas de identificação e classificação',
    evaluation: 'Avaliação formativa e somativa',
    timeLimit: '50 minutos por aula',
    context: 'Aulas presenciais com apoio de material didático',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: 'EF06LP04, EF06LP05',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: 'Português',
    associatedExercises: '',
    knowledgeArea: 'Linguagens',
    complexityLevel: 'Médio'
  };

  try {
    console.log('📝 Dados de teste:', dadosTeste);
    
    const resultado = await sequenciaDidaticaBuilder.construirSequenciaDidatica(dadosTeste);
    
    if (resultado.success && resultado.data) {
      console.log('✅ Teste PASSOU - Sequência gerada:', {
        titulo: resultado.data.tituloTemaAssunto,
        disciplina: resultado.data.disciplina,
        aulasCount: resultado.data.aulas.length,
        diagnosticosCount: resultado.data.diagnosticos.length,
        avaliacoesCount: resultado.data.avaliacoes.length,
        temAulas: resultado.data.aulas.length > 0,
        temDiagnosticos: resultado.data.diagnosticos.length > 0,
        temAvaliacoes: resultado.data.avaliacoes.length > 0
      });

      // Verificar se foi salvo no localStorage
      const sequenciaSalva = sequenciaDidaticaBuilder.carregarSequenciaSalva();
      if (sequenciaSalva) {
        console.log('✅ Sequência encontrada no localStorage');
        return { success: true, data: resultado.data };
      } else {
        console.log('⚠️ Sequência não encontrada no localStorage');
        return { success: false, error: 'Não foi salva no localStorage' };
      }
    } else {
      console.error('❌ Teste FALHOU:', resultado.error);
      return { success: false, error: resultado.error };
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return { success: false, error: error.message };
  }
}

// Função para testar apenas o carregamento
export function testarCarregamento() {
  console.log('🔍 Testando carregamento da sequência didática');
  
  const sequenciaSalva = sequenciaDidaticaBuilder.carregarSequenciaSalva();
  
  if (sequenciaSalva) {
    console.log('✅ Sequência carregada:', {
      titulo: sequenciaSalva.tituloTemaAssunto,
      aulasCount: sequenciaSalva.aulas?.length || 0,
      diagnosticosCount: sequenciaSalva.diagnosticos?.length || 0,
      avaliacoesCount: sequenciaSalva.avaliacoes?.length || 0
    });
    return sequenciaSalva;
  } else {
    console.log('❌ Nenhuma sequência encontrada');
    return null;
  }
}

// Função para limpar dados de teste
export function limparTeste() {
  console.log('🗑️ Limpando dados de teste');
  sequenciaDidaticaBuilder.limparSequenciasSalvas();
}

// Expor funções no window para teste manual no console
if (typeof window !== 'undefined') {
  (window as any).testarSequenciaDidatica = testarSequenciaDidatica;
  (window as any).testarCarregamento = testarCarregamento;
  (window as any).limparTeste = limparTeste;
}
