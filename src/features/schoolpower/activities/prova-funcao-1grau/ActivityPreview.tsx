
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Award } from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple_choice' | 'open' | 'true_false';
  statement: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface ProvaData {
  title: string;
  description: string;
  subject: string;
  duration: number;
  totalPoints: number;
  instructions: string;
  questions: Question[];
}

interface ActivityPreviewProps {
  data: Partial<ProvaData>;
}

export default function ActivityPreview({ data }: ActivityPreviewProps) {
  const totalQuestions = data.questions?.length || 0;
  const totalPoints = data.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header da Prova */}
      <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {data.subject || 'Disciplina'}
            </Badge>
          </div>
          <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
            {data.title || 'Título da Prova'}
          </CardTitle>
          <p className="text-blue-700 dark:text-blue-300 mt-2">
            {data.description || 'Descrição da prova'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{data.duration || 0} minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{totalQuestions} questões</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{totalPoints} pontos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      {data.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {data.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Questões */}
      <div className="space-y-4">
        {data.questions?.map((question, index) => (
          <Card key={question.id} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  Questão {index + 1}
                </h3>
                <Badge variant="outline">
                  {question.points} {question.points === 1 ? 'ponto' : 'pontos'}
                </Badge>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {question.statement || 'Enunciado da questão...'}
                </p>
              </div>

              {question.type === 'multiple_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {option || `Alternativa ${String.fromCharCode(65 + optIndex)}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'open' && (
                <div className="mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                    Espaço para resposta dissertativa
                  </div>
                </div>
              )}

              {question.type === 'true_false' && (
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span>Verdadeiro</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span>Falso</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )) || (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma questão criada</p>
              <p className="text-sm text-center">
                As questões que você adicionar aparecerão aqui em tempo real
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rodapé */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Prova gerada pelo School Power • Ponto School</p>
            <p className="mt-1">Total: {totalQuestions} questões • {totalPoints} pontos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
