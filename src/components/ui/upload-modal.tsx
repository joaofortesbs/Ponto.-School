import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  X, 
  Clock, 
  ChevronRight, 
  FileText,
  Cloud
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  position?: { top: number; left: number };
}

export function UploadModal({ 
  isOpen, 
  onClose, 
  onUpload,
  position = { top: 0, left: 0 }
}: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 pointer-events-auto"
            style={{ 
              top: `${position.top}px`, 
              left: `${position.left}px` 
            }}
          >
            <div className="bg-gradient-to-br from-[#001A3B] to-[#051F3C] rounded-lg shadow-xl overflow-hidden border border-[#1E3A5F] w-64">
              <div className="flex items-center justify-between p-3 border-b border-[#1E3A5F]">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <Cloud size={14} className="mr-2 text-[#3B82F6]" />
                  Conectar arquivos
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full hover:bg-[#1E3A5F]/30 text-gray-400"
                  onClick={onClose}
                >
                  <X size={14} />
                </Button>
              </div>
              <div className="p-2">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1E3A5F]/30 rounded-md flex items-center transition-colors group"
                  onClick={() => {
                    console.log("Google Drive connection");
                    onClose();
                  }}
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-[#4285F4] to-[#0F9D58] rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 10L6 20l-3-5 9-13h6l9 13-3 5-6-10" />
                    </svg>
                  </div>
                  Conectar com Google Drive
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400" />
                </button>
                
                <button
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1E3A5F]/30 rounded-md flex items-center transition-colors group"
                  onClick={() => {
                    console.log("OneDrive connection");
                    onClose();
                  }}
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-[#0078D4] to-[#106EBE] rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M18 15v-4h-6v4" />
                      <circle cx="9" cy="9" r="6" />
                    </svg>
                  </div>
                  Conectar com OneDrive
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400" />
                </button>

                <button
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1E3A5F]/30 rounded-md flex items-center transition-colors group"
                  onClick={onUpload}
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] rounded-full mr-2">
                    <Upload size={14} className="text-white" />
                  </div>
                  Carregar arquivos
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400" />
                </button>

                <button
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1E3A5F]/30 rounded-md flex items-center transition-colors group"
                  onClick={() => {
                    console.log("Recent files");
                    onClose();
                  }}
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] rounded-full mr-2">
                    <Clock size={14} className="text-white" />
                  </div>
                  Recentes
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  );
}