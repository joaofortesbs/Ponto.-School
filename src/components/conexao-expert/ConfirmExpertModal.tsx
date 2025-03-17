import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Info, Star, X } from "lucide-react";

interface ConfirmExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expert: any;
}

const ConfirmExpertModal: React.FC<ConfirmExpertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  expert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-[#29335C] dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-[#FF6B00]" /> Escolher Expert
        </h3>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12 border border-[#FF6B00]/20">
              <AvatarImage
                src={
                  expert?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert?.name}`
                }
              />
              <AvatarFallback>{expert?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-[#29335C] dark:text-white">
                {expert?.name}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Star className="h-3 w-3 text-yellow-400" />{" "}
                {expert?.rating || "4.9"} ({expert?.ratingCount || "156"}{" "}
                avaliações)
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20 mb-4">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
              <Info className="h-4 w-4" /> Detalhes do Lance
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Valor</span>
                <div className="font-bold text-blue-800 dark:text-blue-300">
                  25 School Points
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Tempo de Resposta
                </span>
                <div className="font-bold text-blue-800 dark:text-blue-300">
                  &lt; 1 hora
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Prévia da Resposta
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Este expert forneceu uma resposta detalhada para sua dúvida. Ao
              escolher este expert, você terá acesso à resposta completa e
              poderá interagir diretamente através do chat privado.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
            onClick={onConfirm}
          >
            Escolher Expert
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmExpertModal;
