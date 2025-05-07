
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-14 relative z-50 pointer-events-auto"
          >
            <div className="bg-white dark:bg-[#0A2540] rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-64">
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium flex items-center">
                  <Upload size={14} className="mr-2 text-[#FF6B00]" />
                  Carregar arquivos
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={onClose}
                >
                  <X size={14} />
                </Button>
              </div>
              <div className="p-3">
                <Button
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF5500] hover:to-[#FF8B40] text-white border-0"
                  size="sm"
                  onClick={onUpload}
                >
                  Selecionar arquivos
                </Button>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
