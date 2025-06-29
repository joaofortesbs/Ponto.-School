
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, Users, Sparkles } from "lucide-react";

interface EntrarGrupoSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
}

const EntrarGrupoSuccessModal: React.FC<EntrarGrupoSuccessModalProps> = ({
  isOpen,
  onClose,
  groupName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden max-w-md w-full shadow-2xl border border-[#FF6B00]/20"
          >
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-6 text-center relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
              
              {/* Ícone de sucesso com animação */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
              >
                🎉 Parabéns!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-sm"
              >
                Você entrou no grupo com sucesso!
              </motion.p>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-[#FF6B00]" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {groupName}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Agora você faz parte deste grupo de estudos! Comece a interagir com outros membros e aproveite todos os recursos disponíveis.
                </p>
              </motion.div>

              {/* Recursos disponíveis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-lg p-4 mb-6 border border-[#FF6B00]/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    O que você pode fazer agora:
                  </span>
                </div>
                
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Participar de discussões do grupo</li>
                  <li>• Acessar materiais compartilhados</li>
                  <li>• Colaborar em projetos</li>
                  <li>• Conversar com outros membros</li>
                </ul>
              </motion.div>

              {/* Botão de ação */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium py-3"
                >
                  Começar a Explorar
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EntrarGrupoSuccessModal;
