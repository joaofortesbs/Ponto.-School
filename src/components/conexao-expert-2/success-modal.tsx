import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Star } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onViewRequest: () => void;
  isMessageSent?: boolean;
  isExpertChosen?: boolean;
  onRateResponse?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  request,
  onViewRequest,
  isMessageSent,
  isExpertChosen,
  onRateResponse,
}) => {
  if (!isOpen) return null;

  let title = "Pedido criado com sucesso!";
  let message = "Seu pedido foi publicado e os experts já podem visualizá-lo.";
  let primaryButtonText = "Voltar para Pedidos";
  let primaryButtonAction = onClose;
  let showRateButton = false;

  if (request) {
    if (isExpertChosen) {
      title = "Expert escolhido com sucesso!";
      message =
        "A resposta do expert foi desbloqueada e está disponível para visualização.";
      primaryButtonText = "Ver Resposta Completa";
      primaryButtonAction = onViewRequest;
      showRateButton = true;
    } else if (isMessageSent) {
      title = "Mensagem enviada com sucesso!";
      message = "Sua mensagem foi enviada e o destinatário será notificado.";
      primaryButtonText = "Ver Detalhes do Pedido";
      primaryButtonAction = onViewRequest;
    } else {
      title = "Operação realizada com sucesso!";
      message = "Sua proposta foi enviada e o estudante será notificado.";
      primaryButtonText = "Ver Detalhes do Pedido";
      primaryButtonAction = onViewRequest;
    }
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
        <div className="p-6 text-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-xl font-bold text-[#29335C] dark:text-white mb-2">
            {title}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={primaryButtonAction}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full"
            >
              {primaryButtonText}
            </Button>

            {showRateButton && onRateResponse && (
              <Button
                variant="outline"
                onClick={onRateResponse}
                className="border-yellow-400 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 w-full"
              >
                <Star className="h-4 w-4 mr-2 text-yellow-400" /> Avaliar
                Resposta
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
            >
              Fechar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessModal;
