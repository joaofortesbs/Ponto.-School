
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download, Eye } from 'lucide-react';
import { AtividadeCompartilhavel } from '../services/gerador-link-atividades-schoolpower';
import { UniversalActivityHeader } from '../construction/components/UniversalActivityHeader';

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
    <div className="w-full max-w-4xl">
      {/* UniversalActivityHeader - Duplicata exata do modal de visualização */}
      <UniversalActivityHeader
        activityTitle={atividade?.titulo || titulo}
        activityIcon={(() => {
          const activityType = atividade?.tipo || '';
          if (activityType.includes('flash-cards')) {
            return () => (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            );
          } else if (activityType.includes('quiz')) {
            return () => (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            );
          } else if (activityType.includes('lista-exercicios')) {
            return () => (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
              </svg>
            );
          } else if (activityType.includes('plano-aula')) {
            return () => (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            );
          } else if (activityType.includes('sequencia-didatica')) {
            return () => (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M9 4v1.38c-.83-.33-1.72-.5-2.61-.5-1.79 0-3.58.68-4.95 2.05l3.33 3.33h1.11v1.11c.86.86 1.98 1.31 3.11 1.36V15H8v1.38c-.83-.33-1.72-.5-2.61-.5-1.79 0-3.58.68-4.95 2.05L3.77 21.3c.69.69 1.73.69 2.42 0l3.33-3.33h1.11v1.11c.86.86 1.98 1.31 3.11 1.36V22h1v-1.56c1.13-.05 2.25-.5 3.11-1.36v-1.11h1.11l3.33 3.33c.69.69 1.73.69 2.42 0l3.33-3.33c.69-.69.69-1.73 0-2.42l-3.33-3.33v-1.11h-1.11c-.86-.86-1.98-1.31-3.11-1.36V9h-1v1.56c-1.13.05-2.25.5-3.11 1.36v1.11H9.89l-3.33-3.33c-.69-.69-1.73-.69-2.42 0L.81 12.03c-.69.69-.69 1.73 0 2.42l3.33 3.33v1.11h1.11c.86.86 1.98 1.31 3.11 1.36V22h1v-1.56c1.13-.05 2.25-.5 3.11-1.36v-1.11h1.11l3.33 3.33c.69.69 1.73.69 2.42 0l3.33-3.33c.69-.69.69-1.73 0-2.42l-3.33-3.33V9h-1.11c-.86-.86-1.98-1.31-3.11-1.36V4h-1z"/>
              </svg>
            );
          } else {
            return () => (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            );
          }
        })()}
        activityType={(() => {
          const tipo = atividade?.tipo || '';
          if (tipo.includes('flash-cards')) return 'Flash Cards';
          if (tipo.includes('quiz')) return 'Quiz Interativo';
          if (tipo.includes('lista-exercicios')) return 'Lista de Exercícios';
          if (tipo.includes('plano-aula')) return 'Plano de Aula';
          if (tipo.includes('sequencia-didatica')) return 'Sequência Didática';
          if (tipo.includes('quadro-interativo')) return 'Quadro Interativo';
          if (tipo.includes('mapa-mental')) return 'Mapa Mental';
          return 'Atividade';
        })()}
        activityId={atividade?.id || 'atividade-compartilhada'}
        userName={atividade?.professorNome || 'Prof. João'}
        userAvatar={atividade?.professorAvatar}
        schoolPoints={atividade?.schoolPoints || 100}
        onMoreOptions={() => {
          console.log('Menu de opções na atividade compartilhada');
        }}
        onAddToClass={() => {
          console.log('Adicionar à aula - atividade compartilhada');
        }}
        onDownload={() => {
          console.log('Download da atividade compartilhada');
        }}
        onShare={() => {
          console.log('Compartilhar atividade');
        }}
        onSendMaterial={() => {
          console.log('Enviar material da atividade compartilhada');
        }}
        onMakePrivate={() => {
          console.log('Tornar atividade privada');
        }}
        onDelete={() => {
          console.log('Deletar atividade compartilhada');
        }}
      />

      {/* Card principal com fundo escuro */}
      <Card className="w-full min-h-[600px] bg-slate-800/90 border-slate-700 backdrop-blur-sm rounded-2xl shadow-2xl mt-0 rounded-t-none border-t-0">
        <CardContent className="p-8 min-h-[550px] flex flex-col">
          {/* Cabeçalho da Atividade - Removido pois agora está no UniversalActivityHeader */}
        

        {/* Card de Pré-visualização da Atividade */}
        <div className="mb-8 flex-1 relative group">
          <Card className="bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden h-full">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Eye className="w-5 h-5" />
                  <span className="font-semibold">Pré-visualização da Atividade</span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden min-h-[350px] max-h-[350px] relative">
                {/* Conteúdo da pré-visualização com interação desabilitada - visualização fixa tipo captura */}
                <div className="p-4 pointer-events-none overflow-hidden h-full">
                  <div className="transform scale-75 origin-top-left w-[133%] h-[133%] overflow-hidden">
                    {renderActivityPreview()}
                  </div>
                </div>

                {/* Container unificado SEMPRE VISÍVEL: Overlay + Ícone + Texto */}
                <div 
                  className="absolute inset-0 z-40 pointer-events-auto cursor-default bg-black/0 group-hover:bg-black/40 transition-all duration-700 ease-in-out flex items-center justify-center"
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10000
                  }}
                >
                  {/* Container unificado com ícone e texto FIXO */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-800 ease-out transform scale-75 group-hover:scale-100 translate-y-4 group-hover:translate-y-0 flex flex-col items-center gap-4 text-white pointer-events-none relative">
                    {/* Ícone de play com animação aprimorada */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 rounded-full p-5 shadow-2xl transition-all duration-500 ease-out transform group-hover:rotate-[360deg] group-hover:scale-110 border-2 border-orange-300/30 relative overflow-hidden">
                      {/* Efeito de brilho interno do ícone */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      <Play className="w-10 h-10 fill-white drop-shadow-lg relative z-10 transition-all duration-300 group-hover:scale-110" />
                    </div>

                    {/* Texto com efeitos aprimorados */}
                    <div className="text-xl font-bold bg-black/80 px-6 py-3 rounded-2xl backdrop-blur-lg shadow-2xl border border-white/30 text-center whitespace-nowrap transform transition-all duration-600 ease-out group-hover:shadow-orange-500/30 group-hover:border-orange-400/40 relative overflow-hidden">
                      {/* Efeito de brilho no texto */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      <span className="relative z-10">Apresentar Atividade</span>
                    </div>
                  </div>
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
    </div>
  );
};

export default CardVisualizacaoAtividadeCompartilhada;
