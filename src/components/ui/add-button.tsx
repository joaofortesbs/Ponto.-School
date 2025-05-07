
import * as React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { UploadModal } from "./upload-modal";

export function AddButton() {
  const [showModal, setShowModal] = React.useState(false);
  
  const handleUpload = () => {
    // Simulando abertura do seletor de arquivos
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      // Aqui você poderia processar os arquivos selecionados
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        console.log(`${files.length} arquivo(s) selecionado(s)`);
        // Adicione aqui a lógica para processar os arquivos
        
        // Fecha o modal após o upload
        setShowModal(false);
      }
    };
    input.click();
  };

  return (
    <>
      <motion.button
        className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
      >
        <Plus size={20} />
      </motion.button>
      
      <UploadModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpload={handleUpload}
      />
    </>
  );
}
