
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, FileText, Target, BookOpen, CheckCircle2, Users } from 'lucide-react';

interface ActivityPreviewProps {
  activityData?: any;
  activityId?: string;
}

export default function ActivityPreview({ activityData, activityId }: ActivityPreviewProps) {
  if (!activityData) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum dado disponível
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Configure a atividade na aba Editor para visualizar a prévia.
        </p>
      </div>
    );
  }

  const {
    title,
    description,
    difficulty,
    timeLimit,
    instructions,
    materials,
    questions,
    rubric,
    objective,
    targetAudience
  } = activityData;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Atividade */}
      <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title || 'Título da Atividade'}
        </h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="flex items-center justify-center space-x-4 mt-4">
          {difficulty && (
            <Badge 
              variant={difficulty === 'Fácil' ? 'default' : difficulty === 'Médio' ? 'secondary' : 'destructive'}
            >
              {difficulty}
            </Badge>
          )}
          {timeLimit && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {timeLimit} minutos
            </div>
          )}
          {questions?.length > 0 && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4 mr-1" />
              {questions.length} questões
            </div>
          )}
        </div>
      </div>

      {/* Objetivo */}
      {objective && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{objective}</p>
          </CardContent>
        </Card>
      )}

      {/* Público-Alvo */}
      {targetAudience && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Público-Alvo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{targetAudience}</p>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      {instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Instruções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {instructions}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materiais */}
      {materials?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Materiais Necessários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {materials.map((material: string, index: number) => (
                material && (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{material}</span>
                  </li>
                )
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Questões */}
      {questions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questões da Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question: any, index: number) => (
              <div key={question.id || index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Questão {index + 1}</Badge>
                  <Badge variant="secondary">{question.type || 'multiple-choice'}</Badge>
                </div>
                
                {question.text && (
                  <p className="font-medium text-gray-900 dark:text-white mb-3">
                    {question.text}
                  </p>
                )}

                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-1 mb-3">
                    {question.options.map((option: string, optIndex: number) => (
                      option && (
                        <div
                          key={optIndex}
                          className={`p-2 rounded border ${
                            question.correctAnswer === optIndex
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                              : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)})
                          </span>
                          {option}
                          {question.correctAnswer === optIndex && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Correta
                            </Badge>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {question.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Explicação:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {question.explanation}
                    </p>
                  </div>
                )}

                {index < questions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Critérios de Avaliação */}
      {rubric && (
        <Card>
          <CardHeader>
            <CardTitle>Critérios de Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {rubric}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há dados */}
      {!title && !description && !instructions && (!materials || materials.length === 0) && 
       (!questions || questions.length === 0) && !rubric && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Atividade em Branco
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure os campos na aba Editor para visualizar o conteúdo da atividade aqui.
          </p>
        </div>
      )}
    </div>
  );
}
import React from 'react';

interface ActivityPreviewProps {
  [key: string]: any;
}

const ActivityPreview: React.FC<ActivityPreviewProps> = (props) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Pré-visualização da Atividade
        </h3>
        <p className="text-gray-500">
          Este componente está em desenvolvimento
        </p>
      </div>
    </div>
  );
};

export default ActivityPreview;
