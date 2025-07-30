import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Clock, FileText, CheckCircle } from 'lucide-react';
import { BookOpen, Target, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice' | 'essay' | 'true-false';
  number: number;
  text: string;
  difficulty: string;
  points: number;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  expectedLength?: string;
  correctAnswer?: boolean;
}

interface ExerciseListData {
  title: string;
  description: string;
  subject: string;
  theme: string;
  schoolYear: string;
  numberOfQuestions: number;
  difficultyLevel: string;
  questionModel: string;
  sources: string;
  questions: Question[];
}

interface ExerciseListPreviewProps {
  content: any;
  activityData?: any;
}

const ExerciseListPreview: React.FC<ExerciseListPreviewProps> = ({ content, activityData }) => {
  console.log('🔍 ExerciseListPreview - Conteúdo recebido:', content);
  console.log('🔍 ExerciseListPreview - Dados da atividade:', activityData);

  // Verificação mais robusta do conteúdo
  if (!content) {
    console.log('⚠️ ExerciseListPreview - Conteúdo não fornecido');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum conteúdo disponível</h3>
          <p className="text-gray-500">A lista de exercícios ainda não foi gerada.</p>
        </div>
      </div>
    );
  }

  // Tentar extrair questões de diferentes estruturas possíveis
  let questions = [];
  let exerciseTitle = '';
  let exerciseDescription = '';
  let metadata = {};

  try {
    // Verificar se é uma string JSON que precisa ser parseada
    if (typeof content === 'string') {
      try {
        const parsedContent = JSON.parse(content);
        content = parsedContent;
      } catch (parseError) {
        console.log('⚠️ Conteúdo é string mas não é JSON válido:', parseError);
        // Se não for JSON, tratar como texto simples
        return (
          <div className="p-6 bg-white dark:bg-gray-800 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Lista de Exercícios
                </h1>
                <Badge variant="secondary" className="mb-4">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Conteúdo Gerado
                </Badge>
              </div>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {content}
                </pre>
              </div>
            </div>
          </div>
        );
      }
    }

    // Extrair dados de diferentes estruturas possíveis
    if (content.questions) {
      questions = Array.isArray(content.questions) ? content.questions : [];
    } else if (content.exercicios) {
      questions = Array.isArray(content.exercicios) ? content.exercicios : [];
    } else if (content.items) {
      questions = Array.isArray(content.items) ? content.items : [];
    } else if (Array.isArray(content)) {
      questions = content;
    }

    // Extrair título e descrição
    exerciseTitle = content.title || content.titulo || content.nome || activityData?.title || 'Lista de Exercícios';
    exerciseDescription = content.description || content.descricao || content.objetivo || activityData?.description || '';

    // Extrair metadados
    metadata = content.metadata || content.info || {};

    console.log('✅ Dados extraídos:', {
      questionsCount: questions.length,
      exerciseTitle,
      exerciseDescription,
      metadata
    });

  } catch (error) {
    console.error('❌ Erro ao processar conteúdo:', error);
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar conteúdo</h3>
          <p className="text-gray-500">Houve um problema ao processar a lista de exercícios.</p>
          <details className="mt-4 text-xs text-gray-400">
            <summary>Detalhes técnicos</summary>
            <pre className="mt-2 text-left bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // Se não há questões, mostrar estado vazio
  if (!questions || questions.length === 0) {
    console.log('⚠️ Nenhuma questão encontrada no conteúdo');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Lista vazia</h3>
          <p className="text-gray-500">Nenhuma questão foi encontrada na lista de exercícios.</p>
          <details className="mt-4 text-xs text-gray-400">
            <summary>Conteúdo recebido</summary>
            <pre className="mt-2 text-left bg-gray-100 dark:bg-gray-700 p-2 rounded max-h-32 overflow-auto">
              {JSON.stringify(content, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header da Lista */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {exerciseTitle}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">
              <BookOpen className="h-4 w-4 mr-1" />
              {questions.length} questões
            </Badge>
            {metadata?.estimatedTime && (
              <Badge variant="outline">
                <Clock className="h-4 w-4 mr-1" />
                {metadata.estimatedTime}
              </Badge>
            )}
            {metadata?.difficulty && (
              <Badge variant="outline">
                <Target className="h-4 w-4 mr-1" />
                {metadata.difficulty}
              </Badge>
            )}
          </div>

          {exerciseDescription && (
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              {exerciseDescription}
            </p>
          )}
        </div>

        {/* Lista de Questões */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            // Validar estrutura da questão
            if (!question || typeof question !== 'object') {
              console.log(`⚠️ Questão ${index + 1} inválida:`, question);
              return (
                <Card key={index} className="border border-red-200 dark:border-red-700">
                  <CardContent className="p-4">
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>Questão {index + 1}: Estrutura inválida</span>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Extrair dados da questão com fallbacks
            const questionText = question.question || question.enunciado || question.text || question.pergunta || '';
            const questionOptions = question.options || question.alternativas || question.choices || [];
            const questionAnswer = question.answer || question.gabarito || question.resposta || question.correctAnswer || '';
            const questionExplanation = question.explanation || question.explicacao || question.explicacao || question.justificativa || '';
            const questionType = question.type || question.tipo || (questionOptions.length > 0 ? 'Múltipla Escolha' : 'Dissertativa');

            return (
              <Card key={index} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    Questão {index + 1}
                    {questionType && (
                      <Badge variant="outline" className="ml-auto">
                        {questionType}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enunciado */}
                  {questionText && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Enunciado:</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {questionText}
                      </p>
                    </div>
                  )}

                  {/* Alternativas (se existirem) */}
                  {questionOptions && questionOptions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Alternativas:</h4>
                      <div className="space-y-2">
                        {questionOptions.map((option, optionIndex) => {
                          const optionText = typeof option === 'string' ? option :
                            option?.text || option?.option || option?.alternativa ||
                            `Alternativa ${optionIndex + 1}`;

                          return (
                            <div key={optionIndex} className="flex items-start space-x-2">
                              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="text-gray-700 dark:text-gray-300 flex-1">
                                {optionText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Resposta/Gabarito */}
                  {questionAnswer && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Resposta:</h4>
                      <p className="text-green-700 dark:text-green-200 text-sm">
                        {questionAnswer}
                      </p>
                    </div>
                  )}

                  {/* Explicação */}
                  {questionExplanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Explicação:</h4>
                      <p className="text-blue-700 dark:text-blue-200 text-sm">
                        {questionExplanation}
                      </p>
                    </div>
                  )}

                  {/* Se a questão não tem conteúdo suficiente, mostrar aviso */}
                  {!questionText && !questionOptions.length && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-center text-yellow-800 dark:text-yellow-300">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">Esta questão não possui conteúdo suficiente para ser exibida.</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExerciseListPreview;