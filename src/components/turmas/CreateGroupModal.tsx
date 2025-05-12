
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Users, Key, Plus } from "lucide-react";
import CreateGroupForm from "./CreateGroupForm";
import EntrarGrupoPorCodigoForm from "./EntrarGrupoPorCodigoForm";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [view, setView] = useState<'initial' | 'createGroup'>('initial');

  const handleBackToInitial = () => {
    setView('initial');
  };

  // Reset view when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setView('initial');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden max-w-4xl w-full shadow-xl relative"
          >
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="h-6 w-6 mr-3 text-[#FF6B00]" />
                  {view === 'initial' ? 'Novo Grupo de Estudo' : 'Criar Grupo de Estudo'}
                </h2>
                <p className="text-white/70 text-sm mt-1">
                  {view === 'initial' 
                    ? 'Você pode entrar em um grupo existente usando um código ou criar um novo grupo.'
                    : 'Preencha os detalhes do seu novo grupo. Você poderá editá-los posteriormente.'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              {view === 'initial' ? (
                <div className="space-y-6">
                  <EntrarGrupoPorCodigoForm />
                  
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#1E293B]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-[#0F172A] px-2 text-white/60">ou</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setView('createGroup')}
                    className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-6"
                  >
                    <Plus className="h-5 w-5 mr-2" /> Criar Novo Grupo
                  </Button>
                </div>
              ) : (
                <div>
                  <CreateGroupForm onSubmit={onSubmit} onCancel={handleBackToInitial} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
