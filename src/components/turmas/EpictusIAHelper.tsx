import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, X, Sparkles, Lightbulb, Rocket } from "lucide-react";

interface EpictusIAHelperProps {
  context?: string;
  suggestions?: string[];
}

const EpictusIAHelper: React.FC<EpictusIAHelperProps> = ({
  context = "turmas",
  suggestions = [
    "Como posso melhorar meu desempenho nas turmas?",
    "Quais materiais complementares você recomenda?",
    "Ajude-me a criar um plano de estudos para esta disciplina",
    "Quais são os tópicos mais importantes desta matéria?",
  ],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const handleSendMessage = () => {
    if (!query.trim()) return;

    // Add user message to conversation
    setConversation((prev) => [...prev, { role: "user", content: query }]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "";
      if (query.toLowerCase().includes("desempenho")) {
        response =
          "Para melhorar seu desempenho, recomendo criar um cronograma de estudos consistente, revisar o conteúdo regularmente e praticar com exercícios. Também sugiro participar ativamente das discussões em aula e formar grupos de estudo com colegas.";
      } else if (
        query.toLowerCase().includes("material") ||
        query.toLowerCase().includes("recomenda")
      ) {
        response =
          "Baseado no seu perfil de aprendizado e no conteúdo da disciplina, recomendo os seguintes materiais complementares:\n\n1. Livro 'Fundamentos de Física' de Halliday e Resnick\n2. Videoaulas do canal 'Khan Academy'\n3. Artigos científicos recentes sobre mecânica quântica\n4. Simuladores interativos de experimentos físicos";
      } else if (
        query.toLowerCase().includes("plano") ||
        query.toLowerCase().includes("estudo")
      ) {
        response =
          "Aqui está um plano de estudos personalizado para você:\n\n**Semana 1-2:** Revisar conceitos fundamentais\n**Semana 3-4:** Aprofundar em tópicos avançados\n**Semana 5:** Resolver exercícios práticos\n**Semana 6:** Preparação para avaliações\n\nRecomendo dedicar 2 horas por dia, alternando entre teoria e prática.";
      } else if (
        query.toLowerCase().includes("tópico") ||
        query.toLowerCase().includes("importante")
      ) {
        response =
          "Os tópicos mais importantes desta disciplina são:\n\n1. Princípios fundamentais da mecânica quântica\n2. Equação de Schrödinger e suas aplicações\n3. Dualidade onda-partícula\n4. Princípio da incerteza de Heisenberg\n5. Aplicações modernas em computação quântica";
      } else {
        response =
          "Posso ajudar com informações sobre suas turmas, recomendações de estudo personalizadas, explicações de conceitos difíceis ou estratégias para melhorar seu desempenho. Como posso auxiliar especificamente com sua questão?";
      }

      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
      setIsLoading(false);
      setQuery("");
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Optional: automatically send the suggestion
    setConversation((prev) => [...prev, { role: "user", content: suggestion }]);
    setIsLoading(true);

    // Simulate AI response for suggestion
    setTimeout(() => {
      let response = "";
      if (suggestion.includes("desempenho")) {
        response =
          "Para melhorar seu desempenho, recomendo criar um cronograma de estudos consistente, revisar o conteúdo regularmente e praticar com exercícios. Também sugiro participar ativamente das discussões em aula e formar grupos de estudo com colegas.";
      } else if (suggestion.includes("materiais")) {
        response =
          "Baseado no seu perfil de aprendizado e no conteúdo da disciplina, recomendo os seguintes materiais complementares:\n\n1. Livro 'Fundamentos de Física' de Halliday e Resnick\n2. Videoaulas do canal 'Khan Academy'\n3. Artigos científicos recentes sobre mecânica quântica\n4. Simuladores interativos de experimentos físicos";
      } else if (suggestion.includes("plano")) {
        response =
          "Aqui está um plano de estudos personalizado para você:\n\n**Semana 1-2:** Revisar conceitos fundamentais\n**Semana 3-4:** Aprofundar em tópicos avançados\n**Semana 5:** Resolver exercícios práticos\n**Semana 6:** Preparação para avaliações\n\nRecomendo dedicar 2 horas por dia, alternando entre teoria e prática.";
      } else if (suggestion.includes("tópicos")) {
        response =
          "Os tópicos mais importantes desta disciplina são:\n\n1. Princípios fundamentais da mecânica quântica\n2. Equação de Schrödinger e suas aplicações\n3. Dualidade onda-partícula\n4. Princípio da incerteza de Heisenberg\n5. Aplicações modernas em computação quântica";
      } else {
        response =
          "Posso ajudar com informações sobre suas turmas, recomendações de estudo personalizadas, explicações de conceitos difíceis ou estratégias para melhorar seu desempenho. Como posso auxiliar especificamente com sua questão?";
      }

      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
      setIsLoading(false);
      setQuery("");
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 flex items-center gap-1"
        >
          <Brain className="h-3.5 w-3.5" />
          <span>Epictus IA</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#FF6B00]" />
            Epictus IA - Assistente de Estudos
          </DialogTitle>
          <DialogDescription>
            Tire dúvidas, peça recomendações ou obtenha ajuda personalizada para
            suas turmas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 max-h-[400px] pr-2 custom-scrollbar">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-[#FF6B00]" />
              </div>
              <h3 className="text-lg font-medium text-center">
                Como posso ajudar com suas turmas hoje?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                Faça perguntas sobre conteúdos, peça dicas de estudo ou solicite
                explicações sobre tópicos difíceis.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-[#FF6B00] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4 text-[#FF6B00]" />
                        <span className="text-xs font-medium text-[#FF6B00]">
                          Epictus IA
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-line text-sm">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-xs font-medium text-[#FF6B00]">
                        Epictus IA
                      </span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {conversation.length === 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start h-auto py-2 px-3 text-left text-xs border-[#FF6B00]/20 hover:bg-[#FF6B00]/5 hover:border-[#FF6B00]/30"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start gap-2">
                  {index % 2 === 0 ? (
                    <Lightbulb className="h-3.5 w-3.5 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                  ) : (
                    <Rocket className="h-3.5 w-3.5 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                  )}
                  <span className="line-clamp-2">{suggestion}</span>
                </div>
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Digite sua pergunta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!query.trim() || isLoading}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpictusIAHelper;
