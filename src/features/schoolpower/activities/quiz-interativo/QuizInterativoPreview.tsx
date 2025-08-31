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
      if (userAnswers[index] === question.correctAnswer) {
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

  // CORREÇÃO CRÍTICA: Preparar dados de forma consistente
  const finalContent = React.useMemo(() => {
    if (!content) {
      return null;
    }

    // Processar dados de forma consistente
    const processedContent = {
      ...content,
      questions: content.questions || [],
      totalQuestions: content.questions?.length || content.totalQuestions || 0,
      timePerQuestion: content.timePerQuestion || 60,
      title: content.title || 'Quiz Interativo',
      description: content.description || 'Teste seus conhecimentos!'
    };

    console.log('🎯 QuizInterativoPreview - Conteúdo processado:', processedContent);
    return processedContent;
  }, [content]);

  // Early return para evitar problemas de hooks
  if (!finalContent) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-orange-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Quiz em Preparação
          </h3>
          <p className="text-gray-500 mb-4">
            Configure os campos obrigatórios na aba "Editar" e clique em "Gerar Quiz com IA" para criar o conteúdo.
          </p>
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
            Você acertou {Object.values(userAnswers).filter((answer, index) => {
              return answer === finalContent?.questions?.[index]?.correctAnswer;
            }).length} de {finalContent?.questions?.length || 0} questões
          </p>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {finalContent?.questions?.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              // Extrair texto da questão de forma segura
              let questionText = '';
              if (typeof question.question === 'string') {
                questionText = question.question;
              } else if (typeof question.question === 'object' && question.question?.text) {
                questionText = String(question.question.text);
              } else if (question.text) {
                questionText = String(question.text);
              } else {
                questionText = `Questão ${index + 1}`;
              }

              return (
                <div key={question.id || index} className="text-left p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start space-x-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 mb-2">{questionText}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        Sua resposta: <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {userAnswer || 'Não respondida'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600 mb-1">
                          Resposta correta: <span className="font-medium">{String(question.correctAnswer || 'N/A')}</span>
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2">
                          💡 {String(question.explanation)}
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

  // Validação final antes de acessar questões
  if (!finalContent?.questions || !Array.isArray(finalContent.questions) || finalContent.questions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-orange-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Questões não encontradas
          </h3>
          <p className="text-gray-500 mb-4">
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
      <Card className="shadow-xl border-2 border-orange-200">
        <CardContent className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Questão {currentQuestionIndex + 1} de {finalContent?.questions?.length || 0}</span>
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
              {/* Question Text Area - Com questões reais da IA */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                <span className="text-gray-800 text-base font-medium text-center leading-relaxed">
                  {(() => {
                    // Acessar questão atual com múltiplas verificações
                    const questaoAtual = finalContent.questions?.[currentQuestionIndex];
                    console.log('📝 Renderizando questão:', questaoAtual);
                    
                    // Garantir que sempre retornamos uma string
                    if (questaoAtual?.question && typeof questaoAtual.question === 'string') {
                      return questaoAtual.question;
                    }
                    
                    if (questaoAtual?.text && typeof questaoAtual.text === 'string') {
                      return questaoAtual.text;
                    }
                    
                    // Se questaoAtual.question for um objeto, extrair o texto
                    if (questaoAtual?.question && typeof questaoAtual.question === 'object') {
                      if (questaoAtual.question.text) {
                        return String(questaoAtual.question.text);
                      }
                      if (questaoAtual.question.id) {
                        return `Questão ${questaoAtual.question.id}`;
                      }
                    }
                    
                    return 'Carregando questão...';
                  })()}
                </span>
              </div>

              {/* Answer Options - Com opções reais da IA */}
              <div className="space-y-3">
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
                          if (option.text) {
                            optionText = String(option.text);
                          } else if (option.id && option.text) {
                            optionText = String(option.text);
                          } else {
                            optionText = `Opção ${index + 1}`;
                          }
                        } else {
                          optionText = String(option || `Opção ${index + 1}`);
                        }
                        
                        return (
                          <div key={index} className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 hover:border-orange-200 transition-all duration-200 cursor-pointer">
                            <RadioGroupItem value={optionText} id={`option-${index}`} className="border-2" />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700 font-medium">
                              {optionText}
                            </Label>
                          </div>
                        );
                      });
                    }
                    
                    // Se for verdadeiro/falso
                    if (questaoAtual?.type === 'verdadeiro-falso') {
                      console.log('✅ Renderizando questão verdadeiro/falso');
                      return (
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
                      );
                    }
                    
                    // Mensagem de carregamento se não há opções
                    console.log('⚠️ Nenhuma opção válida encontrada para a questão atual');
                    return (
                      <div className="text-center text-gray-500 p-4">
                        {questaoAtual ? 'Carregando opções de resposta...' : 'Questão não encontrada...'}
                      </div>
                    );
                  })()}
                </RadioGroup>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {currentQuestionIndex < (finalContent?.questions?.length || 0) - 1 ? 'Próxima Questão' : 'Finalizar Quiz'}
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