
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Clock, FileText, CheckCircle } from 'lucide-react';

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
  exerciseData: ExerciseListData;
}

export const ExerciseListPreview: React.FC<ExerciseListPreviewProps> = ({ exerciseData }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const currentQuestion = exerciseData.questions[currentQuestionIndex];
  const totalPoints = exerciseData.questions.reduce((sum, q) => sum + q.points, 0);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < exerciseData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderQuestionContent = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {question.text}
            </p>
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="space-y-3"
            >
              {question.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                  <Label htmlFor={`${question.id}-${option.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{option.id.toUpperCase()})</span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {question.text}
            </p>
            {question.expectedLength && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Extensão esperada: {question.expectedLength}
              </p>
            )}
            <Textarea
              placeholder="Digite sua resposta aqui..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {question.text}
            </p>
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value === 'true')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <RadioGroupItem value="true" id={`${question.id}-true`} />
                <Label htmlFor={`${question.id}-true`} className="cursor-pointer font-medium">
                  Verdadeiro
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <RadioGroupItem value="false" id={`${question.id}-false`} />
                <Label htmlFor={`${question.id}-false`} className="cursor-pointer font-medium">
                  Falso
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar com lista de questões */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 pr-6">
        <div className="sticky top-0">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Lista de Questões</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {exerciseData.questions.length} questões
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {totalPoints} pontos
              </span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {exerciseData.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => goToQuestion(index)}
                className={`w-full p-3 text-left border rounded-lg transition-all ${
                  currentQuestionIndex === index
                    ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Questão {question.number}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {question.points} {question.points === 1 ? 'pt' : 'pts'}
                    </Badge>
                    {answers[question.id] && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Badge variant="secondary" className="text-xs">
                    {question.type === 'multiple-choice' ? 'Múltipla Escolha' :
                     question.type === 'essay' ? 'Dissertativa' :
                     'Verdadeiro/Falso'}
                  </Badge>
                  <span>{question.difficulty}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Área principal da questão */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{exerciseData.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {exerciseData.subject} • {exerciseData.theme} • {exerciseData.schoolYear}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {exerciseData.difficultyLevel}
                </Badge>
                <Badge variant="secondary">
                  Questão {currentQuestion.number} de {exerciseData.questions.length}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  Questão {currentQuestion.number}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {currentQuestion.points} {currentQuestion.points === 1 ? 'ponto' : 'pontos'}
                  </Badge>
                  <Badge 
                    variant={
                      currentQuestion.type === 'multiple-choice' ? 'default' :
                      currentQuestion.type === 'essay' ? 'secondary' : 'outline'
                    }
                  >
                    {currentQuestion.type === 'multiple-choice' ? 'Múltipla Escolha' :
                     currentQuestion.type === 'essay' ? 'Dissertativa' :
                     'Verdadeiro/Falso'}
                  </Badge>
                </div>
              </div>

              {renderQuestionContent(currentQuestion)}
            </div>

            {/* Navegação entre questões */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Object.keys(answers).length} de {exerciseData.questions.length} respondidas
                </span>
              </div>

              <Button
                variant="outline"
                onClick={nextQuestion}
                disabled={currentQuestionIndex === exerciseData.questions.length - 1}
                className="flex items-center gap-2"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé com ações */}
        <div className="mt-4 flex justify-center">
          <Button size="lg" className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
            Finalizar Lista de Exercícios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseListPreview;
