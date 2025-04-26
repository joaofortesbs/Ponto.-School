
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoricoModal: React.FC<HistoricoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2634] text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-400"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Histórico de Conversas
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center h-40 text-gray-400">
          Seu histórico irá aparecer aqui
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoModal;
