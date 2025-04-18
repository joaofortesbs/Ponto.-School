import React, { useMemo } from "react";
import { QuizHistory } from "../../types/quiz-history";

interface QuizProgressViewProps {
  quizHistory: QuizHistory[];
  currentQuiz: {
    date: Date;
    type: string;
    topic: string;
    totalQuestions: number;
    correctAnswers: number;
    settings: Record<string, boolean>;
    bnccCompetence?: string;
  };
}

export const QuizProgressView: React.FC<QuizProgressViewProps> = ({ quizHistory, currentQuiz }) => {
  // Combine current quiz with history for display
  const allHistory = useMemo(() => {
    const combinedHistory = [...quizHistory];

    // Add current quiz if it's not already in the history
    const currentQuizExists = combinedHistory.some(
      quiz => 
        quiz.date.getTime() === currentQuiz.date.getTime() &&
        quiz.type === currentQuiz.type &&
        quiz.topic === currentQuiz.topic &&
        quiz.totalQuestions === currentQuiz.totalQuestions &&
        quiz.correctAnswers === currentQuiz.correctAnswers
    );

    if (!currentQuizExists) {
      combinedHistory.unshift({
        id: "current",
        userId: "current",
        date: currentQuiz.date,
        type: currentQuiz.type,
        topic: currentQuiz.topic,
        totalQuestions: currentQuiz.totalQuestions,
        correctAnswers: currentQuiz.correctAnswers,
        settings: currentQuiz.settings,
        bnccCompetence: currentQuiz.bnccCompetence,
      });
    }

    // Sort by date (newest first)
    return combinedHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [quizHistory, currentQuiz]);

  // Get recent attempts with the same topic for evolution analysis
  const recentSameTopicAttempts = useMemo(() => {
    return allHistory
      .filter(quiz => quiz.topic === currentQuiz.topic)
      .slice(0, 4); // Current + up to 3 previous
  }, [allHistory, currentQuiz.topic]);

  // Calculate evolution trend
  const evolutionTrend = useMemo(() => {
    if (recentSameTopicAttempts.length <= 1) {
      return null; // Not enough data for trend
    }

    // Get percentages from recent attempts (excluding current)
    const percentages = recentSameTopicAttempts.map(
      quiz => (quiz.correctAnswers / quiz.totalQuestions) * 100
    );

    const currentPercentage = percentages[0];
    const previousPercentages = percentages.slice(1);
    const averagePreviousPercentage = 
      previousPercentages.reduce((sum, p) => sum + p, 0) / previousPercentages.length;

    const difference = currentPercentage - averagePreviousPercentage;

    if (difference > 5) return { trend: "up", difference };
    if (difference < -5) return { trend: "down", difference };
    return { trend: "stable", difference };
  }, [recentSameTopicAttempts]);

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSettings = (settings: Record<string, boolean>) => {
    const enabledSettings = Object.entries(settings)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([key]) => {
        switch(key) {
          case "studyMode": return "Modo Estudo";
          case "smartDifficulty": return "Dificuldade Inteligente";
          default: return key;
        }
      });

    return enabledSettings.length ? enabledSettings.join(", ") : "Nenhuma";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Progresso de Aprendizagem</h3>

      {/* Current quiz details */}
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-lg font-medium mb-2">Tentativa Atual</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Tipo:</span> {currentQuiz.type}</p>
            <p><span className="font-medium">Tema:</span> {currentQuiz.topic}</p>
            <p><span className="font-medium">Data:</span> {formatDate(currentQuiz.date)}</p>
            <p><span className="font-medium">Total de Questões:</span> {currentQuiz.totalQuestions}</p>
          </div>
          <div>
            <p>
              <span className="font-medium">Acertos:</span> 
              <span className={getScoreColor(currentQuiz.correctAnswers / currentQuiz.totalQuestions * 100)}>
                {" "}{currentQuiz.correctAnswers} ({Math.round(currentQuiz.correctAnswers / currentQuiz.totalQuestions * 100)}%)
              </span>
            </p>
            <p><span className="font-medium">Configurações:</span> {renderSettings(currentQuiz.settings)}</p>
            {currentQuiz.bnccCompetence && (
              <p><span className="font-medium">Competência BNCC:</span> {currentQuiz.bnccCompetence}</p>
            )}
          </div>
        </div>

        {/* Evolution trend */}
        {evolutionTrend && (
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
            <h5 className="font-medium mb-1">Análise de Evolução</h5>
            <div className="flex items-center gap-2">
              {evolutionTrend.trend === "up" && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-600 dark:text-green-400">
                    Evolução positiva! Melhorou {Math.abs(evolutionTrend.difference).toFixed(1)}% em relação às tentativas anteriores.
                  </span>
                </>
              )}
              {evolutionTrend.trend === "down" && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-600 dark:text-red-400">
                    Evolução negativa. Caiu {Math.abs(evolutionTrend.difference).toFixed(1)}% em relação às tentativas anteriores.
                  </span>
                </>
              )}
              {evolutionTrend.trend === "stable" && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Desempenho estável. Variação de apenas {Math.abs(evolutionTrend.difference).toFixed(1)}% em relação às tentativas anteriores.
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Baseado em {recentSameTopicAttempts.length - 1} tentativa(s) anterior(es) neste tema.
            </p>
          </div>
        )}
      </div>

      {/* Previous attempts */}
      {allHistory.length > 1 ? (
        <div>
          <h4 className="text-lg font-medium mb-3">Histórico de Tentativas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allHistory.slice(1).map((quiz, index) => (
              <div key={quiz.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex justify-between">
                  <h5 className="font-medium">{quiz.topic}</h5>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(new Date(quiz.date))}</span>
                </div>
                <p>
                  <span className="font-medium">Tipo:</span> {quiz.type}
                </p>
                <p>
                  <span className="font-medium">Resultado:</span> 
                  <span className={getScoreColor(quiz.correctAnswers / quiz.totalQuestions * 100)}>
                    {" "}{quiz.correctAnswers}/{quiz.totalQuestions} ({Math.round(quiz.correctAnswers / quiz.totalQuestions * 100)}%)
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium">Configurações:</span> {renderSettings(quiz.settings || {})}
                </p>
                {quiz.bnccCompetence && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">BNCC:</span> {quiz.bnccCompetence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>Nenhum histórico de tentativas anteriores.</p>
          <p className="text-sm mt-1">Complete mais quizzes ou provas para acompanhar sua evolução!</p>
        </div>
      )}
    </div>
  );
};