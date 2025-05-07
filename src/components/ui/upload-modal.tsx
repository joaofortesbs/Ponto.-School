
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Cloud, Clock, ChevronRight, FolderOpen } from "lucide-react";
import { Google, Microsoft } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (files: File[]) => void;
  position: { top: number; left: number };
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  position,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (onUpload && files.length > 0) {
      onUpload(files);
      setFiles([]);
      onClose();
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleOptionClick = (option: string) => {
    switch (option) {
      case "google":
        console.log("Conectar com Google Drive");
        // Implementar integração com Google Drive
        break;
      case "onedrive":
        console.log("Conectar com Microsoft OneDrive");
        // Implementar integração com OneDrive
        break;
      case "upload":
        setActiveTab("upload");
        openFileDialog();
        break;
      case "recent":
        setActiveTab("recent");
        // Implementar carregamento de arquivos recentes
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 pointer-events-auto"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 pointer-events-auto"
            style={{ 
              top: `${position.top}px`, 
              left: `${position.left}px` 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-b from-[#0c1c36] to-[#0a1625] border border-blue-500/20 text-white rounded-xl shadow-xl w-64 overflow-hidden">
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-200 mb-2">Selecione uma opção</h3>
                
                <div className="space-y-1">
                  {/* Google Drive Option */}
                  <button 
                    onClick={() => handleOptionClick("google")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-700/20 text-blue-400">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.66669 10L5.33335 5.33333L8.00002 10H2.66669Z" fill="#4285F4"/>
                        <path d="M5.33335 5.33333L8.00002 0.666666L10.6667 5.33333H5.33335Z" fill="#EA4335"/>
                        <path d="M8.00002 10L10.6667 5.33333L13.3334 10H8.00002Z" fill="#FBBC05"/>
                        <path d="M2.66669 10L5.33335 15.3333L8.00002 10H2.66669Z" fill="#34A853"/>
                        <path d="M8.00002 10L10.6667 15.3333L13.3334 10H8.00002Z" fill="#188038"/>
                      </svg>
                    </div>
                    <span className="text-sm">Conectar com Google Drive</span>
                  </button>
                  
                  {/* Microsoft OneDrive Option */}
                  <button 
                    onClick={() => handleOptionClick("onedrive")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.53335 5.33333C6.53335 3.86056 7.72724 2.66667 9.20002 2.66667C10.6728 2.66667 11.8667 3.86056 11.8667 5.33333C11.8667 6.80611 10.6728 8 9.20002 8C7.72724 8 6.53335 6.80611 6.53335 5.33333Z" fill="#0364B8"/>
                        <path d="M3.86669 9.33333C3.86669 8.22876 4.75879 7.33333 5.86335 7.33333C6.96792 7.33333 7.86002 8.22876 7.86002 9.33333C7.86002 10.4379 6.96792 11.3333 5.86335 11.3333C4.75879 11.3333 3.86669 10.4379 3.86669 9.33333Z" fill="#0078D4"/>
                        <path d="M10.1333 9.66667C10.1333 8.93029 10.7303 8.33333 11.4667 8.33333C12.203 8.33333 12.8 8.93029 12.8 9.66667C12.8 10.403 12.203 11 11.4667 11C10.7303 11 10.1333 10.403 10.1333 9.66667Z" fill="#1490DF"/>
                        <path d="M2.66669 12C2.66669 11.2636 3.26364 10.6667 4.00002 10.6667H11.3334C12.0697 10.6667 12.6667 11.2636 12.6667 12C12.6667 12.7364 12.0697 13.3333 11.3334 13.3333H4.00002C3.26364 13.3333 2.66669 12.7364 2.66669 12Z" fill="#28A8EA"/>
                      </svg>
                    </div>
                    <span className="text-sm">Conectar com OneDrive</span>
                  </button>
                  
                  {/* Upload Files Option */}
                  <button 
                    onClick={() => handleOptionClick("upload")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-700/20 text-purple-400">
                      <Upload size={14} />
                    </div>
                    <span className="text-sm">Carregar arquivos</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                    />
                  </button>
                  
                  {/* Recent Files Option */}
                  <button 
                    onClick={() => handleOptionClick("recent")}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-700/20 text-amber-400">
                        <Clock size={14} />
                      </div>
                      <span className="text-sm">Recentes</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                </div>
                
                {activeTab === "upload" && files.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <p className="text-xs text-gray-400 mb-2">
                      Arquivos selecionados ({files.length})
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-800/50 p-2 rounded-md text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <File className="h-3 w-3 text-blue-400" />
                            <span className="truncate max-w-[140px]">
                              {file.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(index);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs py-1 h-8 px-3"
                        onClick={handleUpload}
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeTab === "recent" && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <p className="text-xs text-gray-400 mb-2">
                      Arquivos recentes
                    </p>
                    <div className="text-center py-3 text-xs text-gray-500">
                      Nenhum arquivo recente disponível
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
