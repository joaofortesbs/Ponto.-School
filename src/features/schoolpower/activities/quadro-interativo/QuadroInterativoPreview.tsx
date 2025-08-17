
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  Monitor,
  Users,
  Settings,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData 
}) => {
  // Função para extrair dados consolidados
  const getPreviewData = () => {
    // Priorizar dados processados, depois dados diretos, depois fallback
    const consolidated = {
      title: data?.title || activityData?.title || activityData?.personalizedTitle || 'Quadro Interativo',
      description: data?.description || activityData?.description || activityData?.personalizedDescription || 'Atividade de Quadro Interativo',
      subject: data?.subject || activityData?.customFields?.['Disciplina / Área de conhecimento'] || activityData?.customFields?.disciplina || 'Matemática',
      schoolYear: data?.schoolYear || activityData?.customFields?.['Ano / Série'] || activityData?.customFields?.anoSerie || '6º Ano',
      theme: data?.theme || activityData?.customFields?.['Tema ou Assunto da aula'] || activityData?.customFields?.tema || 'Conteúdo Interativo',
      objectives: data?.objectives || activityData?.customFields?.['Objetivo de aprendizagem da aula'] || activityData?.customFields?.objetivos || 'Desenvolver habilidades através de atividades interativas',
      difficultyLevel: data?.difficultyLevel || activityData?.customFields?.['Nível de Dificuldade'] || 'Intermediário',
      quadroInterativoCampoEspecifico: data?.quadroInterativoCampoEspecifico || activityData?.customFields?.['Atividade mostrada'] || activityData?.customFields?.quadroInterativoCampoEspecifico || 'Atividade interativa no quadro',
      timeLimit: data?.timeLimit || activityData?.customFields?.['Tempo Estimado'] || '45 minutos',
      materials: data?.materials || activityData?.customFields?.['Materiais'] || 'Quadro interativo, computador, projetor',
      instructions: data?.instructions || activityData?.customFields?.['Instruções'] || 'Siga as orientações apresentadas no quadro interativo',
      evaluation: data?.evaluation || activityData?.customFields?.['Avaliação'] || 'Participação e engajamento durante a atividade'
    };

    return consolidated;
  };

  const previewData = getPreviewData();

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Principal */}
        <Card className="border-l-4 border-l-[#FF6B00] shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white">
            <div className="flex items-center gap-3">
              <Monitor className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl font-bold">{previewData.title}</CardTitle>
                <p className="text-orange-100 mt-1">{previewData.description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FF6B00]" />
                Informações da Disciplina
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Disciplina:</span>
                <Badge variant="secondary">{previewData.subject}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Ano/Série:</span>
                <Badge variant="outline">{previewData.schoolYear}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tema:</span>
                <span className="font-medium text-sm">{previewData.theme}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#FF6B00]" />
                Configurações da Atividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Dificuldade:</span>
                <Badge 
                  variant={
                    previewData.difficultyLevel === 'Fácil' ? 'default' : 
                    previewData.difficultyLevel === 'Médio' ? 'secondary' : 'destructive'
                  }
                >
                  {previewData.difficultyLevel}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Duração:</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{previewData.timeLimit}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Modalidade:</span>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Interativa
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Objetivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FF6B00]" />
              Objetivos de Aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {previewData.objectives}
            </p>
          </CardContent>
        </Card>

        {/* Atividade Específica do Quadro */}
        <Card className="border-2 border-[#FF6B00]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#FF6B00]">
              <PlayCircle className="w-6 h-6" />
              Atividade do Quadro Interativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                Atividade Principal
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {previewData.quadroInterativoCampoEspecifico}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recursos e Materiais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF6B00]" />
              Recursos Necessários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Materiais:</h5>
                <p className="text-gray-600 dark:text-gray-400">{previewData.materials}</p>
              </div>
              <Separator />
              <div>
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Instruções:</h5>
                <p className="text-gray-600 dark:text-gray-400">{previewData.instructions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critérios de Avaliação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#FF6B00]" />
              Critérios de Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {previewData.evaluation}
            </p>
          </CardContent>
        </Card>

        {/* Status de Construção */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
              <CheckCircle className="w-6 h-6" />
              <div>
                <h4 className="font-semibold">Atividade Construída com Sucesso!</h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  O quadro interativo foi configurado e está pronto para uso.
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
