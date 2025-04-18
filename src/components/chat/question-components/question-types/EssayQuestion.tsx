import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateAIResponse } from "@/services/aiChatService";

interface EssayQuestionProps {
  selectedQuestion: any;
  questionNumber: number;
  messageContent: string;
}

export const EssayQuestion: React.FC<EssayQuestionProps> = ({
  selectedQuestion,
  questionNumber,
  messageContent
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<"pending" | "correct" | "partially" | "incorrect">("pending");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Questões padrão por tipo (para fallback)
  const essayQuestions = [
    "Explique com suas palavras os principais aspectos do tema apresentado.",
    "Disserte sobre a importância deste conteúdo para sua área de estudo.",
    "Descreva como você aplicaria estes conceitos em uma situação prática.",
    "Elabore uma análise crítica sobre o tema abordado.",
    "Compare os diferentes aspectos apresentados no material."
  ];

  const questionContent = selectedQuestion 
    ? selectedQuestion.text 
    : essayQuestions[(questionNumber - 1) % essayQuestions.length];

  useEffect(() => {
    // Mostrar botão de envio assim que o usuário começar a digitar qualquer coisa
    if (userAnswer.trim().length > 0 && !showSubmitButton) {
      setShowSubmitButton(true);
    }
  }, [userAnswer]);

  const handleSubmit = async () => {
    if (userAnswer.trim().length < 1) return;

    setIsSubmitting(true);

    try {
      // Construir o prompt para a IA analisar a resposta
      const analysisPrompt = `
      Você é um professor especialista em avaliação de respostas discursivas. 
      Analise a resposta do aluno em relação à questão proposta.

      Questão: ${questionContent}

      Resposta do aluno: ${userAnswer}

      Por favor, avalie nos seguintes critérios:
      1. Aderência ao tema principal da questão
      2. Profundidade do conhecimento demonstrado
      3. Clareza e coerência da argumentação
      4. Precisão das informações apresentadas

      Forneça:
      1. Uma avaliação sucinta (máximo 3 parágrafos)
      2. Pontos fortes da resposta
      3. Sugestões de melhoria
      4. Uma classificação final: CORRETA, PARCIALMENTE CORRETA ou INCORRETA

      Faça sua resposta direta, profissional e educativa, sem introduções como "Claro" ou "Vamos analisar".
      `;

      // Chamar a API para obter a análise da IA
      const response = await generateAIResponse(
        analysisPrompt,
        'essay_analysis',
        {
          intelligenceLevel: 'advanced',
          languageStyle: 'formal'
        }
      );

      // Processar classificação (extraindo da resposta)
      const lowerResponse = response.toLowerCase();
      let evaluationResult: "pending" | "correct" | "partially" | "incorrect" = "pending";

      if (lowerResponse.includes("correta") && !lowerResponse.includes("parcialmente correta") && !lowerResponse.includes("incorreta")) {
        evaluationResult = "correct";
      } else if (lowerResponse.includes("parcialmente correta")) {
        evaluationResult = "partially";
      } else if (lowerResponse.includes("incorreta")) {
        evaluationResult = "incorrect";
      }

      // Atualizar estados
      setFeedback(response);
      setEvaluation(evaluationResult);
    } catch (error) {
      console.error("Erro ao analisar resposta:", error);
      setFeedback("Ocorreu um erro ao analisar sua resposta. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {questionContent}
      </p>
      <div className="mt-4">
        <textarea 
          ref={textareaRef}
          placeholder="Digite sua resposta aqui..." 
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isSubmitting || feedback !== null}
        ></textarea>

        {showSubmitButton && !feedback && (
          <div className="mt-3 flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              {isSubmitting ? "Analisando..." : "Enviar!"}
            </Button>
          </div>
        )}

        {feedback && (
          <div className={`mt-4 p-4 rounded-lg border max-h-[50vh] max-w-[90%] mx-auto overflow-y-auto flex flex-col` +
          ` ${
            evaluation === "correct" 
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
              : evaluation === "partially" 
                ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}>
            <h3 className={`text-lg font-medium mb-2 ${
              evaluation === "correct" 
                ? "text-green-700 dark:text-green-300" 
                : evaluation === "partially" 
                  ? "text-yellow-700 dark:text-yellow-300"
                  : "text-red-700 dark:text-red-300"
            }`}>
              {evaluation === "correct" 
                ? "✓ Resposta Correta" 
                : evaluation === "partially" 
                  ? "⚠ Parcialmente Correta"
                  : "✗ Resposta Incorreta"}
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line flex-grow">
              {feedback}
            </div>
            <div className="mt-3 flex justify-end">
              <Button 
                onClick={() => {
                  setFeedback(null);
                  setEvaluation("pending");
                  // Opcional: limpar a resposta do usuário para permitir nova tentativa
                  // setUserAnswer("");
                }}
                variant="outline"
                className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                Voltar para edição
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};