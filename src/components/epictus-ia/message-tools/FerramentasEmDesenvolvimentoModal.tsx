
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Construction } from "lucide-react";

interface FerramentasEmDesenvolvimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ferramenta: string;
}

const FerramentasEmDesenvolvimentoModal: React.FC<FerramentasEmDesenvolvimentoModalProps> = ({
  isOpen,
  onClose,
  ferramenta
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl border border-gray-100/80 dark:border-gray-700/80 shadow-xl rounded-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            <span className="bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-300 dark:to-amber-500 bg-clip-text text-transparent">
              Função em Desenvolvimento
            </span>
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 dark:text-gray-300">
            A funcionalidade "{ferramenta}" está atualmente em desenvolvimento e será disponibilizada em breve.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4 shadow-inner">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Nossa equipe está trabalhando para trazer uma experiência aprimorada com novas funcionalidades inteligentes para ajudar em seus estudos.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FerramentasEmDesenvolvimentoModal;
