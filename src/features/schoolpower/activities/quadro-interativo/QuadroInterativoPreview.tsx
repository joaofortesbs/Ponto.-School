
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { geminiLogger } from '@/utils/geminiDebugLogger';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

interface QuadroInterativoContent {
  title: string;
  text: string;
  generatedAt: string;
  isGeneratedByAI: boolean;
}

interface QuadroInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  const [contentState, setContentState] = useState<{
    content: QuadroInterativoContent | null;
    isLoading: boolean;
    error: string | null;
    hasGenerated: boolean;
  }>({
    content: null,
    isLoading: false,
    error: null,
    hasGenerated: false
  });

  // Sistema exclusivo de extração de dados com múltiplas fontes
  const extractQuadroData = (): QuadroInterativoData => {
    console.log('📊 Extraindo dados do Quadro Interativo de múltiplas fontes');
    
    // Coletar dados de todas as fontes possíveis
    const customFields = data?.customFields || activityData?.customFields || {};
    const activityTitle = data?.title || data?.personalizedTitle || activityData?.title || '';
    const activityDescription = data?.description || data?.personalizedDescription || activityData?.description || '';
    
    // Verificar dados salvos localmente
    const constructedDataKey = `constructed_quadro-interativo_${data?.id || 'default'}`;
    const autoDataKey = `auto_activity_data_${data?.id || 'default'}`;
    
    let constructedData = {};
    let autoData = {};
    
    try {
      const saved = localStorage.getItem(constructedDataKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        constructedData = parsed.data || parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar dados construídos:', e);
    }
    
    try {
      const autoSaved = localStorage.getItem(autoDataKey);
      if (autoSaved) {
        const parsed = JSON.parse(autoSaved);
        autoData = parsed.customFields || {};
      }
    } catch (e) {
      console.warn('Erro ao carregar dados automáticos:', e);
    }
    
    // Consolidar dados com prioridade: autoData > constructedData > customFields > data
    const consolidatedFields = {
      ...customFields,
      ...constructedData,
      ...autoData
    };
    
    console.log('🔄 Dados consolidados para extração:', {
      customFields,
      constructedData,
      autoData,
      consolidatedFields
    });
    
    const extractedData = {
      subject: consolidatedFields['Disciplina / Área de conhecimento'] || 
               consolidatedFields['Disciplina'] || 
               consolidatedFields['disciplina'] || 
               data?.subject || 
               'Matemática',
      
      schoolYear: consolidatedFields['Ano / Série'] || 
                  consolidatedFields['anoSerie'] || 
                  consolidatedFields['Ano'] || 
                  data?.schoolYear || 
                  '6º Ano',
      
      theme: consolidatedFields['Tema ou Assunto da aula'] || 
             consolidatedFields['tema'] || 
             consolidatedFields['Tema'] || 
             activityTitle ||
             data?.theme || 
             'Conteúdo Educativo',
      
      objectives: consolidatedFields['Objetivo de aprendizagem da aula'] || 
                  consolidatedFields['objetivos'] || 
                  consolidatedFields['Objetivos'] || 
                  activityDescription ||
                  data?.objectives || 
                  'Objetivos de aprendizagem',
      
      difficultyLevel: consolidatedFields['Nível de Dificuldade'] || 
                       consolidatedFields['nivelDificuldade'] || 
                       consolidatedFields['dificuldade'] || 
                       data?.difficultyLevel || 
                       'Intermediário',
      
      quadroInterativoCampoEspecifico: consolidatedFields['Atividade mostrada'] || 
                                       consolidatedFields['atividadeMostrada'] || 
                                       consolidatedFields['quadroInterativoCampoEspecifico'] ||
                                       consolidatedFields['Tipo de Interação'] || 
                                       data?.quadroInterativoCampoEspecifico || 
                                       'Atividade interativa no quadro'
    };
    
    console.log('✅ Dados extraídos para geração:', extractedData);
    return extractedData;
  };

  // Gerador de conteúdo interno usando Gemini
  const generateQuadroContent = async (quadroData: QuadroInterativoData): Promise<QuadroInterativoContent> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key do Gemini não configurada');
    }

    const prompt = `
Você é uma IA especializada em educação brasileira que cria conteúdo educativo COMPLETO e DIDÁTICO para quadros interativos em sala de aula.

DADOS DA AULA:
- Disciplina: ${quadroData.subject}
- Ano/Série: ${quadroData.schoolYear}
- Tema: ${quadroData.theme}
- Objetivos: ${quadroData.objectives}
- Nível de Dificuldade: ${quadroData.difficultyLevel}
- Atividade Mostrada: ${quadroData.quadroInterativoCampoEspecifico}

MISSÃO: Criar um conteúdo que ENSINE o conceito de forma clara e completa, como se fosse uma mini-aula explicativa.

FORMATO DE RESPOSTA (JSON apenas):
{
  "title": "Título educativo direto sobre o conceito (máximo 60 caracteres)",
  "text": "Explicação COMPLETA do conceito com definição, características principais, exemplos práticos e dicas para identificação/aplicação. Deve ser uma mini-aula textual que ensina efetivamente o tema (máximo 400 caracteres)"
}

DIRETRIZES OBRIGATÓRIAS:

TÍTULO:
- Seja direto e educativo sobre o conceito
- Use terminologia adequada para ${quadroData.schoolYear}
- Exemplos: "Substantivos Próprios e Comuns", "Função do 1º Grau", "Fotossíntese das Plantas"
- NÃO use "Quadro Interativo" ou "Atividade de"

TEXTO:
- INICIE com uma definição clara do conceito
- INCLUA as características principais
- ADICIONE exemplos práticos e concretos
- FORNEÇA dicas para identificação ou aplicação
- Use linguagem didática apropriada para ${quadroData.schoolYear}
- Seja EDUCATIVO, não apenas descritivo
- Foque em ENSINAR o conceito de forma completa

AGORA GERE O CONTEÚDO EDUCATIVO:`;

    try {
      geminiLogger.logRequest('Gerando conteúdo de Quadro Interativo', quadroData);
      
      const startTime = Date.now();
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      const executionTime = Date.now() - startTime;
      
      geminiLogger.logResponse(apiData, executionTime);
      
      const responseText = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Resposta vazia da API Gemini');
      }

      // Limpar a resposta removendo markdown e extraindo JSON
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Tentar fazer parse do JSON
      const parsedContent = JSON.parse(cleanedResponse);
      
      // Validar estrutura
      if (!parsedContent.title || !parsedContent.text) {
        throw new Error('Estrutura JSON inválida na resposta');
      }

      // Limitar tamanhos conforme especificado no prompt
      const title = parsedContent.title.substring(0, 70);
      const text = parsedContent.text.substring(0, 450);

      geminiLogger.logValidation({ title, text }, true);
      
      const result: QuadroInterativoContent = {
        title,
        text,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      console.log('✅ Conteúdo do Quadro Interativo gerado:', result);
      return result;
      
    } catch (error) {
      geminiLogger.logError(error as Error, { quadroData });
      
      // Fallback com conteúdo educativo melhorado
      const educationalTitle = quadroData.theme || 'Conteúdo Educativo';
      const educationalText = quadroData.objectives 
        ? `${quadroData.objectives} - Explore este conceito através de atividades interativas que facilitam o aprendizado e compreensão do tema.`
        : `Explore o tema "${quadroData.theme}" de forma interativa. Este conteúdo foi desenvolvido para facilitar a compreensão e aplicação dos conceitos fundamentais da disciplina.`;
      
      const fallbackResult: QuadroInterativoContent = {
        title: educationalTitle.substring(0, 70),
        text: educationalText.substring(0, 450),
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false
      };
      
      console.log('⚠️ Usando conteúdo fallback para Quadro Interativo:', fallbackResult);
      return fallbackResult;
    }
  };

  // Função para gerar conteúdo
  const handleGenerateContent = async () => {
    if (contentState.isLoading) return;

    setContentState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      const quadroData = extractQuadroData();
      const generatedContent = await generateQuadroContent(quadroData);
      
      // Salvar no localStorage para persistência
      const storageKey = `quadro_interativo_content_${data?.id || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(generatedContent));
      
      setContentState({
        content: generatedContent,
        isLoading: false,
        error: null,
        hasGenerated: true
      });
      
    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo:', error);
      setContentState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  // Carregar conteúdo salvo na inicialização
  useEffect(() => {
    const loadSavedContent = () => {
      // Verificar se já existe conteúdo salvo
      const storageKey = `quadro_interativo_content_${data?.id || 'default'}`;
      const savedContent = localStorage.getItem(storageKey);
      
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent);
          setContentState({
            content: parsedContent,
            isLoading: false,
            error: null,
            hasGenerated: true
          });
          return;
        } catch (error) {
          console.warn('⚠️ Erro ao carregar conteúdo salvo:', error);
        }
      }

      // Verificar se há conteúdo gerado nos dados
      if (data?.customFields?.generatedContent) {
        try {
          const generatedContent = JSON.parse(data.customFields.generatedContent);
          if (generatedContent?.cardContent) {
            setContentState({
              content: {
                title: generatedContent.cardContent.title,
                text: generatedContent.cardContent.text,
                generatedAt: generatedContent.generatedAt || new Date().toISOString(),
                isGeneratedByAI: true
              },
              isLoading: false,
              error: null,
              hasGenerated: true
            });
            return;
          }
        } catch (error) {
          console.warn('⚠️ Erro ao processar conteúdo gerado:', error);
        }
      }

      // Se não há conteúdo, definir estado inicial
      setContentState({
        content: null,
        isLoading: false,
        error: null,
        hasGenerated: false
      });
    };

    loadSavedContent();
  }, [data?.id, data?.customFields?.generatedContent]);

  // Sistema exclusivo de detecção e auto-geração para Quadro Interativo
  useEffect(() => {
    const checkAndGenerateContent = async () => {
      // Verificar múltiplas fontes de dados para trigger de geração
      const isBuiltActivity = data?.isBuilt || data?.builtAt;
      const hasConstructedData = localStorage.getItem(`constructed_quadro-interativo_${data?.id || 'default'}`);
      const hasActionPlanData = localStorage.getItem(`auto_activity_data_${data?.id || 'default'}`);
      const hasFormData = data?.customFields && Object.keys(data.customFields).length > 0;
      
      // Condições para auto-geração
      const shouldAutoGenerate = !contentState.hasGenerated && 
                                !contentState.isLoading && 
                                !contentState.error &&
                                data?.id &&
                                (isBuiltActivity || hasConstructedData || hasActionPlanData || hasFormData);

      console.log('🔍 Sistema de detecção Quadro Interativo:', {
        shouldAutoGenerate,
        isBuiltActivity,
        hasConstructedData: !!hasConstructedData,
        hasActionPlanData: !!hasActionPlanData,
        hasFormData,
        hasGenerated: contentState.hasGenerated,
        dataId: data?.id
      });

      if (shouldAutoGenerate) {
        console.log('🤖 Auto-gerando conteúdo para Quadro Interativo construído');
        
        // Aguardar um pouco para garantir que todos os dados estejam carregados
        setTimeout(() => {
          handleGenerateContent();
        }, 500);
      }
    };

    checkAndGenerateContent();
  }, [data?.isBuilt, data?.builtAt, data?.id, data?.customFields, contentState.hasGenerated]);

  // Monitor adicional para construção automática via "Construir Todas"
  useEffect(() => {
    const handleAutoBuildTrigger = () => {
      console.log('🎯 Trigger de construção automática detectado para Quadro Interativo');
      
      if (!contentState.hasGenerated && !contentState.isLoading) {
        console.log('🚀 Iniciando geração automática de conteúdo');
        handleGenerateContent();
      }
    };

    // Escutar eventos customizados de construção automática
    window.addEventListener('quadro-interativo-auto-build', handleAutoBuildTrigger);
    
    return () => {
      window.removeEventListener('quadro-interativo-auto-build', handleAutoBuildTrigger);
    };
  }, [contentState.hasGenerated, contentState.isLoading]);

  // Renderizar conteúdo do card
  const renderCardContent = () => {
    if (contentState.isLoading) {
      return (
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-700">
            Gerando Conteúdo Educativo...
          </h1>
          <p className="text-gray-600">
            A IA Gemini está criando um conteúdo personalizado para sua aula
          </p>
        </div>
      );
    }

    if (contentState.error) {
      return (
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">
            Erro ao gerar conteúdo
          </div>
          <p className="text-gray-600 text-sm">
            {contentState.error}
          </p>
          <Button 
            onClick={handleGenerateContent}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      );
    }

    if (contentState.content) {
      return (
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {contentState.content.title}
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {contentState.content.text}
            </p>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleGenerateContent}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Novo Conteúdo
            </Button>
          </div>
        </div>
      );
    }

    // Estado inicial - sem conteúdo
    const quadroData = extractQuadroData();
    return (
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
          {quadroData.theme}
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {quadroData.objectives}
          </p>
          
          <Button 
            onClick={handleGenerateContent}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Gerar Conteúdo com IA
          </Button>
          
          <p className="text-sm text-gray-500 mt-2">
            Clique para gerar conteúdo educativo personalizado com IA Gemini
          </p>
        </div>
      </div>
    );
  };

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
            
            <div className="flex items-center justify-center gap-2">
              {contentState.content?.isGeneratedByAI ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Conteúdo gerado pela IA Gemini
                </Badge>
              ) : (
                <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                  Aguardando geração de conteúdo
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
