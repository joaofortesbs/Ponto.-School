
import React, { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import QuestionSimulatorModal from './QuestionSimulatorModal';
import QuizConfigModal from './QuizConfigModal';
import QuestionsConfigModal, { QuestionsConfig } from './QuestionsConfigModal';
import LoadingModal from './LoadingModal';
import QuestionsResultModal from './QuestionsResultModal';
import { generateQuizQuestions, generateExamQuestions, Question } from './QuestionGenerator';
import QuizTask from "@/components/agenda/challenges/QuizTask";

interface QuizSimulatorManagerProps {
  sessionId: string;
  content: string;
  onClose: () => void;
  onAddMessage: (message: string) => void;
  onShowQuizTask: (show: boolean) => void;
  setQuizTaskProps?: (props: any) => void;
}

const QuizSimulatorManager: React.FC<QuizSimulatorManagerProps> = ({
  sessionId,
  content,
  onClose,
  onAddMessage,
  onShowQuizTask,
  setQuizTaskProps
}) => {
  // Estados para controle de modais
  const [showSimulatorModal, setShowSimulatorModal] = useState(true);
  const [showQuizConfigModal, setShowQuizConfigModal] = useState(false);
  const [showQuestionsConfigModal, setShowQuestionsConfigModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showQuestionsResultModal, setShowQuestionsResultModal] = useState(false);
  
  // Estados para dados
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Gerando questões");

  // Funções de gerenciamento do modal de simulador
  const handleQuizSelect = () => {
    setShowSimulatorModal(false);
    setShowQuizConfigModal(true);
  };

  const handleQuestionsSelect = () => {
    setShowSimulatorModal(false);
    setShowQuestionsConfigModal(true);
  };

  // Função para iniciar o quiz
  const handleStartQuiz = async (smartDifficulty: boolean, studyMode: boolean) => {
    setShowQuizConfigModal(false);
    setShowLoadingModal(true);
    setLoadingMessage("Gerando quiz");
    setIsLoading(true);
    
    try {
      // Gerar perguntas do quiz
      const quizQuestions = await generateQuizQuestions(
        sessionId,
        content,
        smartDifficulty,
        studyMode
      );
      
      // Configurar props do componente QuizTask
      const quizProps = {
        taskId: `quiz-${Date.now()}`,
        title: "Quiz sobre o conteúdo",
        description: "Teste seus conhecimentos sobre o assunto abordado",
        questions: quizQuestions,
        showExplanation: studyMode,
        onComplete: (score: number, totalQuestions: number) => {
          onShowQuizTask(false);
          onAddMessage(`Você completou o quiz com ${score} de ${totalQuestions} acertos (${Math.round((score/totalQuestions)*100)}%).`);
        },
        onClose: () => onShowQuizTask(false)
      };
      
      // Passar props para o componente QuizTask
      if (setQuizTaskProps) {
        setQuizTaskProps(quizProps);
      }
      
      // Mostrar componente de Quiz
      onShowQuizTask(true);
      
      // Adicionar mensagem no chat
      onAddMessage("📝 **Quiz Iniciado!**\n\nResponda às perguntas de múltipla escolha para testar seus conhecimentos sobre o assunto. Boa sorte!");
      
      // Fechar o modal de carregamento
      setShowLoadingModal(false);
      
      // Fechar todos os modais
      onClose();
      
      // Notificação ao usuário
      toast({
        title: "Quiz iniciado",
        description: `Quiz com ${smartDifficulty ? 'dificuldade inteligente' : 'dificuldade padrão'} e ${studyMode ? 'modo estudo ativado' : 'modo estudo desativado'}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao gerar quiz:', error);
      toast({
        title: "Erro ao gerar quiz",
        description: "Não foi possível gerar as perguntas. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
      setShowLoadingModal(false);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Função para gerar questões de exame
  const handleGenerateQuestions = async (config: QuestionsConfig) => {
    setShowQuestionsConfigModal(false);
    setShowLoadingModal(true);
    setLoadingMessage("Gerando questões para exame");
    setIsLoading(true);
    
    try {
      // Gerar questões de exame
      const examQuestions = await generateExamQuestions(
        sessionId,
        content,
        config
      );
      
      // Armazenar questões geradas
      setQuestions(examQuestions);
      
      // Mostrar modal de resultado com as questões
      setShowLoadingModal(false);
      setShowQuestionsResultModal(true);
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      toast({
        title: "Erro ao gerar questões",
        description: "Não foi possível gerar as questões. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
      setShowLoadingModal(false);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Função para exportar questões geradas
  const handleExportQuestions = () => {
    // Formatação das questões para texto
    const questionsText = questions.map((q, index) => {
      return `Questão ${q.number}: ${q.type}
Enunciado: ${q.statement}
${q.answer ? `Gabarito: ${q.answer}` : ''}
${q.explanation ? `Explicação: ${q.explanation}` : ''}
`;
    }).join('\n---\n\n');

    // Criar um elemento de link para download
    const element = document.createElement('a');
    const file = new Blob([questionsText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `questoes-geradas-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Questões exportadas",
      description: "O arquivo de texto com as questões foi baixado com sucesso.",
      duration: 3000,
    });
  };

  // Fechar todos os modais
  const handleCloseAll = () => {
    setShowSimulatorModal(false);
    setShowQuizConfigModal(false);
    setShowQuestionsConfigModal(false);
    setShowLoadingModal(false);
    setShowQuestionsResultModal(false);
    onClose();
  };

  return (
    <>
      {showSimulatorModal && (
        <QuestionSimulatorModal 
          onClose={handleCloseAll}
          onQuizSelect={handleQuizSelect}
          onQuestionsSelect={handleQuestionsSelect}
        />
      )}
      
      {showQuizConfigModal && (
        <QuizConfigModal 
          onClose={() => {
            setShowQuizConfigModal(false);
            setShowSimulatorModal(true);
          }}
          onStartQuiz={handleStartQuiz}
        />
      )}
      
      {showQuestionsConfigModal && (
        <QuestionsConfigModal 
          onClose={() => {
            setShowQuestionsConfigModal(false);
            setShowSimulatorModal(true);
          }}
          onGenerateQuestions={handleGenerateQuestions}
        />
      )}
      
      {showLoadingModal && (
        <LoadingModal message={loadingMessage} />
      )}
      
      {showQuestionsResultModal && (
        <QuestionsResultModal 
          questions={questions} 
          onClose={handleCloseAll}
          onExport={handleExportQuestions}
        />
      )}
    </>
  );
};

export default QuizSimulatorManager;
