import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Calendar, CheckSquare, Lightbulb, Mic } from "lucide-react";

interface EpictusAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EpictusAIModal: React.FC<EpictusAIModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-[#001427] to-[#29335C] text-white border-none">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Epictus IA
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Seu assistente inteligente para organização acadêmica
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="bg-[#29335C]/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=epictus" />
              <AvatarFallback>IA</AvatarFallback>
            </Avatar>
            <div className="bg-[#29335C]/50 rounded-lg p-3 text-sm text-gray-200">
              Olá! Sou o Epictus IA, seu assistente pessoal. Como posso ajudar
              você hoje com sua agenda e organização acadêmica?
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <div className="bg-[#FF6B00]/20 rounded-lg p-3 text-sm text-gray-200">
              Preciso organizar meu tempo de estudo para a prova de Física
            </div>
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>EU</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-[#29335C] text-gray-300 hover:bg-[#29335C]/30 hover:text-white"
            >
              <Calendar className="h-4 w-4 mr-1" /> Criar evento
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-[#29335C] text-gray-300 hover:bg-[#29335C]/30 hover:text-white"
            >
              <CheckSquare className="h-4 w-4 mr-1" /> Criar tarefa
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-[#29335C] text-gray-300 hover:bg-[#29335C]/30 hover:text-white"
            >
              <Lightbulb className="h-4 w-4 mr-1" /> Sugestões
            </Button>
          </div>
          <div className="relative">
            <Input
              placeholder="Digite sua mensagem..."
              className="bg-[#29335C]/30 border-[#29335C] text-white placeholder:text-gray-400 pr-24"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#29335C]/30"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button className="h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpictusAIModal;
