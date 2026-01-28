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
    // Campos adicionais que podem vir do modal de visualização
    customFields?: any;
    type?: string;
    data?: any;
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
    // Verificar se há questões válidas antes de iniciar
    const questoesValidas = finalContent?.questions && Array.isArray(finalContent.questions) && finalContent.questions.length > 0;
    
    if (!questoesValidas) {
      console.error('❌ Tentativa de iniciar quiz sem questões válidas');
      console.error('📊 Estado atual:', {
        hasContent: !!finalContent,
        hasQuestions: !!finalContent?.questions,
        questionsIsArray: Array.isArray(finalContent?.questions),
        questionsLength: finalContent?.questions?.length || 0,
        firstQuestion: finalContent?.questions?.[0]
      });
      return;
    }

    console.log('🎯 Iniciando quiz com questões reais:', finalContent.questions);
    console.log('📊 Total de questões disponíveis:', finalContent.questions.length);
    
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
    if (!finalContent?.questions || finalContent.questions.length === 0) return 0;
    let correctAnswers = 0;

    finalContent.questions.forEach((question, index) => {
      // CORREÇÃO: Aceitar tanto 'correctAnswer' quanto 'answer' da IA
      const correctAnswer = (question as any).correctAnswer || (question as any).answer;
      if (userAnswers[index] === correctAnswer) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / finalContent.questions.length) * 100);
  };

  const getProgressPercentage = () => {
    if (!finalContent?.questions || finalContent.questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / finalContent.questions.length) * 100;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 shadow-xl rounded-3xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="text-lg text-gray-800 dark:text-gray-200">Gerando Quiz Interativo com IA do Gemini...</span>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Aguarde enquanto criamos questões personalizadas para você
          </p>
        </CardContent>
      </Card>
    );
  }

  // CORREÇÃO CRÍTICA: Preparar dados de forma consistente
  const finalContent = React.useMemo(() => {
    if (!content) {
      return null;
    }

    // Extrair dados de diferentes estruturas possíveis (modal de edição vs modal de visualização)
    let extractedData = content;

    // Se os dados vêm do modal de visualização
    if (content.data && typeof content.data === 'object') {
      extractedData = content.data;
    }

    // Se há customFields, pode conter dados do quiz
    if (content.customFields && typeof content.customFields === 'object') {
      extractedData = { ...extractedData, ...content.customFields };
    }

    // Processar dados de forma consistente
    const processedContent = {
      ...extractedData,
      questions: extractedData.questions || content.questions || [],
      totalQuestions: (extractedData.questions || content.questions || []).length || extractedData.totalQuestions || content.totalQuestions || 0,
      timePerQuestion: extractedData.timePerQuestion || content.timePerQuestion || 60,
      title: extractedData.title || content.title || 'Quiz Interativo',
      description: extractedData.description || content.description || 'Teste seus conhecimentos!',
      isGeneratedByAI: extractedData.isGeneratedByAI || content.isGeneratedByAI || false,
      isFallback: extractedData.isFallback || content.isFallback || false
    };

    console.log('🎯 QuizInterativoPreview - Conteúdo processado:', processedContent);
    console.log('🎯 QuizInterativoPreview - Dados originais:', content);
    return processedContent;
  }, [content]);

  // Early return para evitar problemas de hooks
  if (!finalContent) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 shadow-xl rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl p-6 mb-6">
            <AlertCircle className="h-16 w-16 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Quiz em Preparação
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure os campos obrigatórios na aba "Editar" e clique em "Gerar Quiz com IA" para criar o conteúdo.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Quiz intro screen
  if (!isQuizStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 dark:from-orange-900/20 dark:via-orange-800/30 dark:to-orange-900/20 rounded-t-3xl p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-4">
              {finalContent.title || 'Quiz Interativo'}
            </CardTitle>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {finalContent.description || 'Teste seus conhecimentos com este quiz interativo!'}
            </p>

            {finalContent.isFallback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl text-sm text-yellow-800 dark:text-yellow-200"
              >
                <AlertCircle className="inline h-4 w-4 mr-2" />
                Este é um quiz de demonstração. Configure a API do Gemini para gerar conteúdo personalizado.
              </motion.div>
            )}
          </motion.div>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-2xl border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Total de Questões:</span>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {finalContent.totalQuestions || finalContent.questions?.length || 0}
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-2xl border-2 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <span className="font-semibold text-green-700 dark:text-green-300 text-sm">Tempo por Questão:</span>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {formatTime(Number(finalContent.timePerQuestion) || 60)}
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-2xl border-2 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">Tempo Total:</span>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {formatTime((Number(finalContent.timePerQuestion) || 60) * (finalContent.totalQuestions || finalContent.questions?.length || 0))}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleStartQuiz}
              className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white px-12 py-4 text-xl font-bold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 rounded-2xl border-0"
              size="lg"
            >
              <Play className="mr-3 h-6 w-6" />
              Iniciar Quiz
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Quiz results screen
  if (showResult) {
    const score = calculateScore();
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-green-900/20 rounded-t-3xl p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              🎉 Resultado do Quiz
            </CardTitle>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="inline-block"
            >
              <div className="text-7xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">
                {score}%
              </div>
            </motion.div>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Você acertou <span className="font-bold text-green-600 dark:text-green-400">
                {Object.values(userAnswers).filter((answer, index) => {
                  // CORREÇÃO: Aceitar tanto 'correctAnswer' quanto 'answer' da IA
                  const correctAnswer = (finalContent?.questions?.[index] as any)?.correctAnswer || (finalContent?.questions?.[index] as any)?.answer;
                  return answer === correctAnswer;
                }).length}
              </span> de <span className="font-bold text-blue-600 dark:text-blue-400">
                {finalContent?.questions?.length || 0}
              </span> questões
            </p>
          </motion.div>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar"
          >
            {finalContent?.questions?.map((question, index) => {
              const userAnswer = userAnswers[index];
              // CORREÇÃO: Aceitar tanto 'correctAnswer' quanto 'answer' da IA
              const correctAnswer = (question as any).correctAnswer || (question as any).answer;
              const isCorrect = userAnswer === correctAnswer;

              // Extrair texto da questão de forma segura
              let questionText = '';
              if (typeof question.question === 'string') {
                questionText = question.question;
              } else if (typeof question.question === 'object' && question.question !== null && 'text' in question.question) {
                questionText = String((question.question as any).text);
              } else {
                questionText = `Questão ${index + 1}`;
              }

              return (
                <motion.div 
                  key={question.id || index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 1, duration: 0.5 }}
                  className={`text-left p-6 border-2 rounded-2xl transition-all duration-300 ${
                    isCorrect 
                      ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-green-200 dark:border-green-700' 
                      : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-red-200 dark:border-red-700'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${
                      isCorrect 
                        ? 'bg-green-200 dark:bg-green-800' 
                        : 'bg-red-200 dark:bg-red-800'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-lg">{questionText}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sua resposta: <span className={`font-bold ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {userAnswer || 'Não respondida'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Resposta correta: <span className="font-bold text-green-600 dark:text-green-400">{String(correctAnswer || 'N/A')}</span>
                          </p>
                        )}
                        {question.explanation && (
                          <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              💡 <span className="font-medium">Explicação:</span> {String(question.explanation)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleResetQuiz}
              variant="outline"
              className="border-2 border-orange-500 dark:border-orange-400 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-600 dark:hover:border-orange-300 rounded-2xl px-8 py-3 text-lg font-semibold transition-all duration-300"
            >
              <RotateCcw className="mr-3 h-5 w-5" />
              Refazer Quiz
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Validação final antes de acessar questões
  if (!finalContent?.questions || !Array.isArray(finalContent.questions) || finalContent.questions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 shadow-xl rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-br from-orange-100 to-red-50 dark:from-orange-900/30 dark:to-red-900/20 rounded-2xl p-6 mb-6">
            <AlertCircle className="h-16 w-16 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Questões não encontradas
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Não foi possível carregar as questões do quiz. Tente gerar novamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Quiz question screen - CORREÇÃO CRÍTICA: Acessar questão atual com validação
  const currentQuestion = finalContent.questions[currentQuestionIndex];
  
  // Debug para verificar se as questões estão sendo acessadas corretamente
  console.log('🔍 Debug da questão atual:', {
    currentQuestionIndex,
    totalQuestions: finalContent.questions.length,
    currentQuestion: currentQuestion,
    hasQuestions: true,
    questionsValidation: finalContent.questions.every(q => q && (q.question || q.text))
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          {/* Progress Bar */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span className="font-semibold">Questão {currentQuestionIndex + 1} de {finalContent?.questions?.length || 0}</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{Math.round(getProgressPercentage())}% concluído</span>
            </div>
            <div className="relative">
              <Progress value={getProgressPercentage()} className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-gray-200 dark:border-gray-600"
          >
            <Clock className="mr-3 h-7 w-7 text-orange-500 dark:text-orange-400" />
            <span className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-gray-200'}`}>
              {formatTime(timeLeft)}
            </span>
          </motion.div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Question Text Area - Com questões reais da IA */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 border-2 border-orange-200 dark:border-orange-700 rounded-2xl p-8 min-h-[120px] flex items-center justify-center shadow-lg"
              >
                <span className="text-gray-800 dark:text-gray-200 text-lg font-semibold text-center leading-relaxed">
                  {(() => {
                    // Acessar questão atual com múltiplas verificações
                    const questaoAtual = finalContent.questions?.[currentQuestionIndex];
                    console.log('📝 Renderizando questão:', questaoAtual);
                    
                    // Garantir que sempre retornamos uma string - CORRIGIDO para aceitar ambas estruturas
                    if (questaoAtual?.question && typeof questaoAtual.question === 'string') {
                      return questaoAtual.question;
                    }
                    
                    // CORREÇÃO: Aceitar também 'text' que é o que a IA gera
                    if (questaoAtual?.text && typeof questaoAtual.text === 'string') {
                      return questaoAtual.text;
                    }
                    
                    // Se questaoAtual.question for um objeto, extrair o texto
                    if (questaoAtual?.question && typeof questaoAtual.question === 'object') {
                      if ((questaoAtual.question as any).text) {
                        return String((questaoAtual.question as any).text);
                      }
                      if ((questaoAtual.question as any).id) {
                        return `Questão ${(questaoAtual.question as any).id}`;
                      }
                    }
                    
                    return 'Carregando questão...';
                  })()}
                </span>
              </motion.div>

              {/* Answer Options - Com opções reais da IA */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="space-y-4"
              >
                <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                  {(() => {
                    // Acessar questão atual com verificação robusta
                    const questaoAtual = finalContent.questions?.[currentQuestionIndex];
                    console.log('🎯 Renderizando opções para questão:', questaoAtual);
                    
                    // Se a questão tem opções válidas, renderizar elas
                    if (questaoAtual?.options && Array.isArray(questaoAtual.options) && questaoAtual.options.length > 0) {
                      console.log('✅ Renderizando opções reais da IA:', questaoAtual.options);
                      return questaoAtual.options.map((option, index) => {
                        // Garantir que a opção seja sempre uma string
                        let optionText = '';
                        
                        if (typeof option === 'string') {
                          optionText = option;
                        } else if (typeof option === 'object' && option !== null) {
                          // Se a opção é um objeto, extrair o texto
                          if ((option as any).text) {
                            optionText = String((option as any).text);
                          } else if ((option as any).id && (option as any).text) {
                            optionText = String((option as any).text);
                          } else {
                            optionText = `Opção ${index + 1}`;
                          }
                        } else {
                          optionText = String(option || `Opção ${index + 1}`);
                        }
                        
                        return (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.7, duration: 0.5 }}
                            whileHover={{ scale: 1.02, x: 8 }}
                            whileTap={{ scale: 0.98 }}
                            className="group"
                          >
                            <div className="flex items-center space-x-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/20 dark:hover:to-orange-800/30 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl">
                              <RadioGroupItem 
                                value={optionText} 
                                id={`option-${index}`} 
                                className="border-2 border-gray-300 dark:border-gray-600 w-5 h-5" 
                              />
                              <Label 
                                htmlFor={`option-${index}`} 
                                className="flex-1 cursor-pointer text-gray-800 dark:text-gray-200 font-medium text-lg group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300"
                              >
                                {optionText}
                              </Label>
                            </div>
                          </motion.div>
                        );
                      });
                    }
                    
                    // Se for verdadeiro/falso
                    if (questaoAtual?.type === 'verdadeiro-falso') {
                      console.log('✅ Renderizando questão verdadeiro/falso');
                      return (
                        <>
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            whileHover={{ scale: 1.02, x: 8 }}
                            whileTap={{ scale: 0.98 }}
                            className="group"
                          >
                            <div className="flex items-center space-x-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/30 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl">
                              <RadioGroupItem value="Verdadeiro" id="verdadeiro" className="border-2 border-gray-300 dark:border-gray-600 w-5 h-5" />
                              <Label htmlFor="verdadeiro" className="flex-1 cursor-pointer text-gray-800 dark:text-gray-200 font-medium text-lg group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                                ✅ Verdadeiro
                              </Label>
                            </div>
                          </motion.div>
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            whileHover={{ scale: 1.02, x: 8 }}
                            whileTap={{ scale: 0.98 }}
                            className="group"
                          >
                            <div className="flex items-center space-x-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/30 hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl">
                              <RadioGroupItem value="Falso" id="falso" className="border-2 border-gray-300 dark:border-gray-600 w-5 h-5" />
                              <Label htmlFor="falso" className="flex-1 cursor-pointer text-gray-800 dark:text-gray-200 font-medium text-lg group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-300">
                                ❌ Falso
                              </Label>
                            </div>
                          </motion.div>
                        </>
                      );
                    }
                    
                    // Mensagem de carregamento se não há opções
                    console.log('⚠️ Nenhuma opção válida encontrada para a questão atual');
                    return (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-500 dark:text-gray-400 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800"
                      >
                        {questaoAtual ? 'Carregando opções de resposta...' : 'Questão não encontrada...'}
                      </motion.div>
                    );
                  })()}
                </RadioGroup>
              </motion.div>

              {/* Next Question Button */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex justify-center pt-6"
              >
                <motion.button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  whileHover={{ scale: selectedAnswer ? 1.05 : 1 }}
                  whileTap={{ scale: selectedAnswer ? 0.95 : 1 }}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    selectedAnswer
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-xl hover:shadow-orange-500/25'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {currentQuestionIndex < (finalContent?.questions?.length || 0) - 1 ? 'Próxima Questão' : 'Finalizar Quiz'}
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizInterativoPreview;