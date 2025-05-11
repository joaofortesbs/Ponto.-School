
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, LogOut, Trash2 } from "lucide-react";

interface GrupoSairModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupoId: string;
  grupoNome: string;
  onSair: (id: string) => void;
  onExcluir: (id: string) => void;
}

const GrupoSairModal: React.FC<GrupoSairModalProps> = ({
  isOpen,
  onClose,
  grupoId,
  grupoNome,
  onSair,
  onExcluir,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Confirmar Ação</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  O que você deseja fazer com o grupo "{grupoNome}"?
                </p>
                
                <div className="space-y-4 mt-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 p-4 h-auto border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 group"
                      onClick={() => {
                        onSair(grupoId);
                        onClose();
                      }}
                    >
                      <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-full group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60 transition-colors">
                        <LogOut className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800 dark:text-gray-200">Sair do grupo</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Você não participará mais das atividades, mas o grupo continuará existindo.
                        </p>
                      </div>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 p-4 h-auto border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 group"
                      onClick={() => {
                        // Confirmação adicional para exclusão
                        if (window.confirm(`Tem certeza que deseja EXCLUIR o grupo "${grupoNome}"? Esta ação não pode ser desfeita.`)) {
                          onExcluir(grupoId);
                          onClose();
                        }
                      }}
                    >
                      <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
                        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800 dark:text-gray-200">Excluir grupo</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Esta ação é irreversível. O grupo e todas suas atividades serão excluídos permanentemente.
                        </p>
                      </div>
                    </Button>
                  </motion.div>
                </div>

                <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p>
                    Nota: A exclusão do grupo só pode ser realizada pelo criador ou administradores do grupo.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default GrupoSairModal;
