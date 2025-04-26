
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface HistoricoConversasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-4/5 max-w-4xl mx-auto bg-gradient-to-b from-[#0c2341] to-[#0f3562] text-white border border-white/10 rounded-xl shadow-xl backdrop-blur-lg">
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">Histórico de Conversas</h2>
            <p className="text-white/80 text-lg">Seu histórico irá aparecer aqui!</p>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;
