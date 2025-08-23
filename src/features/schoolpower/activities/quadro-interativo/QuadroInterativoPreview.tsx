
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  content?: any;
  activityData?: any;
}

export const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ data, content, activityData }) => {
  console.log('🎯 QuadroInterativoPreview - Dados recebidos:', { data, content, activityData });

  // Consolidar dados de múltiplas fontes
  const consolidatedData = {
    ...data,
    ...content,
    ...activityData
  };

  // Garantir que temos os dados necessários com fallbacks robustos
  const cardTitle = consolidatedData?.cardContent?.title || 
                   consolidatedData?.title || 
                   consolidatedData?.theme || 
                   activityData?.title || 
                   data?.theme ||
                   'Conteúdo do Quadro';
                   
  const cardText = consolidatedData?.cardContent?.text || 
                  consolidatedData?.text || 
                  consolidatedData?.description || 
                  consolidatedData?.objectives ||
                  activityData?.description ||
                  data?.objectives ||
                  'Conteúdo educativo será exibido aqui após a geração pela IA.';

  console.log('📝 Dados consolidados do card:', { cardTitle, cardText, consolidatedData });

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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Conteúdo gerado por IA
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuadroInterativoPreview;
