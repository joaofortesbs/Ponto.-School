
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
    apiKeyStatus: 'checking' | 'valid' | 'invalid' | 'missing';
  }>({
    content: null,
    isLoading: false,
    error: null,
    hasGenerated: false,
    apiKeyStatus: 'checking'
  });

  // Verificar API Key do Gemini na inicialização
  useEffect(() => {
    const checkGeminiApiKey = () => {
      console.log('🔐 [QUADRO INTERATIVO] Verificando API Key do Gemini');
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('❌ [QUADRO INTERATIVO] VITE_GEMINI_API_KEY não encontrada');
        setContentState(prev => ({ 
          ...prev, 
          apiKeyStatus: 'missing',
          error: 'API Key do Gemini não configurada. Verifique VITE_GEMINI_API_KEY nas variáveis de ambiente.'
        }));
        return;
      }
      
      if (apiKey.length < 20) {
        console.error('❌ [QUADRO INTERATIVO] API Key inválida (muito curta)');
        setContentState(prev => ({ 
          ...prev, 
          apiKeyStatus: 'invalid',
          error: 'API Key do Gemini inválida. Verifique se está configurada corretamente.'
        }));
        return;
      }
      
      console.log('✅ [QUADRO INTERATIVO] API Key encontrada e válida');
      setContentState(prev => ({ ...prev, apiKeyStatus: 'valid' }));
    };
    
    checkGeminiApiKey();
  }, []);

  // Sistema consolidado de extração de dados
  const extractQuadroData = (): QuadroInterativoData => {
    console.log('📊 [QUADRO INTERATIVO] Extraindo dados consolidados');
    
    // Coletar dados de todas as fontes possíveis
    const customFields = data?.customFields || activityData?.customFields || {};
    const activityTitle = data?.title || data?.personalizedTitle || activityData?.title || '';
    const activityDescription = data?.description || data?.personalizedDescription || activityData?.description || '';
    
    // Verificar localStorage com múltiplas chaves
    const storageKeys = [
      `constructed_quadro-interativo_${data?.id || 'default'}`,
      `auto_activity_data_${data?.id || 'default'}`,
      `activity_quadro-interativo`,
      `quadro_interativo_preview_${data?.id || 'default'}`,
      'schoolPowerActionPlan'
    ];
    
    let consolidatedData = {};
    
    storageKeys.forEach(key => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (key === 'schoolPowerActionPlan' && Array.isArray(parsed)) {
            // Buscar dados específicos do quadro interativo no action plan
            const quadroActivity = parsed.find(activity => 
              activity.id === 'quadro-interativo' || 
              activity.type === 'quadro-interativo'
            );
            if (quadroActivity?.customFields || quadroActivity?.formData) {
              consolidatedData = { 
                ...consolidatedData, 
                ...(quadroActivity.customFields || quadroActivity.formData || {})
              };
            }
          } else if (parsed.formData || parsed.data || parsed.customFields) {
            consolidatedData = { 
              ...consolidatedData, 
              ...(parsed.formData || parsed.data || parsed.customFields || parsed) 
            };
          }
        }
      } catch (e) {
        console.warn(`⚠️ Erro ao carregar ${key}:`, e);
      }
    });
    
    // Mesclar com customFields
    const allData = { ...customFields, ...consolidatedData };
    
    console.log('🔄 [QUADRO INTERATIVO] Dados coletados:', {
      customFields,
      consolidatedData,
      allData,
      activityTitle,
      activityDescription
    });
    
    const extractedData = {
      subject: allData['Disciplina / Área de conhecimento'] || 
               allData['Disciplina'] || 
               allData['disciplina'] || 
               allData['subject'] ||
               data?.subject || 
               'Matemática',
      
      schoolYear: allData['Ano / Série'] || 
                  allData['anoSerie'] || 
                  allData['Ano'] || 
                  allData['schoolYear'] ||
                  data?.schoolYear || 
                  '6º Ano',
      
      theme: allData['Tema ou Assunto da aula'] || 
             allData['tema'] || 
             allData['Tema'] || 
             allData['theme'] ||
             activityTitle ||
             data?.theme || 
             'Conteúdo Educativo Interativo',
      
      objectives: allData['Objetivo de aprendizagem da aula'] || 
                  allData['objetivos'] || 
                  allData['Objetivos'] || 
                  allData['objectives'] ||
                  activityDescription ||
                  data?.objectives || 
                  'Desenvolver competências através de atividades interativas',
      
      difficultyLevel: allData['Nível de Dificuldade'] || 
                       allData['nivelDificuldade'] || 
                       allData['dificuldade'] || 
                       allData['difficultyLevel'] ||
                       data?.difficultyLevel || 
                       'Intermediário',
      
      quadroInterativoCampoEspecifico: allData['Atividade mostrada'] || 
                                       allData['atividadeMostrada'] || 
                                       allData['quadroInterativoCampoEspecifico'] ||
                                       allData['Tipo de Interação'] || 
                                       allData['Campo Específico'] ||
                                       data?.quadroInterativoCampoEspecifico || 
                                       'Quadro interativo educacional'
    };
    
    console.log('✅ [QUADRO INTERATIVO] Dados extraídos e processados:', extractedData);
    return extractedData;
  };

  // Gerador consolidado usando API Gemini
  const generateQuadroContent = async (quadroData: QuadroInterativoData): Promise<QuadroInterativoContent> => {
    console.log('🚀 [QUADRO INTERATIVO - GEMINI API] Iniciando geração');
    console.log('📋 [QUADRO INTERATIVO - GEMINI API] Dados de entrada:', quadroData);

    // Verificar API Key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key do Gemini não configurada. Configure VITE_GEMINI_API_KEY nas variáveis de ambiente.');
    }

    // Prompt educativo otimizado
    const prompt = `
Você é uma IA especializada em educação brasileira que cria conteúdo educativo COMPLETO para quadros interativos.

DADOS DA ATIVIDADE:
- Disciplina: ${quadroData.subject}
- Ano/Série: ${quadroData.schoolYear}
- Tema: ${quadroData.theme}
- Objetivos: ${quadroData.objectives}
- Nível: ${quadroData.difficultyLevel}
- Tipo de Atividade: ${quadroData.quadroInterativoCampoEspecifico}

OBJETIVO: Criar conteúdo educativo que ENSINE o conceito de forma clara, didática e adequada para ${quadroData.schoolYear}.

INSTRUÇÕES RIGOROSAS:
1. Título: Claro, educativo e direto sobre o tema (máximo 60 caracteres)
2. Texto: Explicação COMPLETA e didática (máximo 400 caracteres)
3. Use linguagem adequada para ${quadroData.schoolYear}
4. Seja EDUCATIVO e DIDÁTICO
5. Foque em ENSINAR o conceito principal

FORMATO DE RESPOSTA (SOMENTE JSON):
{
  "title": "Título educativo sobre o tema",
  "text": "Explicação didática completa com conceitos, características e exemplos práticos para facilitar o aprendizado"
}

EXEMPLOS DE TÍTULOS ADEQUADOS:
- "Função do 1º Grau: Conceitos e Aplicações"
- "Substantivos: Classificação e Uso"
- "Fotossíntese: Processo Vital das Plantas"

NÃO use "Quadro Interativo" ou "Atividade" no título.

GERE O CONTEÚDO EDUCATIVO AGORA:`;

    console.log('📝 [QUADRO INTERATIVO - GEMINI API] Prompt preparado');

    try {
      console.log('🌐 [QUADRO INTERATIVO - GEMINI API] Enviando requisição');
      
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      const executionTime = Date.now() - startTime;
      console.log(`⏱️ [QUADRO INTERATIVO - GEMINI API] Tempo de resposta: ${executionTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [QUADRO INTERATIVO - GEMINI API] Erro HTTP:', response.status, errorText);
        throw new Error(`Erro na API Gemini: ${response.status} - ${response.statusText}`);
      }

      const apiData = await response.json();
      console.log('📦 [QUADRO INTERATIVO - GEMINI API] Resposta recebida:', apiData);
      
      const responseText = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        console.error('❌ [QUADRO INTERATIVO - GEMINI API] Resposta vazia');
        throw new Error('Resposta vazia da API Gemini');
      }

      console.log('📄 [QUADRO INTERATIVO - GEMINI API] Texto bruto:', responseText);

      // Limpar e processar resposta
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Se não começar com {, tentar encontrar o JSON
      if (!cleanedResponse.startsWith('{')) {
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
      }

      console.log('🧹 [QUADRO INTERATIVO - GEMINI API] Resposta limpa:', cleanedResponse);

      let parsedContent;
      try {
        parsedContent = JSON.parse(cleanedResponse);
        console.log('✅ [QUADRO INTERATIVO - GEMINI API] JSON parseado:', parsedContent);
      } catch (parseError) {
        console.error('❌ [QUADRO INTERATIVO - GEMINI API] Erro no parse:', parseError);
        throw new Error('Formato JSON inválido na resposta da API');
      }
      
      // Validar estrutura
      if (!parsedContent?.title || !parsedContent?.text) {
        console.error('❌ [QUADRO INTERATIVO - GEMINI API] Estrutura inválida:', parsedContent);
        throw new Error('Estrutura JSON inválida - título ou texto ausente');
      }

      // Processar e limitar conteúdo
      const title = String(parsedContent.title).substring(0, 60).trim();
      const text = String(parsedContent.text).substring(0, 400).trim();

      const result: QuadroInterativoContent = {
        title,
        text,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      console.log('🎉 [QUADRO INTERATIVO - GEMINI API] Conteúdo gerado com sucesso:', result);
      return result;
      
    } catch (error) {
      console.error('💥 [QUADRO INTERATIVO - GEMINI API] Erro na geração:', error);
      
      // Fallback educativo melhorado
      const fallbackTitle = quadroData.theme.length > 60 
        ? quadroData.theme.substring(0, 57) + '...'
        : quadroData.theme;
      
      const fallbackText = quadroData.objectives.length > 400
        ? quadroData.objectives.substring(0, 397) + '...'
        : quadroData.objectives || `Explore ${quadroData.theme} através de atividades interativas desenvolvidas para ${quadroData.schoolYear}. Conteúdo educativo que facilita a compreensão e aplicação dos conceitos fundamentais.`;
      
      const fallbackResult: QuadroInterativoContent = {
        title: fallbackTitle || 'Conteúdo Educativo',
        text: fallbackText,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false
      };
      
      console.log('🔄 [QUADRO INTERATIVO - GEMINI API] Usando fallback:', fallbackResult);
      return fallbackResult;
    }
  };

  // Função principal de geração
  const handleGenerateContent = async () => {
    if (contentState.isLoading) {
      console.log('⏳ [QUADRO INTERATIVO] Geração em andamento');
      return;
    }

    if (contentState.apiKeyStatus !== 'valid') {
      console.error('❌ [QUADRO INTERATIVO] API Key inválida');
      setContentState(prev => ({
        ...prev,
        error: 'API Key do Gemini não configurada corretamente'
      }));
      return;
    }

    console.log('🚀 [QUADRO INTERATIVO] Iniciando geração de conteúdo');
    setContentState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      const quadroData = extractQuadroData();
      console.log('📊 [QUADRO INTERATIVO] Dados para geração:', quadroData);
      
      const generatedContent = await generateQuadroContent(quadroData);
      console.log('✅ [QUADRO INTERATIVO] Conteúdo gerado:', generatedContent);
      
      // Salvar no localStorage
      const storageKey = `quadro_interativo_content_${data?.id || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(generatedContent));
      
      setContentState({
        content: generatedContent,
        isLoading: false,
        error: null,
        hasGenerated: true,
        apiKeyStatus: 'valid'
      });
      
    } catch (error) {
      console.error('❌ [QUADRO INTERATIVO] Erro na geração:', error);
      setContentState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na geração de conteúdo',
        hasGenerated: false
      }));
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
          setContentState(prev => ({
            ...prev,
            content: parsedContent,
            hasGenerated: true
          }));
          return;
        } catch (error) {
          console.warn('⚠️ [QUADRO INTERATIVO] Erro ao carregar conteúdo salvo:', error);
        }
      }

      console.log('📝 [QUADRO INTERATIVO] Nenhum conteúdo salvo encontrado');
    };

    loadSavedContent();
  }, [data?.id]);

  // Auto-geração quando API Key está válida e há dados
  useEffect(() => {
    const checkAutoGeneration = () => {
      if (contentState.apiKeyStatus === 'valid' && 
          !contentState.hasGenerated && 
          !contentState.isLoading && 
          !contentState.error &&
          data?.id) {
        
        console.log('🤖 [QUADRO INTERATIVO] Iniciando auto-geração');
        setTimeout(() => {
          handleGenerateContent();
        }, 1000);
      }
    };

    checkAutoGeneration();
  }, [contentState.apiKeyStatus, contentState.hasGenerated, data?.id]);

  // Renderizar conteúdo
  const renderCardContent = () => {
    if (contentState.isLoading) {
      return (
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-700">
            Gerando Conteúdo Educativo...
          </h1>
          <p className="text-gray-600">
            A IA Gemini está criando conteúdo personalizado para sua aula
          </p>
        </div>
      );
    }

    if (contentState.error) {
      return (
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
          <div className="text-red-600 font-semibold">
            Erro ao gerar conteúdo
          </div>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            {contentState.error}
          </p>
          {contentState.apiKeyStatus === 'valid' && (
            <Button 
              onClick={handleGenerateContent}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
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
        </div>
      );
    }

    // Estado inicial
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
          
          {contentState.apiKeyStatus === 'valid' && (
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Preparando geração automática...</span>
            </div>
          )}
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
              {contentState.content?.isGeneratedByAI ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gerado pela IA Gemini
                </Badge>
              ) : contentState.isLoading ? (
                <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Gerando...
                </Badge>
              ) : contentState.apiKeyStatus === 'missing' || contentState.apiKeyStatus === 'invalid' ? (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  API Key inválida
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
