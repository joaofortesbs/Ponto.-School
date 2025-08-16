
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Users, BookOpen, Target, Presentation, Eye, Copy, Download, Share2 } from 'lucide-react';
import { generateQuadroInterativoContent } from './QuadroInterativoGenerator';

interface ActivityFormData {
  quadroInterativoTitulo?: string;
  quadroInterativoDescricao?: string;
  quadroInterativoMateria?: string;
  quadroInterativoTema?: string;
  quadroInterativoAnoEscolar?: string;
  quadroInterativoNumeroQuestoes?: number;
  quadroInterativoNivelDificuldade?: string;
  quadroInterativoModalidadeQuestao?: string;
  quadroInterativoCampoEspecifico?: string;
}

interface QuadroInterativoPreviewProps {
  data: ActivityFormData;
  activityData?: any;
  activityId?: string;
}

interface CardDeVisualizacaoDeQuadroProps {
  title: string;
  content: string | any;
  isLoading?: boolean;
}

/**
 * Card de Visualização de Quadro - Interface principal para mostrar conteúdo gerado
 */
function CardDeVisualizacaoDeQuadro({ title, content, isLoading = false }: CardDeVisualizacaoDeQuadroProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#FF6B00]" />
            Gerando Atividade
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
              <Presentation className="w-8 h-8 text-[#FF6B00]" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Aguarde enquanto geramos seu quadro interativo...
            </p>
            <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Aguardando Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Eye className="h-12 w-12 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              Preencha os campos do formulário para visualizar a atividade de Quadro Interativo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processar conteúdo se for string JSON
  let processedContent = content;
  if (typeof content === 'string') {
    try {
      processedContent = JSON.parse(content);
    } catch {
      processedContent = { description: content };
    }
  }

  return (
    <Card className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
      {/* Header do Card */}
      <CardHeader className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Presentation className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              {processedContent.subject && (
                <p className="text-white/90 text-sm">{processedContent.subject}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Badges informativos */}
        <div className="flex flex-wrap gap-2 mt-3">
          {processedContent.theme && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <BookOpen className="h-3 w-3 mr-1" />
              {processedContent.theme}
            </Badge>
          )}
          {processedContent.schoolYear && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Target className="h-3 w-3 mr-1" />
              {processedContent.schoolYear}
            </Badge>
          )}
          {processedContent.numberOfQuestions && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Users className="h-3 w-3 mr-1" />
              {processedContent.numberOfQuestions} questões
            </Badge>
          )}
          {processedContent.difficultyLevel && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Clock className="h-3 w-3 mr-1" />
              Nível {processedContent.difficultyLevel}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Conteúdo Principal */}
      <CardContent className="p-6">
        {processedContent.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Apresentação Interativa
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {processedContent.description}
            </p>
          </div>
        )}

        {/* Seção de Conteúdo da Atividade */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Presentation className="h-5 w-5 text-[#FF6B00]" />
            Conteúdo da Atividade
          </h4>
          
          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 font-mono text-sm text-green-400 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              {typeof content === 'string' ? content : JSON.stringify(processedContent, null, 2)}
            </pre>
          </div>
        </div>

        {/* Slides Preview (se disponível) */}
        {processedContent.slides && Array.isArray(processedContent.slides) && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Slides da Apresentação ({processedContent.slides.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {processedContent.slides.slice(0, isExpanded ? undefined : 2).map((slide: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-[#FF6B00] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{slide.title || `Slide ${index + 1}`}</h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {slide.content || slide.description || 'Conteúdo do slide...'}
                  </p>
                </div>
              ))}
            </div>
            
            {processedContent.slides.length > 2 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Ver menos' : `Ver todos os ${processedContent.slides.length} slides`}
              </Button>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C40] text-white">
            <Eye className="h-4 w-4 mr-2" />
            Pré-visualização
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copiar Conteúdo
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Baixar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente principal de Preview do Quadro Interativo
 */
export default function QuadroInterativoPreview({ data, activityData, activityId }: QuadroInterativoPreviewProps) {
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para gerar conteúdo quando os dados mudarem
  useEffect(() => {
    const generateContent = async () => {
      // Verificar se temos dados suficientes para gerar conteúdo
      if (!data.quadroInterativoTitulo || !data.quadroInterativoMateria || !data.quadroInterativoTema) {
        setGeneratedContent(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('🎯 Gerando conteúdo de Quadro Interativo com dados:', data);
        
        const content = await generateQuadroInterativoContent({
          titulo: data.quadroInterativoTitulo,
          descricao: data.quadroInterativoDescricao || '',
          materia: data.quadroInterativoMateria,
          tema: data.quadroInterativoTema,
          anoEscolar: data.quadroInterativoAnoEscolar || '6º ano',
          numeroQuestoes: data.quadroInterativoNumeroQuestoes || 10,
          nivelDificuldade: data.quadroInterativoNivelDificuldade || 'Médio',
          modalidadeQuestao: data.quadroInterativoModalidadeQuestao || 'Múltipla escolha',
          campoEspecifico: data.quadroInterativoCampoEspecifico || ''
        });

        console.log('✅ Conteúdo gerado com sucesso:', content);
        setGeneratedContent(content);
      } catch (err) {
        console.error('❌ Erro ao gerar conteúdo:', err);
        setError('Erro ao gerar conteúdo. Tente novamente.');
        setGeneratedContent(null);
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [
    data.quadroInterativoTitulo,
    data.quadroInterativoMateria,
    data.quadroInterativoTema,
    data.quadroInterativoDescricao,
    data.quadroInterativoAnoEscolar,
    data.quadroInterativoNumeroQuestoes,
    data.quadroInterativoNivelDificuldade,
    data.quadroInterativoModalidadeQuestao,
    data.quadroInterativoCampoEspecifico
  ]);

  // Renderizar com base no estado
  if (error) {
    return (
      <Card className="w-full border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardContent className="text-center py-8">
          <div className="text-red-600 dark:text-red-400">
            <p className="font-semibold">Erro ao gerar atividade</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <CardDeVisualizacaoDeQuadro
        title="Gerando Atividade"
        content=""
        isLoading={true}
      />
    );
  }

  if (!generatedContent) {
    return (
      <CardDeVisualizacaoDeQuadro
        title="Aguardando Dados"
        content="Preencha os campos do formulário para visualizar a atividade de Quadro Interativo."
      />
    );
  }

  return (
    <CardDeVisualizacaoDeQuadro
      title={generatedContent?.title || data.quadroInterativoTitulo || 'Atividade de Quadro Interativo'}
      content={generatedContent}
    />
  );
}
