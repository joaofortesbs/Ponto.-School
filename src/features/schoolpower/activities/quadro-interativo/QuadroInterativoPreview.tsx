
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, BookOpen, Target, Lightbulb, CheckCircle, ArrowRight, Users, Play, Sparkles } from 'lucide-react';

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
  customFields?: {
    'Disciplina / Área de conhecimento'?: string;
    'Ano / Série'?: string;
    'Nível de Dificuldade'?: string;
    'Tema ou Assunto da aula'?: string;
    'Objetivo de aprendizagem da aula'?: string;
    'Atividade mostrada'?: string;
  };
  // Suporte para dados diretos da IA
  text?: string;
  content?: string;
  body?: string;
  description?: string;
  title?: string;
  type?: string;
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

    // Função para processar e estruturar os dados
    const processContentData = () => {
      if (!data) {
        console.log('⚠️ Nenhum dado fornecido');
        return null;
      }

      // Se os dados já estão estruturados
      if (data.titulo || data.conteudo) {
        console.log('✅ Dados já estruturados encontrados');
        return data;
      }

      // Se há conteúdo de texto direto da IA (formato alternativo)
      const textContent = data.text || data.content || data.body || data.description;
      if (textContent && typeof textContent === 'string') {
        console.log('📝 Processando conteúdo de texto da IA');
        
        // Tentar extrair JSON do conteúdo de texto
        try {
          const jsonMatch = textContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedContent = JSON.parse(jsonMatch[0]);
            console.log('🔄 Conteúdo JSON extraído:', parsedContent);
            return {
              ...data,
              ...parsedContent,
              isGeneratedByAI: true
            };
          }
        } catch (e) {
          console.log('⚠️ Erro ao parsear JSON do texto, criando estrutura básica');
        }

        // Criar estrutura básica a partir do texto
        return {
          titulo: data.title || data.customFields?.['Tema ou Assunto da aula'] || 'Quadro Interativo',
          subtitulo: data.customFields?.['Objetivo de aprendizagem da aula'] || 'Conteúdo educacional interativo',
          conteudo: {
            introducao: textContent,
            conceitosPrincipais: [
              {
                titulo: data.customFields?.['Tema ou Assunto da aula'] || 'Conceito Principal',
                explicacao: textContent.substring(0, 200) + '...',
                exemplo: 'Exemplo prático será apresentado durante a atividade.'
              }
            ],
            exemplosPraticos: [
              'Exemplo prático baseado no conteúdo gerado',
              'Aplicação real dos conceitos apresentados'
            ],
            atividadesPraticas: [
              {
                titulo: 'Atividade Interativa',
                instrucoes: 'Siga as orientações apresentadas no quadro',
                objetivo: data.customFields?.['Objetivo de aprendizagem da aula'] || 'Fixar o aprendizado'
              }
            ],
            resumo: 'Resumo dos principais pontos abordados no conteúdo gerado.',
            proximosPassos: 'Continue explorando o tema com as próximas atividades.'
          },
          recursos: ['Quadro interativo', 'Conteúdo gerado por IA', 'Material de apoio'],
          objetivosAprendizagem: [
            data.customFields?.['Objetivo de aprendizagem da aula'] || 'Compreender o tema',
            'Aplicar os conceitos na prática',
            'Desenvolver habilidades específicas'
          ],
          customFields: data.customFields,
          isGeneratedByAI: true,
          type: 'quadro-interativo'
        };
      }

      // Se há campos customizados, criar estrutura básica
      if (data.customFields) {
        console.log('🔧 Criando estrutura a partir dos campos customizados');
        return {
          titulo: data.customFields['Tema ou Assunto da aula'] || 'Quadro Interativo',
          subtitulo: data.customFields['Objetivo de aprendizagem da aula'] || 'Atividade educacional',
          conteudo: {
            introducao: `Bem-vindos ao estudo sobre ${data.customFields['Tema ou Assunto da aula'] || 'este tema'}. Este quadro interativo foi desenvolvido para facilitar a compreensão dos conceitos.`,
            conceitosPrincipais: [
              {
                titulo: data.customFields['Tema ou Assunto da aula'] || 'Conceito Principal',
                explicacao: `Exploraremos os fundamentos de ${data.customFields['Tema ou Assunto da aula'] || 'este tema'} de forma didática.`,
                exemplo: 'Exemplo prático será apresentado durante a atividade.'
              }
            ],
            exemplosPraticos: [
              'Exemplo 1: Aplicação prática do conceito',
              'Exemplo 2: Situação real de uso'
            ],
            atividadesPraticas: [
              {
                titulo: 'Atividade Prática',
                instrucoes: 'Siga as instruções apresentadas no quadro',
                objetivo: data.customFields['Objetivo de aprendizagem da aula'] || 'Fixar o aprendizado'
              }
            ],
            resumo: `Resumo dos principais pontos sobre ${data.customFields['Tema ou Assunto da aula'] || 'o tema'}.`,
            proximosPassos: 'Continue explorando com as próximas atividades.'
          },
          recursos: ['Quadro interativo', 'Material de apoio'],
          objetivosAprendizagem: [
            data.customFields['Objetivo de aprendizagem da aula'] || 'Compreender o tema',
            'Aplicar conceitos na prática'
          ],
          customFields: data.customFields,
          type: 'quadro-interativo'
        };
      }

      console.log('⚠️ Dados insuficientes para criar preview');
      return null;
    };

    const processedData = processContentData();
    
    if (processedData) {
      console.log('✅ Dados processados com sucesso:', processedData);
      setContentData(processedData);
      setIsLoading(false);
    } else {
      console.log('⚠️ Aguardando dados válidos...');
      setTimeout(() => {
        const retryData = processContentData();
        setContentData(retryData || {});
        setIsLoading(false);
      }, 1500);
    }
  }, [data, activityData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px] bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-200">
        <Monitor className="h-16 w-16 text-purple-400 mb-4 animate-pulse" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Carregando Conteúdo</h3>
        <p className="text-sm text-gray-500 text-center max-w-md">
          O conteúdo do Quadro Interativo está sendo processado...
        </p>
        <div className="mt-4 flex space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  if (!contentData) {
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

  // Extrair informações dos campos customizados para exibição
  const disciplina = contentData.customFields?.['Disciplina / Área de conhecimento'] || 'Multidisciplinar';
  const anoSerie = contentData.customFields?.['Ano / Série'] || 'Ensino Fundamental';
  const dificuldade = contentData.customFields?.['Nível de Dificuldade'] || 'Médio';
  
  // Garantir que sempre temos um título
  const titulo = contentData.titulo || 
                contentData.customFields?.['Tema ou Assunto da aula'] || 
                'Quadro Interativo';
  
  // Garantir que sempre temos um subtítulo
  const subtitulo = contentData.subtitulo || 
                   contentData.customFields?.['Objetivo de aprendizagem da aula'] || 
                   'Atividade interativa educacional';

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Monitor className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{titulo}</CardTitle>
                <p className="text-purple-100 mt-1 text-sm">{subtitulo}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span>{disciplina}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{anoSerie}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <Target className="h-4 w-4" />
                    <span>Nível {dificuldade}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contentData.isGeneratedByAI && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Gerado por IA
                </Badge>
              )}
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Play className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            </div>
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
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <BookOpen className="h-5 w-5" />
                <span>Introdução</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {contentData.conteudo?.introducao || 
                 `Bem-vindos ao estudo sobre ${contentData.customFields?.['Tema ou Assunto da aula'] || 'este tema'}. Este quadro interativo foi desenvolvido para facilitar a compreensão e aplicação dos conceitos apresentados de forma dinâmica e envolvente.`}
              </p>
            </CardContent>
          </Card>

          {((contentData.conteudo?.exemplosPraticos && contentData.conteudo.exemplosPraticos.length > 0) || true) && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-700">
                  <Lightbulb className="h-5 w-5" />
                  <span>Exemplos Práticos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {(contentData.conteudo?.exemplosPraticos || [
                    `Exemplo prático 1: Aplicação real de ${contentData.customFields?.['Tema ou Assunto da aula'] || 'conceitos'} no dia a dia`,
                    `Exemplo prático 2: Exercício interativo para fixação do aprendizado`,
                    `Exemplo prático 3: Situação problema baseada em contexto real`
                  ]).map((exemplo, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{exemplo}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span>Resumo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {contentData.conteudo?.resumo || 
                 `Este quadro interativo sobre ${contentData.customFields?.['Tema ou Assunto da aula'] || 'o tema abordado'} apresenta os conceitos fundamentais de forma visual e prática, facilitando a compreensão e aplicação dos conhecimentos pelos estudantes.`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Conceitos */}
        <TabsContent value="conceitos" className="space-y-4">
          {contentData.conteudo?.conceitosPrincipais && contentData.conteudo.conceitosPrincipais.length > 0 ? (
            <div className="grid gap-6">
              {contentData.conteudo.conceitosPrincipais.map((conceito, index) => (
                <Card key={index} className="border-2 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
                    <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-lg">{conceito.titulo}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{conceito.explicacao}</p>
                    {conceito.exemplo && (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Exemplo Prático:</p>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300 italic">{conceito.exemplo}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">Conceitos em desenvolvimento...</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Os conceitos aparecerão aqui quando gerados pela IA.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Atividades */}
        <TabsContent value="atividades" className="space-y-4">
          {contentData.conteudo?.atividadesPraticas && contentData.conteudo.atividadesPraticas.length > 0 ? (
            <div className="grid gap-6">
              {contentData.conteudo.atividadesPraticas.map((atividade, index) => (
                <Card key={index} className="border-2 border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <Target className="h-4 w-4" />
                      </div>
                      <span className="text-lg">{atividade.titulo}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Instruções:
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300">{atividade.instrucoes}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Objetivo:
                      </h4>
                      <p className="text-purple-700 dark:text-purple-300">{atividade.objetivo}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar Atividade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">Atividades em desenvolvimento...</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">As atividades aparecerão aqui quando geradas pela IA.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Recursos */}
        <TabsContent value="recursos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recursos */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos Necessários</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(contentData.recursos || ['Quadro interativo', 'Material de apoio', 'Conteúdo gerado por IA']).map((recurso, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{recurso}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Objetivos de Aprendizagem */}
            <Card>
              <CardHeader>
                <CardTitle>Objetivos de Aprendizagem</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(contentData.objetivosAprendizagem || [
                    contentData.customFields?.['Objetivo de aprendizagem da aula'] || 'Compreender o tema',
                    'Aplicar os conceitos na prática',
                    'Desenvolver habilidades específicas'
                  ]).map((objetivo, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{objetivo}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Próximos Passos */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {contentData.conteudo?.proximosPassos || 'Continue explorando o tema com as próximas atividades e aprofunde seus conhecimentos.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuadroInterativoPreview;
