
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
  console.log('🔍 DADOS COMPLETOS recebidos no Preview:', JSON.stringify(data, null, 2));

  // Sistema CRÍTICO de extração do conteúdo REAL da IA Gemini
  const extractRealAIContent = () => {
    console.log('🚀 INICIANDO EXTRAÇÃO CRÍTICA DO CONTEÚDO REAL DA IA GEMINI');
    
    // PRIORIDADE 1: Verificar cardContent direto com conteúdo REAL da IA
    if (data?.cardContent?.title && data?.cardContent?.text && 
        data.cardContent.text.length > 100 && 
        data.isGeneratedByAI === true &&
        !data.cardContent.text.includes('Conteúdo educativo específico será gerado') &&
        !data.cardContent.text.includes('será gerado') &&
        data.cardContent.text !== data?.description) {
      
      console.log('✅ CONTEÚDO REAL DA IA ENCONTRADO EM cardContent');
      console.log('🎯 Título da IA:', data.cardContent.title);
      console.log('📝 Texto da IA (100 chars):', data.cardContent.text.substring(0, 100));
      
      return {
        title: data.cardContent.title,
        text: data.cardContent.text,
        advancedText: data.cardContent2?.text,
        source: 'cardContent-IA-REAL',
        isRealAI: true
      };
    }

    // PRIORIDADE 2: Verificar campos AI específicos nos customFields
    if (data?.customFields?.aiGeneratedTitle && data?.customFields?.aiGeneratedText && 
        data.customFields.aiGeneratedText.length > 100 &&
        data.customFields.isAIGenerated === 'true' &&
        !data.customFields.aiGeneratedText.includes('será gerado') &&
        data.customFields.aiGeneratedText !== data?.description) {
      
      console.log('✅ CONTEÚDO REAL DA IA ENCONTRADO EM customFields');
      console.log('🎯 Título da IA:', data.customFields.aiGeneratedTitle);
      console.log('📝 Texto da IA (100 chars):', data.customFields.aiGeneratedText.substring(0, 100));
      
      return {
        title: data.customFields.aiGeneratedTitle,
        text: data.customFields.aiGeneratedText,
        advancedText: data.customFields.aiGeneratedAdvancedText,
        source: 'customFields-IA-REAL',
        isRealAI: true
      };
    }

    // PRIORIDADE 3: Verificar generatedContent serializado
    if (data?.customFields?.generatedContent) {
      try {
        const parsedContent = JSON.parse(data.customFields.generatedContent);
        
        if (parsedContent?.cardContent?.title && parsedContent?.cardContent?.text &&
            parsedContent.cardContent.text.length > 100 &&
            parsedContent.apiSuccess === true &&
            !parsedContent.cardContent.text.includes('será gerado') &&
            parsedContent.cardContent.text !== data?.description) {
          
          console.log('✅ CONTEÚDO REAL DA IA ENCONTRADO EM generatedContent JSON');
          console.log('🎯 Título da IA:', parsedContent.cardContent.title);
          console.log('📝 Texto da IA (100 chars):', parsedContent.cardContent.text.substring(0, 100));
          
          return {
            title: parsedContent.cardContent.title,
            text: parsedContent.cardContent.text,
            advancedText: parsedContent.cardContent2?.text,
            source: 'generatedContent-IA-REAL',
            isRealAI: true
          };
        }
      } catch (error) {
        console.error('❌ Erro no parsing do generatedContent:', error);
      }
    }

    // PRIORIDADE 4: Verificar text direto (não description) com validação rigorosa
    if (data?.text && data.text !== data?.description && 
        data.text.length > 100 &&
        data.isGeneratedByAI === true &&
        !data.text.includes('Conteúdo educativo específico será gerado') &&
        !data.text.includes('será gerado')) {
      
      console.log('✅ CONTEÚDO REAL DA IA ENCONTRADO EM text direto');
      console.log('🎯 Título gerado:', data.title);
      console.log('📝 Texto da IA (100 chars):', data.text.substring(0, 100));
      
      return {
        title: data.title || `Como Dominar ${data?.customFields?.['Tema ou Assunto da aula'] || 'Este Conteúdo'}`,
        text: data.text,
        advancedText: data.advancedText,
        source: 'text-direto-IA-REAL',
        isRealAI: true
      };
    }

    // EMERGÊNCIA: Detectar uso incorreto da description
    console.log('❌ NENHUM CONTEÚDO REAL DA IA ENCONTRADO - GERANDO CONTEÚDO ESPECÍFICO');
    
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

    // Gerar conteúdo ultra-específico baseado no tema REAL
    const tituloEspecifico = `Como Dominar ${tema} - Guia Prático`;
    const textoEspecifico = `Para você dominar ${tema} em ${disciplina} (${anoSerie}): 1) Identifique as características específicas de ${tema} - observe os elementos únicos que definem ${tema}. 2) Pratique com exemplos reais de ${tema} - use situações do cotidiano onde ${tema} aparece. 3) Aplique técnicas específicas para ${tema} - desenvolva estratégias exclusivas para este conceito. 4) Teste seu conhecimento de ${tema} com exercícios progressivos. Exemplo prático: ${tema} é fundamental quando você precisa resolver problemas específicos da área. Macete especial: para lembrar de ${tema}, associe com conceitos que você já conhece. Cuidado: o erro mais comum em ${tema} é confundir com temas similares. Dica final: ${tema} é essencial em ${disciplina} porque conecta diretamente com outros conceitos importantes!`;

    return {
      title: tituloEspecifico,
      text: textoEspecifico,
      advancedText: `Dominando ${tema} no nível avançado: explore aplicações complexas de ${tema}. Para casos difíceis: divida o problema em partes menores e aplique ${tema} sistematicamente. Exercício avançado: combine ${tema} com outros conceitos de ${disciplina}. Segredo profissional: a chave está em entender a lógica fundamental por trás de ${tema}.`,
      source: 'fallback-tema-especifico',
      isRealAI: false
    };
  };

  const aiContent = extractRealAIContent();

  // Preparar conteúdo final baseado na extração
  const cardContent = {
    title: aiContent.title,
    text: aiContent.text
  };

  const cardContent2 = aiContent.advancedText ? {
    title: `${aiContent.title} - Nível Avançado`,
    text: aiContent.advancedText
  } : null;

  console.log('🎯 CONTEÚDO FINAL PARA EXIBIÇÃO:', {
    titulo: cardContent.title,
    textoPreview: cardContent.text?.substring(0, 150),
    temAvancado: !!cardContent2,
    fonte: aiContent.source,
    isRealAI: aiContent.isRealAI,
    tamanhoTexto: cardContent.text?.length
  });

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Card de Quadro Visível - EXIBINDO CONTEÚDO REAL DA IA */}
        <Card className="shadow-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-blue-700 dark:text-blue-300 mb-2">
              <Lightbulb className="h-7 w-7" />
              Card de Quadro Visível
            </CardTitle>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              {aiContent.isRealAI ? '✅ Conteúdo REAL gerado pela IA Gemini' : '⚠️ Conteúdo específico baseado no tema'}
            </p>
            {/* Debug indicator para desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Fonte: {aiContent.source} | Real IA: {String(aiContent.isRealAI)}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Card 1 - Conteúdo Principal */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {cardContent.title}
                  </h3>
                  {/* Indicador de status da IA */}
                  {aiContent.isRealAI ? (
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded font-medium">
                      ✅ IA Gemini
                    </span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-1 rounded font-medium">
                      📝 Específico
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                  {cardContent.text}
                </p>
                {/* Debug info detalhado para desenvolvimento */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-3 text-xs text-gray-500 border-t pt-2 space-y-1">
                    <div>Tamanho do texto: {cardContent.text.length} chars</div>
                    <div>cardContent existe: {!!data?.cardContent}</div>
                    <div>isGeneratedByAI: {String(data?.isGeneratedByAI)}</div>
                    <div>Texto ≠ Description: {String(cardContent.text !== data?.description)}</div>
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
                    {/* Indicador de nível avançado */}
                    <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded font-medium">
                      🎯 Avançado
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                    {cardContent2.text}
                  </p>
                  {/* Debug info para conteúdo avançado */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-3 text-xs text-gray-500 border-t pt-2 space-y-1">
                      <div>Tamanho do texto avançado: {cardContent2.text.length} chars</div>
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
