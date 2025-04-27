
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, AlertCircle, Sparkles, Lightbulb, Code, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#121620] to-[#1E293B] border-none text-white p-0 overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(255,132,0,0.2)]">
        <div className="relative overflow-hidden">
          {/* Efeito de partículas de fundo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-amber-500/20 blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-blue-500/20 blur-xl"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-purple-500/20 blur-xl"></div>
          </div>

          {/* Linhas de grade decorativas */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-500">
                  Função em Desenvolvimento
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="rounded-full p-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-white/90 mb-5 leading-relaxed">
                A funcionalidade <span className="font-semibold text-amber-400">"Aprofundar no tema"</span> está atualmente em desenvolvimento e será disponibilizada em breve.
              </p>
              
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur-lg"></div>
                <div className="relative bg-[#29335C]/60 rounded-xl p-5 backdrop-blur-sm border border-white/10 mb-6">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/80 text-sm leading-relaxed">
                      Nossa equipe está trabalhando para trazer uma experiência aprimorada com novas funcionalidades inteligentes para ajudar em seus estudos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center gap-3 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/30"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20"></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#1A2634]/80 to-[#1E293B]/80 backdrop-blur-sm p-5 flex justify-center border-t border-white/5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 mr-1.5 text-white" />
                <span>Entendi</span>
              </motion.button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FerramentasEmDesenvolvimentoModal;
