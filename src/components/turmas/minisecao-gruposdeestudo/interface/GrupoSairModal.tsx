
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, Trash2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GrupoSairModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  isCreator: boolean;
  onLeaveGroup: () => void;
  onDeleteGroup: () => void;
}

const GrupoSairModal: React.FC<GrupoSairModalProps> = ({
  isOpen,
  onClose,
  groupName,
  isCreator,
  onLeaveGroup,
  onDeleteGroup,
}: GrupoSairModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white/95 to-white/90 dark:from-[#0A2540]/95 dark:to-[#071a2e]/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 via-transparent to-[#FF8C40]/5 dark:from-[#FF6B00]/10 dark:via-transparent dark:to-[#FF8C40]/5 rounded-2xl pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] opacity-80"></div>
        
        <DialogHeader className="border-b border-gray-200/50 dark:border-gray-700/50 p-6 relative">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 p-1"
          >
            <X className="h-5 w-5" />
          </button>
          
          <DialogTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <span>Confirmação</span>
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2 ml-[52px]">
            O que deseja fazer com o grupo <span className="font-semibold text-[#29335C] dark:text-white">"{groupName}"</span>?
          </p>
        </DialogHeader>
        
        <div className="py-6 px-6 space-y-5">
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onLeaveGroup}
            className="w-full flex items-center gap-4 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-300 group"
          >
            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <LogOut className="h-7 w-7" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-[#29335C] dark:text-white text-lg">Sair do grupo</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Você não receberá mais atualizações e conteúdos deste grupo</p>
            </div>
          </motion.button>
          
          {isCreator && (
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onDeleteGroup}
              className="w-full flex items-center gap-4 p-5 rounded-xl border border-red-100/50 dark:border-red-900/20 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all duration-300 group"
            >
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                <Trash2 className="h-7 w-7" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-[#29335C] dark:text-white text-lg">Excluir grupo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Esta ação é permanente e excluirá todo o conteúdo e histórico</p>
              </div>
              <div className="absolute right-4 -top-1">
                <span className="px-2 py-1 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md font-medium">
                  Admin
                </span>
              </div>
            </motion.button>
          )}
        </div>
        
        <DialogFooter className="border-t border-gray-200/50 dark:border-gray-700/50 py-4 px-6 bg-gray-50/80 dark:bg-gray-800/20">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="hover:bg-white dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GrupoSairModal;
