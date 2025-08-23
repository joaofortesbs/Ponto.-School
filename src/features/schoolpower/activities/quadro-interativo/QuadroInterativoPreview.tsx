
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data?: any;
  content?: any;
  activityData?: any;
  previewData?: any;
}

export const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  content, 
  activityData, 
  previewData 
}) => {
  console.log('🎯 QuadroInterativoPreview - Dados recebidos:', { 
    data, 
    content, 
    activityData, 
    previewData 
  });

  // Estratégia robusta de consolidação de dados
  const consolidatedData = {
    // Prioridade 1: previewData (dados mais recentes)
    ...previewData,
    // Prioridade 2: data (dados do formulário)
    ...data,
    // Prioridade 3: content (conteúdo gerado)
    ...content,
    // Prioridade 4: activityData (dados da atividade)
    ...activityData
  };

  // Extrair conteúdo do card com fallbacks robustos
  let cardTitle = '';
  let cardText = '';

  // Estratégia 1: Buscar no cardContent
  if (consolidatedData?.cardContent) {
    cardTitle = consolidatedData.cardContent.title || '';
    cardText = consolidatedData.cardContent.text || '';
  }

  // Estratégia 2: Buscar em data.cardContent
  if ((!cardTitle || !cardText) && consolidatedData?.data?.cardContent) {
    cardTitle = cardTitle || consolidatedData.data.cardContent.title || '';
    cardText = cardText || consolidatedData.data.cardContent.text || '';
  }

  // Estratégia 3: Buscar nos campos diretos
  if (!cardTitle) {
    cardTitle = consolidatedData?.title || 
               consolidatedData?.theme || 
               consolidatedData?.tema ||
               activityData?.title || 
               data?.theme ||
               previewData?.theme ||
               'Conteúdo do Quadro';
  }

  if (!cardText) {
    cardText = consolidatedData?.description || 
              consolidatedData?.text || 
              consolidatedData?.objectives || 
              consolidatedData?.objetivos ||
              activityData?.description ||
              data?.objectives ||
              previewData?.objectives ||
              'Conteúdo educativo gerado pela IA será exibido aqui.';
  }

  // Garantir que temos conteúdo válido
  if (!cardTitle || cardTitle.trim() === '') {
    cardTitle = 'Conteúdo do Quadro';
  }

  if (!cardText || cardText.trim() === '') {
    cardText = 'Conteúdo educativo será exibido aqui após a geração pela IA.';
  }

  console.log('📝 Dados finais do card:', { cardTitle, cardText });

  // Verificar se é conteúdo gerado pela IA
  const isAIGenerated = consolidatedData?.isGeneratedByAI === true || 
                       consolidatedData?.data?.isGeneratedByAI === true ||
                       (cardText !== 'Conteúdo educativo será exibido aqui após a geração pela IA.' && 
                        cardTitle !== 'Conteúdo do Quadro');

  return (
    <div className="space-y-6 p-6">
      {/* Card de Quadro Visível - ÚNICO COMPONENTE */}
      <Card className="shadow-lg border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl text-blue-700 dark:text-blue-300">
            <Lightbulb className="h-6 w-6" />
            Card de Quadro Visível
          </CardTitle>
          <p className="text-blue-600 dark:text-blue-400 text-sm">
            Conteúdo gerado pela IA para exibição no quadro interativo
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-inner border border-blue-200 dark:border-blue-700">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {cardTitle}
              </h3>
              <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                {cardText}
              </p>
            </div>

            {/* Indicador de IA */}
            <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <div className={`w-2 h-2 rounded-full ${isAIGenerated ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                {isAIGenerated ? 'Conteúdo gerado por IA' : 'Aguardando geração da IA'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuadroInterativoPreview;
