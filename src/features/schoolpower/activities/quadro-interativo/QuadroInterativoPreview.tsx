
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb
} from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  // Extrair dados do conteúdo gerado pela IA
  const cardContent = (() => {
    // Se há conteúdo gerado pela IA com cardContent
    if (data?.cardContent && typeof data.cardContent === 'object') {
      return {
        title: String(data.cardContent.title || 'Conteúdo do Quadro'),
        text: String(data.cardContent.text || 'Conteúdo educativo será exibido aqui após a geração pela IA.')
      };
    }
    
    // Se há dados diretos da IA no nível raiz
    if (data?.title && data?.description) {
      return {
        title: String(data.title),
        text: String(data.description)
      };
    }
    
    // Se há dados nos campos personalizados
    if (data?.customFields) {
      const theme = data.customFields['Tema ou Assunto da aula'] || 
                   data.customFields['tema'] || 
                   data.customFields['theme'] || 
                   'Conteúdo do Quadro';
      
      const objectives = data.customFields['Objetivo de aprendizagem da aula'] || 
                        data.customFields['objetivos'] || 
                        data.customFields['objectives'] || 
                        'Conteúdo educativo será exibido aqui após a geração pela IA.';
      
      return {
        title: String(theme),
        text: String(objectives)
      };
    }
    
    // Fallback padrão
    return {
      title: 'Conteúdo do Quadro',
      text: 'Conteúdo educativo será exibido aqui após a geração pela IA.'
    };
  })();

  // Verificar se o conteúdo foi gerado pela IA
  const isGeneratedByAI = data?.isGeneratedByAI || 
                         data?.generatedAt || 
                         (data?.cardContent && Object.keys(data.cardContent).length > 0) ||
                         false;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Card de Quadro Visível - ÚNICO CARD */}
        <Card className="shadow-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-blue-700 dark:text-blue-300 mb-2">
              <Lightbulb className="h-7 w-7" />
              Card de Quadro Visível
            </CardTitle>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              {isGeneratedByAI ? 'Conteúdo gerado pela IA Gemini' : 'Aguardando geração de conteúdo'}
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-inner border-2 border-blue-200 dark:border-blue-700">
              <div className="text-center space-y-6">
                {/* Título Principal */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {cardContent.title}
                </h1>
                
                {/* Linha Decorativa */}
                <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
                
                {/* Conteúdo Principal */}
                <div className="max-w-3xl mx-auto">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {cardContent.text}
                  </p>
                </div>
              </div>
              
              {/* Indicador de IA na parte inferior */}
              <div className="mt-8 pt-6 border-t border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-center gap-3">
                  {isGeneratedByAI ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        ✨ Conteúdo gerado por IA Gemini
                      </span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        ⏳ Aguardando geração de conteúdo pela IA
                      </span>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    </>
                  )}
                </div>
                
                {/* Timestamp se disponível */}
                {data?.generatedAt && (
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Gerado em: {new Date(data.generatedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuadroInterativoPreview;
