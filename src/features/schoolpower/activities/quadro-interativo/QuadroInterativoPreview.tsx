
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
            text: String(generatedContent.cardContent.text || 'Conteúdo educativo gerado pela IA.')
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
        text: String(data.cardContent.text || 'Conteúdo educativo gerado pela IA.')
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
        text: String(data.text || 'Conteúdo educativo.')
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
        text: String(data.generatedContent.cardContent.text || 'Conteúdo educativo.')
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
      text: fallbackText.substring(0, 500)
    };
  })();tle && data?.description) {
      console.log('✅ Usando dados diretos da IA');
      return {
        title: String(data.title),
        text: String(data.description)
      };
    }
    
    // Prioridade 4: Buscar nos dados aninhados
    if (data?.data && typeof data.data === 'object') {
      if (data.data.cardContent) {
        console.log('✅ Usando cardContent aninhado');
        return {
          title: String(data.data.cardContent.title || 'Conteúdo do Quadro'),
          text: String(data.data.cardContent.text || 'Conteúdo educativo gerado pela IA.')
        };
      }
      if (data.data.title && data.data.description) {
        console.log('✅ Usando dados aninhados da IA');
        return {
          title: String(data.data.title),
          text: String(data.data.description)
        };
      }
    }
    
    // Prioridade 5: Se há dados nos campos personalizados
    if (data?.customFields || (data?.data?.customFields)) {
      const customFields = data.customFields || data.data?.customFields || {};
      console.log('✅ Usando customFields:', customFields);
      
      const theme = customFields['Tema ou Assunto da aula'] || 
                   customFields['tema'] || 
                   customFields['theme'] || 
                   data?.theme ||
                   'Conteúdo do Quadro';
      
      const objectives = customFields['Objetivo de aprendizagem da aula'] || 
                        customFields['objetivos'] || 
                        customFields['objectives'] || 
                        data?.objectives ||
                        data?.description ||
                        'Conteúdo educativo será exibido aqui após a geração pela IA.';
      
      return {
        title: String(theme),
        text: String(objectives)
      };
    }
    
    // Prioridade 6: Se há dados de activityData
    if (activityData?.customFields) {
      console.log('✅ Usando dados do activityData');
      const customFields = activityData.customFields;
      
      const theme = customFields['Tema ou Assunto da aula'] || 
                   activityData.title ||
                   'Conteúdo do Quadro';
      
      const objectives = customFields['Objetivo de aprendizagem da aula'] || 
                        activityData.description ||
                        'Conteúdo educativo será exibido aqui após a geração pela IA.';
      
      return {
        title: String(theme),
        text: String(objectives)
      };
    }
    
    // Prioridade 7: Usar dados básicos se disponíveis
    if (data?.theme || data?.subject) {
      console.log('✅ Usando dados básicos disponíveis');
      return {
        title: String(data.theme || data.subject || 'Conteúdo do Quadro'),
        text: String(data.objectives || data.description || 'Conteúdo educativo será exibido aqui após a geração pela IA.')
      };
    }
    
    // Fallback padrão
    console.log('⚠️ Usando fallback padrão');
    return {
      title: 'Conteúdo do Quadro',
      text: 'Conteúdo educativo será exibido aqui após a geração pela IA.'
    };
  })();

  // Verificar se o conteúdo foi gerado pela IA
  const isGeneratedByAI = data?.isGeneratedByAI || 
                         data?.generatedAt || 
                         data?.customFields?.isAIGenerated === 'true' ||
                         data?.customFields?.generatedContent ||
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
                {/* Título Principal - Conteúdo da IA */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {cardContent.title}
                </h1>
                
                {/* Conteúdo Principal - Texto da IA */}
                <div className="max-w-3xl mx-auto">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {cardContent.text}
                  </p>
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
