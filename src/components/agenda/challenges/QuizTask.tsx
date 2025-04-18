import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Trophy,
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface QuizTaskProps {
  taskId: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in seconds per question
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
}

const QuizTask: React.FC<QuizTaskProps> = ({
  taskId,
  title,
  description,
  questions,
  timeLimit = 30,
  onComplete,
  onClose,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (quizCompleted) return;

    // Reset timer when moving to a new question
    setTimeRemaining(timeLimit);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          if (!selectedOption) {
            handleAnswer(null);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, timeLimit, quizCompleted, selectedOption]);

  const handleAnswer = (optionId: string | null) => {
    // Store the answer
    const updatedAnswers = { ...answers };
    updatedAnswers[currentQuestion.id] = optionId || "";
    setAnswers(updatedAnswers);

    // Check if answer is correct
    const correctOption = currentQuestion.options.find((opt) => opt.isCorrect);
    const isAnswerCorrect = optionId === correctOption?.id;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore((prev) => prev + 1);
    }

    // Show feedback
    setShowFeedback(true);

    // Move to next question after a delay
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        // Quiz completed
        setQuizCompleted(true);
        setShowResult(true);
      }
    }, 2000);
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      handleAnswer(selectedOption);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers({});
    setShowResult(false);
    setScore(0);
    setTimeRemaining(timeLimit);
    setQuizCompleted(false);
    setShowFeedback(false);
  };

  const handleComplete = () => {
    onComplete(score, questions.length);
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-[#FF6B00]/20 overflow-hidden max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 text-white">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-white/90">{description}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-[#FF6B00]/10 h-2">
        <div
          className="h-full bg-[#FF6B00] transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!showResult ? (
          <div>
            {/* Question counter and timer */}
            <div className="flex justify-between items-center mb-4">
              <Badge
                variant="outline"
                className="text-[#FF6B00] border-[#FF6B00]/30"
              >
                Questão {currentQuestionIndex + 1} de {questions.length}
              </Badge>
              <Badge
                className={`flex items-center gap-1 ${timeRemaining < 10 ? "bg-red-500" : "bg-[#FF6B00]"} text-white`}
              >
                <Clock className="h-3 w-3" /> {formatTime(timeRemaining)}
              </Badge>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {currentQuestion.text}
              </h4>

              {/* Options */}
              <RadioGroup value={selectedOption || ""} className="space-y-3">
                <AnimatePresence mode="wait">
                  {currentQuestion.options.map((option) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-all ${selectedOption === option.id ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/50"} ${showFeedback && option.isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""} ${showFeedback && selectedOption === option.id && !option.isCorrect ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""}`}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="text-[#FF6B00]"
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                      >
                        {option.text}
                      </Label>
                      {showFeedback && option.isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                      )}
                      {showFeedback &&
                        selectedOption === option.id &&
                        !option.isCorrect && (
                          <XCircle className="h-5 w-5 text-red-500 ml-2" />
                        )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </RadioGroup>
            </div>

            {/* Feedback message */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 rounded-lg mb-4 ${isCorrect ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"}`}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Correto! Muito bem!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" />
                        <span>
                          Incorreto. A resposta correta está destacada.
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end mt-6">
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                disabled={!selectedOption || showFeedback}
                onClick={handleSubmit}
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Próxima <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-10 w-10 text-[#FF6B00]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Concluído!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Você acertou {score} de {questions.length} questões.
              </p>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pontuação
                  </span>
                  <span className="text-sm font-bold text-[#FF6B00]">
                    {Math.round((score / questions.length) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(score / questions.length) * 100}
                  className="h-2 bg-[#FF6B00]/10"
                />
              </div>
            </div>

            {/* Lista de perguntas com resultados */}
            <div className="mt-6 mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 max-h-60 overflow-auto">
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Resumo das respostas:</h4>
              <div className="space-y-3">
                {questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const correctOption = question.options.find(opt => opt.isCorrect);
                  const isCorrect = userAnswer === correctOption?.id;
                  
                  return (
                    <div key={question.id} className="flex items-start gap-2 text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {index + 1}. {question.text.length > 70 ? question.text.substring(0, 70) + '...' : question.text}
                        </p>
                        {!isCorrect && correctOption && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Resposta correta: {correctOption.text}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Button
                variant="outline"
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                onClick={handleRetry}
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Refazer com novas perguntas
              </Button>
              <Button
                variant="outline"
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                onClick={() => {
                  // Criar conteúdo para o caderno
                  const notebookContent = `# Resumo do Quiz\n\n**Pontuação:** ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)\n\n## Perguntas e Respostas:\n\n${questions.map((q, idx) => {
                    const userAnswer = answers[q.id];
                    const correctOption = q.options.find(opt => opt.isCorrect);
                    const isCorrect = userAnswer === correctOption?.id;
                    
                    return `${idx + 1}. ${q.text}\n   - Resposta correta: ${correctOption?.text}\n   - Resultado: ${isCorrect ? 'Correto ✓' : 'Incorreto ✗'}\n`;
                  }).join('\n')}`;
                  
                  // Solicita à IA para transformar em formato de caderno
                  const event = new CustomEvent('transform-to-notebook', { 
                    detail: { content: notebookContent } 
                  });
                  document.dispatchEvent(event);
                  
                  // Informar ao usuário
                  onComplete(score, questions.length);
                }}
              >
                <FileText className="h-4 w-4 mr-2" /> Transformar em Caderno
              </Button>
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white sm:col-span-2"
                onClick={handleComplete}
              >
                Marcar como Concluído
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTask;
