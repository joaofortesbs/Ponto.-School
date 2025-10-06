import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  X,
  CheckCircle,
  Star,
  Clock,
  MessageCircle,
  Award,
  Info,
} from "lucide-react";

interface ExpertSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: any;
  request: any;
  onConfirm: (expert: any) => void;
}

export const ExpertSelectionModal: React.FC<ExpertSelectionModalProps> = ({
  isOpen,
  onClose,
  expert,
  request,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white font-montserrat">
              Selecionar Expert
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 border-2 border-[#FF6B00]/20">
              <AvatarImage src={expert.avatar} />
              <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                  {expert.name}
                </h3>
                {expert.verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{expert.rating}</span>
                <span className="mx-1">•</span>
                <span>{expert.completedRequests} pedidos concluídos</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#29335C] dark:text-white mb-2">
              Especialidades
            </h4>
            <div className="flex flex-wrap gap-2">
              {expert.specialties.map((specialty: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#29335C] dark:text-white mb-2">
              Sobre o Expert
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {expert.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-md p-3">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Tempo de Resposta
                </span>
              </div>
              <p className="text-sm font-medium text-[#29335C] dark:text-white">
                {expert.responseTime}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-md p-3">
              <div className="flex items-center gap-1 mb-1">
                <MessageCircle className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Pedidos Concluídos
                </span>
              </div>
              <p className="text-sm font-medium text-[#29335C] dark:text-white">
                {expert.completedRequests}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 flex items-start gap-2 mb-6">
            <Info className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Se você quiser comparar respostas de diferentes experts, você
                poderá selecionar outro expert posteriormente, utilizando mais
                School Points.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => onConfirm(expert)}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
            >
              Confirmar Seleção
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
