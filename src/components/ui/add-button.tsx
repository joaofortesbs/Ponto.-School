
import React, { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import UploadModal from "./upload-modal";

interface AddButtonProps {
  onFilesSelected?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  isDisabled?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({ 
  onFilesSelected,
  fileInputRef: externalFileInputRef,
  isDisabled
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const localFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = externalFileInputRef || localFileInputRef;

  const handleUpload = (files: File[]) => {
    // Criar um evento sintético para simular uma seleção de arquivo
    const syntheticEvent = {
      target: {
        files: files
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    if (onFilesSelected) {
      onFilesSelected(syntheticEvent);
    }

    // Fechar o modal após enviar os arquivos
    setShowUploadModal(false);

    console.log("Arquivos enviados:", files);

    // Implementação do salvamento dos arquivos na lista de recentes
    if (files.length > 0) {
      try {
        // Converter Files para objetos serializáveis
        const recentFilesToSave = files.map(file => ({
          name: file.name,
          date: "Hoje",
          type: file.type,
          size: file.size
        }));

        // Obter arquivos existentes
        const existingFilesJson = localStorage.getItem('recentFiles');
        let existingFiles = existingFilesJson ? JSON.parse(existingFilesJson) : [];

        // Adicionar novos arquivos no início da lista (mais recentes primeiro)
        const updatedFiles = [...recentFilesToSave, ...existingFiles].slice(0, 10); // limitar a 10

        // Salvar no localStorage
        localStorage.setItem('recentFiles', JSON.stringify(updatedFiles));
        console.log("Arquivos recentes salvos no localStorage");
      } catch (error) {
        console.error("Erro ao salvar arquivos recentes:", error);
      }
    }
  };

  return (
    <>
      <Button 
        onClick={() => setShowUploadModal(true)} 
        disabled={isDisabled}
        className="flex-shrink-0 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                 flex items-center justify-center shadow-lg text-white"
      >
        <Plus className="h-4 w-4 mr-2" /> Adicionar Arquivos
      </Button>
      
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal
            open={showUploadModal}
            onOpenChange={setShowUploadModal}
            onUpload={handleUpload}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AddButton;
