
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

  // Extrair dados do conteúdo gerado pela IA
  const getCardContent = () => {
    // Prioridade 1: Dados diretos da IA na estrutura data.cardContent
    if (data?.cardContent) {
      console.log('✅ Usando cardContent diretamente:', data.cardContent);
      return {
        title: String(data.cardContent.title || 'Conteúdo do Quadro'),
        text: String(data.cardContent.text || 'Conteúdo educativo gerado pela IA.')
      };
    }

    // Prioridade 2: Dados da IA na estrutura data.data.cardContent
    if (data?.data?.cardContent) {
      console.log('✅ Usando cardContent da estrutura data.data:', data.data.cardContent);
      return {
        title: String(data.data.cardContent.title || 'Conteúdo do Quadro'),
        text: String(data.data.cardContent.text || 'Conteúdo educativo gerado pela IA.')
      };
    }

    // Prioridade 3: Verificar localStorage para dados construídos
    if (typeof window !== 'undefined' && activityData?.id) {
      const constructedKey = `constructed_quadro-interativo_${activityData.id}`;
      const savedData = localStorage.getItem(constructedKey);
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          console.log('✅ Dados encontrados no localStorage:', parsed);
          
          if (parsed?.data?.cardContent) {
            return {
              title: String(parsed.data.cardContent.title || 'Conteúdo do Quadro'),
              text: String(parsed.data.cardContent.text || 'Conteúdo educativo gerado pela IA.')
            };
          }
          
          if (parsed?.cardContent) {
            return {
              title: String(parsed.cardContent.title || 'Conteúdo do Quadro'),
              text: String(parsed.cardContent.text || 'Conteúdo educativo gerado pela IA.')
            };
          }
        } catch (error) {
          console.error('❌ Erro ao parsear dados do localStorage:', error);
        }
      }
    }

    // Prioridade 4: Tentar extrair de outros formatos de dados
    if (data?.title || data?.theme) {
      const title = data.title || data.theme || 'Conteúdo do Quadro';
      const text = data.text || data.objectives || data.description || 'Conteúdo educativo será exibido aqui após a geração pela IA.';
      
      console.log('✅ Usando dados alternativos extraídos:', { title, text });
      return {
        title: String(title),
        text: String(text)
      };
    }

    // Fallback final
    console.log('⚠️ Usando dados de fallback');
    return {
      title: 'Conteúdo do Quadro',
      text: 'Conteúdo educativo será exibido aqui após a geração pela IA.'
    };
  };

  const cardContent = getCardContent();

  console.log('🎯 CardContent final que será renderizado:', cardContent);

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Card de Quadro Visível - ÚNICO ELEMENTO COMO SOLICITADO */}
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

              {/* Indicador de IA - Mostra que o conteúdo foi gerado */}
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
