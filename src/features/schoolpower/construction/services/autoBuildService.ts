import { ConstructionActivity } from '../types';
import { quadroInterativoFieldMapping, prepareQuadroInterativoDataForModal } from '../../activities/quadro-interativo';

export interface AutoBuildProgress {
  current: number;
  total: number;
  currentActivity: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  errors: string[];
}

export class AutoBuildService {
  private static instance: AutoBuildService;
  private progressCallback?: (progress: AutoBuildProgress) => void;
  private onActivityBuilt?: (activityId: string) => void;

  private constructor() {}

  static getInstance(): AutoBuildService {
    if (!AutoBuildService.instance) {
      AutoBuildService.instance = new AutoBuildService();
    }
    return AutoBuildService.instance;
  }

  setProgressCallback(callback: (progress: AutoBuildProgress) => void) {
    this.progressCallback = callback;
  }

  setOnActivityBuilt(callback: (activityId: string) => void) {
    this.onActivityBuilt = callback;
  }

  private updateProgress(progress: Partial<AutoBuildProgress>) {
    if (this.progressCallback) {
      this.progressCallback(progress as AutoBuildProgress);
    }
  }

  private async prepareFormDataExactlyLikeModal(activity: ConstructionActivity): Promise<any> {
    console.log(`🎯 Preparando formData EXATAMENTE como EditActivityModal para: ${activity.title}`);

    // Sistema exclusivo para Quadro Interativo
    if (activity.id === 'quadro-interativo') {
      console.log('🎯 Sistema exclusivo de auto-build para Quadro Interativo');

      try {
        // Importar processador do Quadro Interativo
        const { prepareQuadroInterativoDataForModal } = await import('../../activities/quadro-interativo/quadroInterativoProcessor');

        // Validar dados de entrada
        if (!activity.title || !activity.description) {
          console.warn('⚠️ Atividade de Quadro Interativo sem dados suficientes');
          throw new Error('Dados insuficientes para Quadro Interativo');
        }

        // Preparar dados com informações extras de contexto
        const enhancedActivity = {
          ...activity,
          customFields: {
            ...activity.customFields,
            isAutoBuild: true,
            buildTimestamp: new Date().toISOString()
          }
        };

        // Usar função específica do Quadro Interativo
        const formData = prepareQuadroInterativoDataForModal(enhancedActivity);

        // Validar resultado
        if (!formData || typeof formData !== 'object') {
          throw new Error('Falha na preparação dos dados do Quadro Interativo');
        }

        // Marcar como pronto para geração automática
        formData.isQuadroInterativoAutoBuild = true;
        formData.autoBuildId = activity.id;

        console.log('✅ FormData do Quadro Interativo preparado para auto-build:', formData);

        // Salvar dados para o preview acessar
        const previewDataKey = `quadro_interativo_preview_${activity.id}`;
        localStorage.setItem(previewDataKey, JSON.stringify({
          formData,
          activity: enhancedActivity,
          timestamp: new Date().toISOString()
        }));

        return formData;
      } catch (error) {
        console.error(`❌ Erro no sistema exclusivo do Quadro Interativo:`, error);
        throw error;
      }
    }

    // Campos básicos obrigatórios
    const formData = {
      title: activity.title || '',
      description: activity.description || '',

      // Campos padrão com fallbacks EXATOS do modal
      subject: activity.customFields?.['Disciplina'] ||
               activity.customFields?.['disciplina'] ||
               'Português',

      theme: activity.customFields?.['Tema'] ||
             activity.customFields?.['tema'] ||
             'Conteúdo Geral',

      schoolYear: activity.customFields?.['Ano de Escolaridade'] ||
                  activity.customFields?.['anoEscolaridade'] ||
                  '6º ano',

      numberOfQuestions: activity.customFields?.['Quantidade de Questões'] ||
                        activity.customFields?.['quantidadeQuestoes'] ||
                        activity.customFields?.['numeroQuestoes'] ||
                        '10',

      difficultyLevel: activity.customFields?.['Nível de Dificuldade'] ||
                      activity.customFields?.['nivelDificuldade'] ||
                      'Médio',

      questionModel: activity.customFields?.['Modelo de Questões'] ||
                    activity.customFields?.['modeloQuestoes'] ||
                    'Múltipla escolha',

      // Campos opcionais EXATOS do modal
      sources: activity.customFields?.['Fontes'] ||
               activity.customFields?.['fontes'] ||
               '',

      objectives: activity.customFields?.['Objetivos'] ||
                  activity.customFields?.['objetivos'] ||
                  '',

      materials: activity.customFields?.['Materiais'] ||
                activity.customFields?.['materiais'] ||
                '',

      instructions: activity.customFields?.['Instruções'] ||
                   activity.customFields?.['instrucoes'] ||
                   '',

      evaluation: activity.customFields?.['Critérios de Correção'] ||
                 activity.customFields?.['criteriosAvaliacao'] ||
                 activity.customFields?.['criteriosCorrecao'] ||
                 '',

      timeLimit: activity.customFields?.['Tempo Limite'] ||
                activity.customFields?.['tempoLimite'] ||
                '',

      context: activity.customFields?.['Contexto de Aplicação'] ||
              activity.customFields?.['contextoAplicacao'] ||
              activity.customFields?.['contexto'] ||
              '',

      // Campos específicos para diferentes tipos de atividade (COMPLETOS)
      textType: activity.customFields?.['Tipo de Texto'] ||
               activity.customFields?.['tipoTexto'] ||
               '',

      textGenre: activity.customFields?.['Gênero Textual'] ||
                activity.customFields?.['generoTextual'] ||
                '',

      textLength: activity.customFields?.['Extensão do Texto'] ||
                 activity.customFields?.['extensaoTexto'] ||
                 '',

      associatedQuestions: activity.customFields?.['Questões Associadas'] ||
                          activity.customFields?.['questoesAssociadas'] ||
                          '',

      competencies: activity.customFields?.['Competências'] ||
                   activity.customFields?.['competencias'] ||
                   '',

      readingStrategies: activity.customFields?.['Estratégias de Leitura'] ||
                        activity.customFields?.['estrategiasLeitura'] ||
                        '',

      visualResources: activity.customFields?.['Recursos Visuais'] ||
                      activity.customFields?.['recursosVisuais'] ||
                      '',

      practicalActivities: activity.customFields?.['Atividades Práticas'] ||
                          activity.customFields?.['atividadesPraticas'] ||
                          '',

      wordsIncluded: activity.customFields?.['Palavras Incluídas'] ||
                    activity.customFields?.['palavrasIncluidas'] ||
                    '',

      gridFormat: activity.customFields?.['Formato da Grade'] ||
                 activity.customFields?.['formatoGrade'] ||
                 '',

      providedHints: activity.customFields?.['Dicas Fornecidas'] ||
                    activity.customFields?.['dicasFornecidas'] ||
                    '',

      vocabularyContext: activity.customFields?.['Contexto do Vocabulário'] ||
                        activity.customFields?.['contextoVocabulario'] ||
                        '',

      language: activity.customFields?.['Idioma'] ||
               activity.customFields?.['idioma'] ||
               'Português',

      associatedExercises: activity.customFields?.['Exercícios Associados'] ||
                          activity.customFields?.['exerciciosAssociados'] ||
                          '',

      knowledgeArea: activity.customFields?.['Área do Conhecimento'] ||
                    activity.customFields?.['areaConhecimento'] ||
                    '',

      complexityLevel: activity.customFields?.['Nível de Complexidade'] ||
                      activity.customFields?.['nivelComplexidade'] ||
                      '',

      // Campo específico para Quadro Interativo - mapeamento completo
      quadroInterativoCampoEspecifico: activity.customFields?.['Atividade mostrada'] ||
                                       activity.customFields?.['atividadeMostrada'] ||
                                       activity.customFields?.['quadroInterativoCampoEspecifico'] ||
                                       activity.customFields?.['Campo Específico do Quadro Interativo'] ||
                                       activity.customFields?.['campoEspecificoQuadroInterativo'] ||
                                       activity.customFields?.['Atividade'] ||
                                       activity.customFields?.['Atividades'] ||
                                       activity.customFields?.['Tipo de Atividade'] ||
                                       activity.customFields?.['Interatividade'] ||
                                       activity.customFields?.['Campo Específico'] ||
                                       'Atividade interativa no quadro'
    };

    console.log('📝 FormData preparado IDENTICO ao EditActivityModal:', formData);
    return formData;
  }

  private prepareContextDataExactlyLikeHook(formData: any): any {
    console.log('🎯 Preparando contextData EXATAMENTE como useGenerateActivity hook');

    // Preparar contextData EXATAMENTE igual ao hook useGenerateActivity
    const contextData = {
      // Dados em português para o prompt (IDENTICO ao hook)
      titulo: formData.title || 'Atividade',
      descricao: formData.description || '',
      disciplina: formData.subject || 'Português',
      tema: formData.theme || 'Conteúdo Geral',
      anoEscolaridade: formData.schoolYear || '6º ano',
      numeroQuestoes: parseInt(formData.numberOfQuestions || '10'),
      nivelDificuldade: formData.difficultyLevel || 'Médio',
      modeloQuestoes: formData.questionModel || 'Múltipla escolha',
      fontes: formData.sources || '',
      objetivos: formData.objectives || '',
      materiais: formData.materials || '',
      instrucoes: formData.instructions || '',
      tempoLimite: formData.timeLimit || '',
      contextoAplicacao: formData.context || '',

      // Campos específicos adicionais EXATOS do hook
      tipoTexto: formData.textType || '',
      generoTextual: formData.textGenre || '',
      extensaoTexto: formData.textLength || '',
      questoesAssociadas: formData.associatedQuestions || '',
      competencias: formData.competencies || '',
      estrategiasLeitura: formData.readingStrategies || '',
      recursosVisuais: formData.visualResources || '',
      atividadesPraticas: formData.practicalActivities || '',
      palavrasIncluidas: formData.wordsIncluded || '',
      formatoGrade: formData.gridFormat || '',
      dicasFornecidas: formData.providedHints || '',
      contextoVocabulario: formData.vocabularyContext || '',
      idioma: formData.language || 'Português',
      exerciciosAssociados: formData.associatedExercises || '',
      areaConhecimento: formData.knowledgeArea || '',
      nivelComplexidade: formData.complexityLevel || '',
      quadroInterativoCampoEspecifico: formData.quadroInterativoCampoEspecifico || '',


      // Dados alternativos em inglês para compatibilidade (EXATOS do hook)
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      theme: formData.theme,
      schoolYear: formData.schoolYear,
      numberOfQuestions: formData.numberOfQuestions,
      difficultyLevel: formData.difficultyLevel,
      questionModel: formData.questionModel,
      sources: formData.sources,
      objectives: formData.objectives,
      materials: formData.materials,
      instructions: formData.instructions,
      timeLimit: formData.timeLimit,
      context: formData.context,
      textType: formData.textType,
      textGenre: formData.textGenre,
      textLength: formData.textLength,
      associatedQuestions: formData.associatedQuestions,
      competencies: formData.competencies,
      readingStrategies: formData.readingStrategies,
      visualResources: formData.visualResources,
      practicalActivities: formData.practicalActivities,
      wordsIncluded: formData.wordsIncluded,
      gridFormat: formData.gridFormat,
      providedHints: formData.providedHints,
      vocabularyContext: formData.vocabularyContext,
      language: formData.language,
      associatedExercises: formData.associatedExercises,
      knowledgeArea: formData.knowledgeArea,
      complexityLevel: formData.complexityLevel,
      quadroInterativoCampoEspecifico: formData.quadroInterativoCampoEspecifico || ''
    };

    console.log('📊 ContextData preparado EXATAMENTE como useGenerateActivity hook:', contextData);
    return contextData;
  }

  private async buildActivityWithExactModalLogic(activity: ConstructionActivity): Promise<void> {
    console.log(`🎯 Construindo com EXATA MESMA LÓGICA do EditActivityModal: ${activity.title}`);

    try {
      // SISTEMA EXCLUSIVO PARA QUADRO INTERATIVO
      if (activity.id === 'quadro-interativo') {
        console.log('🎯 SISTEMA EXCLUSIVO: Construindo Quadro Interativo');
        await this.buildQuadroInterativoExclusively(activity);
        return;
      }

      // PASSO 1: Preparar formData EXATAMENTE como o modal faz
      const formData = await this.prepareFormDataExactlyLikeModal(activity);

      // PASSO 2: Preparar contextData EXATAMENTE como o hook useGenerateActivity faz
      const contextData = this.prepareContextDataExactlyLikeHook(formData);

      // PASSO 3: Importar e usar EXATAMENTE a mesma função que o modal usa
      const { generateActivityContent } = await import('../api/generateActivity');

      // PASSO 4: Determinar o tipo de atividade EXATAMENTE como o modal faz
      const activityType = activity.type || activity.id || 'lista-exercicios';

      console.log(`🤖 Chamando generateActivityContent com tipo: ${activityType}`);
      console.log('📋 ContextData COMPLETO:', contextData);

      // PASSO 5: Chamar a função EXATAMENTE como o modal EditActivityModal e o hook fazem
      const result = await generateActivityContent(activityType, contextData);

      if (result) {
        console.log('✅ Resultado da IA recebido:', result);

        // PASSO 6: Salvar EXATAMENTE como o modal EditActivityModal faz
        const saveKey = `activity_${activity.id}`;
        const savedContent = {
          ...result,
          generatedAt: new Date().toISOString(),
          activityId: activity.id,
          activityType: activityType,
          formData: formData
        };

        // Salvar no localStorage EXATAMENTE como o modal faz
        localStorage.setItem(saveKey, JSON.stringify(savedContent));
        console.log(`💾 Conteúdo salvo com chave: ${saveKey}`);

        // PASSO 7: Atualizar status EXATAMENTE como o modal faz
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          isBuilt: true,
          builtAt: new Date().toISOString(),
          formData: formData,
          generatedContent: result
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

        // PASSO 8: Marcar atividade como construída EXATAMENTE como o modal faz
        activity.isBuilt = true;
        activity.builtAt = new Date().toISOString();
        activity.progress = 100;
        activity.status = 'completed';

        // PASSO 9: Callback de atividade construída
        if (this.onActivityBuilt) {
          this.onActivityBuilt(activity.id);
        }

        console.log(`✅ Atividade construída com EXATA MESMA LÓGICA do EditActivityModal: ${activity.title}`);
      } else {
        throw new Error('Falha na geração do conteúdo pela IA - resultado vazio');
      }

    } catch (error) {
      console.error(`❌ Erro na construção com lógica do modal para ${activity.title}:`, error);

      // Marcar atividade com erro
      activity.status = 'error';
      activity.progress = 0;

      throw error;
    }
  }

  /**
   * Sistema exclusivo para construção de Quadro Interativo
   */
  private async buildQuadroInterativoExclusively(activity: ConstructionActivity): Promise<void> {
    console.log('🎯 SISTEMA EXCLUSIVO: Iniciando construção do Quadro Interativo');
    
    try {
      // ETAPA 1: Preparar dados específicos do Quadro Interativo
      const quadroData = this.prepareQuadroInterativoData(activity);
      console.log('📊 Dados do Quadro Interativo preparados:', quadroData);

      // ETAPA 2: Gerar conteúdo usando API Gemini diretamente
      const generatedContent = await this.generateQuadroInterativoContent(quadroData);
      console.log('✅ Conteúdo do Quadro Interativo gerado:', generatedContent);

      // ETAPA 3: Salvar dados de construção
      const constructedKey = `constructed_quadro-interativo_${activity.id}`;
      const constructedData = {
        isBuilt: true,
        builtAt: new Date().toISOString(),
        activityId: activity.id,
        formData: quadroData,
        generatedContent: generatedContent,
        status: 'completed'
      };
      localStorage.setItem(constructedKey, JSON.stringify(constructedData));

      // ETAPA 4: Salvar conteúdo para o preview
      const contentKey = `quadro_interativo_content_${activity.id}`;
      localStorage.setItem(contentKey, JSON.stringify(generatedContent));

      // ETAPA 5: Atualizar status da atividade
      activity.isBuilt = true;
      activity.builtAt = new Date().toISOString();
      activity.progress = 100;
      activity.status = 'completed';

      // ETAPA 6: Disparar evento para auto-geração
      window.dispatchEvent(new CustomEvent('quadro-interativo-auto-build', {
        detail: { 
          activityId: activity.id, 
          data: constructedData,
          generatedContent: generatedContent 
        }
      }));

      // ETAPA 7: Callback de atividade construída
      if (this.onActivityBuilt) {
        this.onActivityBuilt(activity.id);
      }

      console.log('🎉 SISTEMA EXCLUSIVO: Quadro Interativo construído com sucesso!');

    } catch (error) {
      console.error('❌ SISTEMA EXCLUSIVO: Erro na construção do Quadro Interativo:', error);
      
      // Marcar com erro
      activity.status = 'error';
      activity.progress = 0;
      
      throw error;
    }
  }

  /**
   * Preparar dados específicos para Quadro Interativo
   */
  private prepareQuadroInterativoData(activity: ConstructionActivity): any {
    const customFields = activity.customFields || {};
    
    return {
      subject: customFields['Disciplina / Área de conhecimento'] || 'Português',
      schoolYear: customFields['Ano / Série'] || '6º Ano',
      theme: customFields['Tema ou Assunto da aula'] || activity.title || 'Tema da Aula',
      objectives: customFields['Objetivo de aprendizagem da aula'] || activity.description || 'Objetivos de aprendizagem',
      difficultyLevel: customFields['Nível de Dificuldade'] || 'Intermediário',
      quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] || 'Atividade interativa no quadro',
      title: activity.title,
      description: activity.description,
      activityId: activity.id
    };
  }

  /**
   * Gerar conteúdo do Quadro Interativo usando API Gemini
   */
  private async generateQuadroInterativoContent(quadroData: any): Promise<any> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key do Gemini não configurada');
    }

    const prompt = `
Você é uma IA especializada em educação brasileira que cria conteúdo educativo COMPLETO e DIDÁTICO para quadros interativos em sala de aula.

DADOS DA AULA:
- Disciplina: ${quadroData.subject}
- Ano/Série: ${quadroData.schoolYear}
- Tema: ${quadroData.theme}
- Objetivos: ${quadroData.objectives}
- Nível de Dificuldade: ${quadroData.difficultyLevel}
- Atividade Mostrada: ${quadroData.quadroInterativoCampoEspecifico}

MISSÃO: Criar um conteúdo que ENSINE o conceito de forma clara e completa, como se fosse uma mini-aula explicativa.

FORMATO DE RESPOSTA (JSON apenas):
{
  "title": "Título educativo direto sobre o conceito (máximo 60 caracteres)",
  "text": "Explicação COMPLETA do conceito com definição, características principais, exemplos práticos e dicas para identificação/aplicação. Deve ser uma mini-aula textual que ensina efetivamente o tema (máximo 400 caracteres)",
  "generatedAt": "${new Date().toISOString()}",
  "isGeneratedByAI": true
}

DIRETRIZES OBRIGATÓRIAS:

TÍTULO:
- Seja direto e educativo sobre o conceito
- Use terminologia adequada para ${quadroData.schoolYear}
- Exemplos: "Substantivos Próprios e Comuns", "Função do 1º Grau", "Fotossíntese das Plantas"
- NÃO use "Quadro Interativo" ou "Atividade de"

TEXTO:
- INICIE com uma definição clara do conceito
- INCLUA as características principais
- ADICIONE exemplos práticos e concretos
- FORNEÇA dicas para identificação ou aplicação
- Use linguagem didática apropriada para ${quadroData.schoolYear}
- Seja EDUCATIVO, não apenas descritivo
- Foque em ENSINAR o conceito de forma completa

AGORA GERE O CONTEÚDO EDUCATIVO:`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      const responseText = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Resposta vazia da API Gemini');
      }

      // Limpar a resposta removendo markdown e extraindo JSON
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Tentar fazer parse do JSON
      const parsedContent = JSON.parse(cleanedResponse);
      
      // Validar estrutura
      if (!parsedContent.title || !parsedContent.text) {
        throw new Error('Estrutura JSON inválida na resposta');
      }

      // Limitar tamanhos conforme especificado no prompt
      const title = parsedContent.title.substring(0, 70);
      const text = parsedContent.text.substring(0, 450);

      return {
        title,
        text,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };
      
    } catch (error) {
      console.error('❌ Erro na API Gemini para Quadro Interativo:', error);
      
      // Fallback com conteúdo educativo
      return {
        title: quadroData.theme || 'Conteúdo Educativo',
        text: quadroData.objectives || 'Explore este conceito através de atividades interativas que facilitam o aprendizado e compreensão do tema.',
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false
      };
    }
  }

  async buildAllActivities(activities: ConstructionActivity[]): Promise<void> {
    console.log('🚀 Iniciando construção automática com EXATA LÓGICA do EditActivityModal');
    console.log(`📋 ${activities.length} atividades para processar`);

    const errors: string[] = [];
    let processedCount = 0;

    this.updateProgress({
      current: 0,
      total: activities.length,
      currentActivity: 'Iniciando construção automática...',
      status: 'running',
      errors: []
    });

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];

      // Verificar se atividade já foi construída
      if (activity.isBuilt || activity.status === 'completed') {
        console.log(`⏭️ Pulando atividade já construída: ${activity.title}`);
        processedCount++;
        this.updateProgress({
          current: processedCount,
          total: activities.length,
          currentActivity: `Pulando: ${activity.title}`,
          status: 'running',
          errors
        });
        continue;
      }

      // Verificar se atividade tem dados mínimos necessários
      if (!activity.title || !activity.description) {
        console.warn(`⚠️ Pulando atividade sem dados suficientes: ${activity.title || 'Sem título'}`);
        errors.push(`Atividade "${activity.title || 'Sem título'}" não possui dados suficientes para construção`);
        processedCount++;
        continue;
      }

      this.updateProgress({
        current: processedCount,
        total: activities.length,
        currentActivity: `Construindo: ${activity.title}`,
        status: 'running',
        errors
      });

      console.log(`🔨 Construindo (${i + 1}/${activities.length}): ${activity.title}`);

      try {
        // Usar a lógica EXATA do modal EditActivityModal
        await this.buildActivityWithExactModalLogic(activity);

        processedCount++;
        console.log(`✅ Atividade ${i + 1}/${activities.length} construída: ${activity.title}`);

        this.updateProgress({
          current: processedCount,
          total: activities.length,
          currentActivity: `Concluída: ${activity.title}`,
          status: 'running',
          errors
        });

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Erro ao construir atividade ${activity.title}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        errors.push(`Erro em "${activity.title}": ${errorMessage}`);

        processedCount++;
        this.updateProgress({
          current: processedCount,
          total: activities.length,
          currentActivity: `Erro em: ${activity.title}`,
          status: 'running',
          errors
        });
      }
    }

    // Progresso final
    this.updateProgress({
      current: activities.length,
      total: activities.length,
      currentActivity: 'Construção automática finalizada!',
      status: errors.length > 0 ? 'error' : 'completed',
      errors
    });

    console.log('🎉 Construção automática finalizada');
    console.log(`📊 Resultado: ${activities.length - errors.length}/${activities.length} atividades construídas`);

    // TRIGGER EXCLUSIVO PARA QUADRO INTERATIVO APÓS CONSTRUIR TODAS
    setTimeout(() => {
      console.log('🎯 Disparando trigger exclusivo para Quadro Interativo após construção');
      
      // Disparar evento global de construção finalizada
      window.dispatchEvent(new CustomEvent('schoolpower-build-all-completed', {
        detail: { 
          totalActivities: activities.length,
          successCount: activities.length - errors.length,
          errorCount: errors.length
        }
      }));

      // Verificar e forçar geração de Quadro Interativo construídos
      const quadroActivities = activities.filter(a => a.id === 'quadro-interativo' && a.isBuilt);
      quadroActivities.forEach(activity => {
        console.log('🚀 Forçando geração de conteúdo para Quadro Interativo:', activity.title);
        
        window.dispatchEvent(new CustomEvent('quadro-interativo-force-generation', {
          detail: { 
            activityId: activity.id,
            activity: activity 
          }
        }));
      });
    }, 1000);

    if (errors.length > 0) {
      console.warn('⚠️ Alguns erros ocorreram:', errors);
    }
  }
}

export const autoBuildService = AutoBuildService.getInstance();

/**
 * Obter processador de atividade baseado no tipo
 */
function getActivityProcessor(activityId: string): ((activity: any) => any) | null {
  const processors: Record<string, (activity: any) => any> = {
    'sequencia-didatica': (activity) => {
      const { processSequenciaDidaticaData } = require('../../activities/sequencia-didatica');
      return processSequenciaDidaticaData(activity);
    },
    'plano-aula': (activity) => {
      const { processPlanoAulaData } = require('../../activities/plano-aula');
      return processPlanoAulaData(activity);
    },
    'quadro-interativo': (activity) => {
      const { prepareQuadroInterativoDataForModal } = require('../../activities/quadro-interativo');
      return prepareQuadroInterativoDataForModal(activity);
    }
  };

  return processors[activityId] || null;
}