import { useEffect, useState } from 'react';

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
 * Hook para carregar automaticamente dados do localStorage quando o modal abre
 * Suporta múltiplas chaves de armazenamento para flexibilidade
 */
export function useActivityAutoLoad(
  activityId: string | null,
  isOpen: boolean
): AutoLoadResult {
  const [formData, setFormData] = useState<ActivityFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activityId) {
      setFormData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    console.log(`%c🔄 [AUTO-LOAD] Iniciando carregamento para: ${activityId}`, 'background: #2196F3; color: white; padding: 5px; border-radius: 3px;');

    try {
      // Definir chaves possíveis de acordo com o tipo de atividade
      const possibleKeys = [
        `auto_activity_data_${activityId}`,
        `${activityId}_form_data`,
        `constructed_${activityId}_content`
      ];

      console.log('%c📦 [AUTO-LOAD] Chaves a verificar:', 'color: #2196F3; font-weight: bold;', possibleKeys);

      let loadedData: ActivityFormData | null = null;

      // Tentar carregar de cada chave
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
            break; // Parar após encontrar dados válidos
          } catch (parseError) {
            console.error(`%c❌ [AUTO-LOAD] Erro ao parsear chave ${key}:`, 'color: red;', parseError);
          }
        } else {
          console.log(`%c⚪ [AUTO-LOAD] Chave "${key}": vazia`, 'color: #999;');
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
  }, [activityId, isOpen]);

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
      theme: data.theme || '',
      topicos: data.topicos || '',
      numberOfFlashcards: data.numberOfFlashcards || '',
      contextoUso: data.contextoUso || data.context || '',
      // Campos adicionais de compatibilidade
      subject: data.subject || '',
      schoolYear: data.schoolYear || '',
      difficultyLevel: data.difficultyLevel || '',
      objectives: data.objectives || ''
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

  // Processamento para outras atividades (pode ser expandido)
  return {
    ...baseData,
    ...data
  };
}
