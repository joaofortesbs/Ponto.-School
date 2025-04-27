import React, { useState } from 'react';
import { MoreHorizontal, Copy, Share, Sparkles, BookOpen, DownloadCloud, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import FerramentasEmDesenvolvimentoModal from './FerramentasEmDesenvolvimentoModal';

interface MessageToolsDropdownProps {
  message: string;
  onCopy?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

const MessageToolsDropdown: React.FC<MessageToolsDropdownProps> = ({ 
  message,
  onCopy,
  onShare,
  onExport
}) => {
  const [showEmDesenvolvimentoModal, setShowEmDesenvolvimentoModal] = useState(false);
  const [ferramentaSelecionada, setFerramentaSelecionada] = useState('');

  const handleFerramentaClick = (nomeFerramenta: string) => {
    setFerramentaSelecionada(nomeFerramenta);
    setShowEmDesenvolvimentoModal(true);
  };

  return (
    <>
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Ferramentas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Opções da mensagem</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onCopy} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            <span>Copiar</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onShare} className="cursor-pointer">
            <Share className="mr-2 h-4 w-4" />
            <span>Compartilhar</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onExport} className="cursor-pointer">
            <DownloadCloud className="mr-2 h-4 w-4" />
            <span>Exportar como PDF</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={() => handleFerramentaClick('Aprofundar no tema')} 
            className="cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Aprofundar no tema</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => handleFerramentaClick('Gerar resumo')} 
            className="cursor-pointer"
          >
            <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
            <span>Gerar resumo</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
            <span>Continuar conversa</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FerramentasEmDesenvolvimentoModal 
        isOpen={showEmDesenvolvimentoModal}
        onClose={() => setShowEmDesenvolvimentoModal(false)}
        ferramenta={ferramentaSelecionada}
      />
    </>
  );
};

export default MessageToolsDropdown;