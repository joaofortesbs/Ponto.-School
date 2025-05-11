
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, Trash2, AlertTriangle } from "lucide-react";

interface GrupoSairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaveGroup: () => void;
  onDeleteGroup: () => void;
  groupName: string;
  isCreator: boolean;
}

const GrupoSairModal = ({
  isOpen,
  onClose,
  onLeaveGroup,
  onDeleteGroup,
  groupName,
  isCreator = false
}: GrupoSairModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#0A2540] border-0 shadow-xl rounded-xl">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-3">
          <DialogTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#FF6B00]" />
            Confirmar ação
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            O que você deseja fazer com o grupo <span className="font-semibold text-[#29335C] dark:text-white">"{groupName}"</span>?
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={onLeaveGroup}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-[#29335C] dark:text-white">Sair do grupo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Você continuará na lista de membros até ser removido</p>
              </div>
            </button>
            
            {isCreator && (
              <button 
                onClick={onDeleteGroup}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-[#29335C] dark:text-white">Excluir grupo</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Essa ação é irreversível e excluirá todo o conteúdo</p>
                </div>
              </button>
            )}
          </div>
        </div>
        
        <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GrupoSairModal;
