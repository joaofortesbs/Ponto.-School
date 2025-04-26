import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBoundary } from "react-error-boundary";

const MessageBoxFallback = ({ error, resetErrorBoundary }) => {
  console.error("Erro na caixa de mensagens:", error);
  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-red-50 dark:bg-red-900/10 p-4 mb-4">
      <p className="text-sm text-red-800 dark:text-red-200 text-center mb-2">
        Ocorreu um erro ao carregar a caixa de mensagens
      </p>
      <div className="flex justify-center">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors text-sm"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
};

const TurboMessageBox: React.FC = () => {
  console.log("Renderizando TurboMessageBox");
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);


  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Mensagem enviada:", message);
      setMessage("");
      // Aqui você implementaria a lógica para enviar a mensagem
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  try {
    return (
      <ErrorBoundary FallbackComponent={MessageBoxFallback}>
        <div className="mx-auto max-w-4xl px-4 mb-4">
          <div className={cn(
            "relative bg-white/5 dark:bg-[#11213a]/60 backdrop-blur-md border border-border/50 rounded-xl p-2 transition-all",
            isExpanded ? "pb-12" : ""
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 absolute top-1 left-1/2 transform -translate-x-1/2 -translate-y-[80%] bg-background dark:bg-[#11213a] border border-border/50 rounded-full z-10 hover:bg-muted"
              onClick={toggleExpanded}
            >
              <ChevronUp className={cn("h-4 w-4 transform transition-transform", isExpanded ? "rotate-180" : "")} />
            </Button>

            {isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/5 dark:bg-[#0a1728]/60 border-t border-border/50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Exemplos</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Modelos</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Personalidade</Button>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="relative flex items-end gap-1.5">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem para o Epictus IA..."
                className="min-h-[80px] border-0 focus-visible:ring-0 focus-visible:ring-transparent resize-none p-3 pr-12 bg-transparent dark:text-white"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          <div className="text-center mt-2 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span>Powered by</span>
              <span className="font-semibold">Epictus</span>
              <Sparkles className="h-3 w-3 text-blue-500" />
              <span className="font-semibold">IA</span>
            </span>
          </div>
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Erro fatal ao renderizar TurboMessageBox:", error);
    return (
      <div className="mx-auto max-w-4xl px-4 mb-4">
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg text-center">
          <p className="text-sm text-red-800 dark:text-red-200">
            Ocorreu um erro ao carregar a caixa de mensagens. Tente recarregar a página.
          </p>
        </div>
      </div>
    );
  }
};

export default TurboMessageBox;