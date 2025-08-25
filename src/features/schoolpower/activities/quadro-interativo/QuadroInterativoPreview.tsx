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

  // Extrair conteúdo real da IA com sistema ULTRA-ROBUSTO
  const extractAIContent = () => {
    console.log('📥 SISTEMA DE EXTRAÇÃO ULTRA-ROBUSTO INICIADO');
    console.log('🔍 DADOS RECEBIDOS:', JSON.stringify(data, null, 2));

    const debugInfo = {
      hasCardContent: !!data?.cardContent,
      cardContentValid: data?.cardContent?.title && data?.cardContent?.text && data.cardContent.text.length > 10,
      hasCustomFields: !!data?.customFields,
      hasGeneratedContent: !!data?.customFields?.generatedContent,
      hasAIFields: !!(data?.customFields?.aiGeneratedTitle || data?.customFields?.aiGeneratedText),
      hasDirectText: !!data?.text && data.text.length > 10,
      hasAdvancedText: !!data?.advancedText,
      isGeneratedByAI: data?.isGeneratedByAI,
      dataKeys: data ? Object.keys(data) : []
    };
    console.log('🔍 DEBUG EXTRAÇÃO:', debugInfo);

    // PRIORIDADE 1: cardContent direto (formato preferencial)
    if (data?.cardContent?.title && data?.cardContent?.text && data.cardContent.text.length > 10) {
      console.log('✅ MÉTODO 1: cardContent direto encontrado');
      const result = {
        card1: {
          title: data.cardContent.title,
          text: data.cardContent.text
        },
        card2: data?.cardContent2?.title && data?.cardContent2?.text ? {
          title: data.cardContent2.title,
          text: data.cardContent2.text
        } : null
      };
      console.log('🎯 CONTEÚDO EXTRAÍDO (Método 1):', result);
      return result;
    }

    // PRIORIDADE 2: Campos AI específicos nos customFields
    if (data?.customFields?.aiGeneratedTitle && data?.customFields?.aiGeneratedText && data.customFields.aiGeneratedText.length > 10) {
      console.log('✅ MÉTODO 2: campos AI específicos encontrados');
      const result = {
        card1: {
          title: data.customFields.aiGeneratedTitle,
          text: data.customFields.aiGeneratedText
        },
        card2: data?.customFields?.aiGeneratedAdvancedText && data.customFields.aiGeneratedAdvancedText.length > 10 ? {
          title: `${data.customFields.aiGeneratedTitle} - Nível Avançado`,
          text: data.customFields.aiGeneratedAdvancedText
        } : null
      };
      console.log('🎯 CONTEÚDO EXTRAÍDO (Método 2):', result);
      return result;
    }

    // PRIORIDADE 3: Dados serializados em generatedContent
    if (data?.customFields?.generatedContent) {
      try {
        console.log('🔍 MÉTODO 3: tentando parsear generatedContent...');
        const parsedContent = JSON.parse(data.customFields.generatedContent);
        console.log('📄 Conteúdo parseado:', parsedContent);

        if (parsedContent?.cardContent?.title && parsedContent?.cardContent?.text) {
          const result = {
            card1: {
              title: parsedContent.cardContent.title,
              text: parsedContent.cardContent.text
            },
            card2: parsedContent?.cardContent2?.title && parsedContent?.cardContent2?.text ? {
              title: parsedContent.cardContent2.title,
              text: parsedContent.cardContent2.text
            } : null
          };
          console.log('✅ MÉTODO 3: conteúdo válido extraído do JSON');
          return result;
        }

      } catch (error) {
        console.error('❌ Erro no parsing do generatedContent:', error);
      }
    }

    // PRIORIDADE 4: Dados no nível raiz (title e text diretos)
    if (data?.title && data?.text && data.text.length > 10) {
      console.log('✅ MÉTODO 4: dados no nível raiz encontrados');
      const result = {
        card1: {
          title: data.title,
          text: data.text
        },
        card2: data?.advancedText && data.advancedText.length > 10 ? {
          title: `${data.title} - Nível Avançado`,
          text: data.advancedText
        } : null
      };
      console.log('🎯 CONTEÚDO EXTRAÍDO (Método 4):', result);
      return result;
    }

    // PRIORIDADE 5: Fallback inteligente baseado no tema
    console.log('⚠️ MÉTODO 5: usando fallback inteligente');
    const tema = data?.customFields?.['Tema ou Assunto da aula'] || data?.theme || data?.title || 'Este Conteúdo';
    const disciplina = data?.customFields?.['Disciplina / Área de conhecimento'] || data?.subject || 'Educação';

    const fallbackResult = {
      card1: {
        title: `Como Dominar ${tema}`,
        text: `Para você dominar ${tema.toLowerCase()}, siga estes passos: 1) Identifique os conceitos fundamentais de ${tema}. 2) Pratique com exemplos específicos de ${tema}. 3) Aplique o conhecimento em exercícios práticos. Exemplo: observe como ${tema} aparece em situações reais de ${disciplina}. Dica: foque nos detalhes específicos de ${tema}. Cuidado: não confunda ${tema} com conceitos similares.`
      },
      card2: null
    };

    console.log('🎯 FALLBACK INTELIGENTE APLICADO:', fallbackResult);
    return fallbackResult;
  };

  const aiContent = extractAIContent();

  // Verificar se o conteúdo foi gerado pela IA
  const isGeneratedByAI = Boolean(
    aiContent?.card1?.text && 
    aiContent.card1.text.length > 50 &&
    !aiContent.card1.text.includes('Gerando conteúdo') &&
    !aiContent.card1.text.includes('Aguardando') &&
    (data?.isGeneratedByAI || 
     data?.generatedAt || 
     data?.customFields?.isAIGenerated === 'true' ||
     data?.customFields?.generatedContent ||
     (data?.cardContent && Object.keys(data.cardContent).length > 0))
  );

  // Usar o conteúdo extraído da IA ou fallback
  let cardContent, cardContent2;

  // 1. Tentar usar conteúdo da IA primeiro
  if (data.isGeneratedByAI && data.cardContent) {
    cardContent = data.cardContent;
    cardContent2 = data.cardContent2;
    console.log('✅ USANDO CONTEÚDO GERADO PELA IA:', cardContent);
  }
  // 2. Tentar extrair de customFields se disponível
  else if (data.customFields?.generatedContent) {
    try {
      const parsedContent = JSON.parse(data.customFields.generatedContent);
      cardContent = parsedContent.cardContent;
      cardContent2 = parsedContent.cardContent2;
      console.log('✅ USANDO CONTEÚDO DE CUSTOM FIELDS:', cardContent);
    } catch (error) {
      console.error('❌ Erro ao fazer parse do conteúdo:', error);
    }
  }
  // 3. Verificar se tem texto da IA diretamente
  else if (data.customFields?.aiGeneratedText) {
    cardContent = {
      title: data.customFields?.aiGeneratedTitle || data.title || 'Conteúdo do Quadro',
      text: data.customFields.aiGeneratedText
    };
    if (data.customFields?.aiGeneratedAdvancedText) {
      cardContent2 = {
        title: `${cardContent.title} - Nível Avançado`,
        text: data.customFields.aiGeneratedAdvancedText
      };
    }
    console.log('✅ USANDO TEXTO DA IA DE CUSTOM FIELDS:', cardContent);
  }
  // 4. Fallback final
  else {
    cardContent = {
      title: data.title || 'Conteúdo do Quadro',
      text: data.description || 'Conteúdo educativo específico será gerado.'
    };
    console.log('⚠️ USANDO FALLBACK BÁSICO:', cardContent);
  }

  console.log('🎯 DADOS FINAIS PARA RENDERIZAÇÃO:', {
    hasCardContent: !!cardContent,
    cardTitle: cardContent?.title,
    cardTextPreview: cardContent?.text?.substring(0, 100),
    hasAdvancedContent: !!cardContent2,
    isGeneratedByAI: data.isGeneratedByAI,
    source: data.isGeneratedByAI ? 'IA' : 'FALLBACK',
    fullCardContent: cardContent
  });


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
                    {cardContent.title}
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
                  {cardContent.text}
                </p>
                {/* Debug info detalhado */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-500 border-t pt-2 space-y-1">
                    <div>Fonte: {aiContent ? 'IA Gemini' : 'Fallback'}</div>
                    <div>Tamanho: {cardContent.text.length} chars</div>
                    <div>cardContent existe: {!!data?.cardContent}</div>
                    <div>isGeneratedByAI: {String(isGeneratedByAI)}</div>
                  </div>
                )}
              </div>

              {/* Card 2 - Conteúdo Avançado (se disponível) */}
              {cardContent2 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cardContent2.title}
                    </h3>
                    {/* Debug indicator */}
                    {isGeneratedByAI && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        ✅ IA Avançado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {cardContent2.text}
                  </p>
                  {/* Debug info detalhado */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500 border-t pt-2 space-y-1">
                      <div>Fonte: IA Gemini (Nível Avançado)</div>
                      <div>Tamanho: {cardContent2.text.length} chars</div>
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