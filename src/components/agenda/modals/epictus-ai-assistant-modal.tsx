import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  CheckSquare,
  Clock,
  List,
  Mic,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";

interface EpictusAIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EpictusAIAssistantModal: React.FC<EpictusAIAssistantModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<
    { type: "user" | "ai"; text: string }[]
  >([
    {
      type: "ai",
      text: "Olá! Sou o assistente Epictus IA. Como posso ajudar com sua agenda hoje?",
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to conversation
    setConversation([...conversation, { type: "user", text: message }]);

    // Simulate AI response
    setTimeout(() => {
      setConversation((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Entendi! Posso ajudar você a organizar sua agenda. Gostaria que eu criasse uma checklist para suas tarefas ou otimizasse seu calendário?",
        },
      ]);
    }, 1000);

    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-[#001427] to-[#29335C] text-white border-none">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Epictus IA
              </DialogTitle>
              <div className="text-sm text-gray-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#FF6B00]" />
                <span>Assistente inteligente para sua agenda</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Conversation area */}
        <div className="bg-[#29335C]/30 rounded-lg p-4 mb-4 h-[300px] overflow-y-auto">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 mb-3 ${msg.type === "user" ? "justify-end" : ""}`}
            >
              {msg.type === "ai" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=epictus" />
                  <AvatarFallback>IA</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[80%] text-sm ${msg.type === "ai" ? "bg-[#29335C]/50 text-gray-200" : "bg-[#FF6B00]/20 text-gray-200"}`}
              >
                {msg.text}
              </div>
              {msg.type === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                  <AvatarFallback>EU</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            className="border-[#29335C] text-gray-300 hover:bg-[#29335C]/30 hover:text-white"
          >
            <Calendar className="h-4 w-4 mr-1" /> Organizar Agenda
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#29335C] text-gray-300 hover:bg-[#29335C]/30 hover:text-white"
          >
            <CheckSquare className="h-4 w-4 mr-1" /> Criar Checklist
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#29335C] text-gray-300 hover:bg-[#29335C]/30 hover:text-white"
          >
            <Clock className="h-4 w-4 mr-1" /> Otimizar Tempo
          </Button>
        </div>

        {/* Input area */}
        <div className="relative">
          <Input
            placeholder="Digite sua mensagem..."
            className="bg-[#29335C]/30 border-[#29335C] text-white placeholder:text-gray-400 pr-24"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#29335C]/30"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpictusAIAssistantModal;
