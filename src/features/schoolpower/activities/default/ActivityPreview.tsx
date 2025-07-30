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
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum conteúdo disponível</h3>
          <p className="text-gray-500">A atividade ainda não foi gerada.</p>
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
  else if (typeof content === 'object') {
    activityContent = content.content || JSON.stringify(content, null, 2);
    activityTitle = content.title || activityTitle;
    activityDescription = content.description || activityDescription;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header da atividade */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {activityTitle}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">
              <BookOpen className="h-4 w-4 mr-1" />
              Atividade Gerada
            </Badge>
            <Badge variant="outline">
              <Clock className="h-4 w-4 mr-1" />
              45 minutos
            </Badge>
            <Badge variant="outline">
              <Target className="h-4 w-4 mr-1" />
              Nível Médio
            </Badge>
          </div>

          {activityDescription && (
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              {activityDescription}
            </p>
          )}
        </div>

        {/* Conteúdo da atividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Conteúdo da Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {activityContent}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        {activityData && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações da Atividade</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  {activityData.subject && (
                    <div>
                      <span className="font-medium">Disciplina:</span> {activityData.subject}
                    </div>
                  )}
                  {activityData.theme && (
                    <div>
                      <span className="font-medium">Tema:</span> {activityData.theme}
                    </div>
                  )}
                  {activityData.schoolYear && (
                    <div>
                      <span className="font-medium">Ano:</span> {activityData.schoolYear}
                    </div>
                  )}
                  {activityData.difficultyLevel && (
                    <div>
                      <span className="font-medium">Dificuldade:</span> {activityData.difficultyLevel}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Atividade gerada com sucesso</span>
                </div>
                <p className="text-gray-500 mt-2">
                  Gerada em {new Date().toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPreview;