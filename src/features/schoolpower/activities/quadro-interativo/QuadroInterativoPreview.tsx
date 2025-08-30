
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Target, Users, Clock } from 'lucide-react';
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
  data?: any;
  activityData?: any;
}

export const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  const [generatedContent, setGeneratedContent] = useState<QuadroInterativoContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Processar dados de entrada
  const processInputData = (): QuadroInterativoData => {
    console.log('🔍 Processando dados de entrada:', { data, activityData });

    // Prioridade: dados passados como prop
    if (data) {
      return {
        subject: data.subject || data.disciplina || data.customFields?.['Disciplina / Área de conhecimento'] || '',
        schoolYear: data.schoolYear || data.anoSerie || data.customFields?.['Ano / Série'] || '',
        theme: data.theme || data.tema || data.customFields?.['Tema ou Assunto da aula'] || '',
        objectives: data.objectives || data.objetivos || data.customFields?.['Objetivo de aprendizagem da aula'] || '',
        difficultyLevel: data.difficultyLevel || data.nivelDificuldade || data.customFields?.['Nível de Dificuldade'] || 'Médio',
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico || data.customFields?.['Campo Específico do Quadro Interativo'] || '',
        customFields: data.customFields || {}
      };
    }

    // Fallback para activityData
    if (activityData) {
      return {
        subject: activityData.subject || activityData.disciplina || '',
        schoolYear: activityData.schoolYear || activityData.anoSerie || '',
        theme: activityData.theme || activityData.tema || '',
        objectives: activityData.objectives || activityData.objetivos || '',
        difficultyLevel: activityData.difficultyLevel || 'Médio',
        quadroInterativoCampoEspecifico: activityData.quadroInterativoCampoEspecifico || '',
        customFields: activityData.customFields || {}
      };
    }

    return {
      subject: '',
      schoolYear: '',
      theme: '',
      objectives: '',
      difficultyLevel: 'Médio',
      quadroInterativoCampoEspecifico: '',
      customFields: {}
    };
  };

  // Gerar prompt para Gemini
  const buildGeminiPrompt = (inputData: QuadroInterativoData): string => {
    return `
Crie um conteúdo educativo completo para um Quadro Interativo com base nos seguintes dados:

INFORMAÇÕES DA ATIVIDADE:
- Disciplina/Área: ${inputData.subject}
- Ano/Série: ${inputData.schoolYear}
- Tema/Assunto: ${inputData.theme}
- Objetivos: ${inputData.objectives}
- Nível de Dificuldade: ${inputData.difficultyLevel}
- Campo Específico: ${inputData.quadroInterativoCampoEspecifico}

INSTRUÇÕES:
1. Crie um conteúdo educativo rico e interativo
2. O conteúdo deve ser adequado ao ano/série especificado
3. Deve abordar diretamente o tema proposto
4. Inclua elementos práticos e didáticos
5. O texto deve ser claro, envolvente e educativo

FORMATO DE RESPOSTA:
Responda APENAS com um JSON no formato:
{
  "title": "Título do conteúdo do quadro",
  "text": "Conteúdo educativo completo e detalhado para o quadro interativo"
}

IMPORTANTE: 
- O conteúdo deve ser substancial e educativo
- Evite textos genéricos ou placeholders
- Foque no tema específico informado
- O texto deve ser adequado para apresentação em quadro interativo
`;
  };

  // Chamar API Gemini
  const generateWithGemini = async (inputData: QuadroInterativoData): Promise<QuadroInterativoContent> => {
    console.log('🤖 Iniciando geração com Gemini...');
    
    const geminiClient = new GeminiClient();
    const prompt = buildGeminiPrompt(inputData);

    const response = await geminiClient.generate({
      prompt,
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      topK: 40
    });

    if (!response.success) {
      throw new Error(response.error || 'Falha na geração de conteúdo');
    }

    // Processar resposta
    let cleanedResponse = response.result.trim();
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }

    const parsedContent = JSON.parse(cleanedResponse);

    // Validar resposta
    if (!parsedContent.title || !parsedContent.text) {
      throw new Error('Resposta da IA incompleta');
    }

    return {
      title: inputData.theme || 'Quadro Interativo',
      description: inputData.objectives || 'Atividade de quadro interativo',
      cardContent: {
        title: parsedContent.title,
        text: parsedContent.text
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: true
    };
  };

  // Gerar conteúdo
  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const inputData = processInputData();
      console.log('📊 Dados processados:', inputData);

      // Validar dados mínimos
      if (!inputData.theme && !inputData.objectives) {
        throw new Error('Tema ou objetivos são necessários para gerar o conteúdo');
      }

      const content = await generateWithGemini(inputData);
      console.log('✅ Conteúdo gerado:', content);

      setGeneratedContent(content);

      // Salvar no localStorage para persistência
      const storageKey = `quadro_interativo_content_${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(content));

    } catch (err) {
      console.error('❌ Erro na geração:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsGenerating(false);
    }
  };

  // Verificar se já existe conteúdo gerado
  useEffect(() => {
    const inputData = processInputData();
    
    // Se já temos dados da IA, usar eles
    if (data && data.cardContent && data.isGeneratedByAI) {
      console.log('✅ Usando conteúdo já gerado pela IA');
      setGeneratedContent(data);
      return;
    }

    // Gerar automaticamente se temos dados suficientes
    if (inputData.theme || inputData.objectives) {
      console.log('🚀 Gerando conteúdo automaticamente...');
      generateContent();
    }
  }, [data, activityData]);

  // Renderizar loading
  if (isGenerating) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quadro Interativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Gerando conteúdo educativo com IA...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar erro
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quadro Interativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4 py-8">
              <div className="text-red-500 text-sm">
                {error}
              </div>
              <Button onClick={generateContent} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar conteúdo gerado
  if (generatedContent) {
    return (
      <div className="space-y-6">
        {/* Header da atividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {generatedContent.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {generatedContent.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                IA Gerado
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(generatedContent.generatedAt).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Card de Quadro Visível - CONTEÚDO PRINCIPAL */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Users className="h-5 w-5" />
              {generatedContent.cardContent.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {generatedContent.cardContent.text}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão para regenerar */}
        <div className="text-center">
          <Button 
            onClick={generateContent} 
            variant="outline"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Regenerando...
              </>
            ) : (
              'Regenerar Conteúdo'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Estado vazio
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quadro Interativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <p className="text-sm text-muted-foreground">
              Nenhum conteúdo disponível. Dados insuficientes para gerar o quadro.
            </p>
            <Button onClick={generateContent} variant="outline">
              Gerar Conteúdo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuadroInterativoPreview;
