import { ActivityGenerationPayload, GeneratedActivity } from '../types/ActivityTypes';
import { generateActivityByType } from '../generationStrategies/generateActivityByType';
import { sequenciaDidaticaGenerator } from '../../activities/sequencia-didatica/SequenciaDidaticaGenerator';
import { SequenciaDidaticaPromptData } from '../../prompts/sequenciaDidaticaPrompt';
import { API_KEYS } from '../../../../config/apiKeys';
import { GeminiClient } from '../../../../utils/api/geminiClient';

export const generateActivityAPI = async (payload: ActivityGenerationPayload): Promise<GeneratedActivity> => {
  console.log('🚀 generateActivityAPI: Iniciando geração de atividade', payload);

  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Determinar o tipo de atividade baseado no ID ou título
    let activityType = payload.activityType;

    if (!activityType) {
      if (payload.activityId.includes('prova') || payload.title.toLowerCase().includes('prova')) {
        activityType = 'prova';
      } else if (payload.activityId.includes('lista') || payload.title.toLowerCase().includes('lista')) {
        activityType = 'lista-exercicios';
      } else if (payload.activityId.includes('jogo') || payload.title.toLowerCase().includes('jogo')) {
        activityType = 'jogo';
      } else if (payload.activityId.includes('video') || payload.title.toLowerCase().includes('vídeo')) {
        activityType = 'video';
      } else if (payload.activityId.includes('sequencia') || payload.title.toLowerCase().includes('sequência')) {
        activityType = 'sequencia-didatica';
      } else {
        activityType = 'lista-exercicios'; // padrão
      }
    }

    console.log('🎯 Tipo de atividade determinado:', activityType);

    // Para Sequência Didática, usar o gerador específico com IA
    if (activityType === 'sequencia-didatica') {
      console.log('📚 Gerando Sequência Didática com IA do Gemini');

      // Mapear dados do payload para o formato da Sequência Didática
      const sequenciaData: SequenciaDidaticaPromptData = {
        tituloTemaAssunto: payload.title || payload.customFields?.tituloTemaAssunto || 'Tema da Sequência',
        anoSerie: payload.schoolYear || payload.customFields?.anoSerie || 'Ensino Fundamental',
        disciplina: payload.subject || payload.customFields?.disciplina || 'Português',
        bnccCompetencias: payload.customFields?.bnccCompetencias || 'Competências da BNCC',
        publicoAlvo: payload.customFields?.publicoAlvo || 'Alunos do ensino fundamental',
        objetivosAprendizagem: payload.description || payload.customFields?.objetivosAprendizagem || 'Objetivos de aprendizagem',
        quantidadeAulas: payload.customFields?.quantidadeAulas || '4',
        quantidadeDiagnosticos: payload.customFields?.quantidadeDiagnosticos || '1',
        quantidadeAvaliacoes: payload.customFields?.quantidadeAvaliacoes || '2',
        cronograma: payload.customFields?.cronograma || 'Cronograma semanal'
      };

      console.log('📋 Dados mapeados para Sequência Didática:', sequenciaData);

      try {
        const sequenciaGerada = await sequenciaDidaticaGenerator.generateSequenciaDidatica(sequenciaData);
        console.log('✅ Sequência Didática gerada pela IA:', sequenciaGerada);

        // Salvar no localStorage com chave específica
        const storageKey = `constructed_sequencia-didatica_${payload.activityId}`;
        localStorage.setItem(storageKey, JSON.stringify(sequenciaGerada));
        console.log('💾 Sequência Didática salva no localStorage:', storageKey);

        return {
          id: payload.activityId,
          title: payload.title,
          description: payload.description,
          content: sequenciaGerada,
          type: 'sequencia-didatica',
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true
        };

      } catch (error) {
        console.error('❌ Erro ao gerar Sequência Didática:', error);
        throw new Error(`Falha na geração da Sequência Didática: ${error.message}`);
      }
    }

    // Para Quadro Interativo, usar o gerador específico
    if (activityType === 'quadro-interativo') {
      console.log('🖼️ Gerando Quadro Interativo com dados da API');

      try {
        const { default: QuadroInterativoGenerator } = await import('../../activities/quadro-interativo/QuadroInterativoGenerator');

        const quadroData = {
          title: payload.title || 'Quadro Interativo',
          description: payload.description || 'Atividade para quadro interativo',
          subject: payload.customFields?.['Disciplina / Área de conhecimento'] || payload.subject || 'Matemática',
          schoolYear: payload.customFields?.['Ano / Série'] || payload.schoolYear || '6º Ano',
          theme: payload.customFields?.['Tema ou Assunto da aula'] || payload.title || 'Tema da aula',
          objectives: payload.customFields?.['Objetivo de aprendizagem da aula'] || payload.description || 'Objetivos de aprendizagem',
          difficultyLevel: payload.customFields?.['Nível de Dificuldade'] || 'Intermediário',
          quadroInterativoCampoEspecifico: payload.customFields?.['Atividade mostrada'] || 'Atividade interativa no quadro',
          materials: payload.customFields?.['Materiais'] || '',
          instructions: payload.customFields?.['Instruções'] || '',
          evaluation: payload.customFields?.['Avaliação'] || '',
          timeLimit: payload.customFields?.['Tempo Estimado'] || '',
          context: payload.customFields?.['Contexto'] || ''
        };

        const quadroContent = await QuadroInterativoGenerator.generateContent(quadroData);

        // Salvar no localStorage
        const storageKey = `constructed_quadro-interativo_${payload.activityId}`;
        localStorage.setItem(storageKey, JSON.stringify(quadroContent));

        return {
          id: payload.activityId,
          title: payload.title,
          description: payload.description,
          content: quadroContent,
          type: 'quadro-interativo',
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true
        };

      } catch (error) {
        console.error('❌ Erro ao gerar Quadro Interativo:', error);
        throw new Error(`Falha na geração do Quadro Interativo: ${error.message}`);
      }
    }

    // Para outros tipos, usar estratégias existentes
    const result = generateActivityByType(activityType as any, payload);
    return result;

  } catch (error) {
    console.error('❌ Erro ao gerar atividade:', error);
    throw new Error('Falha na geração da atividade');
  }
};

export const validateActivityData = (data: ActivityGenerationPayload): string[] => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Título é obrigatório');
  }

  if (!data.description?.trim()) {
    errors.push('Descrição é obrigatória');
  }

  if (!data.subject?.trim()) {
    errors.push('Disciplina deve ser selecionada');
  }

  // Validações específicas para Sequência Didática
  if (data.activityType === 'sequencia-didatica') {
    if (!data.customFields?.quantidadeAulas?.trim()) {
      errors.push('Quantidade de aulas é obrigatória');
    }
    if (!data.customFields?.quantidadeDiagnosticos?.trim()) {
      errors.push('Quantidade de diagnósticos é obrigatória');
    }
    if (!data.customFields?.quantidadeAvaliacoes?.trim()) {
      errors.push('Quantidade de avaliações é obrigatória');
    }
  }

  return errors;
};

// Função principal de geração de conteúdo que será usada pelo modal e construção automática
export const generateActivityContent = async (
  activityType: string,
  formData: any
): Promise<GeneratedActivity> => {
  console.log('🤖 Gerando conteúdo personalizado para:', activityType);
  console.log('📋 Dados do formulário:', formData);

  try {
    let prompt = '';
    let structuredContent = {};

    switch (activityType) {
      case 'lista-exercicios':
        prompt = `Como especialista em educação, crie uma lista de exercícios COMPLETA e DETALHADA:

INFORMAÇÕES BASE:
- Tema: "${formData.theme || formData.title}"
- Disciplina: ${formData.subject || 'Não especificado'}
- Ano/Série: ${formData.schoolYear || 'Não especificado'}
- Número de questões: ${formData.numberOfQuestions || 10}
- Nível de dificuldade: ${formData.difficultyLevel || 'médio'}
- Descrição: ${formData.description || 'Lista de exercícios'}
- Objetivos: ${formData.objectives || 'Avaliar conhecimentos'}
- Modelo de questões: ${formData.questionModel || 'Variadas'}
- Contexto: ${formData.context || 'Aplicação em sala de aula'}

INSTRUÇÕES ESPECÍFICAS:
1. Crie exatamente ${formData.numberOfQuestions || 10} questões
2. Varie os tipos: múltipla escolha, verdadeiro/falso, dissertativas
3. Cada questão deve ter:
   - Enunciado claro e contextualizado
   - Alternativas quando aplicável
   - Resposta correta
   - Explicação da resposta
4. Dificuldade progressiva
5. Conecte com objetivos pedagógicos

Retorne em formato JSON estruturado.`;

        structuredContent = {
          questions: [],
          subject: formData.subject || 'Disciplina',
          theme: formData.theme || formData.title || 'Tema',
          schoolYear: formData.schoolYear || 'Ano/Série',
          difficulty: formData.difficultyLevel || 'médio',
          totalQuestions: parseInt(formData.numberOfQuestions) || 10,
          objectives: formData.objectives || 'Objetivos de aprendizagem',
          description: formData.description || 'Descrição da atividade'
        };
        break;
      case 'plano-aula':
        prompt = `Como especialista pedagógico, crie um PLANO DE AULA COMPLETO e ESTRUTURADO:

DADOS ESPECÍFICOS:
- Título: "${formData.title || 'Plano de Aula'}"
- Componente Curricular: ${formData.subject || 'Não especificado'}
- Tema/Tópico Central: ${formData.theme || 'Tema da aula'}
- Ano/Série: ${formData.schoolYear || 'Não especificado'}
- Descrição: ${formData.description || 'Descrição da aula'}
- Objetivo Geral: ${formData.objectives || 'Objetivos de aprendizagem'}
- Materiais/Recursos: ${formData.materials || 'Materiais básicos'}
- Perfil da Turma: ${formData.context || 'Turma padrão'}
- Tempo Estimado: ${formData.timeLimit || '50 minutos'}
- Tipo de Aula: ${formData.difficultyLevel || 'Expositiva'}
- Habilidades BNCC: ${formData.competencies || 'A definir'}

ESTRUTURA OBRIGATÓRIA:
1. CABEÇALHO (dados da escola, professor, turma)
2. OBJETIVOS ESPECÍFICOS (baseados no objetivo geral)
3. CONTEÚDOS (detalhados por tópicos)
4. METODOLOGIA (passo a passo da aula)
5. RECURSOS DIDÁTICOS (lista detalhada)
6. AVALIAÇÃO (critérios e instrumentos)
7. OBSERVAÇÕES (adaptações, dificuldades)
8. CRONOGRAMA (distribuição do tempo)

Crie conteúdo PERSONALIZADO baseado nos dados fornecidos. Retorne JSON estruturado.`;

        structuredContent = {
          title: formData.title || 'Plano de Aula',
          subject: formData.subject || 'Componente Curricular',
          theme: formData.theme || 'Tema Central',
          schoolYear: formData.schoolYear || 'Ano/Série',
          objectives: formData.objectives || 'Objetivos de aprendizagem',
          materials: formData.materials ? formData.materials.split('\n').filter(m => m.trim()) : [],
          duration: formData.timeLimit || '50 minutos',
          context: formData.context || 'Perfil da turma',
          methodology: formData.difficultyLevel || 'Expositiva',
          competencies: formData.competencies || 'Habilidades BNCC',
          description: formData.description || 'Descrição da aula'
        };
        break;
      case 'quadro-interativo':
        prompt = `Como especialista em tecnologia educacional, crie umQUADRO INTERATIVO COMPLETO:

ESPECIFICAÇÕES TÉCNICAS:
- Título: "${formData.title || 'Quadro Interativo'}"
- Disciplina/Área: ${formData.subject || 'Não especificado'}
- Ano/Série: ${formData.schoolYear || 'Não especificado'}
- Tema/Assunto: ${formData.theme || 'Tema da aula'}
- Descrição: ${formData.description || 'Atividade interativa'}
- Objetivos: ${formData.objectives || 'Objetivos de aprendizagem'}
- Nível de Dificuldade: ${formData.difficultyLevel || 'Intermediário'}
- Atividade Específica: ${formData.quadroInterativoCampoEspecifico || 'Atividade interativa'}
- Materiais: ${formData.materials || 'Quadro interativo, computador'}
- Instruções: ${formData.instructions || 'Instruções básicas'}
- Tempo: ${formData.timeLimit || '45 minutos'}

ELEMENTOS OBRIGATÓRIOS:
1. LAYOUT VISUAL (organização na tela)
2. ELEMENTOS INTERATIVOS (botões, áreas clicáveis)
3. CONTEÚDO EDUCATIVO (textos, imagens, vídeos)
4. ATIVIDADES PRÁTICAS (exercícios, jogos)
5. FEEDBACK AUTOMÁTICO (respostas corretas/incorretas)
6. PROGRESSÃO (níveis ou etapas)
7. RECURSOS MULTIMÍDIA (sons, animações)

Crie conteúdo PERSONALIZADO e INTERATIVO. Retorne JSON estruturado.`;

        structuredContent = {
          title: formData.title || 'Quadro Interativo',
          subject: formData.subject || 'Disciplina',
          theme: formData.theme || 'Tema da aula',
          schoolYear: formData.schoolYear || 'Ano/Série',
          objectives: formData.objectives || 'Objetivos de aprendizagem',
          interactiveType: formData.quadroInterativoCampoEspecifico || 'Atividade interativa',
          difficulty: formData.difficultyLevel || 'Intermediário',
          description: formData.description || 'Descrição da atividade',
          materials: formData.materials || 'Materiais necessários',
          instructions: formData.instructions || 'Instruções de uso',
          timeLimit: formData.timeLimit || '45 minutos'
        };
        break;
      case 'sequencia-didatica':
        prompt = `Como especialista em planejamento educacional, crie uma SEQUÊNCIA DIDÁTICA COMPLETA:

DADOS FUNDAMENTAIS:
- Título do Tema: "${formData.tituloTemaAssunto || formData.title || 'Sequência Didática'}"
- Disciplina: ${formData.disciplina || formData.subject || 'Não especificado'}
- Ano/Série: ${formData.anoSerie || formData.schoolYear || 'Não especificado'}
- Descrição: ${formData.description || 'Descrição da sequência'}
- Público-alvo: ${formData.publicoAlvo || 'Alunos do ensino fundamental/médio'}
- Objetivos de Aprendizagem: ${formData.objetivosAprendizagem || formData.objectives || 'Objetivos educacionais'}
- Quantidade de Aulas: ${formData.quantidadeAulas || '4'}
- Diagnósticos: ${formData.quantidadeDiagnosticos || '1'}
- Avaliações: ${formData.quantidadeAvaliacoes || '2'}
- BNCC/Competências: ${formData.bnccCompetencias || formData.competencies || 'A definir'}
- Cronograma: ${formData.cronograma || 'Cronograma flexível'}

ESTRUTURA OBRIGATÓRIA:
1. APRESENTAÇÃO (contextualização do tema)
2. OBJETIVOS DETALHADOS (geral e específicos por aula)
3. JUSTIFICATIVA (relevância pedagógica)
4. METODOLOGIA (abordagens e estratégias)
5. CRONOGRAMA DETALHADO (distribuição das ${formData.quantidadeAulas || 4} aulas)
6. DIAGNÓSTICOS (${formData.quantidadeDiagnosticos || 1} atividade diagnóstica)
7. AVALIAÇÕES (${formData.quantidadeAvaliacoes || 2} instrumentos avaliativos)
8. RECURSOS NECESSÁRIOS (materiais e tecnologias)
9. REFERÊNCIAS BIBLIOGRÁFICAS

Crie conteúdo PERSONALIZADO baseado nos dados. Retorne JSON estruturado.`;

        structuredContent = {
          title: formData.tituloTemaAssunto || formData.title || 'Sequência Didática',
          discipline: formData.disciplina || formData.subject || 'Disciplina',
          schoolYear: formData.anoSerie || formData.schoolYear || 'Ano/Série',
          targetAudience: formData.publicoAlvo || 'Público-alvo',
          objectives: formData.objetivosAprendizagem || formData.objectives || 'Objetivos de aprendizagem',
          totalLessons: parseInt(formData.quantidadeAulas) || 4,
          diagnostics: parseInt(formData.quantidadeDiagnosticos) || 1,
          evaluations: parseInt(formData.quantidadeAvaliacoes) || 2,
          competencies: formData.bnccCompetencias || formData.competencies || 'Competências BNCC',
          schedule: formData.cronograma || 'Cronograma da sequência',
          description: formData.description || 'Descrição da sequência didática'
        };
        break;
      default:
        prompt = `Como um criador de conteúdo educacional, gere o conteúdo para uma atividade do tipo "${activityType}" com base nas seguintes informações:

INFORMAÇÕES FORNECIDAS:
- Título: "${formData.title || 'Atividade Padrão'}"
- Disciplina: ${formData.subject || 'Geral'}
- Tema: ${formData.theme || 'Tema Não Especificado'}
- Ano/Série: ${formData.schoolYear || 'Não especificado'}
- Descrição/Objetivos: ${formData.description || formData.objectives || 'Descrição da atividade'}
- Nível de Dificuldade: ${formData.difficultyLevel || 'Médio'}
- Contexto: ${formData.context || 'Contexto educacional geral'}

REQUISITOS:
- Conteúdo relevante e alinhado ao tema e objetivos.
- Formato adequado ao tipo de atividade.
- Linguagem clara e acessível ao público-alvo.

Retorne em formato JSON estruturado, garantindo que todos os campos essenciais para o tipo "${activityType}" estejam presentes.`;

        structuredContent = {
          title: formData.title || `Atividade ${activityType}`,
          subject: formData.subject || 'Geral',
          theme: formData.theme || 'Tema',
          schoolYear: formData.schoolYear || 'Ano/Série',
          description: formData.description || 'Descrição da atividade',
          objectives: formData.objectives || 'Objetivos de aprendizagem',
          difficulty: formData.difficultyLevel || 'Médio',
          context: formData.context || 'Contexto educacional'
        };
        break;
    }

    console.log('📝 Prompt personalizado gerado:', prompt);
    console.log('🎯 Dados estruturados:', structuredContent);

    // Fazer chamada REAL para a API do Gemini
    let geminiResponse;
    try {
      console.log('🔄 Enviando para API do Gemini...');
      const { geminiClient } = await import('../../../utils/api/geminiClient');
      const response = await geminiClient.generateContent(prompt);

      if (response && response.text) {
        console.log('✅ Resposta recebida do Gemini:', response.text.substring(0, 200) + '...');
        geminiResponse = response.text;
      } else {
        console.warn('⚠️ Resposta vazia do Gemini, usando conteúdo estruturado');
        geminiResponse = JSON.stringify(structuredContent, null, 2);
      }
    } catch (apiError) {
      console.error('❌ Erro na API do Gemini:', apiError);
      console.log('🔧 Usando conteúdo estruturado como fallback');
      geminiResponse = JSON.stringify(structuredContent, null, 2);
    }

    // Processar resposta do Gemini
    let finalContent;
    try {
      // Tentar parsear como JSON se possível
      finalContent = JSON.parse(geminiResponse);
      console.log('📊 Conteúdo parseado como JSON:', finalContent);
    } catch (parseError) {
      // Se não for JSON válido, usar como texto estruturado
      console.log('📝 Usando resposta como texto estruturado');
      finalContent = {
        ...structuredContent,
        generatedText: geminiResponse,
        rawResponse: geminiResponse
      };
    }

    // Garantir que temos os dados essenciais
    const enhancedContent = {
      ...structuredContent,
      ...finalContent,
      prompt: prompt,
      generatedAt: new Date().toISOString(),
      activityType: activityType,
      formData: formData // Manter dados originais para referência
    };

    console.log('🎉 Conteúdo final gerado:', enhancedContent);

    return {
      title: formData.title || `${activityType} - ${formData.theme || formData.tituloTemaAssunto || 'Atividade'}`,
      description: formData.description || `Conteúdo gerado pela IA para ${activityType}`,
      content: enhancedContent,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: true,
      activityType: activityType,
      customFields: formData
    };

  } catch (error) {
    console.error('💥 Erro crítico ao gerar atividade:', error);

    // Fallback com conteúdo estruturado mínimo
    return {
      title: formData.title || `${activityType} - Atividade`,
      description: formData.description || 'Atividade gerada automaticamente',
      content: {
        ...structuredContent,
        error: error.message,
        fallback: true
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      activityType: activityType,
      customFields: formData
    };
  }
};

// Função para gerar atividade (compatibilidade)
export async function generateActivity(formData: any): Promise<{ success: boolean; content?: string; error?: string }> {
  console.log('🎯 generateActivity: Iniciando geração com formData:', formData);

  try {
    // Para Sequência Didática, garantir validação específica
    if (formData.typeId === 'sequencia-didatica') {
      console.log('🎯 Detectada solicitação de Sequência Didática');

      const requiredFields = ['tituloTemaAssunto', 'anoSerie', 'disciplina', 'publicoAlvo', 'objetivosAprendizagem', 'quantidadeAulas'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        console.error('❌ Campos obrigatórios ausentes para Sequência Didática:', missingFields);
        return {
          success: false,
          error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
        };
      }

      // Gerar usando IA
      const generatedContent = await generateActivityContent('sequencia-didatica', formData);

      return {
        success: true,
        content: JSON.stringify(generatedContent)
      };
    }

    // Lógica para outros tipos de atividade
    let generatedContent;

    switch (formData.typeId) {
      case 'lista-exercicios':
        generatedContent = await generateActivityContent('lista-exercicios', formData);
        break;

      case 'prova':
        generatedContent = {
          titulo: formData.title || 'Avaliação',
          descricao: formData.description || 'Avaliação de conhecimentos sobre o tema.',
          disciplina: formData.subject || 'Matemática',
          tema: formData.theme || 'Tópico específico',
          tempoLimite: formData.timeLimit || '60 minutos',
          pontuacaoTotal: parseInt(formData.totalScore) || 10,
          questoes: formData.questions || [],
          isGeneratedByAI: true,
          generatedAt: new Date().toISOString()
        };
        break;

      case 'plano-aula':
        generatedContent = await generateActivityContent('plano-aula', formData);
        break;

      case 'quadro-interativo':
        generatedContent = await generateActivityContent('quadro-interativo', formData);
        break;

      default:
        generatedContent = await generateActivityContent(formData.typeId, formData);
        break;
    }

    const formattedContent = await generateSimpleActivityContent(generatedContent);

    if (formattedContent) {
      console.log('✅ Atividade gerada com sucesso');
      return {
        success: true,
        content: formattedContent
      };
    } else {
      throw new Error('Falha na geração do conteúdo');
    }

  } catch (error) {
    console.error('❌ Erro na geração da atividade:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função auxiliar para formatar o conteúdo
async function generateSimpleActivityContent(activityData: any): Promise<string> {
  console.log('🔨 Gerando conteúdo da atividade:', activityData.titulo || activityData.title);

  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Se for um objeto JSON, serializar para string
  if (typeof activityData === 'object' && activityData !== null && !Array.isArray(activityData)) {
    try {
      return JSON.stringify(activityData, null, 2);
    } catch (error) {
      console.error("Erro ao serializar dados da atividade para JSON:", error);
      return `
# ${activityData.titulo || activityData.title || 'Atividade'}

## Descrição
${activityData.descricao || activityData.description || 'Sem descrição'}

## Detalhes
- Disciplina: ${activityData.disciplina || 'Não especificada'}
- Tema: ${activityData.tema || activityData.theme || 'Não especificado'}
- Duração: ${activityData.tempoLimite || activityData.duracao || 'Não especificada'}

*Erro ao formatar dados detalhados.*
      `;
    }
  } else {
    return activityData;
  }
}