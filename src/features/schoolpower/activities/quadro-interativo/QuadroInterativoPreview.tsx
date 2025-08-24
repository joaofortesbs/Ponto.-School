
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
    console.log('🔍 Processando dados para QuadroInterativoPreview:', data);
    
    // Prioridade 1: Se há conteúdo gerado pela IA com cardContent
    if (data?.cardContent && typeof data.cardContent === 'object') {
      console.log('✅ Usando cardContent gerado pela IA');
      return {
        title: String(data.cardContent.title || 'Conteúdo do Quadro'),
        text: String(data.cardContent.text || 'Conteúdo educativo gerado pela IA.')
      };
    }
    
    // Prioridade 2: Se há dados diretos da IA no nível raiz
    if (data?.title && data?.description) {
      console.log('✅ Usando dados diretos da IA');
      return {
        title: String(data.title),
        text: String(data.description)
      };
    }
    
    // Prioridade 3: Buscar nos dados aninhados
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
    
    // Prioridade 4: Se há dados nos campos personalizados
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
    
    // Prioridade 5: Usar dados básicos se disponíveis
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

  // Log de debug para verificar dados recebidos
  console.log('🔍 QuadroInterativoPreview - Dados recebidos:', data);
  console.log('🔍 QuadroInterativoPreview - CardContent:', cardContent);

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
