
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserMinus, AlertTriangle } from "lucide-react";

interface RemoverMembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  onRemove: () => void;
}

const RemoverMembroModal: React.FC<RemoverMembroModalProps> = ({
  isOpen,
  onClose,
  memberName,
  onRemove
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-[#0f1525] rounded-xl p-6 mx-4 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-[#FF6B00]/10 rounded-full">
                <UserMinus className="h-6 w-6 text-[#FF6B00]" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Remover Membro
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Tem certeza que deseja remover <span className="font-medium text-gray-900 dark:text-white">{memberName}</span> do grupo?
            </p>

            {/* Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Esta funcionalidade está em desenvolvimento e será habilitada em breve.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancelar
              </Button>

              <Button
                onClick={onRemove}
                disabled={true}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              >
                Remover
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RemoverMembroModal;
