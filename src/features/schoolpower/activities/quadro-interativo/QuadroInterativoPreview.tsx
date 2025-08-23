
import React, { useEffect, useState } from 'react';
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
  const [cardContent, setCardContent] = useState({
    title: 'Conteúdo do Quadro',
    text: 'Conteúdo educativo será exibido aqui após a geração pela IA.'
  });

  useEffect(() => {
    console.log('🖼️ QuadroInterativoPreview - Dados recebidos:', data);
    console.log('🖼️ QuadroInterativoPreview - Activity data:', activityData);

    const extractCardContent = () => {
      // Prioridade 1: Dados diretos da IA na estrutura data.cardContent
      if (data?.cardContent?.title && data?.cardContent?.text) {
        console.log('✅ Usando cardContent diretamente:', data.cardContent);
        return {
          title: String(data.cardContent.title),
          text: String(data.cardContent.text)
        };
      }

      // Prioridade 2: Dados da IA na estrutura data.data.cardContent
      if (data?.data?.cardContent?.title && data?.data?.cardContent?.text) {
        console.log('✅ Usando cardContent da estrutura data.data:', data.data.cardContent);
        return {
          title: String(data.data.cardContent.title),
          text: String(data.data.cardContent.text)
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
            
            if (parsed?.data?.cardContent?.title && parsed?.data?.cardContent?.text) {
              return {
                title: String(parsed.data.cardContent.title),
                text: String(parsed.data.cardContent.text)
              };
            }
            
            if (parsed?.cardContent?.title && parsed?.cardContent?.text) {
              return {
                title: String(parsed.cardContent.title),
                text: String(parsed.cardContent.text)
              };
            }
          } catch (error) {
            console.error('❌ Erro ao parsear dados do localStorage:', error);
          }
        }
      }

      // Prioridade 4: Extrair dados dos campos do formulário ou atividade
      if (data?.title || data?.theme || activityData?.title) {
        const title = data.title || data.theme || activityData?.title || 'Conteúdo Educativo';
        const text = data.text || data.objectives || data.description || 
                    activityData?.description || 
                    'Explore este conteúdo educativo através do quadro interativo.';
        
        console.log('✅ Usando dados extraídos dos campos:', { title, text });
        return {
          title: String(title),
          text: String(text)
        };
      }

      // Prioridade 5: Verificar outros padrões de localStorage
      if (typeof window !== 'undefined' && activityData?.id) {
        const activityDataKey = `activity_${activityData.id}`;
        const activityDataSaved = localStorage.getItem(activityDataKey);
        
        if (activityDataSaved) {
          try {
            const parsed = JSON.parse(activityDataSaved);
            if (parsed?.title || parsed?.description) {
              return {
                title: String(parsed.title || 'Conteúdo Educativo'),
                text: String(parsed.description || 'Conteúdo desenvolvido especialmente para o quadro interativo.')
              };
            }
          } catch (error) {
            console.error('❌ Erro ao parsear activity data do localStorage:', error);
          }
        }
      }

      // Fallback final
      console.log('⚠️ Usando dados de fallback');
      return {
        title: 'Conteúdo do Quadro',
        text: 'Conteúdo educativo será exibido aqui após a geração pela IA.'
      };
    };

    const extractedContent = extractCardContent();
    setCardContent(extractedContent);
    console.log('🎯 CardContent final que será renderizado:', extractedContent);
  }, [data, activityData]);

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
