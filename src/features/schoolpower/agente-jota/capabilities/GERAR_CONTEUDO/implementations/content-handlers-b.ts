/**
 * content-handlers-b.ts
 * Handlers especializados: flash-cards e atividades versão-texto.
 */

import type { ChosenActivity } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { createDebugEntry } from '../../../../interface-chat-producao/debug-system/DebugStore';
import { FlashCardsGenerator } from '../../../../activities/flash-cards/FlashCardsGenerator';
import {
  generateTextVersionContent,
  storeTextVersionContent,
  type TextVersionInput
} from '../../../../activities/text-version/TextVersionGenerator';
import { isTextVersionActivity } from '../../../../config/activityVersionConfig';
import type { GeneratedFieldsResult, HandlerContext } from './content-types';
import {
  inferSubjectFromObjective,
  generateThemeFromObjective,
  generateDefaultObjectives,
  generateDefaultMaterials,
  generateDefaultEvaluation,
} from './content-helpers';

// ============================================================
// HANDLER: FLASH CARDS
// ============================================================
export async function handleFlashCards(
  activity: ChosenActivity,
  ctx: HandlerContext
): Promise<GeneratedFieldsResult> {
  const { correlationId, capabilityId, capabilityName, userObjective, temaLimpo, disciplinaExtraida, onProgress } = ctx;

  console.log(`🃏 [GerarConteudo] ====== HANDLER ESPECIALIZADO: FLASH CARDS ======`);
  console.log(`🃏 [GerarConteudo] Atividade: ${activity.titulo} (${activity.id})`);

  createDebugEntry(capabilityId, capabilityName, 'action',
    `[FLASH-CARDS] Usando gerador especializado para "${activity.titulo}"`,
    'high', { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
  );

  try {
    const generator = new FlashCardsGenerator();

    const inferredSubject = activity.campos_preenchidos?.subject ||
      activity.campos_preenchidos?.disciplina ||
      activity.materia || disciplinaExtraida ||
      inferSubjectFromObjective(userObjective) || 'Português';

    const inferredTheme = activity.campos_preenchidos?.theme ||
      activity.campos_preenchidos?.tema ||
      temaLimpo ||
      generateThemeFromObjective(userObjective, inferredSubject);

    if (temaLimpo) console.log(`🎯 [GerarConteudo] FLASH-CARDS usando tema limpo do plano: "${temaLimpo}"`);

    const inferredSchoolYear = activity.campos_preenchidos?.schoolYear ||
      activity.campos_preenchidos?.anoEscolaridade || '7º Ano - Ensino Fundamental';

    const inferredTopicos = activity.campos_preenchidos?.topicos ||
      activity.campos_preenchidos?.topics ||
      `- Conceitos fundamentais de ${inferredTheme}\n- Definições e termos-chave\n- Exemplos práticos e aplicações\n- Resumo dos principais pontos`;

    const inferredNumberOfFlashcards = String(
      activity.campos_preenchidos?.numberOfFlashcards ||
      activity.campos_preenchidos?.numeroFlashcards || 10
    );

    const inferredContextoUso = activity.campos_preenchidos?.contextoUso ||
      activity.campos_preenchidos?.context ||
      `Estudos e revisão para ${inferredSchoolYear} na disciplina de ${inferredSubject}`;

    const flashCardsData = {
      title: activity.titulo || `Flash Cards: ${inferredTheme}`,
      theme: inferredTheme, subject: inferredSubject, schoolYear: inferredSchoolYear,
      topicos: inferredTopicos, numberOfFlashcards: inferredNumberOfFlashcards,
      context: inferredContextoUso,
      difficultyLevel: activity.campos_preenchidos?.difficultyLevel || 'Médio',
      objectives: activity.campos_preenchidos?.objectives || generateDefaultObjectives(inferredTheme, inferredSubject),
      instructions: activity.campos_preenchidos?.instructions || 'Use os flash cards para estudar e revisar o conteúdo',
      evaluation: activity.campos_preenchidos?.evaluation || 'Avalie o conhecimento através da prática com os cards'
    };

    const generatedContent = await generator.generateFlashCardsContent(flashCardsData);
    console.log(`✅ [GerarConteudo] Flash Cards gerados: ${generatedContent.cards?.length || 0} cards`);

    const schemaFields = {
      theme: inferredTheme, topicos: inferredTopicos,
      numberOfFlashcards: Number(inferredNumberOfFlashcards), contextoUso: inferredContextoUso
    };

    const generatedFields = {
      ...schemaFields,
      titulo: generatedContent.title, cards: generatedContent.cards,
      totalCards: generatedContent.totalCards, description: generatedContent.description,
      subject: inferredSubject, schoolYear: inferredSchoolYear,
      isGeneratedByAI: true, generatedAt: new Date().toISOString()
    };

    createDebugEntry(capabilityId, capabilityName, 'info',
      `[FLASH-CARDS] Geração concluída: ${generatedContent.cards?.length || 0} cards reais gerados`,
      'high', { correlation_id: correlationId, activity_id: activity.id,
        cards_count: generatedContent.cards?.length || 0,
        schema_fields_count: Object.keys(schemaFields).length, schema_fields_keys: Object.keys(schemaFields) }
    );

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const flashFlatData = {
          title: generatedContent.title || activity.titulo || 'Flash Cards',
          cards: generatedContent.cards || [],
          totalCards: generatedContent.totalCards || generatedContent.cards?.length || 0,
          description: generatedContent.description || `Flash Cards sobre ${inferredTheme}`,
          theme: inferredTheme, subject: inferredSubject, schoolYear: inferredSchoolYear,
          isGeneratedByAI: true, generatedAt: new Date().toISOString()
        };
        const { writeActivityContent } = await import('../../../../services/activity-storage-contract');
        writeActivityContent(activity.id, 'flash-cards', flashFlatData, true);
        console.log(`✅ [FLASH-CARDS] Persistido via StorageContract com ${generatedContent.cards?.length || 0} cards`);
        try {
          const { ContentSyncService } = await import('../../../../services/content-sync-service');
          ContentSyncService.setContent(activity.id, 'flash-cards', flashFlatData);
        } catch { }
      } catch (storageError) {
        console.error(`❌ [FLASH-CARDS] Erro ao salvar no localStorage:`, storageError);
      }
    }

    onProgress?.({ type: 'activity_completed', activity_id: activity.id, activity_title: activity.titulo,
      message: `Flash cards gerados com ${generatedContent.cards?.length || 0} cartões` });

    return { activity_id: activity.id, activity_type: activity.tipo, generated_fields: generatedFields, schema_fields: schemaFields, success: true };

  } catch (error) {
    console.error(`❌ [GerarConteudo] Erro ao gerar flash cards:`, error);
    createDebugEntry(capabilityId, capabilityName, 'error',
      `[FLASH-CARDS] Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      'critical', { correlation_id: correlationId, activity_id: activity.id, error: String(error) }
    );
    return { activity_id: activity.id, activity_type: activity.tipo, generated_fields: {}, success: false,
      error: `Erro ao gerar flash cards: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
  }
}

// ============================================================
// HANDLER: ATIVIDADES VERSÃO TEXTO (plano-aula, sequencia-didatica, tese-redacao, etc.)
// ============================================================
export async function handleTextVersion(
  activity: ChosenActivity,
  ctx: HandlerContext,
  conversationContext: string
): Promise<GeneratedFieldsResult> {
  const { correlationId, capabilityId, capabilityName, userObjective, temaLimpo, disciplinaExtraida, turmaExtraida, onProgress } = ctx;

  console.log(`📄 [GerarConteudo] ====== HANDLER ESPECIALIZADO: ATIVIDADE VERSÃO TEXTO ======`);
  console.log(`📄 [GerarConteudo] Tipo: ${activity.tipo} - "${activity.titulo}" (${activity.id})`);

  createDebugEntry(capabilityId, capabilityName, 'action',
    `[VERSÃO-TEXTO] Usando gerador de texto para "${activity.titulo}" (${activity.tipo})`,
    'high', { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
  );

  try {
    const inferredSubject = activity.campos_preenchidos?.subject ||
      activity.campos_preenchidos?.disciplina ||
      activity.materia || disciplinaExtraida ||
      inferSubjectFromObjective(userObjective) || 'Matemática';

    const inferredSchoolYear = activity.campos_preenchidos?.schoolYear ||
      activity.campos_preenchidos?.serie || turmaExtraida || '7º Ano - Ensino Fundamental';

    const inferredTheme = activity.campos_preenchidos?.theme ||
      activity.campos_preenchidos?.tema || temaLimpo ||
      generateThemeFromObjective(userObjective, inferredSubject);

    if (temaLimpo) console.log(`🎯 [GerarConteudo] GENÉRICO usando tema limpo do plano: "${temaLimpo}"`);

    const inferredObjectives = activity.campos_preenchidos?.objectives ||
      activity.campos_preenchidos?.objetivos ||
      generateDefaultObjectives(inferredTheme, inferredSubject);

    const inferredMaterials = activity.campos_preenchidos?.materials ||
      activity.campos_preenchidos?.materiais ||
      generateDefaultMaterials(inferredSubject);

    const inferredContext = activity.campos_preenchidos?.context ||
      activity.campos_preenchidos?.perfilTurma ||
      `Turma de ${inferredSchoolYear} com conhecimentos básicos em ${inferredSubject}`;

    const inferredCompetencies = activity.campos_preenchidos?.competencies ||
      activity.campos_preenchidos?.habilidadesBNCC || '';

    const inferredTimeLimit = activity.campos_preenchidos?.timeLimit ||
      activity.campos_preenchidos?.tempoLimite ||
      activity.campos_preenchidos?.duracao || '2 aulas de 50 minutos';

    const inferredDifficultyLevel = activity.campos_preenchidos?.difficultyLevel ||
      activity.campos_preenchidos?.tipoAula ||
      activity.campos_preenchidos?.metodologia || 'Expositiva';

    const inferredEvaluation = activity.campos_preenchidos?.evaluation ||
      activity.campos_preenchidos?.observacoesProfessor ||
      generateDefaultEvaluation(inferredTheme);

    const textInput: TextVersionInput = {
      activityType: activity.tipo,
      activityId: activity.id,
      context: {
        tema: inferredTheme, disciplina: inferredSubject, serie: inferredSchoolYear,
        objetivos: inferredObjectives, materiais: inferredMaterials,
        perfilTurma: inferredContext, metodologia: inferredDifficultyLevel,
        duracao: inferredTimeLimit,
        description: activity.campos_preenchidos?.description || activity.campos_preenchidos?.descricao,
        titulo: activity.titulo,
        text_activity_template_id: (activity as any).text_activity_template_id || activity.campos_preenchidos?.text_activity_template_id || '',
        ...activity.campos_preenchidos
      },
      conversationContext,
      userObjective
    };

    const textVersionResult = await generateTextVersionContent(textInput);

    if (textVersionResult.success) {
      console.log(`✅ [GerarConteudo] Conteúdo texto gerado: ${textVersionResult.sections?.length || 0} seções`);
      storeTextVersionContent(activity.id, activity.tipo, textVersionResult);

      const textVersionMetadata = {
        titulo: activity.titulo || textVersionResult.rawData?.titulo || 'Atividade Gerada',
        textContent: textVersionResult.textContent,
        sections: textVersionResult.sections,
        versionType: 'text', isTextVersion: true,
        isGeneratedByAI: true, generatedAt: textVersionResult.generatedAt
      };

      let activityTypeFields: Record<string, any> = {};

      if (activity.tipo === 'plano-aula') {
        activityTypeFields = {
          subject: inferredSubject, theme: inferredTheme, schoolYear: inferredSchoolYear,
          objectives: inferredObjectives, materials: inferredMaterials, context: inferredContext,
          competencies: inferredCompetencies, timeLimit: inferredTimeLimit,
          difficultyLevel: inferredDifficultyLevel, evaluation: inferredEvaluation,
        };
      } else if (activity.tipo === 'sequencia-didatica') {
        activityTypeFields = {
          tituloTemaAssunto: inferredTheme, anoSerie: inferredSchoolYear, disciplina: inferredSubject,
          publicoAlvo: `Turma de ${inferredSchoolYear} em ${inferredSubject}, com perfil heterogêneo e conhecimentos prévios básicos. Os alunos demonstram interesse em atividades práticas e colaborativas.`,
          objetivosAprendizagem: inferredObjectives,
          quantidadeAulas: Number(activity.campos_preenchidos?.quantidadeAulas) || 4,
          quantidadeDiagnosticos: Number(activity.campos_preenchidos?.quantidadeDiagnosticos) || 1,
          quantidadeAvaliacoes: Number(activity.campos_preenchidos?.quantidadeAvaliacoes) || 2,
          bnccCompetencias: inferredCompetencies || '',
          cronograma: activity.campos_preenchidos?.cronograma || `Aula 1: Introdução ao tema e diagnóstico inicial\nAula 2: Desenvolvimento do conteúdo principal\nAula 3: Atividades práticas e fixação\nAula 4: Avaliação formativa e fechamento`,
        };
      } else if (activity.tipo === 'tese-redacao') {
        const validNivelOptions = ['Fundamental', 'Médio', 'ENEM', 'Vestibular'];
        const userNivel = activity.campos_preenchidos?.nivelDificuldade || '';
        let mappedNivelDificuldade = validNivelOptions.find(opt => opt.toLowerCase() === userNivel.toLowerCase());
        if (!mappedNivelDificuldade) {
          const lowerNivel = userNivel.toLowerCase();
          if (lowerNivel.includes('fundamental')) mappedNivelDificuldade = 'Fundamental';
          else if (lowerNivel.includes('enem')) mappedNivelDificuldade = 'ENEM';
          else if (lowerNivel.includes('vestibular')) mappedNivelDificuldade = 'Vestibular';
          else mappedNivelDificuldade = 'Médio';
        }
        activityTypeFields = {
          temaRedacao: inferredTheme,
          objetivo: inferredObjectives || `Desenvolver uma tese argumentativa sólida sobre "${inferredTheme}", utilizando argumentos coerentes e propondo uma intervenção que respeite os direitos humanos.`,
          nivelDificuldade: mappedNivelDificuldade,
          competenciasENEM: inferredCompetencies || 'C1, C2, C3, C4, C5',
          contextoAdicional: inferredContext || `O tema "${inferredTheme}" é relevante no contexto atual da sociedade brasileira e exige reflexão crítica sobre aspectos sociais, econômicos e culturais.`,
        };
      } else if (activity.tipo === 'atividade-textual' || isTextVersionActivity(activity.tipo)) {
        activityTypeFields = {
          theme: inferredTheme, subject: inferredSubject, schoolYear: inferredSchoolYear,
          objectives: inferredObjectives, materials: inferredMaterials || '', context: inferredContext || '',
          competencies: inferredCompetencies || '', difficultyLevel: inferredDifficultyLevel || 'Médio',
          textContent: textVersionResult.textContent || '', sections: textVersionResult.sections || [],
          templateId: activity.campos_preenchidos?.text_activity_template_id || '',
          templateName: activity.campos_preenchidos?.text_activity_template_name || '',
        };
      }

      const schemaFields = { ...activityTypeFields };
      const generatedFields = { ...schemaFields, ...textVersionMetadata };

      createDebugEntry(capabilityId, capabilityName, 'info',
        `[VERSÃO-TEXTO] Geração concluída: ${textVersionResult.sections?.length || 0} seções, ${Object.keys(schemaFields).length} campos do schema`,
        'high', { correlation_id: correlationId, activity_id: activity.id,
          sections_count: textVersionResult.sections?.length || 0,
          schema_fields_count: Object.keys(schemaFields).length,
          schema_fields_keys: Object.keys(schemaFields),
          text_preview: textVersionResult.textContent?.substring(0, 200) }
      );

      onProgress?.({ type: 'activity_completed', activity_id: activity.id, activity_title: activity.titulo,
        message: `Conteúdo em texto gerado com ${textVersionResult.sections?.length || 0} seções e ${Object.keys(schemaFields).length} campos do modal` });

      return { activity_id: activity.id, activity_type: activity.tipo,
        generated_fields: generatedFields, schema_fields: schemaFields, text_metadata: textVersionMetadata, success: true };

    } else {
      throw new Error(textVersionResult.error || 'Falha na geração de conteúdo texto');
    }

  } catch (error) {
    console.error(`❌ [GerarConteudo] Erro ao gerar conteúdo texto:`, error);
    createDebugEntry(capabilityId, capabilityName, 'error',
      `[VERSÃO-TEXTO] Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      'critical', { correlation_id: correlationId, activity_id: activity.id, error: String(error) }
    );
    return { activity_id: activity.id, activity_type: activity.tipo,
      generated_fields: { versionType: 'text', isTextVersion: true, error: String(error) },
      success: false, error: `Erro ao gerar conteúdo texto: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
  }
}
