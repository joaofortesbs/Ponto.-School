
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GrupoSairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSair: () => void;
  onExcluir: () => void;
  grupoNome: string;
}

const GrupoSairModal: React.FC<GrupoSairModalProps> = ({
  isOpen,
  onClose,
  onSair,
  onExcluir,
  grupoNome
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-gray-900 to-black border border-white/10 p-0 max-w-md rounded-xl overflow-hidden">
        <div className="flex flex-col">
          <DialogTitle className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
            <span className="text-white text-lg font-medium">Opções do Grupo</span>
            <Button
              variant="ghost"
              className="p-0 h-8 w-8 rounded-full hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-4 w-4 text-white/70" />
            </Button>
          </DialogTitle>
          
          <div className="p-6">
            <p className="text-white/80 mb-6">
              O que você deseja fazer com o grupo <span className="font-semibold text-white">"{grupoNome}"</span>?
            </p>
            
            <div className="space-y-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full py-6 flex justify-center items-center bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg font-medium text-sm transition-all duration-200"
                  onClick={onSair}
                >
                  Sair do Grupo
                </Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full py-6 flex justify-center items-center bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-lg font-medium text-sm transition-all duration-200"
                  onClick={onExcluir}
                >
                  Excluir Grupo
                </Button>
              </motion.div>
            </div>
            
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-transparent underline text-xs"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GrupoSairModal;
