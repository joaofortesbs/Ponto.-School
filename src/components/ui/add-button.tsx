
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import UploadModal from "./upload-modal";

interface AddButtonProps {
  onFileUpload?: (files: File[]) => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onFileUpload }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const handleButtonClick = (e: React.MouseEvent) => {
    // Posiciona o modal próximo ao botão
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + 10,
      left: rect.left
    });
    setShowUploadModal(true);
  };

  const handleUpload = (files: File[]) => {
    if (onFileUpload) {
      onFileUpload(files);
    }
    console.log("Arquivos enviados:", files);
  };

  return (
    <>
      <motion.button
        className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                 flex items-center justify-center shadow-lg text-white"
        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        onClick={handleButtonClick}
      >
        <Plus size={18} />
      </motion.button>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        position={modalPosition}
        onUpload={handleUpload}
      />
    </>
  );
};

export default AddButton;
