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
  // Debug: Mostrar todos os dados recebidos
  console.log('🔍 DADOS COMPLETOS recebidos no Preview:', JSON.stringify(data, null, 2));

  // Verificar se o conteúdo foi gerado pela IA
  const isGeneratedByAI = data?.isGeneratedByAI || 
                         data?.generatedAt || 
                         data?.customFields?.isAIGenerated === 'true' ||
                         data?.customFields?.generatedContent ||
                         (data?.cardContent && Object.keys(data.cardContent).length > 0) ||
                         false;

  console.log('🤖 Conteúdo foi gerado pela IA?', isGeneratedByAI);

  // Extrair conteúdo real da IA - PRIORIZAR SEMPRE O CONTEÚDO DA IA
  const extractAIContent = () => {
    console.log('📥 Extraindo conteúdo da IA...');

    // 1. Verificar cardContent direto (mais comum)
    if (data?.cardContent?.title && data?.cardContent?.text) {
      console.log('✅ Encontrado cardContent direto:', data.cardContent);
      return {
        card1: {
          title: data.cardContent.title,
          text: data.cardContent.text
        },
        card2: data?.cardContent2 ? {
          title: data.cardContent2.title,
          text: data.cardContent2.text
        } : null
      };
    }

    // 2. Verificar nos customFields
    if (data?.customFields?.generatedContent) {
      try {
        const parsedContent = JSON.parse(data.customFields.generatedContent);
        console.log('✅ Encontrado conteúdo nos customFields:', parsedContent);
        
        if (parsedContent?.cardContent) {
          return {
            card1: {
              title: parsedContent.cardContent.title,
              text: parsedContent.cardContent.text
            },
            card2: parsedContent?.cardContent2 ? {
              title: parsedContent.cardContent2.title,
              text: parsedContent.cardContent2.text
            } : null
          };
        }
      } catch (error) {
        console.error('❌ Erro ao parsear customFields:', error);
      }
    }

    // 3. Verificar se os dados estão no nível raiz
    if (data?.title && data?.text) {
      console.log('✅ Encontrado no nível raiz');
      return {
        card1: {
          title: data.title,
          text: data.text
        },
        card2: data?.advancedText ? {
          title: `${data.title} - Nível Avançado`,
          text: data.advancedText
        } : null
      };
    }

    console.log('❌ Nenhum conteúdo da IA encontrado - usando fallback');
    return null;
  };

  const aiContent = extractAIContent();

  // Verificar se o conteúdo foi gerado pela IA
  const isGeneratedByAI = data?.isGeneratedByAI || 
                         data?.generatedAt || 
                         data?.customFields?.isAIGenerated === 'true' ||
                         data?.customFields?.generatedContent ||
                         (data?.cardContent && Object.keys(data.cardContent).length > 0) ||
                         false;

  // Usar o conteúdo extraído da IA ou fallback
  const displayContent = aiContent?.card1 || {
    title: data?.customFields?.['Tema ou Assunto da aula'] || data?.theme || 'Aguardando conteúdo...',
    text: 'Gerando conteúdo específico com a IA Gemini...'
  };

  const displayContent2 = aiContent?.card2;


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
            <div className="space-y-8">
              {/* Card 1 - Conteúdo Inicial */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {displayContent.title}
                  </h3>
                  {/* Debug indicator */}
                  {isGeneratedByAI && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✅ IA Gemini
                    </span>
                  )}
                  {!isGeneratedByAI && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      ⏳ Aguardando IA
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {displayContent.text}
                </p>
                {/* Debug info detalhado */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-500 border-t pt-2 space-y-1">
                    <div>Fonte: {aiContent ? 'IA Gemini' : 'Fallback'}</div>
                    <div>Tamanho: {displayContent.text.length} chars</div>
                    <div>cardContent existe: {!!data?.cardContent}</div>
                    <div>isGeneratedByAI: {String(isGeneratedByAI)}</div>
                  </div>
                )}
              </div>

              {/* Card 2 - Conteúdo Avançado (se disponível) */}
              {displayContent2 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {displayContent2.title}
                    </h3>
                    {/* Debug indicator */}
                    {isGeneratedByAI && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        ✅ IA Avançado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {displayContent2.text}
                  </p>
                  {/* Debug info detalhado */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500 border-t pt-2 space-y-1">
                      <div>Fonte: IA Gemini (Nível Avançado)</div>
                      <div>Tamanho: {displayContent2.text.length} chars</div>
                      <div>cardContent2 existe: {!!data?.cardContent2}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuadroInterativoPreview;