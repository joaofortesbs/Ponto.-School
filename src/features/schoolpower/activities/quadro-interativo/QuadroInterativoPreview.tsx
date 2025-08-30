
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Target, Users, Clock, RefreshCw } from 'lucide-react';
import { GeminiClient } from '@/utils/api/geminiClient';

interface QuadroInterativoData {
  subject?: string;
  schoolYear?: string;
  theme?: string;
  objectives?: string;
  difficultyLevel?: string;
  quadroInterativoCampoEspecifico?: string;
  customFields?: Record<string, any>;
}

interface QuadroInterativoContent {
  title: string;
  description: string;
  cardContent: {
    title: string;
    text: string;
  };
  generatedAt: string;
  isGeneratedByAI: boolean;
}

interface QuadroInterativoPreviewProps {
  data: QuadroInterativoData;
  isBuilt?: boolean;
  onUpdate?: (content: QuadroInterativoContent) => void;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  isBuilt = false, 
  onUpdate 
}) => {
  const [content, setContent] = useState<QuadroInterativoContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para gerar o prompt específico para Quadro Interativo
  const generateQuadroInterativoPrompt = (data: QuadroInterativoData): string => {
    return `
Você é uma IA especializada em criar conteúdo educacional interativo para quadros digitais.

DADOS DA ATIVIDADE:
- Disciplina: ${data.subject || 'Não especificada'}
- Ano/Série: ${data.schoolYear || 'Não especificado'}
- Tema: ${data.theme || 'Não especificado'}
- Objetivos: ${data.objectives || 'Não especificados'}
- Nível de Dificuldade: ${data.difficultyLevel || 'Não especificado'}
- Atividade Específica: ${data.quadroInterativoCampoEspecifico || 'Não especificada'}

INSTRUÇÕES:
1. Crie um conteúdo educacional interativo específico para quadro digital
2. O conteúdo deve ser adequado para a disciplina e série especificadas
3. Deve incluir elementos visuais e interativos
4. Seja específico e detalhado
5. Foque na interatividade e engajamento dos alunos

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título específico do quadro interativo",
  "description": "Descrição detalhada da atividade",
  "cardContent": {
    "title": "Título do conteúdo principal",
    "text": "Conteúdo detalhado, específico e interativo para o quadro digital. Inclua instruções claras, elementos visuais sugeridos e formas de interação."
  }
}

Responda APENAS com o JSON, sem explicações adicionais.
`;
  };

  // Função para gerar conteúdo com a IA
  const generateContentWithAI = async (inputData: QuadroInterativoData): Promise<QuadroInterativoContent> => {
    console.log('🤖 Gerando conteúdo de Quadro Interativo com IA...', inputData);
    
    try {
      setError(null);
      const prompt = generateQuadroInterativoPrompt(inputData);
      
      const geminiClient = new GeminiClient();
      const response = await geminiClient.generateContent(prompt);
      
      console.log('📥 Resposta bruta da IA:', response);
      
      // Processar resposta JSON
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const aiResponse = JSON.parse(cleanedResponse);
      
      const generatedContent: QuadroInterativoContent = {
        title: aiResponse.title || inputData.theme || 'Quadro Interativo',
        description: aiResponse.description || inputData.objectives || 'Atividade interativa',
        cardContent: {
          title: aiResponse.cardContent?.title || 'Conteúdo Interativo',
          text: aiResponse.cardContent?.text || 'Conteúdo gerado pela IA'
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };
      
      console.log('✅ Conteúdo gerado com sucesso:', generatedContent);
      return generatedContent;
      
    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo:', error);
      
      // Fallback com conteúdo padrão baseado nos dados
      const fallbackContent: QuadroInterativoContent = {
        title: inputData.theme || 'Quadro Interativo',
        description: inputData.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: `${inputData.subject || 'Disciplina'} - ${inputData.schoolYear || 'Série'}`,
          text: `Quadro interativo sobre "${inputData.theme || 'tema educacional'}" para ${inputData.schoolYear || 'estudantes'}. 
          
Objetivos: ${inputData.objectives || 'Desenvolver conhecimentos específicos'}.

Atividade: ${inputData.quadroInterativoCampoEspecifico || 'Atividade interativa personalizada'}.

Nível: ${inputData.difficultyLevel || 'Adequado à turma'}.

Este é um conteúdo gerado automaticamente. Para personalizar completamente, utilize a geração por IA.`
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false
      };
      
      return fallbackContent;
    }
  };

  // Função para iniciar a geração
  const handleGenerateContent = async () => {
    if (!data) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedContent = await generateContentWithAI(data);
      setContent(generatedContent);
      
      if (onUpdate) {
        onUpdate(generatedContent);
      }
      
    } catch (error) {
      console.error('❌ Erro na geração:', error);
      setError('Falha ao gerar conteúdo. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar conteúdo automaticamente quando isBuilt for true
  useEffect(() => {
    if (isBuilt && !content && !isGenerating) {
      console.log('🚀 Atividade construída - gerando conteúdo automaticamente');
      handleGenerateContent();
    }
  }, [isBuilt, content, isGenerating]);

  // Se não há dados suficientes
  if (!data || (!data.theme && !data.objectives && !data.subject)) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quadro Interativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Dados insuficientes para gerar o quadro interativo.</p>
            <p className="text-sm mt-2">Certifique-se de que todos os campos obrigatórios estão preenchidos.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho da Atividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Quadro Interativo: {data.theme || 'Atividade Personalizada'}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.subject && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <BookOpen className="h-3 w-3 mr-1" />
                {data.subject}
              </Badge>
            )}
            {data.schoolYear && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Users className="h-3 w-3 mr-1" />
                {data.schoolYear}
              </Badge>
            )}
            {data.difficultyLevel && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Target className="h-3 w-3 mr-1" />
                {data.difficultyLevel}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.objectives && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Objetivos de Aprendizagem:</h4>
                <p className="text-sm text-gray-600">{data.objectives}</p>
              </div>
            )}
            {data.quadroInterativoCampoEspecifico && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Atividade Específica:</h4>
                <p className="text-sm text-gray-600">{data.quadroInterativoCampoEspecifico}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card de Quadro Visível - Conteúdo Principal */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Quadro Visível - Conteúdo Interativo
            </span>
            {!isGenerating && (
              <Button
                onClick={handleGenerateContent}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {content ? 'Regenerar' : 'Gerar Conteúdo'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Gerando conteúdo interativo com IA...</p>
                <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">❌ {error}</div>
              <Button onClick={handleGenerateContent} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : content ? (
            <div className="space-y-6">
              {/* Título do Conteúdo */}
              <div className="border-b pb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {content.cardContent.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Gerado em: {new Date(content.generatedAt).toLocaleString('pt-BR')}
                  {content.isGeneratedByAI && (
                    <Badge variant="default" className="bg-green-100 text-green-800 ml-2">
                      ✨ Gerado por IA
                    </Badge>
                  )}
                </div>
              </div>

              {/* Conteúdo Principal do Quadro */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800">
                    {content.cardContent.text}
                  </div>
                </div>
              </div>

              {/* Metadados da Atividade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Informações da Atividade:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Disciplina:</strong> {data.subject || 'Não especificada'}</p>
                    <p><strong>Série:</strong> {data.schoolYear || 'Não especificada'}</p>
                    <p><strong>Tema:</strong> {data.theme || 'Não especificado'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Configurações:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Dificuldade:</strong> {data.difficultyLevel || 'Não especificada'}</p>
                    <p><strong>Tipo:</strong> Quadro Interativo</p>
                    <p><strong>Status:</strong> {content.isGeneratedByAI ? 'Gerado por IA' : 'Conteúdo Padrão'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Pronto para Gerar Conteúdo
                </h3>
                <p className="text-gray-600 mb-6">
                  Clique no botão acima para gerar o conteúdo interativo personalizado com IA
                </p>
              </div>
              <Button 
                onClick={handleGenerateContent} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Gerar Conteúdo Interativo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Técnicas (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Debug - Dados da Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuadroInterativoPreview;
