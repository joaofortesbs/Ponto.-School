import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { QuadroInterativoFields, quadroInterativoFieldMapping } from './fieldMapping';

export interface QuadroInterativoCustomFields {
  [key: string]: string;
}

export interface QuadroInterativoActivity {
  id: string;
  title: string;
  description: string;
  customFields: QuadroInterativoCustomFields;
  personalizedTitle?: string;
  personalizedDescription?: string;
}

/**
 * Processa dados de uma atividade de Quadro Interativo do Action Plan
 * para o formato do formulário do modal
 */
export function processQuadroInterativoData(activity: QuadroInterativoActivity): ActivityFormData {
  console.log('📱 Processando dados do Quadro Interativo:', activity);

  const customFields = activity.customFields || {};
  const consolidatedData = {
    ...activity,
    title: activity.personalizedTitle || activity.title,
    description: activity.personalizedDescription || activity.description
  };

  // Inicializar dados base
  const formData: ActivityFormData = {
    title: consolidatedData.title || '',
    description: consolidatedData.description || '',
    subject: '',
    theme: '',
    schoolYear: '',
    numberOfQuestions: '1',
    difficultyLevel: '',
    questionModel: '',
    sources: '',
    objectives: '',
    materials: '',
    instructions: '',
    evaluation: '',
    timeLimit: '',
    context: '',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: '',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: '',
    associatedExercises: '',
    knowledgeArea: '',
    complexityLevel: '',
    tituloTemaAssunto: '',
    anoSerie: '',
    disciplina: '',
    bnccCompetencias: '',
    publicoAlvo: '',
    objetivosAprendizagem: '',
    quantidadeAulas: '',
    quantidadeDiagnosticos: '',
    quantidadeAvaliacoes: '',
    cronograma: '',
    quadroInterativoCampoEspecifico: ''
  };

  // Mapeamento específico e abrangente para Quadro Interativo
  const fieldMappings: Record<string, keyof ActivityFormData> = {
    // Disciplina / Área de conhecimento
    'Disciplina / Área de conhecimento': 'subject',
    'Disciplina': 'subject',
    'Área de conhecimento': 'subject',
    'Componente Curricular': 'subject',
    'Matéria': 'subject',
    'disciplina': 'subject',

    // Ano / Série
    'Ano / Série': 'schoolYear',
    'Ano': 'schoolYear',
    'Série': 'schoolYear',
    'Ano de Escolaridade': 'schoolYear',
    'Público-Alvo': 'schoolYear',
    'anoSerie': 'schoolYear',
    'anoEscolaridade': 'schoolYear',

    // Tema ou Assunto da aula
    'Tema ou Assunto da aula': 'theme',
    'Tema': 'theme',
    'Assunto': 'theme',
    'Tópico': 'theme',
    'Tema Central': 'theme',
    'tema': 'theme',

    // Objetivo de aprendizagem da aula
    'Objetivo de aprendizagem da aula': 'objectives',
    'Objetivo': 'objectives',
    'Objetivos': 'objectives',
    'Objetivo Principal': 'objectives',
    'Objetivos de Aprendizagem': 'objectives',
    'objetivos': 'objectives',

    // Nível de Dificuldade
    'Nível de Dificuldade': 'difficultyLevel',
    'Dificuldade': 'difficultyLevel',
    'Nível': 'difficultyLevel',
    'Complexidade': 'difficultyLevel',
    'nivelDificuldade': 'difficultyLevel',
    'dificuldade': 'difficultyLevel',

    // Atividade mostrada
    'Atividade mostrada': 'quadroInterativoCampoEspecifico',
    'Atividade': 'quadroInterativoCampoEspecifico',
    'Atividades': 'quadroInterativoCampoEspecifico',
    'Tipo de Atividade': 'quadroInterativoCampoEspecifico',
    'Interatividade': 'quadroInterativoCampoEspecifico',
    'Campo Específico': 'quadroInterativoCampoEspecifico',
    'quadroInterativoCampoEspecifico': 'quadroInterativoCampoEspecifico',
    'atividadeMostrada': 'quadroInterativoCampoEspecifico',

    // Campos adicionais
    'Materiais': 'materials',
    'Materiais Necessários': 'materials',
    'Recursos': 'materials',
    'materials': 'materials',

    'Instruções': 'instructions',
    'Metodologia': 'instructions',
    'instructions': 'instructions',

    'Avaliação': 'evaluation',
    'Critérios de Avaliação': 'evaluation',
    'evaluation': 'evaluation',

    'Tempo Estimado': 'timeLimit',
    'Duração': 'timeLimit',
    'timeLimit': 'timeLimit',

    'Contexto': 'context',
    'Aplicação': 'context',
    'context': 'context'
  };

  // Aplicar mapeamentos dos custom fields
  Object.entries(customFields).forEach(([customFieldKey, value]) => {
    const formFieldKey = fieldMappings[customFieldKey];
    if (formFieldKey && typeof value === 'string' && value.trim()) {
      formData[formFieldKey] = value.trim();
      console.log(`🔗 Mapeado: ${customFieldKey} -> ${formFieldKey} = ${value}`);
    }
  });

  // Mapear usando o sistema de fieldMapping existente para compatibilidade
  Object.entries(customFields).forEach(([key, value]) => {
    const mappedField = quadroInterativoFieldMapping[key];
    if (mappedField && typeof value === 'string' && value.trim()) {
      switch (mappedField) {
        case 'recursos':
          formData.materials = value;
          console.log(`📋 Recursos mapeados: ${value}`);
          break;
        case 'objetivo':
          if (!formData.objectives) {
            formData.objectives = value;
            console.log(`🎯 Objetivo mapeado: ${value}`);
          }
          break;
        case 'avaliacao':
          formData.evaluation = value;
          console.log(`📊 Avaliação mapeada: ${value}`);
          break;
        case 'conteudo':
          formData.instructions = value;
          console.log(`📝 Conteúdo mapeado: ${value}`);
          break;
        case 'interatividade':
          if (!formData.quadroInterativoCampoEspecifico) {
            formData.quadroInterativoCampoEspecifico = value;
            console.log(`🎮 Interatividade mapeada: ${value}`);
          }
          break;
        case 'design':
          if (!formData.difficultyLevel) {
            formData.difficultyLevel = value;
            console.log(`🎨 Design mapeado: ${value}`);
          }
          break;
      }
    }
  });

  // Garantir que campos essenciais tenham valores padrão se estiverem vazios
  if (!formData.subject) {
    formData.subject = 'Matemática';
    console.log('🔧 Disciplina padrão aplicada: Matemática');
  }

  if (!formData.schoolYear) {
    formData.schoolYear = '6º Ano';
    console.log('🔧 Ano padrão aplicado: 6º Ano');
  }

  if (!formData.theme) {
    formData.theme = formData.title || 'Tema da Aula';
    console.log('🔧 Tema padrão aplicado');
  }

  if (!formData.objectives) {
    formData.objectives = formData.description || 'Objetivos de aprendizagem a serem definidos';
    console.log('🔧 Objetivo padrão aplicado');
  }

  if (!formData.difficultyLevel) {
    formData.difficultyLevel = 'Intermediário';
    console.log('🔧 Nível de dificuldade padrão aplicado: Intermediário');
  }

  if (!formData.quadroInterativoCampoEspecifico) {
    formData.quadroInterativoCampoEspecifico = 'Atividade interativa no quadro';
    console.log('🔧 Atividade padrão aplicada');
  }

  console.log('✅ Dados processados do Quadro Interativo:', formData);
  return formData;
}

/**
 * Valida se uma atividade é um Quadro Interativo válido
 */
export function isValidQuadroInterativoActivity(activity: any): activity is QuadroInterativoActivity {
  return activity &&
         activity.id === 'quadro-interativo' &&
         typeof activity.title === 'string' &&
         typeof activity.description === 'string' &&
         typeof activity.customFields === 'object';
}

/**
 * Gera os campos customizados específicos para Quadro Interativo
 */
export function generateQuadroInterativoFields(
  disciplina: string,
  anoSerie: string,
  tema: string,
  objetivo: string,
  nivelDificuldade: string,
  atividadeMostrada: string
): QuadroInterativoCustomFields {
  return {
    'Disciplina / Área de conhecimento': disciplina,
    'Ano / Série': anoSerie,
    'Tema ou Assunto da aula': tema,
    'Objetivo de aprendizagem da aula': objetivo,
    'Nível de Dificuldade': nivelDificuldade,
    'Atividade mostrada': atividadeMostrada
  };
}

/**
 * Extrai dados específicos do Quadro Interativo de um objeto de atividade
 */
export function extractQuadroInterativoData(activity: any): QuadroInterativoCustomFields {
  const customFields = activity.customFields || {};
  const extractedData: QuadroInterativoCustomFields = {};

  // Campos obrigatórios para Quadro Interativo
  const requiredFields = [
    'Disciplina / Área de conhecimento',
    'Ano / Série',
    'Tema ou Assunto da aula',
    'Objetivo de aprendizagem da aula',
    'Nível de Dificuldade',
    'Atividade mostrada'
  ];

  requiredFields.forEach(field => {
    if (customFields[field]) {
      extractedData[field] = customFields[field];
    }
  });

  return extractedData;
}

/**
 * Prepara dados específicos do Quadro Interativo para preenchimento do modal EditActivityModal
 */
export function prepareQuadroInterativoDataForModal(activity: any): any {
  console.log('🖼️ Preparando dados específicos do Quadro Interativo para modal:', activity);

  const customFields = activity.customFields || {};
  const consolidatedData = {
    ...activity,
    title: activity.personalizedTitle || activity.title || '',
    description: activity.personalizedDescription || activity.description || ''
  };

  // Mapeamento completo e específico para Quadro Interativo
  const formData = {
    title: consolidatedData.title,
    description: consolidatedData.description,

    // Disciplina / Área de conhecimento - com múltiplos aliases
    subject: customFields['Disciplina / Área de conhecimento'] ||
             customFields['disciplina'] ||
             customFields['Disciplina'] ||
             customFields['Componente Curricular'] ||
             customFields['Matéria'] ||
             customFields['Area de Conhecimento'] ||
             'Matemática', // Valor padrão

    // Ano / Série - com múltiplos aliases
    schoolYear: customFields['Ano / Série'] ||
                customFields['anoSerie'] ||
                customFields['Ano de Escolaridade'] ||
                customFields['Público-Alvo'] ||
                customFields['Ano'] ||
                customFields['Série'] ||
                customFields['ano'] ||
                '6º Ano', // Valor padrão

    // Tema ou Assunto da aula - com múltiplos aliases
    theme: customFields['Tema ou Assunto da aula'] ||
           customFields['tema'] ||
           customFields['Tema'] ||
           customFields['Assunto'] ||
           customFields['Tópico'] ||
           customFields['Tema Central'] ||
           customFields['assunto'] ||
           consolidatedData.title ||
           'Tema da Aula', // Valor padrão

    // Objetivo de aprendizagem da aula - com múltiplos aliases
    objectives: customFields['Objetivo de aprendizagem da aula'] ||
                customFields['objetivos'] ||
                customFields['Objetivos'] ||
                customFields['Objetivo'] ||
                customFields['Objetivo Principal'] ||
                customFields['Objetivos de Aprendizagem'] ||
                customFields['objetivo'] ||
                consolidatedData.description ||
                'Objetivos de aprendizagem da aula', // Valor padrão

    // Nível de Dificuldade - com múltiplos aliases
    difficultyLevel: customFields['Nível de Dificuldade'] ||
                     customFields['nivelDificuldade'] ||
                     customFields['dificuldade'] ||
                     customFields['Dificuldade'] ||
                     customFields['Nível'] ||
                     customFields['Complexidade'] ||
                     customFields['nivel'] ||
                     'Intermediário', // Valor padrão

    // Atividade mostrada - com múltiplos aliases
    quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] ||
                                     customFields['atividadeMostrada'] ||
                                     customFields['quadroInterativoCampoEspecifico'] ||
                                     customFields['Campo Específico do Quadro Interativo'] ||
                                     customFields['Atividade'] ||
                                     customFields['Atividades'] ||
                                     customFields['Tipo de Atividade'] ||
                                     customFields['Interatividade'] ||
                                     customFields['Campo Específico'] ||
                                     customFields['atividade'] ||
                                     'Atividade interativa no quadro', // Valor padrão

    // Campos adicionais
    materials: customFields['Materiais'] ||
               customFields['Materiais Necessários'] ||
               customFields['Recursos'] ||
               customFields['materials'] ||
               '',

    instructions: customFields['Instruções'] ||
                  customFields['Metodologia'] ||
                  customFields['instructions'] ||
                  customFields['instrucoes'] ||
                  '',

    evaluation: customFields['Avaliação'] ||
                customFields['Critérios de Avaliação'] ||
                customFields['evaluation'] ||
                customFields['avaliacao'] ||
                '',

    timeLimit: customFields['Tempo Estimado'] ||
               customFields['Duração'] ||
               customFields['timeLimit'] ||
               customFields['tempo'] ||
               '',

    context: customFields['Contexto'] ||
             customFields['Aplicação'] ||
             customFields['context'] ||
             customFields['contexto'] ||
             '',

    // Outros campos obrigatórios com valores padrão
    numberOfQuestions: '1',
    questionModel: '',
    sources: '',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: '',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: 'Português',
    associatedExercises: '',
    knowledgeArea: '',
    complexityLevel: '',
    tituloTemaAssunto: '',
    anoSerie: '',
    disciplina: '',
    bnccCompetencias: '',
    publicoAlvo: '',
    objetivosAprendizagem: '',
    quantidadeAulas: '',
    quantidadeDiagnosticos: '',
    quantidadeAvaliacoes: '',
    cronograma: ''
  };

  console.log('✅ Dados do Quadro Interativo preparados para modal:', formData);
  return formData;
}

import { GeminiClient } from '@/utils/api/geminiClient';

interface QuadroInterativoFormData {
  disciplina: string;
  anoSerie: string;
  tema: string;
  objetivo: string;
  nivelDificuldade: string;
  atividadeMostrada: string;
}

interface QuadroInterativoResult {
  success: boolean;
  titulo: string;
  conteudo: string;
  error?: string;
}

export async function generateQuadroInterativoContent(
  formData: QuadroInterativoFormData
): Promise<QuadroInterativoResult> {
  console.log('🎯 Iniciando geração de conteúdo do Quadro Interativo...');
  console.log('📋 Dados recebidos:', formData);

  try {
    const geminiClient = new GeminiClient();

    const prompt = buildQuadroInterativoPrompt(formData);
    console.log('📝 Prompt construído:', prompt);

    const response = await geminiClient.generate({
      prompt,
      temperature: 0.7,
      maxTokens: 2048,
    });

    if (!response.success) {
      throw new Error(response.error || 'Erro na API Gemini');
    }

    console.log('📤 Resposta da IA recebida:', response.result);

    const parsedContent = parseGeminiResponse(response.result);

    if (!parsedContent.titulo || !parsedContent.conteudo) {
      throw new Error('Resposta da IA não contém título ou conteúdo válidos');
    }

    console.log('✅ Conteúdo processado com sucesso:', parsedContent);

    return {
      success: true,
      titulo: parsedContent.titulo,
      conteudo: parsedContent.conteudo
    };

  } catch (error) {
    console.error('❌ Erro na geração do conteúdo:', error);

    return {
      success: false,
      titulo: '',
      conteudo: '',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

function buildQuadroInterativoPrompt(formData: QuadroInterativoFormData): string {
  return `Você é uma IA especializada em criar conteúdo educacional para quadros interativos.

Crie um conteúdo educacional completo e didático baseado nas seguintes informações:

**Informações da Aula:**
- Disciplina: ${formData.disciplina}
- Ano/Série: ${formData.anoSerie}
- Tema: ${formData.tema}
- Objetivo de Aprendizagem: ${formData.objetivo}
- Nível de Dificuldade: ${formData.nivelDificuldade}
- Atividade Relacionada: ${formData.atividadeMostrada}

**Instruções:**
1. Crie um TÍTULO claro e educativo para o quadro interativo
2. Desenvolva um CONTEÚDO didático estruturado com:
   - Introdução ao tema
   - Conceitos principais explicados de forma clara
   - Exemplos práticos e aplicações
   - Atividades práticas para os alunos
   - Resumo dos pontos importantes
   - Próximos passos no aprendizado

3. Use linguagem clara e apropriada para o ${formData.anoSerie}
4. Estruture o conteúdo de forma organizada e didática
5. Inclua elementos interativos relacionados a "${formData.atividadeMostrada}"
6. Adapte a complexidade ao nível "${formData.nivelDificuldade}"

**Formato de Resposta Obrigatório - Retorne APENAS um JSON válido:**
{
  "titulo": "Título claro e educativo do quadro interativo",
  "conteudo": "Conteúdo educacional completo e estruturado em texto corrido, bem organizado em parágrafos claros e didáticos"
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`;
}

function parseGeminiResponse(responseText: string): { titulo: string; conteudo: string } {
  try {
    // Limpar a resposta removendo possíveis caracteres extras
    let cleanedResponse = responseText.trim();

    // Remover possíveis blocos de código
    cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*|\s*```/g, '');

    // Tentar fazer parse do JSON
    const parsed = JSON.parse(cleanedResponse);

    if (parsed.titulo && parsed.conteudo) {
      return {
        titulo: parsed.titulo,
        conteudo: parsed.conteudo
      };
    }

    throw new Error('JSON não contém campos obrigatórios');

  } catch (error) {
    console.warn('Erro ao fazer parse da resposta JSON:', error);

    // Fallback: tentar extrair título e conteúdo do texto
    const lines = responseText.split('\n').filter(line => line.trim());
    const titulo = lines[0]?.replace(/^#+\s*/, '') || 'Quadro Interativo';
    const conteudo = lines.slice(1).join('\n').trim() || responseText;

    return { titulo, conteudo };
  }
}

// Função auxiliar para validar dados de entrada
export function validateQuadroInterativoData(data: Partial<QuadroInterativoFormData>): boolean {
  const requiredFields: (keyof QuadroInterativoFormData)[] = [
    'disciplina', 'anoSerie', 'tema', 'objetivo', 'nivelDificuldade', 'atividadeMostrada'
  ];

  return requiredFields.every(field =>
    data[field] && typeof data[field] === 'string' && data[field]!.trim().length > 0
  );
}

// Função para criar dados de fallback
export function createFallbackQuadroInterativoContent(formData: Partial<QuadroInterativoFormData>): QuadroInterativoResult {
  return {
    success: true,
    titulo: `${formData.tema || 'Quadro Interativo'} - ${formData.disciplina || 'Educação'}`,
    conteudo: `
**Introdução:**
Bem-vindos à nossa aula sobre ${formData.tema || 'este importante tema'}! Hoje vamos explorar conceitos fundamentais de ${formData.disciplina || 'nossa disciplina'} de forma interativa e envolvente.

**Objetivo de Aprendizagem:**
${formData.objetivo || 'Desenvolver conhecimentos essenciais através de atividades práticas e participativas.'}

**Desenvolvimento:**
Durante esta aula, trabalharemos com ${formData.atividadeMostrada || 'atividades interativas'} que permitirão uma compreensão mais profunda do tema. O nível de dificuldade está adequado para ${formData.anoSerie || 'esta turma'}.

**Atividades Práticas:**
1. Participação ativa no quadro interativo
2. Exercícios práticos em grupo
3. Demonstrações visuais
4. Discussões dirigidas

**Conclusão:**
Ao final desta aula, os alunos terão desenvolvido uma compreensão sólida sobre ${formData.tema || 'o tema abordado'} e estarão preparados para os próximos desafios de aprendizagem.
    `
  };
}