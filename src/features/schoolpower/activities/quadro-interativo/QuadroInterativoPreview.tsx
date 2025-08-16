
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Clock, Users, Target, BookOpen, CheckCircle, User, Calendar } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  console.log('🖼️ QuadroInterativoPreview - data:', data);
  console.log('🖼️ QuadroInterativoPreview - activityData:', activityData);

  // Buscar conteúdo gerado no localStorage
  const constructedDataJson = localStorage.getItem(`activity_content_${activityData?.id || 'quadro-interativo'}`);
  let generatedContent = null;
  
  if (constructedDataJson) {
    try {
      const constructedData = JSON.parse(constructedDataJson);
      generatedContent = constructedData;
      console.log('🖼️ Conteúdo construído encontrado:', generatedContent);
    } catch (error) {
      console.error('Erro ao parse do conteúdo construído:', error);
    }
  }

  // Extrair dados dos campos customizados
  const customFields = activityData?.customFields || data?.customFields || {};
  
  // Dados básicos da atividade
  const activityInfo = {
    title: generatedContent?.titulo || data?.title || activityData?.title || 'Quadro Interativo',
    description: generatedContent?.descricao || data?.description || activityData?.description || '',
    subject: customFields['Disciplina / Área de conhecimento'] || customFields['Disciplina'] || 'Disciplina',
    schoolYear: customFields['Ano / Série'] || customFields['Ano'] || 'Ano/Série',
    theme: customFields['Tema ou Assunto da aula'] || customFields['Tema'] || 'Tema da Aula',
    objectives: customFields['Objetivo de aprendizagem da aula'] || customFields['Objetivos'] || 'Objetivos de Aprendizagem',
    difficultyLevel: customFields['Nível de Dificuldade'] || 'Médio',
    activity: customFields['Atividade mostrada'] || 'Atividade Interativa'
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'fácil':
      case 'básico':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'médio':
      case 'intermediário':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'difícil':
      case 'avançado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  // Se não há conteúdo gerado, mostrar estado de carregamento
  if (!generatedContent) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-l-4 border-l-purple-500 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activityInfo.title}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Atividade de Quadro Interativo
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`px-3 py-1 ${getDifficultyColor(activityInfo.difficultyLevel)}`}
                >
                  {activityInfo.difficultyLevel}
                </Badge>
              </div>
              {activityInfo.description && (
                <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                  {activityInfo.description}
                </p>
              )}
            </CardHeader>
          </Card>

          <div className="text-center p-8">
            <div className="animate-pulse">
              <Monitor className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Processando Conteúdo
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                O conteúdo do Quadro Interativo está sendo gerado...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {generatedContent.titulo || activityInfo.title}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Atividade de Quadro Interativo
                  </p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={`px-3 py-1 ${getDifficultyColor(activityInfo.difficultyLevel)}`}
              >
                {activityInfo.difficultyLevel}
              </Badge>
            </div>
            {generatedContent.descricao && (
              <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                {generatedContent.descricao}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Informações da Atividade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disciplina</p>
                <p className="text-gray-900 dark:text-white">{activityInfo.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ano/Série</p>
                <p className="text-gray-900 dark:text-white">{activityInfo.schoolYear}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tema</p>
                <p className="text-gray-900 dark:text-white">{activityInfo.theme}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Detalhes da Atividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo de Atividade</p>
                <p className="text-gray-900 dark:text-white">{activityInfo.activity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duração Estimada</p>
                <p className="text-gray-900 dark:text-white flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  45 minutos
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Público-alvo</p>
                <p className="text-gray-900 dark:text-white flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Estudantes do {activityInfo.schoolYear}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Objetivos de Aprendizagem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              Objetivos de Aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {activityInfo.objectives}
            </p>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        {generatedContent.conteudo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-purple-500" />
                Conteúdo da Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {generatedContent.conteudo}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recursos e Materiais */}
        {generatedContent.recursos && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Recursos Necessários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {generatedContent.recursos}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        {generatedContent.instrucoes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Instruções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {generatedContent.instrucoes}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-center">
              <div className="space-y-2">
                <p className="text-purple-700 dark:text-purple-300 font-medium">
                  Atividade de Quadro Interativo gerada com IA
                </p>
                <p className="text-purple-600 dark:text-purple-400 text-sm">
                  Use o quadro digital para engajar os alunos de forma interativa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Construção */}
        {activityData?.builtAt && (
          <Card className="mt-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Construído em: {new Date(activityData.builtAt).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Atualizado: {new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuadroInterativoPreview;
