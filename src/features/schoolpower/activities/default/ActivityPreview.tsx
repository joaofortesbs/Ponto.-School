import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, BookOpen, Users, CheckCircle } from 'lucide-react';

interface ActivityPreviewProps {
  content: any;
  activityData?: any;
}

const ActivityPreview: React.FC<ActivityPreviewProps> = ({ content, activityData }) => {
  console.log('🔍 ActivityPreview - Conteúdo recebido:', content);
  console.log('🔍 ActivityPreview - Dados da atividade:', activityData);

  // Se não há conteúdo, mostrar estado vazio
  if (!content && !activityData) {
    return (
      <div className="flex items-center justify-center h-full dark:bg-gray-800">
        <div className="text-center p-6">
          <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Nenhum conteúdo disponível</h3>
          <p className="text-gray-500 dark:text-gray-400">A atividade ainda não foi gerada.</p>
        </div>
      </div>
    );
  }

  // Extrair informações do conteúdo
  let activityContent = '';
  let activityTitle = activityData?.title || 'Atividade';
  let activityDescription = activityData?.description || '';

  // Se o conteúdo é uma string, usar diretamente
  if (typeof content === 'string') {
    activityContent = content;
  } 
  // Se é um objeto, tentar extrair o conteúdo
  else if (typeof content === 'object' && content !== null) {
    activityContent = content.content || JSON.stringify(content, null, 2);
    activityTitle = content.title || activityTitle;
    activityDescription = content.description || activityDescription;
  } else {
    // Caso content seja nulo ou indefinido mas activityData exista
    activityContent = activityData?.content || JSON.stringify(activityData, null, 2) || '';
  }


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {activityTitle}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {activityDescription}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <Badge variant="secondary" className="dark:bg-gray-700 dark:text-white">
          <BookOpen className="h-4 w-4 mr-1" />
          Atividade Gerada
        </Badge>
        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4 mr-1" />
          45 minutos
        </Badge>
        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
          <Target className="h-4 w-4 mr-1" />
          Nível Médio
        </Badge>
      </div>

      {/* Seção de conteúdo */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Conteúdo da Atividade
        </h2>

        {typeof content === 'string' || (typeof content === 'object' && content !== null && content.content) ? (
          <div 
            className="prose max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: activityContent }}
          />
        ) : (
          <div className="text-gray-700 dark:text-gray-300">
            <pre className="whitespace-pre-wrap font-sans bg-gray-100 dark:bg-gray-800 p-4 rounded border dark:border-gray-600">
              {activityContent}
            </pre>
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      {activityData && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-700 dark:text-gray-300">Informações da Atividade</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-300">
              <div className="space-y-2">
                {activityData.subject && (
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white">Disciplina:</span> {activityData.subject}
                  </div>
                )}
                {activityData.theme && (
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white">Tema:</span> {activityData.theme}
                  </div>
                )}
                {activityData.schoolYear && (
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white">Ano:</span> {activityData.schoolYear}
                  </div>
                )}
                {activityData.difficultyLevel && (
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white">Dificuldade:</span> {activityData.difficultyLevel}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-700 dark:text-gray-300">Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>Atividade gerada com sucesso</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Gerada em {new Date().toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ActivityPreview;