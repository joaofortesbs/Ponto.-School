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

  // Sistema CRÍTICO de extração de conteúdo da IA
  const extractAIGeneratedContent = () => {
    console.log('🚀 INICIANDO EXTRAÇÃO CRÍTICA DE CONTEÚDO DA IA GEMINI');
    console.log('📊 DADOS RECEBIDOS PARA ANÁLISE:', JSON.stringify(data, null, 2));

    // VERIFICAÇÃO CRÍTICA 1: cardContent direto da IA
    if (data?.cardContent?.title && data?.cardContent?.text && 
        data.cardContent.text.length > 50 && 
        !data.cardContent.text.includes('Conteúdo educativo específico será gerado') &&
        !data.cardContent.text.includes(data?.description || '')) {
      console.log('✅ CRÍTICO 1: Conteúdo cardContent DA IA encontrado');
      return {
        title: data.cardContent.title,
        text: data.cardContent.text,
        advancedText: data.cardContent2?.text,
        source: 'cardContent-IA',
        isAIGenerated: true
      };
    }

    // VERIFICAÇÃO CRÍTICA 2: Campos AI nos customFields
    if (data?.customFields?.aiGeneratedTitle && data?.customFields?.aiGeneratedText && 
        data.customFields.aiGeneratedText.length > 50 &&
        !data.customFields.aiGeneratedText.includes(data?.description || '')) {
      console.log('✅ CRÍTICO 2: Campos AI específicos encontrados');
      return {
        title: data.customFields.aiGeneratedTitle,
        text: data.customFields.aiGeneratedText,
        advancedText: data.customFields.aiGeneratedAdvancedText,
        source: 'customFields-AI',
        isAIGenerated: true
      };
    }

    // VERIFICAÇÃO CRÍTICA 3: JSON serializado no generatedContent
    if (data?.customFields?.generatedContent) {
      try {
        console.log('🔍 CRÍTICO 3: Analisando generatedContent...');
        const parsedContent = JSON.parse(data.customFields.generatedContent);
        
        if (parsedContent?.cardContent?.title && parsedContent?.cardContent?.text &&
            parsedContent.cardContent.text.length > 50 &&
            !parsedContent.cardContent.text.includes(data?.description || '')) {
          console.log('✅ CRÍTICO 3: Conteúdo válido extraído do JSON serializado');
          return {
            title: parsedContent.cardContent.title,
            text: parsedContent.cardContent.text,
            advancedText: parsedContent.cardContent2?.text,
            source: 'generatedContent-JSON',
            isAIGenerated: true
          };
        }
      } catch (error) {
        console.error('❌ Erro no parsing do generatedContent:', error);
      }
    }

    // VERIFICAÇÃO CRÍTICA 4: text direto no nível raiz (não description)
    if (data?.text && data.text !== data?.description && 
        data.text.length > 50 &&
        !data.text.includes('Conteúdo educativo específico será gerado')) {
      console.log('✅ CRÍTICO 4: Text direto válido (não é description)');
      return {
        title: data.title || `Como Dominar ${data?.customFields?.['Tema ou Assunto da aula'] || 'Este Conteúdo'}`,
        text: data.text,
        advancedText: data.advancedText,
        source: 'text-direto',
        isAIGenerated: Boolean(data.isGeneratedByAI)
      };
    }

    // CRÍTICO 5: Detectar se está usando description incorretamente
    if (data?.description && (
        data.cardContent?.text === data.description ||
        data.text === data.description ||
        !data.cardContent?.text ||
        !data.text
    )) {
      console.log('❌ CRÍTICO 5: DETECTADO USO INCORRETO DA DESCRIPTION - GERANDO CONTEÚDO IA');
      
      // Extrair dados para gerar conteúdo específico
      const tema = data?.customFields?.['Tema ou Assunto da aula'] || 
                   data?.theme || 
                   data?.title || 
                   'Conteúdo Educativo';
      
      const disciplina = data?.customFields?.['Disciplina / Área de conhecimento'] || 
                         data?.subject || 
                         'Educação';
      
      const anoSerie = data?.customFields?.['Ano / Série'] || 
                       data?.schoolYear || 
                       'Ensino Fundamental';

      // Gerar conteúdo específico baseado nos dados reais
      const contentText = `Para você dominar ${tema} em ${disciplina} (${anoSerie}): 1) Identifique os conceitos-chave específicos de ${tema} - observe as características únicas que definem este tema. 2) Pratique com exemplos reais de ${tema} - use situações do cotidiano onde ${tema} é aplicado. 3) Desenvolva estratégias específicas para ${tema} - crie métodos de estudo exclusivos para este conteúdo. 4) Teste seu conhecimento com exercícios progressivos de ${tema}. Exemplo prático: ${tema} é fundamental quando você precisa resolver problemas específicos da área. Macete especial: para lembrar de ${tema}, associe com conceitos que você já conhece. Cuidado: o erro mais comum em ${tema} é confundir com temas similares. Dica final: ${tema} é essencial em ${disciplina} porque conecta diretamente com outros conceitos importantes da matéria!`;

      return {
        title: `Como Dominar ${tema} - Guia Específico`,
        text: contentText,
        advancedText: `Dominando ${tema} no nível avançado: explore aplicações complexas e desafiadoras de ${tema}. Para casos difíceis: divida o problema em partes menores e aplique ${tema} sistematicamente. Exercício avançado: combine ${tema} com outros conceitos de ${disciplina} para resolver problemas interdisciplinares. Segredo profissional: a chave está em entender a lógica fundamental por trás de ${tema}, não apenas memorizar definições.`,
        source: 'fallback-inteligente',
        isAIGenerated: false
      };
    }

    // FALLBACK FINAL
    console.log('⚠️ FALLBACK FINAL: Gerando conteúdo básico');
    return {
      title: 'Aguardando Geração de Conteúdo',
      text: 'O conteúdo específico está sendo gerado pela IA. Por favor, aguarde ou tente construir a atividade novamente para acionar a geração automática.',
      advancedText: null,
      source: 'fallback-final',
      isAIGenerated: false
    };
  };

  const aiContent = extractAIGeneratedContent();

  // Preparar conteúdo para renderização baseado na extração da IA
  const cardContent = {
    title: aiContent.title,
    text: aiContent.text
  };

  const cardContent2 = aiContent.advancedText ? {
    title: `${aiContent.title} - Nível Avançado`,
    text: aiContent.advancedText
  } : null;

  const isGeneratedByAI = aiContent.isAIGenerated;

  console.log('🎯 CONTEÚDO FINAL PREPARADO PARA RENDERIZAÇÃO:', {
    titulo: cardContent.title,
    textoPreview: cardContent.text?.substring(0, 150),
    temAvancado: !!cardContent2,
    isGeneratedByAI,
    fonte: aiContent.source,
    tamanhoTexto: cardContent.text?.length,
    NÃO_É_DESCRIPTION: cardContent.text !== data?.description
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