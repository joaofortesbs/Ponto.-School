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

Crie um conteúdo educacional simples e didático baseado nas seguintes informações:

**Informações da Aula:**
- Disciplina: ${formData.disciplina}
- Ano/Série: ${formData.anoSerie}
- Tema: ${formData.tema}
- Objetivo de Aprendizagem: ${formData.objetivo}
- Nível de Dificuldade: ${formData.nivelDificuldade}
- Atividade Relacionada: ${formData.atividadeMostrada}

**Instruções:**
1. Crie um TÍTULO claro e educativo para o quadro interativo
2. Desenvolva um CONTEÚDO didático em texto simples, bem estruturado e fácil de ler
3. Use linguagem clara e apropriada para o ${formData.anoSerie}
4. Inclua conceitos importantes, exemplos práticos e explicações simples
5. Organize o conteúdo em parágrafos bem separados
6. NÃO use formato de código, JSON ou markdown - apenas texto corrido educativo
7. O conteúdo deve ser direto e útil para os alunos aprenderem o tema

**Formato de Resposta:**
Retorne APENAS um JSON no seguinte formato:
{
  "titulo": "Título claro do quadro interativo",
  "conteudo": "Conteúdo educacional em texto simples, bem organizado em parágrafos, sem códigos ou formatação especial, apenas texto educativo direto"
}

O conteúdo deve ser um texto educativo corrido, bem explicativo e adequado para ser exibido em um quadro de aula.`;
}

function parseGeminiResponse(response: string): { titulo: string; conteudo: string } {
  try {
    // Remove possíveis caracteres de formatação
    const cleanResponse = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    console.log('🔍 Resposta limpa para parsing:', cleanResponse);
    
    const parsed = JSON.parse(cleanResponse);
    
    return {
      titulo: parsed.titulo || '',
      conteudo: parsed.conteudo || ''
    };
  } catch (error) {
    console.error('❌ Erro ao fazer parse da resposta:', error);
    console.log('📄 Resposta original:', response);
    
    // Fallback: tentar extrair título e conteúdo manualmente
    const lines = response.split('\n').filter(line => line.trim());
    
    if (lines.length >= 2) {
      return {
        titulo: lines[0].replace(/^[^a-zA-Z]*/, '').trim(),
        conteudo: lines.slice(1).join('\n').trim()
      };
    }
    
    return {
      titulo: 'Quadro Interativo',
      conteudo: response
    };
  }
}
