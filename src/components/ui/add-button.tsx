import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface AddButtonProps {
  onFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isDisabled?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({ 
  onFilesSelected, 
  fileInputRef,
  isDisabled = false 
}) => {
  const handleClick = () => {
    if (fileInputRef.current && !isDisabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.button
      className={`flex-shrink-0 w-9 h-9 rounded-full bg-[#1230CC]/20 hover:bg-[#1230CC]/30
                flex items-center justify-center shadow-sm 
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileHover={{ scale: isDisabled ? 1 : 1.05, backgroundColor: isDisabled ? "" : "rgba(18, 48, 204, 0.3)" }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={isDisabled}
      title="Adicionar arquivos"
      type="button"
    >
      <Plus size={16} className="text-[#1230CC]" />
    </motion.button>
  );
};

export default AddButton;