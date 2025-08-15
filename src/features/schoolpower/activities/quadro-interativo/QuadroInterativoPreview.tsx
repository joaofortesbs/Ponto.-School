
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Monitor, Target, Play, FileText, Package, CheckCircle, Zap } from 'lucide-react';
import { CarrosselQuadrosSalaAula } from './CarrosselQuadrosSalaAula';
import QuadroInterativoGenerator from './QuadroInterativoGenerator';

interface QuadroInterativoPreviewProps {
  data?: any;
  activityData?: any;
}

export function QuadroInterativoPreview({ data, activityData }: QuadroInterativoPreviewProps) {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateContent = async () => {
      setIsLoading(true);
      try {
        console.log('🖼️ Iniciando geração de conteúdo para Quadro Interativo...');
        console.log('📋 Dados recebidos:', { data, activityData });

        let contentToGenerate = data || activityData;

        // Verificar se já existe conteúdo gerado
        if (contentToGenerate?.generatedContent && 
            contentToGenerate.generatedContent.card1 && 
            contentToGenerate.generatedContent.card2) {
          console.log('✅ Usando conteúdo já gerado:', contentToGenerate.generatedContent);
          setContent(contentToGenerate.generatedContent);
          setIsLoading(false);
          return;
        }

        // Verificar se há dados suficientes para geração
        const hasRequiredData = contentToGenerate && (
          contentToGenerate.subject || 
          contentToGenerate['Disciplina / Área de conhecimento'] ||
          contentToGenerate.theme || 
          contentToGenerate['Tema ou Assunto da aula']
        );

        if (hasRequiredData) {
          console.log('📊 Gerando conteúdo com dados:', contentToGenerate);
          
          // Mapear dados corretamente
          const mappedData = {
            ...contentToGenerate,
            subject: contentToGenerate.subject || contentToGenerate['Disciplina / Área de conhecimento'],
            schoolYear: contentToGenerate.schoolYear || contentToGenerate['Ano / Série'],
            theme: contentToGenerate.theme || contentToGenerate['Tema ou Assunto da aula'],
            objectives: contentToGenerate.objectives || contentToGenerate['Objetivo de aprendizagem da aula'],
            difficultyLevel: contentToGenerate.difficultyLevel || contentToGenerate['Nível de Dificuldade'],
            quadroInterativoCampoEspecifico: contentToGenerate['Atividade mostrada'] || contentToGenerate.quadroInterativoCampoEspecifico
          };
          
          console.log('🔄 Dados mapeados para geração:', mappedData);
          
          const generatedContent = await QuadroInterativoGenerator.generateContent(mappedData);
          console.log('✅ Conteúdo gerado com sucesso:', generatedContent);
          setContent(generatedContent);
        } else {
          // Conteúdo padrão quando não há dados suficientes
          const tema = contentToGenerate?.theme || contentToGenerate?.['Tema ou Assunto da aula'] || 'Conteúdo Educacional';
          const disciplina = contentToGenerate?.subject || contentToGenerate?.['Disciplina / Área de conhecimento'] || 'Disciplina';
          
          const defaultContent = {
            card1: {
              titulo: `Introdução: ${tema}`,
              conteudo: `Bem-vindos ao estudo de ${tema} em ${disciplina}. Este conteúdo apresenta os conceitos fundamentais de forma clara e envolvente, proporcionando uma base sólida para o aprendizado.`
            },
            card2: {
              titulo: `Desenvolvimento: ${tema}`,
              conteudo: `Vamos aprofundar o conhecimento sobre ${tema}. Aqui você encontrará informações essenciais, exemplos práticos e aplicações que conectam a teoria com a realidade.`
            }
          };
          console.log('📋 Usando conteúdo padrão personalizado:', defaultContent);
          setContent(defaultContent);
        }
      } catch (error) {
        console.error('❌ Erro ao gerar conteúdo:', error);
        
        // Fallback inteligente baseado nos dados disponíveis
        const tema = (data || activityData)?.theme || (data || activityData)?.[`Tema ou Assunto da aula`] || 'Tema da Aula';
        const fallbackContent = {
          card1: { 
            titulo: `Introdução: ${tema}`, 
            conteudo: `Conteúdo introdutório sobre ${tema}. Este material foi preparado para facilitar o aprendizado e a compreensão dos conceitos fundamentais.` 
          },
          card2: { 
            titulo: `Desenvolvimento: ${tema}`, 
            conteudo: `Desenvolvimento do conteúdo sobre ${tema}. Aqui você encontrará informações detalhadas e aplicações práticas dos conceitos estudados.` 
          }
        };
        setContent(fallbackContent);
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [data, activityData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Gerando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Nenhum conteúdo disponível
          </h4>
          <p className="text-gray-500 dark:text-gray-500">
            Configure os dados na aba "Editar" e gere o conteúdo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Header da Atividade */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Monitor className="h-6 w-6 text-orange-500" />
              <Badge variant="secondary" className="text-orange-700 bg-orange-100">
                Quadro Interativo
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data?.title || activityData?.title || 'Quadro Interativo'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {data?.description || activityData?.description || 'Visualização interativa do conteúdo educacional'}
            </p>
          </div>

          {/* Carrossel de Quadros */}
          <div className="relative bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
            <CarrosselQuadrosSalaAula contentData={content} />
          </div>

          {/* Informações da Atividade */}
          {(data || activityData) && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Target className="h-5 w-5" />
                  Informações da Atividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data?.subject || activityData?.subject) && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Disciplina:</label>
                      <p className="text-gray-900 dark:text-gray-100">{data?.subject || activityData?.subject}</p>
                    </div>
                  )}
                  {(data?.schoolYear || activityData?.schoolYear) && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ano/Série:</label>
                      <p className="text-gray-900 dark:text-gray-100">{data?.schoolYear || activityData?.schoolYear}</p>
                    </div>
                  )}
                  {(data?.theme || activityData?.theme) && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tema:</label>
                      <p className="text-gray-900 dark:text-gray-100">{data?.theme || activityData?.theme}</p>
                    </div>
                  )}
                  {(data?.difficultyLevel || activityData?.difficultyLevel) && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nível de Dificuldade:</label>
                      <Badge variant="outline" className="ml-2">
                        {data?.difficultyLevel || activityData?.difficultyLevel}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {(data?.objectives || activityData?.objectives) && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Objetivos:</label>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                      {data?.objectives || activityData?.objectives}
                    </p>
                  </div>
                )}

                {(data?.quadroInterativoCampoEspecifico || activityData?.quadroInterativoCampoEspecifico) && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Atividade Mostrada:</label>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                      {data?.quadroInterativoCampoEspecifico || activityData?.quadroInterativoCampoEspecifico}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Estatísticas do Quadro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {Object.keys(content || {}).length}
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">Cards Interativos</p>
            </Card>
            
            <Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                <Play className="h-6 w-6 mx-auto" />
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Navegação Interativa</p>
            </Card>
            
            <Card className="p-4 text-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">100%</div>
              <p className="text-sm text-green-700 dark:text-green-300">Responsivo</p>
            </Card>
          </div>

          {/* Recursos Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Recursos do Quadro Interativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Navegação por cards</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Conteúdo personalizado</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Interface responsiva</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Fácil visualização</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

export default QuadroInterativoPreview;
