
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityPreviewProps {
  data: any;
}

export default function ActivityPreview({ data = {} }: ActivityPreviewProps) {
  const questions = data.questions || [];
  const totalQuestions = questions.length;
  const totalScore = questions.reduce((sum: number, q: any) => sum + (q.pontuacao || 1), 0);

  return (
    <div className="space-y-4">
      {/* Header da Prova */}
      <Card className="border-[#FF6B00]/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {data.title || 'Prova de Função do 1º Grau'}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {data.instructions || 'Instruções da prova aparecerão aqui...'}
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              Prova
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{data.time_limit || '60'} minutos</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{totalQuestions} questões</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{totalScore} pontos</span>
            </div>
          </div>

          {(data.shuffle_questions || data.show_results) && (
            <div className="mt-4 flex gap-2">
              {data.shuffle_questions && (
                <Badge variant="outline" className="text-xs">
                  Questões embaralhadas
                </Badge>
              )}
              {data.show_results && (
                <Badge variant="outline" className="text-xs">
                  Resultado imediato
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview das Questões */}
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((question: any, index: number) => (
            <Card key={question.id || index} className="border border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Questão {index + 1}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {question.pontuacao || 1} pt{(question.pontuacao || 1) > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {question.enunciado || 'Enunciado da questão aparecerá aqui...'}
                </p>

                {question.type === 'multipla_escolha' && question.alternativas && (
                  <div className="space-y-2">
                    {question.alternativas.map((alt: string, altIndex: number) => (
                      <div 
                        key={altIndex} 
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          question.resposta_correta === altIndex 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                          question.resposta_correta === altIndex 
                            ? 'border-green-500 bg-green-500 text-white' 
                            : 'border-gray-300'
                        }`}>
                          {String.fromCharCode(65 + altIndex)}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {alt || `Alternativa ${String.fromCharCode(65 + altIndex)}`}
                        </span>
                        {question.resposta_correta === altIndex && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'verdadeiro_falso' && (
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <input type="radio" name={`vf_${index}`} disabled />
                      <span className="text-sm">Verdadeiro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" name={`vf_${index}`} disabled />
                      <span className="text-sm">Falso</span>
                    </div>
                  </div>
                )}

                {question.type === 'dissertativa' && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 italic">
                      Espaço para resposta dissertativa
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Adicione questões para visualizar a prova
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Botão de Ação */}
      {questions.length > 0 && (
        <Card className="bg-gradient-to-r from-[#FF6B00]/10 to-[#E55A00]/10 border-[#FF6B00]/20">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Prova Pronta para Aplicação
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalQuestions} questões • {totalScore} pontos • {data.time_limit || 60} minutos
              </p>
            </div>
            <Button className="bg-[#FF6B00] hover:bg-[#E55A00] text-white">
              Aplicar Prova
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
