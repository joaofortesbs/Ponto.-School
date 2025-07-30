
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

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
        </div>
      </div>
    );
  }

  // Normalizar questões para garantir estrutura consistente
  const normalizedQuestions = questions.map((question, index) => {
    if (!question || typeof question !== 'object') {
      return {
        id: `q${index + 1}`,
        number: index + 1,
        text: `Questão ${index + 1}`,
        type: 'multiple-choice',
        difficulty: 'Médio',
        points: 1,
        options: []
      };
    }

    // Extrair dados da questão com fallbacks
    const questionText = question.question || question.enunciado || question.text || question.pergunta || `Questão ${index + 1}`;
    const questionOptions = question.options || question.alternativas || question.choices || [];
    const questionType = question.type || question.tipo || (questionOptions.length > 0 ? 'multiple-choice' : 'essay');

    return {
      id: question.id || `q${index + 1}`,
      number: index + 1,
      text: questionText,
      type: questionType,
      difficulty: question.difficulty || question.dificuldade || 'Médio',
      points: question.points || question.pontos || 1,
      options: questionOptions,
      answer: question.answer || question.gabarito || question.resposta || question.correctAnswer || '',
      explanation: question.explanation || question.explicacao || question.justificativa || ''
    };
  });

  const currentQuestion = normalizedQuestions[currentQuestionIndex];

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < normalizedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Sidebar com lista de questões */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header da sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {exerciseTitle}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <BookOpen className="h-4 w-4" />
            <span>{normalizedQuestions.length} questões</span>
          </div>
        </div>

        {/* Lista de questões */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {normalizedQuestions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => goToQuestion(index)}
                className={`w-full text-left p-3 mb-2 rounded-lg border transition-all duration-200 ${
                  currentQuestionIndex === index
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    Questão {question.number}
                  </span>
                  {answers[question.id] && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className={`text-xs line-clamp-2 ${
                  currentQuestionIndex === index 
                    ? 'text-orange-100' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {question.text.substring(0, 80)}...
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      currentQuestionIndex === index 
                        ? 'border-orange-200 text-orange-100' 
                        : 'border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {question.type === 'multiple-choice' ? 'Múltipla Escolha' : 
                     question.type === 'essay' ? 'Dissertativa' : 'V/F'}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer da sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progresso</span>
            <span>{Object.keys(answers).length}/{normalizedQuestions.length}</span>
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-[#FF6B00] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / normalizedQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Área principal da questão */}
      <div className="flex-1 flex flex-col">
        {/* Header da questão */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF6B00] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                {currentQuestion.number}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Questão {currentQuestion.number}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    <Target className="h-3 w-3 mr-1" />
                    {currentQuestion.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {currentQuestion.points} {currentQuestion.points === 1 ? 'ponto' : 'pontos'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextQuestion}
                disabled={currentQuestionIndex === normalizedQuestions.length - 1}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo da questão */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Enunciado:</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-6">
                {currentQuestion.text}
              </p>

              {/* Renderizar baseado no tipo de questão */}
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && currentQuestion.options.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Alternativas:</h4>
                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, index) => {
                      const optionText = typeof option === 'string' ? option : option.text || `Alternativa ${index + 1}`;
                      const optionValue = String.fromCharCode(65 + index);
                      
                      return (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <RadioGroupItem value={optionValue} id={`option-${index}`} className="mt-1" />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            <span className="font-medium text-[#FF6B00] mr-2">
                              {optionValue})
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {optionText}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}

              {currentQuestion.type === 'essay' && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Sua resposta:</h4>
                  <Textarea
                    placeholder="Digite sua resposta aqui..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="min-h-[120px]"
                  />
                  {currentQuestion.expectedLength && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Extensão esperada: {currentQuestion.expectedLength}
                    </p>
                  )}
                </div>
              )}

              {currentQuestion.type === 'true-false' && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Sua resposta:</h4>
                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="cursor-pointer">Verdadeiro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="cursor-pointer">Falso</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Explicação da questão (se disponível) */}
              {currentQuestion.explanation && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Explicação:</h4>
                  <p className="text-blue-700 dark:text-blue-200 text-sm">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer com ações */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Questão {currentQuestionIndex + 1} de {normalizedQuestions.length}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === normalizedQuestions.length - 1}
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseListPreview;
