
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RotinaContent from "./RotinaContent";

interface RotinaInteligenteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RotinaInteligenteModal: React.FC<RotinaInteligenteModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-[#FF6B00]/20"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="flex items-center justify-center flex-col">
                  <div className="flex items-center mb-2">
                    <Clock className="h-6 w-6 mr-2 text-white" />
                    <Sparkles className="h-5 w-5 text-white animate-pulse absolute ml-1 mt-0.5" />
                  </div>
                  <h2 className="text-3xl font-bold text-white text-center flex items-center">
                    Rotina Inteligente
                  </h2>
                  <p className="text-white/80 text-sm mt-2 max-w-md text-center">
                    Organize seu tempo com a ajuda da inteligência artificial para maximizar sua produtividade
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-0">
                <Tabs defaultValue="visualizar" className="w-full">
                  <div className="px-6 pt-6 border-b border-gray-200 dark:border-gray-700">
                    <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                      <TabsTrigger value="visualizar" className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white">
                        <Calendar className="h-4 w-4 mr-2" />
                        Visualizar
                      </TabsTrigger>
                      <TabsTrigger value="configurar" className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white">
                        <Clock className="h-4 w-4 mr-2" />
                        Configurar
                      </TabsTrigger>
                      <TabsTrigger value="otimizar" className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white">
                        <Brain className="h-4 w-4 mr-2" />
                        Otimizar
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="visualizar" className="p-6 h-[550px] overflow-y-auto">
                    <RotinaContent />
                  </TabsContent>

                  <TabsContent value="configurar" className="p-6 h-[550px] overflow-y-auto">
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">
                        Configure sua rotina base e atividades recorrentes
                      </p>
                      <Button className="mt-4 bg-[#FF6B00] text-white hover:bg-[#FF8C40]">
                        Descrever Minha Rotina
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="otimizar" className="p-6 h-[550px] overflow-y-auto">
                    <div className="flex flex-col items-center justify-center h-full">
                      <Sparkles className="h-10 w-10 text-[#FF6B00] mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Otimização Inteligente</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                        Deixe nossa IA analisar sua rotina atual, compromissos e preferências para sugerir
                        a distribuição ideal do seu tempo.
                      </p>
                      <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF8C40] hover:to-[#FF6B00]">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Otimizar Minha Rotina
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RotinaInteligenteModal;
