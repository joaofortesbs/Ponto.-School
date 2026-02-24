import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { generateContent } from '@/services/llm-orchestrator';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

interface QuadroContent {
  title: string;
  text: string;
  generatedAt: string;
  isGeneratedByAI: boolean;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  const [content, setContent] = useState<QuadroContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Extrair dados de forma simples e direta
  const extractData = () => {
    console.log('📊 [QUADRO INTERATIVO] Extraindo dados:', { data, activityData });
    
    // Coletar dados de várias fontes
    const customFields = data?.customFields || activityData?.customFields || {};
    
    // Verificar localStorage para dados salvos
    let savedData = {};
    try {
      const actionPlan = localStorage.getItem('schoolPowerActionPlan');
      if (actionPlan) {
        const parsed = JSON.parse(actionPlan);
        if (Array.isArray(parsed)) {
          const quadroActivity = parsed.find(activity => 
            activity.id === 'quadro-interativo' || 
            activity.type === 'quadro-interativo'
          );
          if (quadroActivity?.customFields) {
            savedData = quadroActivity.customFields;
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ Erro ao carregar dados salvos:', e);
    }

    const allData = { ...customFields, ...savedData };

    return {
      subject: allData['Disciplina / Área de conhecimento'] || 
               allData['disciplina'] || 
               data?.subject || 
               'Matemática',
      
      schoolYear: allData['Ano / Série'] || 
                  allData['anoSerie'] || 
                  data?.schoolYear || 
                  '6º Ano',
      
      theme: allData['Tema ou Assunto da aula'] || 
             allData['tema'] || 
             data?.title || 
             data?.theme || 
             'Conteúdo Educativo',
      
      objectives: allData['Objetivo de aprendizagem da aula'] || 
                  allData['objetivos'] || 
                  data?.description || 
                  data?.objectives || 
                  'Desenvolver competências através de atividades interativas'
    };
  };

  // Gerar conteúdo usando API Gemini
  const handleGenerate = async () => {
    if (isLoading) return;

    console.log('🚀 [QUADRO INTERATIVO] Iniciando geração de conteúdo');
    setIsLoading(true);
    setError(null);

    try {
      // Extrair dados
      const extractedData = extractData();
      console.log('📋 [QUADRO INTERATIVO] Dados extraídos:', extractedData);

      // Criar prompt simples e direto
      const prompt = `
Você é uma IA especializada em educação que cria conteúdo educativo para quadros interativos.

DADOS DA ATIVIDADE:
- Disciplina: ${extractedData.subject}
- Ano/Série: ${extractedData.schoolYear}
- Tema: ${extractedData.theme}
- Objetivos: ${extractedData.objectives}

TAREFA: Criar um título educativo e um texto explicativo curto sobre o tema.

INSTRUÇÕES:
1. Título: Máximo 50 caracteres, claro e educativo
2. Texto: Máximo 300 caracteres, explicação didática
3. Foque no tema principal
4. Use linguagem adequada para ${extractedData.schoolYear}

FORMATO DE RESPOSTA (APENAS JSON):
{
  "title": "Título educativo sobre o tema",
  "text": "Explicação clara e didática do conceito"
}

Gere o conteúdo agora:`;

      console.log('📝 [QUADRO INTERATIVO] Enviando para LLM Orchestrator v3.0');

      const result = await generateContent(prompt, {
        activityType: 'quadro-interativo',
        onProgress: (status) => console.log(`🎨 [QuadroInterativo Preview] ${status}`),
      });

      if (!result.success || !result.data) {
        throw new Error('LLM Orchestrator retornou erro');
      }

      const responseText = result.data;
      console.log('📦 [QUADRO INTERATIVO] Resposta do Orchestrator:', responseText);

      // Processar resposta JSON
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Se não começar com {, tentar encontrar o JSON
      if (!cleanedResponse.startsWith('{')) {
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
      }

      console.log('🧹 [QUADRO INTERATIVO] Resposta limpa:', cleanedResponse);

      let parsedContent;
      try {
        parsedContent = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('❌ [QUADRO INTERATIVO] Erro no parse JSON:', parseError);
        throw new Error('Formato JSON inválido na resposta da API');
      }
      
      // Validar estrutura
      if (!parsedContent?.title || !parsedContent?.text) {
        throw new Error('Estrutura JSON inválida - título ou texto ausente');
      }

      // Criar conteúdo final
      const finalContent: QuadroContent = {
        title: String(parsedContent.title).substring(0, 50).trim(),
        text: String(parsedContent.text).substring(0, 300).trim(),
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      console.log('✅ [QUADRO INTERATIVO] Conteúdo gerado:', finalContent);

      // Salvar no localStorage
      const storageKey = `quadro_interativo_content_${data?.id || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(finalContent));

      setContent(finalContent);
      setHasGenerated(true);
      setError(null);
      
    } catch (error) {
      console.error('💥 [QUADRO INTERATIVO] Erro na geração:', error);
      
      // Fallback com dados extraídos
      const extractedData = extractData();
      
      const fallbackContent: QuadroContent = {
        title: extractedData.theme.length > 50 
          ? extractedData.theme.substring(0, 47) + '...'
          : extractedData.theme,
        text: extractedData.objectives.length > 300
          ? extractedData.objectives.substring(0, 297) + '...'
          : extractedData.objectives,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false
      };
      
      setContent(fallbackContent);
      setError(error instanceof Error ? error.message : 'Erro desconhecido na geração');
      setHasGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar conteúdo salvo na inicialização
  useEffect(() => {
    const loadSavedContent = () => {
      console.log('📂 [QUADRO INTERATIVO] Verificando conteúdo salvo');
      
      const storageKey = `quadro_interativo_content_${data?.id || 'default'}`;
      const savedContent = localStorage.getItem(storageKey);
      
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent);
          console.log('✅ [QUADRO INTERATIVO] Conteúdo encontrado no localStorage');
          setContent(parsedContent);
          setHasGenerated(true);
          return;
        } catch (error) {
          console.warn('⚠️ [QUADRO INTERATIVO] Erro ao carregar conteúdo salvo:', error);
        }
      }

      console.log('📝 [QUADRO INTERATIVO] Nenhum conteúdo salvo encontrado');
    };

    loadSavedContent();
  }, [data?.id]);

  // Auto-geração quando componente carrega
  useEffect(() => {
    if (!hasGenerated && !isLoading && data?.id) {
      console.log('🤖 [QUADRO INTERATIVO] Iniciando auto-geração');
      setTimeout(() => {
        handleGenerate();
      }, 1000);
    }
  }, [hasGenerated, isLoading, data?.id]);

  // Renderizar conteúdo do card
  const renderCardContent = () => {
    if (isLoading) {
      return (
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-700">
            Gerando Conteúdo Educativo...
          </h1>
          <p className="text-gray-600">
            A IA Gemini está criando conteúdo personalizado
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
          <div className="text-red-600 font-semibold">
            Erro ao gerar conteúdo
          </div>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            {error}
          </p>
          <Button 
            onClick={handleGenerate}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      );
    }

    if (content) {
      return (
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {content.title}
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {content.text}
            </p>
          </div>
        </div>
      );
    }

    // Estado inicial - mostrar dados básicos enquanto não gera
    const extractedData = extractData();
    
    return (
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
          {extractedData.theme}
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {extractedData.objectives}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-blue-700 dark:text-blue-300 mb-2">
              <Lightbulb className="h-7 w-7" />
              Card de Quadro Visível
            </CardTitle>
            
            <div className="flex items-center justify-center gap-2">
              {content?.isGeneratedByAI ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gerado pela IA Gemini
                </Badge>
              ) : isLoading ? (
                <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Gerando...
                </Badge>
              ) : error ? (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Erro na API
                </Badge>
              ) : (
                <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                  Conteúdo educativo
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-inner border-2 border-blue-200 dark:border-blue-700">
              {renderCardContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuadroInterativoPreview;
