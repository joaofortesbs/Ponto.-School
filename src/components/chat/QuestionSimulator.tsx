
import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { generateAIResponse } from "@/services/aiChatService";
// Estender a interface Window para incluir função de mostrar progresso
declare global {
  interface Window {
    showQuestionDetails: (questionType: string, questionNumber: number) => void;
    generatedQuestions: Question[];
    handleMyProgressClick?: () => void;
  }
}
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

// Função para gerar questões fallback em caso de erro
const generateFallbackQuestions = (
  totalQuestions: number,
  multipleChoice: number,
  essay: number,
  trueFalse: number
): Question[] => {
  const questions: Question[] = [];
  let questionId = 1;
  
  // Gerar questões de múltipla escolha
  for (let i = 0; i < multipleChoice; i++) {
    if (questions.length < totalQuestions) {
      questions.push({
        id: `q${questionId}`,
        type: 'multiple-choice',
        text: `Qual é o principal conceito abordado no conteúdo apresentado? (Questão ${questionId})`,
        options: [
          { id: `q${questionId}-a`, text: 'Primeiro conceito importante', isCorrect: false },
          { id: `q${questionId}-b`, text: 'Segundo conceito relevante', isCorrect: true },
          { id: `q${questionId}-c`, text: 'Terceiro conceito relacionado', isCorrect: false },
          { id: `q${questionId}-d`, text: 'Quarto conceito mencionado', isCorrect: false },
          { id: `q${questionId}-e`, text: 'Quinto conceito complementar', isCorrect: false }
        ],
        explanation: 'Esta questão avalia sua compreensão sobre o tema principal discutido.'
      });
      questionId++;
    }
  }
  
  // Gerar questões discursivas
  for (let i = 0; i < essay; i++) {
    if (questions.length < totalQuestions) {
      questions.push({
        id: `q${questionId}`,
        type: 'essay',
        text: `Explique com suas palavras os principais conceitos abordados neste tema. (Questão ${questionId})`,
        explanation: 'Esta questão avalia sua capacidade de explicar o conteúdo com suas próprias palavras.'
      });
      questionId++;
    }
  }
  
  // Gerar questões de verdadeiro ou falso
  for (let i = 0; i < trueFalse; i++) {
    if (questions.length < totalQuestions) {
      questions.push({
        id: `q${questionId}`,
        type: 'true-false',
        text: `Os conceitos abordados neste tema são aplicáveis em diferentes contextos. (Questão ${questionId})`,
        answer: true,
        explanation: 'Esta afirmação é verdadeira pois os conceitos fundamentais discutidos possuem aplicações diversas.'
      });
      questionId++;
    }
  }
  
  return questions;
};

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
      console.log("Resposta da API:", questionsText);

      // Tentar extrair o JSON de questões com uma regex mais robusta
      let questionsData: Question[] = [];
      
      // Procurar por um JSON válido na resposta usando diferentes estratégias
      const findJson = (text: string) => {
        // Tenta encontrar um array JSON entre colchetes
        const jsonRegex = /\[\s*\{[\s\S]*?\}\s*\]/g;
        const matches = text.match(jsonRegex);
        
        if (matches && matches.length > 0) {
          // Tenta cada correspondência encontrada
          for (const match of matches) {
            try {
              const parsed = JSON.parse(match);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
            } catch (e) {
              console.log("Falha ao analisar match:", match);
            }
          }
        }
        
        // Tenta encontrar o JSON inteiro (fallback)
        try {
          // Verifica se o texto inteiro é um JSON válido
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.log("Texto completo não é um JSON válido");
        }
        
        return null;
      };
      
      const parsedQuestions = findJson(questionsText);
      
      if (parsedQuestions) {
        // Processar e validar as questões antes de usar
        questionsData = parsedQuestions.map((question, index) => {
          // Garantir que todas as questões tenham propriedades necessárias
          const processedQuestion = {
            ...question,
            id: question.id || `q${index + 1}`,
            text: question.text || `Questão ${index + 1} gerada automaticamente`,
            type: question.type || (
              // Inferir tipo da questão se não estiver especificado
              question.options && Array.isArray(question.options) ? 'multiple-choice' :
              typeof question.answer === 'boolean' ? 'true-false' : 'essay'
            ),
            explanation: question.explanation || "Explicação não disponível para esta questão."
          };
          
          // Para questões de múltipla escolha, garantir que as opções estão corretas
          if (processedQuestion.type === 'multiple-choice' && (!processedQuestion.options || !Array.isArray(processedQuestion.options))) {
            processedQuestion.options = [
              { id: `${processedQuestion.id}-a`, text: "Primeira opção", isCorrect: true },
              { id: `${processedQuestion.id}-b`, text: "Segunda opção", isCorrect: false },
              { id: `${processedQuestion.id}-c`, text: "Terceira opção", isCorrect: false },
              { id: `${processedQuestion.id}-d`, text: "Quarta opção", isCorrect: false },
              { id: `${processedQuestion.id}-e`, text: "Quinta opção", isCorrect: false }
            ];
          } else if (processedQuestion.type === 'multiple-choice') {
            // Verificar se pelo menos uma opção está marcada como correta
            const hasCorrect = processedQuestion.options.some(opt => opt.isCorrect);
            if (!hasCorrect && processedQuestion.options.length > 0) {
              processedQuestion.options[0].isCorrect = true;
            }
            
            // Garantir que todas as opções tenham IDs
            processedQuestion.options = processedQuestion.options.map((opt, i) => ({
              ...opt,
              id: opt.id || `${processedQuestion.id}-${String.fromCharCode(97 + i)}`,
              text: opt.text || `Opção ${i + 1}`
            }));
          }
          
          return processedQuestion;
        });
        
        console.log("Questões processadas com sucesso:", questionsData);
        
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
      } else {
        console.error("Resposta não contém JSON válido:", questionsText);
        
        // Gerar questões fallback para garantir que o modal apareça mesmo com erro
        const fallbackQuestions: Question[] = generateFallbackQuestions(
          totalQuestions,
          multipleChoice, 
          essay, 
          trueFalse
        );
        
        console.log("Usando questões de fallback:", fallbackQuestions);
        
        // Salvar as questões fallback para acesso global
        window.generatedQuestions = fallbackQuestions;
        
        // Fechar o modal de configuração
        onClose();
        
        // Mostrar o modal mesmo com questões fallback
        setTimeout(() => {
          showResultsModal(
            totalQuestions,
            multipleChoice,
            essay,
            trueFalse,
            messagesContent,
            fallbackQuestions
          );
          
          // Notificar o usuário sobre o problema, mas mostrar o resultado mesmo assim
          toast({
            title: "Aviso sobre as questões",
            description: "Algumas questões foram geradas automaticamente devido a um erro de formato.",
            variant: "default",
            duration: 5000
          });
        }, 100);
      }
    } catch (error) {
      console.error("Erro ao gerar questões:", error);
      
      // Mesmo com erro, gerar questões fallback
      const fallbackQuestions: Question[] = generateFallbackQuestions(
        totalQuestions,
        multipleChoice, 
        essay, 
        trueFalse
      );
      
      // Salvar as questões fallback para acesso global
      window.generatedQuestions = fallbackQuestions;
      
      // Fechar o modal de configuração
      onClose();
      
      // Mostrar o modal mesmo com questões fallback
      setTimeout(() => {
        showResultsModal(
          totalQuestions,
          multipleChoice,
          essay,
          trueFalse,
          messagesContent,
          fallbackQuestions
        );
        
        toast({
          title: "Erro ao gerar questões",
          description: "Algumas questões foram geradas automaticamente devido a um erro.",
          variant: "destructive",
          duration: 5000
        });
      }, 100);
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

    // Definir globalmente a função para mostrar detalhes da questão
    window.showQuestionDetails = (questionType: string, questionNumber: number) => {
      showQuestionDetailModal(
        questionType,
        questionNumber,
        totalQuestions,
        multipleChoice,
        essay,
        trueFalse,
        messageContent,
        questionsData
      );
    };

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
