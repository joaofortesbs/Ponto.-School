
import React, { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface EpictusMessageBoxProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  isTyping: boolean;
  charCount: number;
  MAX_CHARS: number;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const EpictusMessageBox: React.FC<EpictusMessageBoxProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyDown,
  charCount,
  MAX_CHARS,
  isTyping
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [inputMessage]);

  return (
    <div className="w-[95%] max-w-4xl mx-auto">
      <div className="relative flex flex-col rounded-xl bg-gradient-to-r from-[#0b111e]/90 to-[#0f172a]/90 p-1 backdrop-blur-sm border border-[#2a3c56]/50 shadow-xl">
        <div className="flex flex-col space-y-2 p-2">
          <Textarea
            placeholder={isTyping ? "Aguarde enquanto a IA está pensando..." : "Enviar uma mensagem para a Epictus IA..."}
            className="min-h-[60px] max-h-[150px] border-none bg-transparent text-white placeholder:text-[#8f97a4] resize-none overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#4A90E2]/20"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            rows={1}
            ref={textareaRef}
          />
        </div>

        <div className="flex items-center justify-between p-2 pt-0">
          <div className="flex items-center text-[#8f97a4] text-xs">
            {charCount > 0 && (
              <span className={`${
                charCount > MAX_CHARS * 0.8 ? "text-yellow-500" : ""
              } ${charCount > MAX_CHARS * 0.95 ? "text-red-500" : ""}`}>
                {charCount}/{MAX_CHARS}
              </span>
            )}
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={isTyping}
            size="sm"
            className={`rounded-lg bg-gradient-to-r from-[#3A7BD5] to-[#4A90E2] text-white hover:from-[#2A6BC5] hover:to-[#3A80D2] transition-all duration-300`}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EpictusMessageBox;
