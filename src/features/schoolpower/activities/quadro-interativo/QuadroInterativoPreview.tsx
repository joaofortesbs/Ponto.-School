import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Configuração direta da API Gemini
const GEMINI_API_KEY = "AIzaSyDTu9ZJo66-dGFQE0JUJfMBo0mNxf-TKg0";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface QuadroInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico?: string;
}

interface QuadroInterativoContent {
  title: string;
  text: string;
  isGenerating: boolean;
  error?: string;
}

interface QuadroInterativoPreviewProps {
  data: QuadroInterativoData;
  onSave?: (content: QuadroInterativoContent) => void;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ data, onSave }) => {
  const [content, setContent] = useState<QuadroInterativoContent>({
    title: '',
    text: '',
    isGenerating: false,
    error: undefined
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Função para gerar conteúdo com a API Gemini
  const generateContentWithGemini = async (activityData: QuadroInterativoData): Promise<{ title: string; text: string }> => {
    console.log('🚀 [GEMINI] Iniciando geração de conteúdo para Quadro Interativo');
    console.log('📊 [GEMINI] Dados da atividade:', activityData);

    // Validar API Key
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      throw new Error('Chave da API Gemini não configurada');
    }

    // Criar prompt educativo específico
    const prompt = `
Você é uma IA especializada em educação que cria conteúdo didático para quadros interativos escolares.

DADOS DA ATIVIDADE:
- Disciplina: ${activityData.subject || 'Não especificado'}
- Ano/Série: ${activityData.schoolYear || 'Não especificado'}
- Tema/Assunto: ${activityData.theme || 'Não especificado'}
- Objetivos: ${activityData.objectives || 'Não especificado'}
- Nível: ${activityData.difficultyLevel || 'Médio'}
${activityData.quadroInterativoCampoEspecifico ? `- Campo Específico: ${activityData.quadroInterativoCampoEspecifico}` : ''}

TAREFA:
Crie um título educativo e um texto explicativo para um quadro interativo escolar.

REGRAS:
1. Título: Máximo 60 caracteres, claro e educativo
2. Texto: Máximo 400 caracteres, explicação didática completa
3. Use linguagem adequada para ${activityData.schoolYear}
4. Foque especificamente no tema: "${activityData.theme}"
5. O conteúdo deve ser educativo e prático
6. NÃO use dados genéricos ou fictícios

FORMATO DE RESPOSTA (APENAS JSON VÁLIDO):
{
  "title": "Título educativo específico sobre ${activityData.theme}",
  "text": "Explicação didática completa e específica sobre ${activityData.theme}"
}

IMPORTANTE: Responda APENAS com o JSON, sem texto adicional, sem markdown, sem explicações.`;

    console.log('📝 [GEMINI] Prompt criado:', prompt.substring(0, 200) + '...');

    try {
      // Fazer requisição para API Gemini
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          }
        }),
        signal: AbortSignal.timeout(30000) // 30 segundos timeout
      });

      console.log('📡 [GEMINI] Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [GEMINI] Erro na API:', errorText);
        throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('📥 [GEMINI] Resposta recebida:', responseData);

      // Extrair texto da resposta
      const generatedText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('Resposta vazia da API Gemini');
      }

      console.log('📄 [GEMINI] Texto gerado:', generatedText);

      // Limpar e parsear JSON
      let cleanedResponse = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Remover possível texto antes do JSON
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
      }

      console.log('🧹 [GEMINI] JSON limpo:', cleanedResponse);

      // Parsear JSON
      const parsedContent = JSON.parse(cleanedResponse);

      // Validar estrutura
      if (!parsedContent.title || !parsedContent.text) {
        throw new Error('Estrutura JSON inválida na resposta');
      }

      // Limitar tamanhos
      const finalTitle = parsedContent.title.substring(0, 60);
      const finalText = parsedContent.text.substring(0, 400);

      console.log('✅ [GEMINI] Conteúdo gerado com sucesso:', { title: finalTitle, text: finalText });

      return {
        title: finalTitle,
        text: finalText
      };

    } catch (error) {
      console.error('❌ [GEMINI] Erro na geração:', error);
      throw error;
    }
  };

  // Função para gerar conteúdo
  const handleGenerateContent = async () => {
    setContent(prev => ({ ...prev, isGenerating: true, error: undefined }));

    try {
      console.log('🎯 [QUADRO] Iniciando geração de conteúdo');
      console.log('📋 [QUADRO] Dados recebidos:', data);

      // Validar dados de entrada
      if (!data.theme || data.theme.trim() === '') {
        throw new Error('Tema é obrigatório para gerar conteúdo');
      }

      if (!data.subject || data.subject.trim() === '') {
        throw new Error('Disciplina é obrigatória para gerar conteúdo');
      }

      // Gerar conteúdo com Gemini
      const generatedContent = await generateContentWithGemini(data);

      // Atualizar estado
      const finalContent: QuadroInterativoContent = {
        title: generatedContent.title,
        text: generatedContent.text,
        isGenerating: false,
        error: undefined
      };

      setContent(finalContent);

      // Chamar callback se fornecido
      if (onSave) {
        onSave(finalContent);
      }

      console.log('✅ [QUADRO] Conteúdo gerado e salvo:', finalContent);

    } catch (error) {
      console.error('❌ [QUADRO] Erro na geração:', error);

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      setContent(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));
    }
  };

  // Gerar conteúdo automaticamente quando os dados mudarem
  useEffect(() => {
    if (!isInitialized && data.theme && data.subject) {
      setIsInitialized(true);
      handleGenerateContent();
    }
  }, [data.theme, data.subject, isInitialized]);

  // Função para regenerar conteúdo
  const handleRegenerate = () => {
    setIsInitialized(false);
    handleGenerateContent();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Card de Quadro Visível</h2>
        <span className="text-sm text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
          Conteúdo educativo
        </span>
      </div>

      {/* Card Principal */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-400" />
              Quadro Interativo
            </CardTitle>
            <Button
              onClick={handleRegenerate}
              disabled={content.isGenerating}
              variant="outline"
              size="sm"
              className="text-blue-300 border-blue-500/30 hover:bg-blue-900/20"
            >
              <RefreshCw className={`h-4 w-4 ${content.isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estado de carregamento */}
          {content.isGenerating && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-blue-300 text-sm">Gerando conteúdo educativo com IA...</p>
              </div>
            </div>
          )}

          {/* Estado de erro */}
          {content.error && !content.isGenerating && (
            <Alert className="border-red-500/20 bg-red-900/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                <strong>Erro:</strong> {content.error}
                <br />
                <Button 
                  onClick={handleRegenerate} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-red-300 border-red-500/30"
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Conteúdo gerado */}
          {!content.isGenerating && !content.error && content.title && content.text && (
            <div className="bg-slate-700/30 rounded-lg p-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-white mb-3 leading-tight">
                {content.title}
              </h3>
              <p className="text-blue-100 leading-relaxed">
                {content.text}
              </p>
            </div>
          )}

          {/* Dados da atividade */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600/30">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Disciplina</p>
              <p className="text-white font-medium">{data.subject || 'Não especificado'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Ano/Série</p>
              <p className="text-white font-medium">{data.schoolYear || 'Não especificado'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Tema</p>
              <p className="text-white font-medium">{data.theme || 'Não especificado'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Nível</p>
              <p className="text-white font-medium">{data.difficultyLevel || 'Médio'}</p>
            </div>
          </div>

          {/* Debug info */}
          <div className="mt-4 p-3 bg-slate-800/50 rounded text-xs text-slate-400">
            <p>Status: {content.isGenerating ? 'Gerando...' : content.error ? 'Erro' : 'Concluído'}</p>
            <p>API: Gemini 1.5 Flash</p>
            <p>Última atualização: {new Date().toLocaleTimeString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuadroInterativoPreview;