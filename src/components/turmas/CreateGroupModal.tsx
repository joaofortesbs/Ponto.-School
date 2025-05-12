
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Users, Plus, ArrowLeft, Key } from "lucide-react";
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
  // Estado para controlar qual view está ativa: 'enterCode' (padrão) ou 'createGroup'
  const [view, setView] = useState<'enterCode' | 'createGroup'>('enterCode');

  // Esta função permite voltar para a view inicial de entrada por código
  const handleBackToCodeView = () => {
    setView('enterCode');
  };

  // Quando o modal fechar, resetamos a view para 'enterCode'
  const handleClose = () => {
    onClose();
    setView('enterCode');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          {view === 'enterCode' ? (
            // View de entrada por código
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden w-[500px] max-w-full shadow-xl relative"
            >
              <div className="sticky top-0 z-10 flex justify-between items-center bg-[#0F172A] border-b border-[#1E293B] p-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Key className="h-6 w-6 mr-3 text-[#FF6B00]" />
                  Entrar em Grupo
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                  onClick={handleClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6">
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
              </div>
            </motion.div>
          ) : (
            // View de criação de grupo
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden w-[650px] max-w-full shadow-xl relative"
            >
              <div className="sticky top-0 z-10 flex justify-between items-center bg-[#0F172A] border-b border-[#1E293B] p-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Users className="h-6 w-6 mr-3 text-[#FF6B00]" />
                    Criar Grupo de Estudo
                  </h2>
                  <p className="text-white/70 text-sm mt-1">
                    Preencha os detalhes do seu novo grupo. Você poderá editá-los posteriormente.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-full text-white/80 hover:text-white hover:bg-white/20 flex items-center gap-1"
                    onClick={handleBackToCodeView}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                    onClick={handleClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <CreateGroupForm onSubmit={onSubmit} onCancel={handleBackToCodeView} />
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
