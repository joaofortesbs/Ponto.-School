import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  console.log('🖼️ QuadroInterativoPreview - Dados recebidos:', data);
  console.log('🖼️ QuadroInterativoPreview - Activity data:', activityData);

  // Extrair dados do conteúdo gerado ou dados do formulário
  const cardContent = (() => {
    // Priorizar dados gerados pela IA
    if (data?.cardContent && typeof data.cardContent === 'object') {
      console.log('✅ Usando cardContent gerado pela IA:', data.cardContent);
      return {
        title: String(data.cardContent.title || 'Conteúdo do Quadro'),
        text: String(data.cardContent.text || 'Conteúdo educativo será exibido aqui após a geração pela IA.')
      };
    }

    // Verificar se há dados no localStorage de conteúdo construído
    if (typeof window !== 'undefined') {
      const activityId = activityData?.id || data?.id;
      if (activityId) {
        const constructedKey = `constructed_quadro-interativo_${activityId}`;
        const constructedData = localStorage.getItem(constructedKey);

        if (constructedData) {
          try {
            const parsed = JSON.parse(constructedData);
            console.log('✅ Usando dados construídos do localStorage:', parsed);

            if (parsed?.data?.cardContent) {
              return {
                title: String(parsed.data.cardContent.title || 'Conteúdo do Quadro'),
                text: String(parsed.data.cardContent.text || 'Conteúdo educativo gerado pela IA.')
              };
            }
          } catch (error) {
            console.error('❌ Erro ao parsear dados construídos:', error);
          }
        }
      }
    }

    // Verificar dados gerados na estrutura principal
    if (data?.data?.cardContent) {
      console.log('✅ Usando cardContent da estrutura data:', data.data.cardContent);
      return {
        title: String(data.data.cardContent.title || 'Conteúdo do Quadro'),
        text: String(data.data.cardContent.text || 'Conteúdo educativo gerado pela IA.')
      };
    }

    // Fallback para dados básicos
    console.log('⚠️ Usando dados fallback para cardContent');
    return {
      title: 'Conteúdo do Quadro',
      text: 'Conteúdo educativo será exibido aqui após a geração pela IA.'
    };
  })();

  console.log('🎯 CardContent final:', cardContent);

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Card de Quadro Visível - ÚNICO ELEMENTO */}
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
                  {cardContent.title}
                </h3>
                <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  {cardContent.text}
                </p>
              </div>

              {/* Indicador de IA */}
              <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Conteúdo gerado por IA</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuadroInterativoPreview;