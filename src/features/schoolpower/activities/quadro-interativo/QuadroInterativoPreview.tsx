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
    console.log('🔍 Processando dados COMPLETOS para QuadroInterativoPreview:', data);

    // Prioridade 1: Verificar se há conteúdo gerado pela IA salvo
    if (data?.customFields?.generatedContent) {
      console.log('🤖 Tentando usar conteúdo gerado pela IA salvo');
      try {
        const generatedContent = JSON.parse(data.customFields.generatedContent);
        if (generatedContent?.cardContent) {
          console.log('✅ Usando cardContent gerado pela IA (salvo):', generatedContent.cardContent);

          // Garantir que o título não tenha "Quadro Interativo:"
          let title = String(generatedContent.cardContent.title || 'Conteúdo Educativo');
          title = title.replace(/^Quadro Interativo:\s*/i, '');

          return {
            title: title,
            text: String(generatedContent.cardContent.text || 'Conteúdo educativo gerado pela IA.'),
            advancedText: String(generatedContent.cardContent.advancedText || null)
          };
        }
      } catch (error) {
        console.warn('⚠️ Erro ao processar conteúdo gerado pela IA salvo:', error);
      }
    }

    // Prioridade 2: Se há conteúdo gerado pela IA com cardContent
    if (data?.cardContent && typeof data.cardContent === 'object') {
      console.log('✅ Usando cardContent gerado pela IA diretamente:', data.cardContent);

      // Garantir que o título não tenha "Quadro Interativo:"
      let title = String(data.cardContent.title || 'Conteúdo Educativo');
      title = title.replace(/^Quadro Interativo:\s*/i, '');

      return {
        title: title,
        text: String(data.cardContent.text || 'Conteúdo educativo gerado pela IA.'),
        advancedText: String(data.cardContent.advancedText || null)
      };
    }

    // Prioridade 3: Se há dados diretos da IA no nível raiz
    if (data?.title && data?.text) {
      console.log('✅ Usando dados diretos da IA');

      // Garantir que o título não tenha "Quadro Interativo:"
      let title = String(data.title || 'Conteúdo Educativo');
      title = title.replace(/^Quadro Interativo:\s*/i, '');

      return {
        title: title,
        text: String(data.text || 'Conteúdo educativo.'),
        advancedText: String(data.advancedText || null)
      };
    }

    // Prioridade 4: Verificar generatedContent no nível raiz
    if (data?.generatedContent?.cardContent) {
      console.log('✅ Usando generatedContent do nível raiz');

      // Garantir que o título não tenha "Quadro Interativo:"
      let title = String(data.generatedContent.cardContent.title || 'Conteúdo Educativo');
      title = title.replace(/^Quadro Interativo:\s*/i, '');

      return {
        title: title,
        text: String(data.generatedContent.cardContent.text || 'Conteúdo educativo.'),
        advancedText: String(data.generatedContent.cardContent.advancedText || null)
      };
    }

    // Fallback educativo baseado nos campos disponíveis
    console.log('⚠️ Usando fallback educativo baseado nos campos disponíveis');

    const tema = data?.customFields?.['Tema ou Assunto da aula'] || 
                 data?.theme || 
                 'Conteúdo Educativo';

    const disciplina = data?.customFields?.['Disciplina / Área de conhecimento'] || 
                       data?.subject || 
                       'a disciplina';

    const serie = data?.customFields?.['Ano / Série'] || 
                  data?.schoolYear || 
                  'esta série';

    const objetivos = data?.customFields?.['Objetivo de aprendizagem da aula'] || 
                      data?.objectives || 
                      'desenvolver conhecimentos fundamentais';

    // Criar título educativo (sem "Quadro Interativo:")
    let fallbackTitle = tema.replace(/^Quadro Interativo:\s*/i, '');

    // Criar texto educativo completo
    const fallbackText = `Este conteúdo sobre ${fallbackTitle.toLowerCase()} apresenta os conceitos fundamentais de ${disciplina} para ${serie}. O objetivo é ${objetivos.toLowerCase()}. Através de explicações claras, exemplos práticos e atividades interativas, você desenvolverá uma compreensão sólida do tema e saberá aplicar esses conhecimentos em situações práticas.`;

    return {
      title: fallbackTitle.substring(0, 80),
      text: fallbackText.substring(0, 500),
      advancedText: `Expandindo os conhecimentos sobre ${fallbackTitle.toLowerCase()}, podemos explorar aspectos mais complexos e aplicações avançadas. Este nível de aprofundamento permite conexões interdisciplinares, análise crítica dos conceitos e desenvolvimento de habilidades mais sofisticadas relacionadas ao tema estudado.`.substring(0, 500)
    };
  })();

  // Verificar se o conteúdo foi gerado pela IA
  const isGeneratedByAI = data?.isGeneratedByAI || 
                         data?.generatedAt || 
                         data?.customFields?.isAIGenerated === 'true' ||
                         data?.customFields?.generatedContent ||
                         (data?.cardContent && Object.keys(data.cardContent).length > 0) ||
                         false;

  // Usar o conteúdo gerado pela IA - SEMPRE priorizar o conteúdo real da IA
  const displayContent = (() => {
    if (data?.customFields?.generatedContent) {
      try {
        const generatedContent = JSON.parse(data.customFields.generatedContent);
        if (generatedContent?.cardContent) {
          let title = String(generatedContent.cardContent.title || 'Conteúdo Educativo');
          title = title.replace(/^Quadro Interativo:\s*/i, '');
          return {
            title: title,
            text: String(generatedContent.cardContent.text || 'Conteúdo educativo gerado pela IA.'),
          };
        }
      } catch (error) {
        console.warn('⚠️ Erro ao processar conteúdo gerado pela IA salvo:', error);
      }
    }
    if (data?.cardContent && typeof data.cardContent === 'object') {
       let title = String(data.cardContent.title || 'Conteúdo Educativo');
       title = title.replace(/^Quadro Interativo:\s*/i, '');
       return {
         title: title,
         text: String(data.cardContent.text || 'Conteúdo educativo gerado pela IA.'),
       };
    }
    if (data?.title && data?.text) {
      let title = String(data.title || 'Conteúdo Educativo');
      title = title.replace(/^Quadro Interativo:\s*/i, '');
      return {
        title: title,
        text: String(data.text || 'Conteúdo educativo.'),
      };
    }
     if (data?.generatedContent?.cardContent) {
      let title = String(data.generatedContent.cardContent.title || 'Conteúdo Educativo');
      title = title.replace(/^Quadro Interativo:\s*/i, '');
      return {
        title: title,
        text: String(data.generatedContent.cardContent.text || 'Conteúdo educativo.'),
      };
    }
    // Fallback
    return {
      title: activityData?.theme || 'Conteúdo do Quadro',
      text: activityData?.objectives || 'Carregando conteúdo educativo...'
    };
  })();

  const displayContent2 = (() => {
    if (data?.customFields?.generatedContent) {
      try {
        const generatedContent = JSON.parse(data.customFields.generatedContent);
        if (generatedContent?.cardContent2) {
          let title = String(generatedContent.cardContent2.title || 'Conteúdo Educativo');
          title = title.replace(/^Quadro Interativo:\s*/i, '');
          return {
            title: title,
            text: String(generatedContent.cardContent2.text || 'Conteúdo educativo gerado pela IA.'),
          };
        }
      } catch (error) {
        console.warn('⚠️ Erro ao processar conteúdo gerado pela IA salvo:', error);
      }
    }
    if (data?.cardContent2 && typeof data.cardContent2 === 'object') {
       let title = String(data.cardContent2.title || 'Conteúdo Educativo');
       title = title.replace(/^Quadro Interativo:\s*/i, '');
       return {
         title: title,
         text: String(data.cardContent2.text || 'Conteúdo educativo gerado pela IA.'),
       };
    }
    if (data?.title2 && data?.text2) {
      let title = String(data.title2 || 'Conteúdo Educativo');
      title = title.replace(/^Quadro Interativo:\s*/i, '');
      return {
        title: title,
        text: String(data.text2 || 'Conteúdo educativo.'),
      };
    }
     if (data?.generatedContent?.cardContent2) {
      let title = String(data.generatedContent.cardContent2.title || 'Conteúdo Educativo');
      title = title.replace(/^Quadro Interativo:\s*/i, '');
      return {
        title: title,
        text: String(data.generatedContent.cardContent2.text || 'Conteúdo educativo.'),
      };
    }
    // Fallback para o segundo card, se não houver conteúdo específico
    return null; 
  })();


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
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">IA</span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {displayContent.text}
                </p>
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                    Fonte: {isGeneratedByAI ? 'IA Gemini' : 'Fallback'} | 
                    Tamanho: {displayContent.text.length} chars
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
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">IA</span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {displayContent2.text}
                  </p>
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                      Fonte: {isGeneratedByAI ? 'IA Gemini (Avançado)' : 'Fallback'} | 
                      Tamanho: {displayContent2.text.length} chars
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