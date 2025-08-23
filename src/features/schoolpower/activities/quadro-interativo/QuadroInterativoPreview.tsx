
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Target, 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle,
  PlayCircle,
  Settings,
  Lightbulb
} from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  // Extrair dados do formulário ou conteúdo gerado
  const previewData = {
    title: data.title || data.personalizedTitle || 'Quadro Interativo',
    description: data.description || data.personalizedDescription || '',
    subject: data.subject || 'Disciplina',
    schoolYear: data.schoolYear || 'Ano/Série',
    theme: data.theme || 'Tema da Aula',
    objectives: data.objectives || 'Objetivos de Aprendizagem',
    difficultyLevel: data.difficultyLevel || 'Médio',
    activityShown: data.quadroInterativoCampoEspecifico || 'Atividade Interativa',
    materials: data.materials || 'Materiais não especificados',
    timeLimit: data.timeLimit || '45 minutos',
    instructions: data.instructions || 'Instruções a serem definidas',
    evaluation: data.evaluation || 'Critérios de avaliação a serem definidos',
    context: data.context || 'Contexto de aplicação geral',
    // Dados gerados pela IA
    cardContent: data.cardContent || {
      title: 'Conteúdo do Quadro',
      text: 'Conteúdo educativo será exibido aqui após a geração pela IA.'
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'básico':
      case 'fácil':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediário':
      case 'médio':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'avançado':
      case 'difícil':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

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
                    {previewData.title}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Atividade de Quadro Interativo
                  </p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={`px-3 py-1 ${getDifficultyColor(previewData.difficultyLevel)}`}
              >
                {previewData.difficultyLevel}
              </Badge>
            </div>
            {previewData.description && (
              <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                {previewData.description}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Informações Básicas */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Informações da Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Disciplina
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {previewData.subject}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ano/Série
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {previewData.schoolYear}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tempo Estimado
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900 dark:text-white font-medium">
                    {previewData.timeLimit}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Quadro Visível - PRINCIPAL */}
        <Card className="shadow-lg border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-blue-700 dark:text-blue-300">
              <Lightbulb className="h-6 w-6" />
              Card de Quadro Visível
            </CardTitle>
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              Conteúdo gerado pela IA para exibição no quadro interativo
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-inner border border-blue-200 dark:border-blue-700">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {previewData.cardContent.title}
                </h3>
                <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  {previewData.cardContent.text}
                </p>
              </div>
              
              {/* Indicador de IA */}
              <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Conteúdo gerado por IA</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tema e Objetivos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-green-600" />
                Tema da Aula
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {previewData.theme}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Objetivos de Aprendizagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {previewData.objectives}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Atividade Interativa */}
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlayCircle className="h-5 w-5 text-blue-600" />
              Atividade no Quadro Interativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {previewData.activityShown}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Materiais e Instruções */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-orange-600" />
                Materiais Necessários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  // Verificar se materials é uma string
                  if (typeof previewData.materials === 'string') {
                    const materialsList = previewData.materials.split('\n').filter(m => m.trim());
                    if (materialsList.length > 0) {
                      return materialsList.map((material, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {material.trim()}
                          </p>
                        </div>
                      ));
                    }
                  }
                  // Se materials é um array
                  else if (Array.isArray(previewData.materials)) {
                    if (previewData.materials.length > 0) {
                      return previewData.materials.map((material, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {typeof material === 'string' ? material : String(material)}
                          </p>
                        </div>
                      ));
                    }
                  }
                  // Fallback para materiais não especificados
                  return (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Materiais não especificados
                    </p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-purple-600" />
                Instruções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {previewData.instructions}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Avaliação e Contexto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Critérios de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {previewData.evaluation}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Contexto de Aplicação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {previewData.context}
              </p>
            </CardContent>
          </Card>
        </div>

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
      </div>
    </div>
  );
};

export default QuadroInterativoPreview;
