import { downloadListaExerciciosAsWord } from './services/listaExerciciosDownload';
import { downloadPlanoAulaAsWord } from './services/planoAulaDownload';
import { downloadSequenciaDidaticaAsWord } from './services/sequenciaDidaticaDownload';
import { downloadQuizInterativoAsPDF } from './services/quizInterativoDownload';
import { downloadFlashCardsAsPDF } from './services/flashCardsDownload';
import { ActivityDownloadData, DownloadOptions, DownloadResult } from './types';

export * from './types';
export * from './utils/formatters';

export const downloadActivity = async (
  activityData: ActivityDownloadData,
  options: DownloadOptions = { format: 'docx' }
): Promise<DownloadResult> => {
  
  const activityType = activityData.type || activityData.categoryId || activityData.id || '';
  
  console.log('📥 Sistema de Download: Iniciando download para tipo:', activityType);
  console.log('📊 Dados da atividade:', activityData);

  try {
    switch (activityType) {
      case 'lista-exercicios':
        return await downloadListaExerciciosAsWord(activityData, options);
      
      case 'plano-aula':
        return await downloadPlanoAulaAsWord(activityData, options);
      
      case 'sequencia-didatica':
        return await downloadSequenciaDidaticaAsWord(activityData, options);
      
      case 'quiz-interativo':
        return await downloadQuizInterativoAsPDF(activityData, options);
      
      case 'flash-cards':
        return await downloadFlashCardsAsPDF(activityData, options);
      
      default:
        console.warn('⚠️ Tipo de atividade não suportado para download:', activityType);
        return {
          success: false,
          error: `Tipo de atividade "${activityType}" ainda não suportado para download. Em breve!`
        };
    }
  } catch (error) {
    console.error('❌ Erro ao processar download:', error);
    return {
      success: false,
      error: 'Erro ao processar download. Tente novamente.'
    };
  }
};

export const getSupportedFormats = (activityType: string): string[] => {
  switch (activityType) {
    case 'lista-exercicios':
    case 'plano-aula':
    case 'sequencia-didatica':
      return ['docx'];
    
    case 'quiz-interativo':
    case 'flash-cards':
      return ['pdf'];
    
    default:
      return [];
  }
};

export const isDownloadSupported = (activityType: string): boolean => {
  const supportedTypes = [
    'lista-exercicios',
    'plano-aula',
    'sequencia-didatica',
    'quiz-interativo',
    'flash-cards'
  ];
  
  return supportedTypes.includes(activityType);
};

export const getDownloadFormatLabel = (activityType: string): string => {
  switch (activityType) {
    case 'lista-exercicios':
      return 'Word (.docx)';
    case 'plano-aula':
      return 'Word (.docx)';
    case 'sequencia-didatica':
      return 'Word (.docx)';
    case 'quiz-interativo':
      return 'PDF';
    case 'flash-cards':
      return 'PDF';
    default:
      return 'Não disponível';
  }
};
