import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, Play, RotateCcw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multipla-escolha' | 'verdadeiro-falso';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizInterativoPreviewProps {
  content?: {
    title?: string;
    description?: string;
    questions?: QuizQuestion[];
    timePerQuestion?: number;
    totalQuestions?: number;
    isGeneratedByAI?: boolean;
    isFallback?: boolean;
  };
  isLoading?: boolean;
}

const QuizInterativoPreview: React.FC<QuizInterativoPreviewProps> = ({ 
  content, 
  isLoading = false 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  // Log detalhado para debug e validação de dados
  useEffect(() => {
    console.log('🎯 QuizInterativoPreview - Conteúdo atualizado:', {
      content,
      hasContent: !!content,
      hasQuestions: !!(content?.questions),
      questionsCount: content?.questions?.length || 0,
      isLoading,
      title: content?.title,
      isGeneratedByAI: content?.isGeneratedByAI,
      isFallback: content?.isFallback,
      questionsStructure: content?.questions?.map(q => ({
        id: q.id,
        hasQuestion: !!q.question,
        hasOptions: !!q.options,
        optionsCount: q.options?.length || 0,
        hasCorrectAnswer: !!q.correctAnswer
      }))
    });

    // Validação crítica de estrutura de dados
    if (content?.questions) {
      const invalidQuestions = content.questions.filter(q => 
        !q.question || !q.options || q.options.length === 0 || !q.correctAnswer
      );

      if (invalidQuestions.length > 0) {
        console.error('❌ Questões com estrutura inválida encontradas:', invalidQuestions);
      } else {
        console.log('✅ Todas as questões têm estrutura válida');
      }
    }
  }, [content, isLoading]);

  // Timer effect
  useEffect(() => {
    if (isQuizStarted && !isQuizCompleted && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
  }, [timeLeft, isQuizStarted, isQuizCompleted, showResult]);

  // Reset timer when question changes
  useEffect(() => {
    if (finalContent && isQuizStarted) {
      const timePerQ = finalContent.timePerQuestion && !isNaN(Number(finalContent.timePerQuestion)) ? 
        Number(finalContent.timePerQuestion) : 60;
      setTimeLeft(timePerQ);
    }
  }, [currentQuestionIndex, finalContent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    if (!finalContent?.questions || finalContent.questions.length === 0) {
      console.error('❌ Tentativa de iniciar quiz sem questões válidas');
      return;
    }

    console.log('🎯 Iniciando quiz com', finalContent.questions.length, 'questões');
    setIsQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers({});
    setIsQuizCompleted(false);
    setShowResult(false);
    const timePerQ = finalContent.timePerQuestion && !isNaN(Number(finalContent.timePerQuestion)) ? 
      Number(finalContent.timePerQuestion) : 60;
    setTimeLeft(timePerQ);
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    if (!finalContent?.questions) return;

    // Save current answer
    const newAnswers = { 
      ...userAnswers, 
      [currentQuestionIndex]: selectedAnswer 
    };
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < finalContent.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      const timePerQ = finalContent.timePerQuestion && !isNaN(Number(finalContent.timePerQuestion)) ? 
        Number(finalContent.timePerQuestion) : 60;
      setTimeLeft(timePerQ);
    } else {
      setIsQuizCompleted(true);
      setShowResult(true);
    }
  };

  const handleResetQuiz = () => {
    setIsQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers({});
    setIsQuizCompleted(false);
    setShowResult(false);
    setTimeLeft(60);
  };

  const calculateScore = () => {
    if (!finalContent?.questions) return 0;
    let correctAnswers = 0;

    finalContent.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / finalContent.questions.length) * 100);
  };

  const getProgressPercentage = () => {
    if (!finalContent?.questions) return 0;
    return ((currentQuestionIndex + 1) / finalContent.questions.length) * 100;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="text-lg">Gerando Quiz Interativo com IA do Gemini...</span>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Aguarde enquanto criamos questões personalizadas para você
          </p>
        </CardContent>
      </Card>
    );
  }

  // Garantir que sempre temos questões válidas
  const ensureValidQuestions = (contentData: any) => {
    if (!contentData) return null;

    // Se não há questões ou questões inválidas, criar fallback
    if (!contentData.questions || contentData.questions.length === 0) {
      const fallbackQuestions: QuizQuestion[] = [
        {
          id: 1,
          question: `Questão sobre ${contentData.title || 'o tema escolhido'}: Qual é o conceito fundamental que deve ser compreendido?`,
          type: 'multipla-escolha',
          options: [
            'A) É um conceito básico e essencial',
            'B) É uma aplicação prática secundária',
            'C) É apenas uma teoria sem aplicação',
            'D) É um conceito avançado opcional'
          ],
          correctAnswer: 'A) É um conceito básico e essencial',
          explanation: 'Este conceito é fundamental para o entendimento da matéria.'
        },
        {
          id: 2,
          question: `O estudo de ${contentData.title || 'este tema'} é importante para o aprendizado?`,
          type: 'verdadeiro-falso',
          options: ['Verdadeiro', 'Falso'],
          correctAnswer: 'Verdadeiro',
          explanation: 'Sim, este conceito é fundamental para o desenvolvimento acadêmico.'
        },
        {
          id: 3,
          question: `Sobre ${contentData.title || 'o tema estudado'}: Qual é a melhor estratégia de aprendizado?`,
          type: 'multipla-escolha',
          options: [
            'A) Prática constante e revisão',
            'B) Memorização sem compreensão',
            'C) Leitura única do material',
            'D) Apenas exercícios práticos'
          ],
          correctAnswer: 'A) Prática constante e revisão',
          explanation: 'A combinação de prática e revisão é a melhor estratégia.'
        }
      ];

      return {
        ...contentData,
        questions: fallbackQuestions,
        totalQuestions: fallbackQuestions.length,
        isFallback: true
      };
    }

    // Validar questões existentes
    const validQuestions = contentData.questions.filter((q: QuizQuestion) => 
      q.question && q.options && q.options.length > 0 && q.correctAnswer
    );

    if (validQuestions.length === 0) {
      // Se nenhuma questão é válida, usar fallback
      return ensureValidQuestions({ ...contentData, questions: [] });
    }

    return {
      ...contentData,
      questions: validQuestions,
      totalQuestions: validQuestions.length
    };
  };

  // Processar content para garantir questões válidas
  const processedContent = ensureValidQuestions(content);

  // Se não conseguiu processar o conteúdo, mostrar estado de erro
  if (!processedContent) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-orange-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {isLoading ? 'Gerando Quiz com IA...' : 'Quiz em Preparação'}
          </h3>
          <p className="text-gray-500 mb-4">
            {isLoading ? 
              'Aguarde enquanto a IA do Gemini gera questões personalizadas para você.' :
              'Configure os campos obrigatórios na aba "Editar" e clique em "Gerar Quiz com IA" para criar o conteúdo.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  // Usar o conteúdo processado daqui em diante
  const finalContent = processedContent;

  // Quiz intro screen
  if (!isQuizStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-orange-200">
        <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="text-2xl text-orange-700">
            {finalContent.title || 'Quiz Interativo'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {finalContent.description || 'Teste seus conhecimentos com este quiz interativo!'}
          </p>

          {finalContent.isFallback && (
            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-yellow-800">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Este é um quiz de demonstração. Configure a API do Gemini para gerar conteúdo personalizado.
            </div>
          )}
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-semibold text-blue-700">Total de Questões:</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {finalContent.totalQuestions || finalContent.questions?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="font-semibold text-green-700">Tempo por Questão:</span>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatTime(Number(finalContent.timePerQuestion) || 60)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <span className="font-semibold text-purple-700">Tempo Total:</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatTime((Number(finalContent.timePerQuestion) || 60) * (finalContent.totalQuestions || finalContent.questions?.length || 0))}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleStartQuiz}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Iniciar Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Quiz results screen
  if (showResult) {
    const score = calculateScore();
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="text-2xl text-gray-800">Resultado do Quiz</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl font-bold text-orange-500">
            {score}%
          </div>
          <p className="text-xl text-gray-600">
            Você acertou {Object.values(userAnswers).filter((answer, index) => 
              answer === finalContent.questions![index]?.correctAnswer
            ).length} de {finalContent.questions!.length} questões
          </p>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {finalContent.questions!.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div key={question.id} className="text-left p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start space-x-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 mb-2">{question.question}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        Sua resposta: <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {userAnswer || 'Não respondida'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600 mb-1">
                          Resposta correta: <span className="font-medium">{question.correctAnswer}</span>
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2">
                          💡 {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={handleResetQuiz}
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Refazer Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Quiz question screen
  const currentQuestion = finalContent.questions[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="shadow-xl border-2 border-orange-200">
        <CardContent className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Questão {currentQuestionIndex + 1} de {finalContent.questions.length}</span>
              <span>{Math.round(getProgressPercentage())}% concluído</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
            <Clock className="mr-2 h-6 w-6 text-orange-500" />
            <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Question Text Area - With Content */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                <span className="text-gray-800 text-base font-medium text-center leading-relaxed">
                  {currentQuestion.question || 'A pergunta aparecerá aqui...'}
                </span>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 hover:border-orange-200 transition-all duration-200 cursor-pointer">
                        <RadioGroupItem value={option} id={`option-${index}`} className="border-2" />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700 font-medium">
                          {option}
                        </Label>
                      </div>
                    ))
                  ) : (
                    // Fallback para questões sem opções ou tipo verdadeiro/falso
                    <>
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 hover:border-green-200 transition-all duration-200 cursor-pointer">
                        <RadioGroupItem value="Verdadeiro" id="verdadeiro" className="border-2" />
                        <Label htmlFor="verdadeiro" className="flex-1 cursor-pointer text-gray-700 font-medium">
                          ✅ Verdadeiro
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 hover:border-red-200 transition-all duration-200 cursor-pointer">
                        <RadioGroupItem value="Falso" id="falso" className="border-2" />
                        <Label htmlFor="falso" className="flex-1 cursor-pointer text-gray-700 font-medium">
                          ❌ Falso
                        </Label>
                      </div>
                    </>
                  )}
                </RadioGroup>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {currentQuestionIndex < finalContent.questions.length - 1 ? 'Próxima Questão' : 'Finalizar Quiz'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizInterativoPreview;