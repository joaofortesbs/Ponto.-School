import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, MessageCircle, ArrowRight, Info } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onViewRequest: () => void;
  isMessageSent?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  request,
  onViewRequest,
  isMessageSent = false,
}) => {
  if (!isOpen) return null;

  if (isMessageSent) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="relative">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-green-500/20 to-green-400/10" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-tr from-green-500/20 to-green-400/10" />
            </div>

            {/* Content */}
            <div className="relative p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-montserrat">
                Mensagem Enviada com Sucesso!
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sua mensagem foi enviada para o aluno. Você receberá uma
                notificação quando houver uma resposta.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 w-full mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">
                    Informações de Ganhos
                  </h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 text-left">
                  Você receberá <span className="font-bold">85%</span> do valor
                  caso o aluno escolha você como expert para esta resposta, de
                  acordo com seu plano atual na plataforma.
                </p>
                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800/30">
                  <p className="text-xs text-blue-600 dark:text-blue-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Mensagem enviada com
                    sucesso para o aluno
                  </p>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <Button
                  className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  onClick={onClose}
                >
                  Entendi
                </Button>
              </div>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-2 right-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="relative">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/10" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-tr from-[#FF6B00]/20 to-[#FF8C40]/10" />
          </div>

          {/* Content */}
          <div className="relative p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-montserrat">
              Pedido Enviado com Sucesso!
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Seu pedido de ajuda foi publicado e está disponível para os
              experts. Você receberá notificações quando houver respostas ou
              lances.
            </p>

            <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-4 w-full mb-6 border border-[#FF6B00]/20">
              <h3 className="font-semibold text-[#FF6B00] mb-2 text-left">
                {request.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> Leilão ativo
                </span>
                <span>Lance inicial: {request.auction.currentBid} PC</span>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                onClick={onClose}
              >
                Fechar
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                onClick={onViewRequest}
              >
                Ver Pedido <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessModal;
