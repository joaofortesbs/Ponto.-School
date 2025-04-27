
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, AlertCircle, Sparkles } from 'lucide-react';

interface FerramentasEmDesenvolvimentoModalProps {
  open: boolean;
  onClose: () => void;
}

const FerramentasEmDesenvolvimentoModal: React.FC<FerramentasEmDesenvolvimentoModalProps> = ({
  open,
  onClose
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1A2634] border-[#3A4B5C]/50 text-white p-0 overflow-hidden rounded-lg shadow-xl">
        <div className="relative">
          {/* Efeito de brilho de fundo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1A2634] via-[#253245] to-[#1A2634] opacity-80"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center p-4 border-b border-[#3A4B5C]/30">
              <h2 className="text-lg font-semibold flex items-center text-amber-400">
                <Sparkles className="h-5 w-5 mr-2 text-amber-400" />
                Função em Desenvolvimento
              </h2>
              <button 
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-white/90 mb-4">
                A funcionalidade "Aprofundar no tema" está atualmente em desenvolvimento e será disponibilizada em breve.
              </p>
              
              <div className="bg-[#2A3645] rounded-lg p-4 mb-4 border border-[#3A4B5C]/20">
                <p className="text-white/80 text-sm">
                  Nossa equipe está trabalhando para trazer uma experiência aprimorada com novas funcionalidades inteligentes para ajudar em seus estudos.
                </p>
              </div>
            </div>
            
            <div className="bg-[#1A2634] border-t border-[#3A4B5C]/30 p-3 flex justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors font-medium flex items-center"
              >
                <Sparkles className="h-4 w-4 mr-1.5 text-white" />
                Entendi
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FerramentasEmDesenvolvimentoModal;
