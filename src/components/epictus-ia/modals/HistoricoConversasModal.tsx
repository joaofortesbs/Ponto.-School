import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HistoricoConversasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-[#001427] to-[#29335C] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Histórico de Conversas
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center h-40 text-gray-300">
          Seu histórico irá aparecer aqui
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;