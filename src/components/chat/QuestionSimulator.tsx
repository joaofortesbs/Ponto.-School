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
      // Encontrar a última mensagem do assistente para usar como contexto
      const lastAIMessage = messages
        .filter(msg => msg.sender === 'assistant')
        .pop();

      const messageContent = lastAIMessage?.content || 'Conteúdo sobre o tema estudado';

      // Analisar a resposta que a IA gerou e o contexto da pergunta
      const analysisPrompt = `
      Analise a seguinte conversa:

      Minha resposta anterior: "${messageContent}"

      Com base nesta resposta e no contexto da conversa, gere ${totalQuestions} questões de avaliação, sendo:
      - ${multipleChoice} questões de múltipla escolha
      - ${essay} questões discursivas
      - ${trueFalse} questões de verdadeiro ou falso

      As questões devem avaliar os conceitos principais abordados na conversa e estar diretamente relacionadas ao tema.
      Formate a saída em JSON com a seguinte estrutura:
      [
        {
          "id": "q1",
          "type": "multiple-choice",
          "text": "Enunciado da pergunta",
          "options": [
            { "id": "q1-a", "text": "Alternativa A", "isCorrect": false },
            { "id": "q1-b", "text": "Alternativa B", "isCorrect": true },
            { "id": "q1-c", "text": "Alternativa C", "isCorrect": false },
            { "id": "q1-d", "text": "Alternativa D", "isCorrect": false }
          ],
          "explanation": "Explicação da resposta correta"
        }
      ]
      `;

      // Chamar a API para gerar as questões
      const questionsResponse = await generateAIResponse(
        analysisPrompt,
        sessionId || 'default_session',
        {
          intelligenceLevel: 'advanced',
          languageStyle: 'formal'
        }
      );

      // Tentar extrair o JSON de questões da resposta
      let questionsData = [];
      try {
        // Extrair apenas o JSON da resposta (que pode conter texto adicional)
        const jsonMatch = questionsResponse.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          questionsData = JSON.parse(jsonMatch[0]);
          console.log('Questões geradas com sucesso:', questionsData);
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (jsonError) {
        console.error('Erro ao parsear as questões JSON:', jsonError);
        questionsData = [];
      }

      // Armazenar as questões geradas em uma variável global para acesso posterior
      window.generatedQuestions = questionsData;

      // Criar função global para mostrar detalhes das questões
      window.showQuestionDetails = (questionType, questionNumber) => {
        showQuestionDetailModal(questionType, questionNumber, totalQuestions, multipleChoice, essay, trueFalse, messageContent, questionsData);
      };

      // Criar o modal de resultados
      showResultsModal(totalQuestions, multipleChoice, essay, trueFalse, messageContent, questionsData);

    } catch (error) {
      console.error('Erro ao gerar questões de prova:', error);
      toast({
        title: "Erro ao gerar questões",
        description: "Ocorreu um problema ao gerar as questões da prova.",
        variant: "destructive",
        duration: 3000,
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