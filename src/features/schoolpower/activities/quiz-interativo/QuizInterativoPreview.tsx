
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multipla-escolha' | 'verdadeiro-falso';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizInterativoContent {
  title: string;
  description: string;
  questions: QuizQuestion[];
  timePerQuestion: number;
  totalQuestions: number;
  generatedAt: string;
  isGeneratedByAI: boolean;
}

interface QuizInterativoPreviewProps {
  activity: any;
}

export const QuizInterativoPreview: React.FC<QuizInterativoPreviewProps> = ({ activity }) => {
  const [content, setContent] = useState<QuizInterativoContent | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    loadQuizContent();
  }, [activity]);

  const loadQuizContent = () => {
    console.log('🔍 [QUIZ PREVIEW] Carregando conteúdo do quiz para atividade:', activity?.id);
    setIsLoading(true);

    try {
      // Tentar carregar do localStorage primeiro
      const storageKey = `constructed_quiz-interativo_${activity?.id}`;
      const storedData = localStorage.getItem(storageKey);

      if (storedData) {
        console.log('📦 [QUIZ PREVIEW] Dados encontrados no localStorage:', storageKey);
        const parsedData = JSON.parse(storedData);
        
        if (parsedData.success && parsedData.data) {
          console.log('✅ [QUIZ PREVIEW] Conteúdo carregado com sucesso:', parsedData.data);
          setContent(parsedData.data);
          setIsLoading(false);
          return;
        }
      }

      // Se não encontrou no localStorage, usar dados básicos da atividade
      console.log('⚠️ [QUIZ PREVIEW] Dados não encontrados no localStorage, usando dados da atividade');
      
      if (activity) {
        const basicContent: QuizInterativoContent = {
          title: activity.title || 'Quiz Interativo',
          description: activity.description || 'Quiz educativo interativo',
          questions: [
            {
              id: 1,
              question: `Questão sobre ${activity.theme || 'o tema estudado'}`,
              type: 'multipla-escolha',
              options: ['A) Opção 1', 'B) Opção 2', 'C) Opção 3', 'D) Opção 4'],
              correctAnswer: 'A) Opção 1',
              explanation: 'Explicação da resposta correta.'
            }
          ],
          timePerQuestion: 60,
          totalQuestions: 1,
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: false
        };

        setContent(basicContent);
      }

    } catch (error) {
      console.error('❌ [QUIZ PREVIEW] Erro ao carregar conteúdo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !content) return;

    const currentQuestion = content.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < content!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <CardTitle className="text-xl text-gray-600">Carregando Quiz...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-red-600">Erro ao Carregar Quiz</CardTitle>
          <p className="text-gray-600">Não foi possível carregar o conteúdo do quiz.</p>
        </CardHeader>
      </Card>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / content.totalQuestions) * 100);
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-orange-600">{content.title}</CardTitle>
          <p className="text-gray-600">{content.description}</p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold">Quiz Concluído!</h3>
          <div className="text-3xl font-bold text-green-600">
            {score}/{content.totalQuestions} ({percentage}%)
          </div>
          <Button onClick={resetQuiz} className="bg-orange-500 hover:bg-orange-600 text-white">
            Refazer Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = content.questions[currentQuestionIndex];
  const totalTime = content.timePerQuestion * content.totalQuestions;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl">{content.title}</CardTitle>
        <p className="text-orange-100">{content.description}</p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Estatísticas do Quiz */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total de Questões:</p>
            <p className="text-2xl font-bold text-blue-600">{content.totalQuestions}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Tempo por Questão:</p>
            <p className="text-2xl font-bold text-green-600">{content.timePerQuestion}s</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Tempo Total:</p>
            <p className="text-2xl font-bold text-purple-600">{Math.round(totalTime / 60)}min</p>
          </div>
        </div>

        {/* Pergunta Atual */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Questão {currentQuestionIndex + 1} de {content.totalQuestions}
            </Badge>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{content.timePerQuestion}s</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>

          {/* Opções de Resposta */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showExplanation}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedAnswer === option
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="font-medium">{option}</span>
                {showExplanation && option === currentQuestion.correctAnswer && (
                  <CheckCircle className="inline-block w-5 h-5 text-green-500 ml-2" />
                )}
                {showExplanation && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                  <XCircle className="inline-block w-5 h-5 text-red-500 ml-2" />
                )}
              </button>
            ))}
          </div>

          {/* Explicação */}
          {showExplanation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Explicação:</h4>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
              <p className="text-sm text-blue-600 mt-2">
                Resposta correta: <strong>{currentQuestion.correctAnswer}</strong>
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-center mt-6 space-x-4">
            {!showExplanation ? (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              >
                Confirmar Resposta
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                className="bg-green-500 hover:bg-green-600 text-white px-8"
              >
                {currentQuestionIndex < content.totalQuestions - 1 ? 'Próxima Questão' : 'Finalizar Quiz'}
              </Button>
            )}
          </div>
        </div>

        {/* Progresso */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{currentQuestionIndex + 1}/{content.totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / content.totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {content.isGeneratedByAI ? '🤖 Gerado por IA' : '📝 Modo Demonstração'} • 
            Gerado em {new Date(content.generatedAt).toLocaleString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizInterativoPreview;
