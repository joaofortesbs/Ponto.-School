
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, BookOpen, Target, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

interface QuadroInterativoData {
  titulo?: string;
  subtitulo?: string;
  conteudo?: {
    introducao?: string;
    conceitosPrincipais?: Array<{
      titulo: string;
      explicacao: string;
      exemplo: string;
    }>;
    exemplosPraticos?: string[];
    atividadesPraticas?: Array<{
      titulo: string;
      instrucoes: string;
      objetivo: string;
    }>;
    resumo?: string;
    proximosPassos?: string;
  };
  recursos?: string[];
  objetivosAprendizagem?: string[];
  isGeneratedByAI?: boolean;
  generatedAt?: string;
}

interface QuadroInterativoPreviewProps {
  data: QuadroInterativoData;
  activityData?: any;
}

export const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [contentData, setContentData] = useState<QuadroInterativoData | null>(null);

  useEffect(() => {
    console.log('🖼️ QuadroInterativoPreview - dados recebidos:', { data, activityData });
    
    // Simular carregamento se os dados estão sendo processados
    if (data && Object.keys(data).length > 0) {
      setContentData(data);
      setIsLoading(false);
    } else {
      // Se não há dados, tentar gerar conteúdo
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [data, activityData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px] bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-200">
        <Monitor className="h-16 w-16 text-purple-400 mb-4 animate-pulse" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Processando Conteúdo</h3>
        <p className="text-sm text-gray-500 text-center max-w-md">
          O conteúdo do Quadro Interativo está sendo gerado...
        </p>
        <div className="mt-4 flex space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  if (!contentData || !contentData.titulo) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px] bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-red-200">
        <Monitor className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Conteúdo Não Disponível</h3>
        <p className="text-sm text-gray-500 text-center max-w-md">
          O conteúdo do Quadro Interativo não pôde ser carregado. Tente regenerar a atividade.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl font-bold">{contentData.titulo}</CardTitle>
                {contentData.subtitulo && (
                  <p className="text-purple-100 mt-1">{contentData.subtitulo}</p>
                )}
              </div>
            </div>
            {contentData.isGeneratedByAI && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                Gerado por IA
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="conteudo" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="conceitos">Conceitos</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
        </TabsList>

        {/* Aba Conteúdo */}
        <TabsContent value="conteudo" className="space-y-6">
          {contentData.conteudo?.introducao && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Introdução</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{contentData.conteudo.introducao}</p>
              </CardContent>
            </Card>
          )}

          {contentData.conteudo?.exemplosPraticos && contentData.conteudo.exemplosPraticos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Exemplos Práticos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentData.conteudo.exemplosPraticos.map((exemplo, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{exemplo}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {contentData.conteudo?.resumo && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{contentData.conteudo.resumo}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Conceitos */}
        <TabsContent value="conceitos" className="space-y-4">
          {contentData.conteudo?.conceitosPrincipais && contentData.conteudo.conceitosPrincipais.length > 0 ? (
            contentData.conteudo.conceitosPrincipais.map((conceito, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{conceito.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-700">{conceito.explicacao}</p>
                  {conceito.exemplo && (
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-blue-800 mb-1">Exemplo:</p>
                      <p className="text-blue-700">{conceito.exemplo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhum conceito principal definido.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Atividades */}
        <TabsContent value="atividades" className="space-y-4">
          {contentData.conteudo?.atividadesPraticas && contentData.conteudo.atividadesPraticas.length > 0 ? (
            contentData.conteudo.atividadesPraticas.map((atividade, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>{atividade.titulo}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Instruções:</h4>
                    <p className="text-gray-700">{atividade.instrucoes}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Objetivo:</h4>
                    <p className="text-gray-700">{atividade.objetivo}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhuma atividade prática definida.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Recursos */}
        <TabsContent value="recursos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recursos */}
            {contentData.recursos && contentData.recursos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recursos Necessários</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {contentData.recursos.map((recurso, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{recurso}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Objetivos de Aprendizagem */}
            {contentData.objetivosAprendizagem && contentData.objetivosAprendizagem.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Objetivos de Aprendizagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {contentData.objetivosAprendizagem.map((objetivo, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{objetivo}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Próximos Passos */}
          {contentData.conteudo?.proximosPassos && (
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{contentData.conteudo.proximosPassos}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuadroInterativoPreview;
