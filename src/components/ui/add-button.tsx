
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

  const handleClick = (e: React.MouseEvent) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setShowUploadModal(true);
  };

  const handleUpload = (files: File[]) => {
    if (onFileUpload) {
      onFileUpload(files);
    }
  };

  return (
    <>
      <motion.button
        className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                 flex items-center justify-center shadow-lg text-white"
        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        <Plus size={18} />
      </motion.button>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        position={modalPosition}
      />
    </>
  );
};

export default AddButton;
