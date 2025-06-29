
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { PartyPopper, Copy, Users, Lock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: string;
    nome: string;
    codigo_unico: string;
    is_private: boolean;
    is_visible_to_all: boolean;
  };
}

export default function CelebrationModal({ isOpen, onClose, group }: CelebrationModalProps) {
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(group.codigo_unico);
    toast({
      title: "Código copiado!",
      description: "O código do grupo foi copiado para a área de transferência.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden max-w-md w-full shadow-xl"
      >
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <PartyPopper className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Parabéns! 🎉
          </h2>
          <p className="text-white/90">
            Seu grupo foi criado com sucesso!
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {group.nome}
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              {group.is_private ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Grupo Privado</span>
                </>
              ) : group.is_visible_to_all ? (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Visível para Todos</span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  <span>Grupo Restrito</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código de Acesso
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-2xl font-bold text-[#FF6B00] bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border-2 border-[#FF6B00]/20">
                  {group.codigo_unico}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCode}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Compartilhe este código com pessoas que você deseja convidar para o grupo
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          >
            Continuar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
