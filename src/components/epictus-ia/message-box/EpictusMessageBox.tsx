import React, { useState, useRef, useEffect } from "react";
import { Send, Zap, Sparkles, Search, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import QuickActionButton from "./QuickActionButton";
import DeepSearchModal, { SearchOptions } from "./DeepSearchModal";

interface EpictusMessageBoxProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  charCount: number;
  MAX_CHARS: number;
  isTyping: boolean;
  handleButtonClick: (action: string) => void;
}

const EpictusMessageBox: React.FC<EpictusMessageBoxProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyDown,
  charCount,
  MAX_CHARS,
  isTyping,
  handleButtonClick,
}) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showDeepSearchModal, setShowDeepSearchModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        buttonRef.current &&
        !actionsRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeepSearch = (query: string, options: SearchOptions) => {
    const optionsText = Object.entries(options)
      .filter(([_, value]) => value)
      .map(([key]) => {
        switch(key) {
          case 'webGlobal': return 'Web Global';
          case 'academic': return 'Fontes Acadêmicas';
          case 'social': return 'Redes Sociais';
          case 'deepSearch': return 'Busca Profunda';
          default: return key;
        }
      })
      .join(', ');

    // Construir mensagem de pesquisa para enviar
    const searchMessage = `🔍 DeepSearch: "${query}" [Fontes: ${optionsText}]`;
    setInputMessage(searchMessage);

    // Opcional: enviar automaticamente após um breve atraso
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <div className="flex flex-col w-full space-y-2">
      <div className="relative">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Digite sua mensagem aqui..."
          className="min-h-[60px] resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 pr-16 text-md"
          onKeyDown={handleKeyDown}
        />
        <div className="absolute bottom-3 right-3">
          <Button
            type="submit"
            size="icon"
            className={`h-9 w-9 rounded-full ${
              inputMessage.trim() === ""
                ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#3A7BD5] to-[#4A90E2] text-white hover:from-[#3A7BD5]/90 hover:to-[#4A90E2]/90"
            }`}
            disabled={inputMessage.trim() === "" || isTyping}
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center space-x-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {charCount}/{MAX_CHARS}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              ref={buttonRef}
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-1 h-8 text-xs flex items-center gap-1.5"
              onClick={() => setShowActions(!showActions)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ações Rápidas
            </Button>

            {showActions && (
              <div
                ref={actionsRef}
                className="absolute left-0 top-full mt-1 w-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10"
              >
                <div className="grid grid-cols-2 gap-2">
                  <QuickActionButton
                    icon={<Zap className="h-3.5 w-3.5 text-yellow-500" />}
                    label="Sugestão Prompts"
                    onClick={() => handleButtonClick("SugestaoPrompts")}
                  />
                  <QuickActionButton
                    icon={<Sparkles className="h-3.5 w-3.5 text-blue-500" />}
                    label="Prompt Aprimorado"
                    onClick={() => handleButtonClick("PromptAprimorado")}
                  />
                  <QuickActionButton
                    icon={<Lightbulb className="h-3.5 w-3.5 text-green-500" />}
                    label="Inspiração"
                    onClick={() => handleButtonClick("Inspiracao")}
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-1 h-8 text-xs flex items-center gap-1.5"
            onClick={() => setShowDeepSearchModal(true)}
          >
            <Search className="h-3.5 w-3.5 text-blue-500" />
            Buscar
          </Button>
        </div>
      </div>

      <DeepSearchModal
        open={showDeepSearchModal}
        onOpenChange={setShowDeepSearchModal}
        onSearch={handleDeepSearch}
      />
    </div>
  );
};

export default EpictusMessageBox;