
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download, Eye } from 'lucide-react';
import { AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';

// Import dos previews das atividades
import ActivityPreview from '../activities/default/ActivityPreview';
import ExerciseListPreview from '../activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '../activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '../activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuizInterativoPreview from '../activities/quiz-interativo/QuizInterativoPreview';
import FlashCardsPreview from '../activities/flash-cards/FlashCardsPreview';
import QuadroInterativoPreview from '../activities/quadro-interativo/QuadroInterativoPreview';
import MapaMentalPreview from '../activities/mapa-mental/MapaMentalPreview';

interface CardVisualizacaoAtividadeCompartilhadaProps {
  titulo: string;
  atividade?: AtividadeCompartilhavel;
  onApresentarMaterial?: () => void;
  onUsarMaterial?: () => void;
}

export const CardVisualizacaoAtividadeCompartilhada: React.FC<CardVisualizacaoAtividadeCompartilhadaProps> = ({
  titulo,
  atividade,
  onApresentarMaterial,
  onUsarMaterial
}) => {

  // Função para renderizar a pré-visualização baseada no tipo da atividade
  const renderActivityPreview = () => {
    if (!atividade) return null;

    const activityType = atividade.tipo;
    const activityData = atividade.dados || {};

    console.log('🎯 Renderizando preview da atividade compartilhada:', { tipo: activityType, dados: activityData });

    try {
      switch (activityType) {
        case 'lista-exercicios':
          return (
            <ExerciseListPreview
              data={activityData}
              customFields={activityData.customFields}
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
      console.error('❌ Erro ao renderizar preview da atividade compartilhada:', error);
      return (
        <div className="flex items-center justify-center p-8 text-white">
          <div className="text-center">
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300">Erro ao carregar pré-visualização</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="w-full max-w-4xl min-h-[600px] bg-slate-800/90 border-slate-700 backdrop-blur-sm rounded-2xl shadow-2xl">
      <CardContent className="p-8 min-h-[550px] flex flex-col">
        {/* Título da atividade */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white text-center leading-tight">
            {titulo}
          </h2>
        </div>

        {/* Card de Pré-visualização da Atividade */}
        <div className="mb-8 flex-1">
          <Card className="bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden h-full">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Eye className="w-5 h-5" />
                  <span className="font-semibold">Pré-visualização da Atividade</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[350px]">
                <div className="p-4">
                  {renderActivityPreview()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões na base do card */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            onClick={onApresentarMaterial}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Apresentar Material
          </Button>
          
          <Button
            onClick={onUsarMaterial}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Usar Material
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardVisualizacaoAtividadeCompartilhada;
