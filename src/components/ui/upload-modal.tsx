
import React, { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { motion } from "framer-motion";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (files: File[]) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  open,
  onOpenChange,
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
      onOpenChange(false);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#0c1c36] to-[#0a1625] border border-blue-500/20 text-white rounded-xl shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h3 className="font-medium text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Carregar Arquivos
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Selecione ou arraste os arquivos para upload
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-all ${
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
            <div className="flex flex-col items-center gap-2 cursor-pointer">
              <motion.div
                className="p-2 rounded-full bg-blue-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-6 w-6 text-blue-400" />
              </motion.div>
              <p className="text-sm font-medium text-gray-300">
                Clique ou arraste arquivos para esta área
              </p>
              <p className="text-xs text-gray-500">
                Suporta PDFs, imagens, documentos e mais
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-300 mb-2">
                Arquivos selecionados ({files.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800/50 p-2 rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-blue-400" />
                      <span className="truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
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

          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
