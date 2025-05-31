
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";

interface AddPartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPartnersModal({ isOpen, onClose }: AddPartnersModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0A2540]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#29335C] dark:text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#FF6B00]" />
            Adicionar Parceiros
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#29335C] dark:text-white">
              Buscar usuários
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite o nome ou username..."
                className="pl-10 border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
            >
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              onClick={() => {
                // Funcionalidade será implementada posteriormente
                console.log("Buscar parceiros");
                onClose();
              }}
            >
              Buscar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
