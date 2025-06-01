
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateGroupModal from "@/components/turmas/CreateGroupModal";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";
import { useGruposEstudo, CreateGrupoEstudoData } from "@/hooks/useGruposEstudo";

const GruposEstudoView: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { grupos, loading } = useGruposEstudo();

  const handleCreateGroup = (formData: CreateGrupoEstudoData) => {
    // Group creation is handled in the form component
    setIsCreateModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-[#001427] dark:text-white font-montserrat">
            Grupos de Estudo
          </h2>
          <p className="text-[#64748B] dark:text-white/60 mt-1">
            {loading ? 'Carregando...' : `${grupos.length} grupos encontrados`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Button
            onClick={handleOpenModal}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Grupo
          </Button>
        </motion.div>
      </div>

      {/* Main Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GruposEstudoInterface grupos={grupos} loading={loading} />
      </motion.div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
};

export default GruposEstudoView;
