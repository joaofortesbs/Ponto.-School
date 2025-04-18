import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { generateAIResponse } from "@/services/aiChatService";
import QuestionConfigModal from "./question-components/QuestionConfigModal";
import QuestionsResultsModal from "./question-components/QuestionsResultsModal";
import QuestionDetailModal from "./question-components/QuestionDetailModal";

// Tipos para as questões geradas
type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  type: string;
  text: string;
  options?: QuestionOption[];
  explanation?: string;
  answer?: boolean; // Added answer property for true/false questions
};

// Estender a interface Window para incluir funções globais necessárias
declare global {
  interface Window {
    showQuestionDetails: (questionType: string, questionNumber: number) => void;
    generatedQuestions: Question[];
  }
}

interface QuestionSimulatorProps {
  onClose: () => void;
  sessionId: string;
  messages: any[];
}

const QuestionSimulator: React.FC<QuestionSimulatorProps> = ({ onClose, sessionId, messages }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Função para gerar questões de prova
  const generateExamQuestions = async (totalQuestions: number, multipleChoice: number, essay: number, trueFalse: number) => {
    setIsLoading(true);

    try {
      // Preparar o conteúdo da mensagem para a API
      const messagesContent = messages.map(msg => msg.content).join("\n\n");

      // Construir prompt para a API
      const prompt = `Com base no conteúdo da conversa a seguir, gere um conjunto de questões para avaliação:

${messagesContent}

Gere exatamente ${totalQuestions} questões no total, sendo:
- ${multipleChoice} questões de múltipla escolha (cada uma com 5 alternativas)
- ${essay} questões discursivas
- ${trueFalse} questões de verdadeiro ou falso

Para cada questão, forneça uma explicação detalhada da resposta correta.

Retorne as questões em formato JSON conforme este exemplo:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "text": "Qual é a capital do Brasil?",
    "options": [
      { "id": "a", "text": "Rio de Janeiro", "isCorrect": false },
      { "id": "b", "text": "São Paulo", "isCorrect": false },
      { "id": "c", "text": "Brasília", "isCorrect": true },
      { "id": "d", "text": "Salvador", "isCorrect": false },
      { "id": "e", "text": "Belo Horizonte", "isCorrect": false }
    ],
    "explanation": "Brasília é a capital federal do Brasil desde 21 de abril de 1960."
  },
  {
    "id": "q2",
    "type": "essay",
    "text": "Explique o processo de fotossíntese e sua importância para o ecossistema.",
    "explanation": "A fotossíntese é o processo pelo qual plantas, algas e algumas bactérias convertem luz solar, água e dióxido de carbono em glicose e oxigênio..."
  },
  {
    "id": "q3",
    "type": "true-false",
    "text": "O nitrogênio é o elemento mais abundante na atmosfera terrestre.",
    "answer": true,
    "explanation": "O nitrogênio constitui aproximadamente 78% da atmosfera terrestre, sendo o elemento mais abundante, seguido pelo oxigênio com 21%."
  }
]`;

      // Fazer a chamada à API
      const response = await generateAIResponse({
        sessionId,
        messages: [{ role: 'user', content: prompt }],
        saveHistory: false
      });

      // Extrair as questões da resposta
      const questionsText = response.message?.content || '';

      // Tentar extrair o JSON de questões
      let questionsData: Question[] = [];
      const jsonMatch = questionsText.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (jsonMatch) {
        try {
          questionsData = JSON.parse(jsonMatch[0]);

          // Verificar se temos questões
          if (questionsData.length === 0) {
            throw new Error("Nenhuma questão foi gerada");
          }

          // Salvar as questões para acesso global
          window.generatedQuestions = questionsData;

          // Fechar o modal de configuração antes de mostrar o resultado
          onClose();

          // Pequeno delay para garantir que o modal anterior seja fechado primeiro
          setTimeout(() => {
            // Mostrar o modal com as questões geradas
            showResultsModal(
              totalQuestions,
              multipleChoice,
              essay,
              trueFalse,
              messagesContent,
              questionsData
            );
          }, 100);
        } catch (error) {
          console.error("Erro ao parsear JSON de questões:", error);
          toast({
            title: "Erro ao gerar questões",
            description: "Não foi possível processar a resposta da IA. Tente novamente.",
            variant: "destructive"
          });
        }
      } else {
        console.error("Resposta não contém JSON válido:", questionsText);
        toast({
          title: "Erro no formato de resposta",
          description: "A IA não retornou um formato válido. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao gerar questões:", error);
      toast({
        title: "Erro ao gerar questões",
        description: "Ocorreu um erro ao comunicar com a IA. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para mostrar o modal de detalhes da questão
  const showQuestionDetailModal = (
    questionType: string, 
    questionNumber: number, 
    totalQuestions: number, 
    multipleChoice: number, 
    essay: number, 
    trueFalse: number, 
    messageContent: string, 
    questionsData: Question[]
  ) => {
    // Remover qualquer modal de detalhes de questão existente
    const existingDetailModal = document.getElementById('question-detail-modal-root');
    if (existingDetailModal) {
      existingDetailModal.remove();
    }

    // Criar um elemento raiz para o modal
    const modalRoot = document.createElement('div');
    modalRoot.id = 'question-detail-modal-root';
    document.body.appendChild(modalRoot);

    // Renderizar o componente QuestionDetailModal
    import('react-dom/client').then((ReactDOMClient) => {
      const reactRoot = ReactDOMClient.createRoot(modalRoot);
      reactRoot.render(
        <QuestionDetailModal
          questionType={questionType}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          multipleChoice={multipleChoice}
          essay={essay}
          trueFalse={trueFalse}
          messageContent={messageContent}
          questionsData={questionsData}
          onClose={() => {
            reactRoot.unmount();
            modalRoot.remove();
          }}
        />
      );
    });
  };

  // Função para mostrar o modal de resultados com questões geradas
  const showResultsModal = (
    totalQuestions: number, 
    multipleChoice: number, 
    essay: number, 
    trueFalse: number, 
    messageContent: string, 
    questionsData: Question[]
  ) => {
    // Remover qualquer modal de resultados existente
    const existingResultsModal = document.getElementById('questions-results-modal-root');
    if (existingResultsModal) {
      existingResultsModal.remove();
    }

    // Criar um elemento raiz para o modal
    const modalRoot = document.createElement('div');
    modalRoot.id = 'questions-results-modal-root';
    document.body.appendChild(modalRoot);

    // Renderizar o componente QuestionsResultsModal
    import('react-dom/client').then((ReactDOMClient) => {
      const reactRoot = ReactDOMClient.createRoot(modalRoot);
      reactRoot.render(
        <QuestionsResultsModal
          totalQuestions={totalQuestions}
          multipleChoice={multipleChoice}
          essay={essay}
          trueFalse={trueFalse}
          messageContent={messageContent}
          questionsData={questionsData}
          onClose={() => {
            reactRoot.unmount();
            modalRoot.remove();
          }}
        />
      );
    });
  };

  return (
    <QuestionConfigModal
      isLoading={isLoading}
      onClose={onClose}
      onGenerateQuestions={generateExamQuestions}
      sessionId={sessionId}
      messages={messages}
    />
  );
};

export default QuestionSimulator;