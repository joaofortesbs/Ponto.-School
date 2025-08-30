import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
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
    title: string;
    description: string;
    questions: QuizQuestion[];
    timePerQuestion: number;
    totalQuestions: number;
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
      setTimeLeft(content.timePerQuestion || 60);
    }
  }, [currentQuestionIndex, content]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers({});
    setIsQuizCompleted(false);
    setShowResult(false);
    if (content) {
      setTimeLeft(content.timePerQuestion || 60);
    }
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    if (!content) return;

    // Save current answer
    const newAnswers = { 
      ...userAnswers, 
      [currentQuestionIndex]: selectedAnswer 
    };
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < content.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setTimeLeft(content.timePerQuestion || 60);
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
    if (!content) return 0;
    let correctAnswers = 0;

    content.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / content.questions.length) * 100);
  };

  const getProgressPercentage = () => {
    if (!content) return 0;
    return ((currentQuestionIndex + 1) / content.questions.length) * 100;
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="text-lg">Gerando Quiz Interativo...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content || !content.questions || content.questions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            {!content ? 
              'Nenhum conteúdo de quiz disponível. Configure os campos e gere o conteúdo.' :
              'Quiz em processamento ou sem questões. Aguarde a geração completa.'
            }
          </p>
          {content && (
            <div className="mt-4 text-sm text-gray-400">
              <p>Título: {content.title || 'Não definido'}</p>
              <p>Questões: {content.questions?.length || 0}</p>
              <p>Tempo por questão: {content.timePerQuestion || 'Não definido'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!isQuizStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-orange-600">{content.title}</CardTitle>
          <p className="text-gray-600">{content.description}</p>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <span className="font-semibold">Total de Questões:</span>
              <p className="text-2xl font-bold text-blue-600">
                {content.totalQuestions || content.questions?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <span className="font-semibold">Tempo por Questão:</span>
              <p className="text-2xl font-bold text-green-600">
                {formatTime(Number(content.timePerQuestion) || 60)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <span className="font-semibold">Tempo Total:</span>
              <p className="text-2xl font-bold text-purple-600">
                {formatTime((Number(content.timePerQuestion) || 60) * (content.totalQuestions || content.questions?.length || 0))}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleStartQuiz}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Iniciar Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    const score = calculateScore();
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Resultado do Quiz</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl font-bold text-orange-500">
            {score}%
          </div>
          <p className="text-xl text-gray-600">
            Você acertou {Object.values(userAnswers).filter((answer, index) => 
              answer === content.questions[index]?.correctAnswer
            ).length} de {content.questions.length} questões
          </p>

          <div className="space-y-4">
            {content.questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div key={question.id} className="text-left p-4 border rounded-lg">
                  <div className="flex items-start space-x-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{question.question}</p>
                      <p className="text-sm text-gray-600">
                        Sua resposta: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {userAnswer || 'Não respondida'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600">
                          Resposta correta: {question.correctAnswer}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-blue-600 mt-1">
                          {question.explanation}
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
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Refazer Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = content.questions[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="shadow-lg border-2 border-orange-200">
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
          <div className="flex items-center justify-center mb-6 p-4 bg-gray-50 rounded-lg">
            <Clock className="mr-2 h-6 w-6 text-orange-500" />
            <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
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
              <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.type === 'multipla-escolha' ? (
                  <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="Verdadeiro" id="verdadeiro" />
                      <Label htmlFor="verdadeiro" className="flex-1 cursor-pointer">
                        Verdadeiro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="Falso" id="falso" />
                      <Label htmlFor="falso" className="flex-1 cursor-pointer">
                        Falso
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                >
                  {currentQuestionIndex < content.questions.length - 1 ? 'Próxima' : 'Finalizar'}
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
export { QuizInterativoPreview };