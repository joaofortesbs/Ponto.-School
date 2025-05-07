
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Cloud, FolderOpen, ChevronRight } from "lucide-react";

interface UploadModalPosition {
  top: number;
  left: number;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: UploadModalPosition;
  onUpload?: (files: File[]) => void;
}

// Ícones personalizados para melhor aparência
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11V8L17 12L12 16V13H8V11H12Z" fill="#ea4335"/>
    <path d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36003 19.27 5.23003 16.25 5.23003 12.27C5.23003 8.29 8.36003 5.27 12.19 5.27C15.68 5.27 17.53 7.53 17.53 7.53L19.42 5.71C19.42 5.71 16.86 3 12.15 3C6.47003 3 2.00003 7.56 2.00003 12.33C2.00003 17.1 6.47003 21.67 12.13 21.67C17.35 21.67 21.58 18.17 21.58 13.07C21.58 12.1 21.35 11.1 21.35 11.1Z" fill="#ea4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 3H3V11.4H11.4V3Z" fill="#F25022"/>
    <path d="M11.4 12.6H3V21H11.4V12.6Z" fill="#00A4EF"/>
    <path d="M21 3H12.6V11.4H21V3Z" fill="#7FBA00"/>
    <path d="M21 12.6H12.6V21H21V12.6Z" fill="#FFB900"/>
  </svg>
);

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  position,
  onUpload,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleCloudService = (service: string) => {
    console.log(`Conectando ao ${service}...`);
    // Implementação futura da conexão com o serviço
  };

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
          >
            <div className="w-[400px] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#0c1c36] to-[#0a1625] border border-blue-500/20 text-white">
              <div className="px-4 py-3 border-b border-blue-500/20 flex justify-between items-center">
                <h3 className="font-medium text-base text-white">Carregar Arquivos</h3>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-blue-500/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Opções principais organizadas verticalmente */}
                <div className="flex flex-col space-y-3">
                  {/* Opção Google Drive */}
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between bg-white/5 border-gray-700 hover:bg-white/10 text-gray-300 py-3"
                    onClick={() => handleCloudService('Google Drive')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <GoogleIcon />
                      </div>
                      <span className="text-sm font-medium">Conectar com o Google Drive</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </Button>
                  
                  {/* Opção Microsoft OneDrive */}
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between bg-white/5 border-gray-700 hover:bg-white/10 text-gray-300 py-3"
                    onClick={() => handleCloudService('Microsoft OneDrive')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <MicrosoftIcon />
                      </div>
                      <span className="text-sm font-medium">Conectar com o Microsoft OneDrive</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </Button>
                  
                  {/* Upload de Arquivos Locais */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer ${
                      isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                    />
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="p-2 rounded-full bg-blue-500/20">
                        <Upload className="h-5 w-5 text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-center text-gray-300">
                        Clique ou arraste arquivos para esta área
                      </p>
                      <p className="text-xs text-center text-gray-500">
                        Suporta PDFs, imagens, documentos e mais
                      </p>
                    </div>
                  </div>
                  
                  {/* Visualização de arquivos recentes */}
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between bg-white/5 border-gray-700 hover:bg-white/10 text-gray-300 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <FolderOpen className="h-4 w-4 text-amber-400" />
                      </div>
                      <span className="text-sm font-medium">Recentes</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>

                {/* Lista de arquivos selecionados */}
                {files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">
                      Arquivos selecionados ({files.length})
                    </p>
                    <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-800/50 p-1.5 rounded-md text-xs"
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <File className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            <span className="truncate max-w-[280px]">
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
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-300 border-gray-700 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={files.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Enviar
                  </Button>
                </div>
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
