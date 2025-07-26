
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Target, Award } from 'lucide-react';

interface ActivityPreviewProps {
  activityData?: any;
}

export default function ActivityPreview({ activityData }: ActivityPreviewProps) {
  const data = activityData || {
    title: 'Lista de Exercícios - Funções do 1° Grau',
    description: 'Lista com exercícios variados sobre funções do primeiro grau',
    subject: 'Matemática',
    grade: '1º Ano do Ensino Médio',
    duration: '50 minutos',
    difficulty: 'Intermediário',
    exercises: []
  };

  const totalPoints = data.exercises?.reduce((sum: number, ex: any) => sum + (ex.points || 1), 0) || 0;

  return (
    <div className="space-y-6 p-4">
      {/* Cabeçalho */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-600">{data.subject}</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {data.title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {data.description}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{data.duration}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{data.difficulty}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Award className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{totalPoints} pontos</span>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Leia cada questão com atenção antes de responder</li>
            <li>• Todas as questões são obrigatórias</li>
            <li>• Marque apenas uma alternativa nas questões de múltipla escolha</li>
            <li>• Justifique suas respostas nas questões abertas</li>
            <li>• Tempo total disponível: {data.duration}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Exercícios */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Exercícios ({data.exercises?.length || 0})
        </h2>
        
        {data.exercises?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhum exercício foi adicionado ainda.</p>
              <p className="text-sm text-gray-400 mt-1">
                Use o editor para adicionar exercícios a esta lista.
              </p>
            </CardContent>
          </Card>
        ) : (
          data.exercises?.map((exercise: any, index: number) => (
            <Card key={exercise.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Questão {index + 1}</Badge>
                    <Badge variant="secondary">{exercise.points} {exercise.points === 1 ? 'ponto' : 'pontos'}</Badge>
                  </div>
                  <Badge 
                    variant={
                      exercise.type === 'multiple-choice' ? 'default' :
                      exercise.type === 'open' ? 'secondary' : 'outline'
                    }
                  >
                    {exercise.type === 'multiple-choice' ? 'Múltipla Escolha' :
                     exercise.type === 'open' ? 'Questão Aberta' : 'Verdadeiro/Falso'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 dark:text-white font-medium mb-4">
                  {exercise.question || 'Pergunta não definida'}
                </p>

                {exercise.type === 'multiple-choice' && exercise.options && (
                  <div className="space-y-2">
                    {exercise.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <span>{option || `Alternativa ${String.fromCharCode(65 + optIndex)}`}</span>
                      </div>
                    ))}
                  </div>
                )}

                {exercise.type === 'open' && (
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 mb-2">Espaço para resposta:</p>
                    <div className="h-20 border-2 border-dashed border-gray-300 rounded"></div>
                  </div>
                )}

                {exercise.type === 'true-false' && (
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                      <span>Verdadeiro</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                      <span>Falso</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rodapé */}
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="text-center py-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Boa sorte! Lembre-se de revisar suas respostas antes de finalizar.
          </p>
          <div className="mt-4">
            <Button size="lg">
              Finalizar Lista de Exercícios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
