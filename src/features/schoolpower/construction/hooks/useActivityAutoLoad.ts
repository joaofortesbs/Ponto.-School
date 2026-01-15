import { useEffect, useState } from 'react';
import { useChosenActivitiesStore } from '../../interface-chat-producao/stores/ChosenActivitiesStore';
import { syncSchemaToFormData } from '../utils/activity-fields-sync';

export interface ActivityFormData {
  title?: string;
  description?: string;
  // Tese da Redação
  temaRedacao?: string;
  objetivo?: string;
  nivelDificuldade?: string;
  competenciasENEM?: string;
  contextoAdicional?: string;
  // Campos comuns
  subject?: string;
  theme?: string;
  schoolYear?: string;
  numberOfQuestions?: string;
  difficultyLevel?: string;
  questionModel?: string;
  objectives?: string;
  [key: string]: any;
}

export interface AutoLoadResult {
  formData: ActivityFormData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para carregar automaticamente dados quando o modal abre
 * 
 * FONTE DE DADOS (em ordem de prioridade):
 * 1. ChosenActivitiesStore (campos gerados pelo gerar_conteudo_atividades)
 * 2. localStorage (dados salvos anteriormente)
 */
export function useActivityAutoLoad(
  activityId: string | null,
  isOpen: boolean
): AutoLoadResult {
  const [formData, setFormData] = useState<ActivityFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Acessar o store para buscar atividades com campos gerados
  const chosenActivities = useChosenActivitiesStore(state => state.chosenActivities);
  const getActivityById = useChosenActivitiesStore(state => state.getActivityById);

  useEffect(() => {
    if (!isOpen || !activityId) {
      setFormData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    console.log(`%c🔄 [AUTO-LOAD] Iniciando carregamento para: ${activityId}`, 'background: #2196F3; color: white; padding: 5px; border-radius: 3px;');
    
    // LOG DE DIAGNÓSTICO: Mostrar estado atual do store
    console.log(`%c📊 [AUTO-LOAD] Estado do Store:`, 'background: #FF5722; color: white; padding: 3px 5px;');
    console.log(`   - Total de atividades no store: ${chosenActivities.length}`);
    console.log(`   - IDs das atividades: ${chosenActivities.map(a => a.id).join(', ') || 'NENHUMA'}`);
    chosenActivities.forEach(a => {
      console.log(`   - ${a.id}: campos_preenchidos=${Object.keys(a.campos_preenchidos || {}).length}, generated_fields=${Object.keys(a.dados_construidos?.generated_fields || {}).length}`);
    });

    try {
      let loadedData: ActivityFormData | null = null;

      // PRIORIDADE 1: Buscar no ChosenActivitiesStore (campos gerados automaticamente)
      const storeActivity = getActivityById(activityId);
      
      // Se não encontrar diretamente, tentar buscar por tipo
      let foundActivity = storeActivity;
      if (!foundActivity) {
        console.log(`%c⚠️ [AUTO-LOAD] Busca direta falhou, tentando busca por tipo...`, 'color: orange;');
        foundActivity = chosenActivities.find(a => 
          a.tipo === activityId || 
          a.id === activityId ||
          a.tipo?.toLowerCase() === activityId?.toLowerCase()
        );
      }
      
      if (foundActivity) {
        console.log(`%c🏪 [AUTO-LOAD] Atividade encontrada no Store:`, 'background: #9C27B0; color: white; padding: 3px 5px;', foundActivity.id);
        
        // Verificar se há campos gerados
        const generatedFields = foundActivity.dados_construidos?.generated_fields || foundActivity.campos_preenchidos;
        
        if (generatedFields && Object.keys(generatedFields).length > 0) {
          console.log('%c📋 [AUTO-LOAD] Campos gerados encontrados:', 'color: #9C27B0; font-weight: bold;', generatedFields);
          
          // Sincronizar campos para formato do formData
          const syncedFields = syncSchemaToFormData(foundActivity.tipo || activityId, generatedFields);
          
          loadedData = processActivityData(activityId, {
            title: foundActivity.titulo,
            ...syncedFields
          });
          
          console.log('%c✨ [AUTO-LOAD] Dados sincronizados do Store:', 'background: #4CAF50; color: white; padding: 3px 5px;', loadedData);
        } else {
          console.log('%c⚠️ [AUTO-LOAD] Atividade encontrada mas SEM campos gerados', 'color: orange;');
        }
      } else {
        console.log(`%c❌ [AUTO-LOAD] Atividade NÃO encontrada no store para ID: ${activityId}`, 'color: red;');
      }

      // PRIORIDADE 2: Buscar no localStorage (fallback)
      if (!loadedData) {
        const possibleKeys = [
          `generated_content_${activityId}`,  // Chave usada pelo gerar_conteudo_atividades
          `auto_activity_data_${activityId}`,
          `${activityId}_form_data`,
          `constructed_${activityId}_content`
        ];

        console.log('%c📦 [AUTO-LOAD] Verificando localStorage:', 'color: #2196F3; font-weight: bold;', possibleKeys);

        for (const key of possibleKeys) {
          const savedData = localStorage.getItem(key);
          
          if (savedData) {
            console.log(`%c✅ [AUTO-LOAD] Dados encontrados na chave: ${key}`, 'color: #4CAF50; font-weight: bold;');
            
            try {
              const parsed = JSON.parse(savedData);
              const data = parsed.formData || parsed;
              
              console.log('%c📋 [AUTO-LOAD] Dados parseados:', 'color: #4CAF50;', data);
              
              loadedData = processActivityData(activityId, data);
              console.log('%c✨ [AUTO-LOAD] Dados processados:', 'color: #9C27B0;', loadedData);
              break;
            } catch (parseError) {
              console.error(`%c❌ [AUTO-LOAD] Erro ao parsear chave ${key}:`, 'color: red;', parseError);
            }
          } else {
            console.log(`%c⚪ [AUTO-LOAD] Chave "${key}": vazia`, 'color: #999;');
          }
        }
      }

      if (loadedData) {
        setFormData(loadedData);
        setError(null);
        console.log('%c🎉 [AUTO-LOAD] SUCESSO! FormData carregado:', 'background: #4CAF50; color: white; font-size: 16px; padding: 10px; font-weight: bold; border-radius: 5px;', loadedData);
      } else {
        console.log('%c⚠️ [AUTO-LOAD] Nenhum dado encontrado', 'background: #FF9800; color: white; padding: 5px; border-radius: 3px;');
        setFormData(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('%c❌ [AUTO-LOAD] Erro crítico:', 'color: red; font-weight: bold;', errorMessage);
      setError(errorMessage);
      setFormData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activityId, isOpen, chosenActivities]);

  return { formData, isLoading, error };
}

/**
 * Processa e mapeia dados específicos de cada tipo de atividade
 */
function processActivityData(activityId: string, data: any): ActivityFormData {
  console.log(`%c🔧 [PROCESSOR] Processando dados para: ${activityId}`, 'color: #673AB7; font-weight: bold;');
  
  const baseData: ActivityFormData = {
    title: data.title || '',
    description: data.description || '',
  };

  // Processamento específico para Tese da Redação
  if (activityId === 'tese-redacao') {
    const processed = {
      ...baseData,
      temaRedacao: data.temaRedacao || data.theme || '',
      objetivo: data.objetivo || data.objectives || '',
      nivelDificuldade: data.nivelDificuldade || data.difficultyLevel || 'Médio',
      competenciasENEM: data.competenciasENEM || '',
      contextoAdicional: data.contextoAdicional || data.context || '',
      // Campos de compatibilidade
      subject: data.subject || 'Língua Portuguesa',
      theme: data.temaRedacao || data.theme || '',
      schoolYear: data.schoolYear || '3º Ano - Ensino Médio',
      numberOfQuestions: data.numberOfQuestions || '1',
      difficultyLevel: data.nivelDificuldade || data.difficultyLevel || 'Médio',
      questionModel: data.questionModel || 'Dissertativa',
      objectives: data.objetivo || data.objectives || ''
    };

    console.log('%c📊 [PROCESSOR] Tese da Redação processada:', 'color: #673AB7;');
    console.table({
      'Tema da Redação': processed.temaRedacao,
      'Objetivo': processed.objetivo,
      'Nível': processed.nivelDificuldade,
      'Competências': processed.competenciasENEM,
      'Contexto': processed.contextoAdicional
    });

    return processed;
  }

  // Processamento específico para Flash Cards
  if (activityId === 'flash-cards') {
    const processed = {
      ...baseData,
      theme: String(data.theme || ''),
      topicos: String(data.topicos || ''),
      numberOfFlashcards: String(data.numberOfFlashcards || ''),
      contextoUso: String(data.contextoUso || data.context || ''),
      // Campos adicionais de compatibilidade
      subject: String(data.subject || ''),
      schoolYear: String(data.schoolYear || ''),
      difficultyLevel: String(data.difficultyLevel || ''),
      objectives: String(data.objectives || '')
    };

    console.log('%c🃏 [PROCESSOR] Flash Cards processado:', 'color: #673AB7;');
    console.table({
      'Tema': processed.theme,
      'Tópicos': processed.topicos,
      'Número de Cards': processed.numberOfFlashcards,
      'Contexto de Uso': processed.contextoUso
    });

    return processed;
  }

  // Processamento específico para Sequência Didática
  if (activityId === 'sequencia-didatica') {
    const processed = {
      ...baseData,
      tituloTemaAssunto: String(data.tituloTemaAssunto || ''),
      anoSerie: String(data.anoSerie || ''),
      disciplina: String(data.disciplina || ''),
      publicoAlvo: String(data.publicoAlvo || ''),
      objetivosAprendizagem: String(data.objetivosAprendizagem || ''),
      quantidadeAulas: String(data.quantidadeAulas || ''),
      quantidadeDiagnosticos: String(data.quantidadeDiagnosticos || ''),
      quantidadeAvaliacoes: String(data.quantidadeAvaliacoes || ''),
      bnccCompetencias: String(data.bnccCompetencias || ''),
      cronograma: String(data.cronograma || ''),
      // Campos de compatibilidade
      subject: String(data.disciplina || data.subject || ''),
      theme: String(data.tituloTemaAssunto || data.theme || ''),
      schoolYear: String(data.anoSerie || data.schoolYear || ''),
      objectives: String(data.objetivosAprendizagem || data.objectives || '')
    };

    console.log('%c📚 [PROCESSOR] Sequência Didática processada:', 'color: #673AB7;');
    console.table({
      'Título/Tema': processed.tituloTemaAssunto,
      'Ano/Série': processed.anoSerie,
      'Disciplina': processed.disciplina,
      'Qtd Aulas': processed.quantidadeAulas,
      'Qtd Diagnósticos': processed.quantidadeDiagnosticos,
      'Qtd Avaliações': processed.quantidadeAvaliacoes
    });

    return processed;
  }

  // Processamento específico para Quiz Interativo
  if (activityId === 'quiz-interativo') {
    const processed = {
      ...baseData,
      numberOfQuestions: String(data.numberOfQuestions || ''),
      theme: String(data.theme || ''),
      subject: String(data.subject || ''),
      schoolYear: String(data.schoolYear || ''),
      difficultyLevel: String(data.difficultyLevel || ''),
      questionModel: String(data.questionModel || ''),
      // Campos de compatibilidade
      objectives: String(data.objectives || ''),
      timePerQuestion: String(data.timePerQuestion || '')
    };

    console.log('%c❓ [PROCESSOR] Quiz Interativo processado:', 'color: #673AB7;');
    console.table({
      'Tema': processed.theme,
      'Disciplina': processed.subject,
      'Número de Questões': processed.numberOfQuestions,
      'Nível': processed.difficultyLevel,
      'Modelo': processed.questionModel
    });

    return processed;
  }

  // Processamento específico para Plano de Aula
  if (activityId === 'plano-aula') {
    const processed = {
      ...baseData,
      subject: String(data.subject || ''),
      theme: String(data.theme || ''),
      schoolYear: String(data.schoolYear || ''),
      objectives: String(data.objectives || ''),
      materials: String(data.materials || ''),
      context: String(data.context || ''),
      // Campos de compatibilidade
      difficultyLevel: String(data.difficultyLevel || ''),
      timeLimit: String(data.timeLimit || ''),
      competencies: String(data.competencies || ''),
      evaluation: String(data.evaluation || '')
    };

    console.log('%c📝 [PROCESSOR] Plano de Aula processado:', 'color: #673AB7;');
    console.table({
      'Tema': processed.theme,
      'Disciplina': processed.subject,
      'Ano Escolar': processed.schoolYear,
      'Objetivos': processed.objectives,
      'Materiais': processed.materials
    });

    return processed;
  }

  // Processamento para outras atividades - converte todos os valores para strings
  const genericProcessed: ActivityFormData = { ...baseData };
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      genericProcessed[key] = String(value);
    }
  });
  
  return genericProcessed;
}
