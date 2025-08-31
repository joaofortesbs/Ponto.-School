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
    if (content && isQuizStarted) {
      const timePerQ = content.timePerQuestion && !isNaN(Number(content.timePerQuestion)) ? 
        Number(content.timePerQuestion) : 60;
      setTimeLeft(timePerQ);
    }
  }, [currentQuestionIndex, content]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    if (!content?.questions || content.questions.length === 0) {
      console.error('❌ Tentativa de iniciar quiz sem questões válidas');
      return;
    }

    console.log('🎯 Iniciando quiz com', content.questions.length, 'questões');
    setIsQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers({});
    setIsQuizCompleted(false);
    setShowResult(false);
    const timePerQ = content.timePerQuestion && !isNaN(Number(content.timePerQuestion)) ? 
      Number(content.timePerQuestion) : 60;
    setTimeLeft(timePerQ);
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    if (!content?.questions) return;

    // Save current answer
    const newAnswers = { 
      ...userAnswers, 
      [currentQuestionIndex]: selectedAnswer 
    };
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < content.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      const timePerQ = content.timePerQuestion && !isNaN(Number(content.timePerQuestion)) ? 
        Number(content.timePerQuestion) : 60;
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
    if (!content?.questions) return 0;
    let correctAnswers = 0;

    content.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / content.questions.length) * 100);
  };

  const getProgressPercentage = () => {
    if (!content?.questions) return 0;
    return ((currentQuestionIndex + 1) / content.questions.length) * 100;
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

  // No content or no questions state
  if (!content || !content.questions || content.questions.length === 0) {
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
              !content ? 
                'Configure os campos obrigatórios na aba "Editar" e clique em "Gerar Quiz com IA" para criar o conteúdo.' :
                'As questões estão sendo processadas. Se demorar muito, tente gerar novamente.'
            }
          </p>

          {content && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Título:</span>
                  <p className="text-gray-800">{content.title || 'Não definido'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Questões:</span>
                  <p className="text-gray-800 font-medium">
                    {content.questions?.length || 0}
                    {content.questions?.length === 0 && (
                      <span className="text-red-500 ml-1">⚠️ Nenhuma questão encontrada</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Tempo/Questão:</span>
                  <p className="text-gray-800">{content.timePerQuestion || 'Não definido'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Gerado por IA:</span>
                  <p className="text-gray-800">{content.isGeneratedByAI ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              {content.isFallback && (
                <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                  ⚠️ Modo demonstração ativo. Configure a API do Gemini para gerar conteúdo personalizado.
                </div>
              )}

              {content.questions?.length === 0 && content.isGeneratedByAI && (
                <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                  ❌ API retornou dados, mas nenhuma questão válida foi encontrada. Verifique o formato da resposta.
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              Recarregar Página
            </Button>
            {content && !isLoading && (
              <Button
                variant="outline"
                onClick={() => console.log('Dados para debug:', content)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Debug Console
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz intro screen
  if (!isQuizStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-orange-200">
        <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="text-2xl text-orange-700">
            {content.title || 'Quiz Interativo'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {content.description || 'Teste seus conhecimentos com este quiz interativo!'}
          </p>

          {content.isFallback && (
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
                {content.totalQuestions || content.questions?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="font-semibold text-green-700">Tempo por Questão:</span>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatTime(Number(content.timePerQuestion) || 60)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <span className="font-semibold text-purple-700">Tempo Total:</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatTime((Number(content.timePerQuestion) || 60) * (content.totalQuestions || content.questions?.length || 0))}
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
              answer === content.questions![index]?.correctAnswer
            ).length} de {content.questions!.length} questões
          </p>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {content.questions!.map((question, index) => {
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
  const currentQuestion = content.questions[currentQuestionIndex];

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
              <span>Questão {currentQuestionIndex + 1} de {content.questions.length}</span>
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
                  {currentQuestion.type === 'multipla-escolha' && currentQuestion.options ? (
                    currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 hover:border-orange-200 transition-all duration-200 cursor-pointer">
                        <RadioGroupItem value={option} id={`option-${index}`} className="border-2" />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700 font-medium">
                          {option}
                        </Label>
                      </div>
                    ))
                  ) : currentQuestion.type === 'verdadeiro-falso' ? (
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
                  ) : (
                    <div className="p-4 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      Tipo de questão não reconhecido: {currentQuestion.type}
                    </div>
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
                  {currentQuestionIndex < content.questions.length - 1 ? 'Próxima Questão' : 'Finalizar Quiz'}
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