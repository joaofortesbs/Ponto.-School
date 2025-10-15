import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { AtividadeDados } from '../services/data-sync-service';

// Import dos previews das atividades
import ActivityPreview from '../activities/default/ActivityPreview';
import ExerciseListPreview from '../activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '../activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '../activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuizInterativoPreview from '../activities/quiz-interativo/QuizInterativoPreview';
import FlashCardsPreview from '../activities/flash-cards/FlashCardsPreview';
import QuadroInterativoPreview from '../activities/quadro-interativo/QuadroInterativoPreview';
import MapaMentalPreview from '../activities/mapa-mental/MapaMentalPreview';

interface ModoApresentacaoAtividadeProps {
  atividade: AtividadeDados;
  isOpen: boolean;
  onClose: () => void;
}

export const ModoApresentacaoAtividade: React.FC<ModoApresentacaoAtividadeProps> = ({
  atividade,
  isOpen,
  onClose
}) => {
  
  if (!isOpen || !atividade) return null;

  // Função para renderizar a pré-visualização baseada no tipo da atividade
  const renderActivityPreview = () => {
    const activityType = atividade.tipo;
    const activityData = atividade.dados || {};

    console.log('🎯 [APRESENTAÇÃO] Renderizando atividade:', { 
      tipo: activityType, 
      dados: activityData,
      atividade 
    });

    try {
      switch (activityType) {
        case 'lista-exercicios':
          return (
            <ExerciseListPreview
              data={activityData}
              customFields={atividade.customFields}
            />
          );

        case 'plano-aula':
          return (
            <PlanoAulaPreview
              data={activityData}
              activityData={atividade}
            />
          );

        case 'sequencia-didatica':
          return (
            <SequenciaDidaticaPreview
              data={activityData}
              activityData={atividade}
            />
          );

        case 'quiz-interativo':
          return (
            <QuizInterativoPreview
              content={activityData}
              isLoading={false}
            />
          );

        case 'flash-cards':
          return (
            <FlashCardsPreview
              content={activityData}
              isLoading={false}
            />
          );

        case 'quadro-interativo':
          return (
            <QuadroInterativoPreview
              data={activityData}
              activityData={atividade}
            />
          );

        case 'mapa-mental':
          return (
            <MapaMentalPreview
              data={activityData}
            />
          );

        default:
          return (
            <ActivityPreview
              content={activityData}
              activityData={atividade}
            />
          );
      }
    } catch (error) {
      console.error('❌ [APRESENTAÇÃO] Erro ao renderizar preview:', error);
      return (
        <div className="flex items-center justify-center p-8 text-white">
          <div className="text-center">
            <p className="text-gray-300">Erro ao carregar atividade</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 overflow-auto"
      style={{ isolation: 'isolate' }}
    >
      {/* Header com botão de fechar */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </Button>
      </div>

      {/* Conteúdo da Atividade em Tela Cheia - Totalmente Funcional */}
      <div className="w-full min-h-screen">
        {renderActivityPreview()}
      </div>
    </div>
  );
};

export default ModoApresentacaoAtividade;
