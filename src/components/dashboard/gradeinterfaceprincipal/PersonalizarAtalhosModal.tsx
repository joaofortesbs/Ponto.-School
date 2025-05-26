
import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Check, ArrowRight, Search, Filter, Layout, Grid3X3 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Input } from "@/components/ui/input";

// Define the shortcut type
export type Atalho = {
  id: number;
  nome: string;
  icone: React.ReactNode;
  cor: string;
  bgColor: string;
  link: string;
};

interface PersonalizarAtalhosModalProps {
  isOpen: boolean;
  onClose: () => void;
  atalhos: Atalho[];
  onSave: (atalhos: Atalho[]) => void;
  disponiveis: Atalho[];
}

// Helper to determine a category from color
const getCategoriaFromCor = (cor: string): string => {
  if (!cor || typeof cor !== 'string') return "Outros";
  
  if (cor.includes("blue")) return "Aprendizado";
  if (cor.includes("green")) return "Organização";
  if (cor.includes("purple")) return "Ferramentas";
  if (cor.includes("red")) return "Importante";
  if (cor.includes("orange")) return "Destaque";
  if (cor.includes("pink")) return "Criativo";
  return "Outros";
};

export default function PersonalizarAtalhosModal({
  isOpen,
  onClose,
  atalhos,
  onSave,
  disponiveis,
}: PersonalizarAtalhosModalProps) {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [selectedAtalhos, setSelectedAtalhos] = useState<Atalho[]>([...atalhos]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoria, setCategoria] = useState('');
  const maxAtalhos = 6;

  // Get all categories from available shortcuts
  const categorias = ["Todos", ...new Set(disponiveis.map(a => getCategoriaFromCor(a.cor)))];

  // Filter available shortcuts based on search term and category
  const filteredDisponiveis = disponiveis.filter((atalho) => {
    const matchesSearch = atalho.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !categoria || getCategoriaFromCor(atalho.cor) === categoria;
    return matchesSearch && matchesCategoria;
  });

  // Reset selected shortcuts when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAtalhos([...atalhos]);
      setSearchTerm('');
      setCategoria('');
    }
  }, [isOpen, atalhos]);

  const handleAddAtalho = (atalho: Atalho) => {
    if (selectedAtalhos.length >= maxAtalhos) {
      // Show max limit reached message
      return;
    }
    
    // Add the atalho if not already in selected
    if (!selectedAtalhos.some((a) => a.id === atalho.id)) {
      setSelectedAtalhos([...selectedAtalhos, atalho]);
    }
  };

  const handleRemoveAtalho = (id: number) => {
    setSelectedAtalhos(selectedAtalhos.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    onSave(selectedAtalhos);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedAtalhos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedAtalhos(items);
  };

  const isAtalhoSelected = (id: number) => {
    return selectedAtalhos.some((a) => a.id === id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`sm:max-w-[550px] h-[85vh] overflow-hidden flex flex-col ${isLightMode ? 'bg-white' : 'bg-[#001e3a]'} rounded-xl shadow-xl backdrop-blur-sm`}
        style={{
          boxShadow: isLightMode 
            ? '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 0 20px -5px rgba(0, 0, 0, 0.1)' 
            : '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(0, 30, 58, 0.4)'
        }}
      >
        {/* Elementos decorativos de fundo */}
        <div className="absolute -right-40 -top-40 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-40 -bottom-40 w-80 h-80 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <DialogHeader className="relative z-10 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
              <Grid3X3 className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className={`text-xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
              Personalizar Atalhos School
            </DialogTitle>
          </div>
          <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'} ml-1 mt-2`}>
            Organize até {maxAtalhos} atalhos para acesso rápido no seu painel. 
            Arraste para reordenar.
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-5 relative z-10">
          {/* Current shortcuts section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-5 rounded-xl ${isLightMode 
              ? 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100' 
              : 'bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30'
            } shadow-sm`}
          >
            <h3 className={`text-md font-semibold mb-3 flex items-center gap-2 ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
              <Layout className="h-4 w-4 opacity-70" />
              Meus Atalhos Atuais
            </h3>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="atalhos" direction="horizontal">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-3 gap-3"
                  >
                    {selectedAtalhos.map((atalho, index) => (
                      <Draggable key={atalho.id} draggableId={atalho.id.toString()} index={index}>
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                            className={`relative p-4 rounded-xl ${atalho.bgColor} flex flex-col items-center justify-center cursor-move group transition-all duration-200 ease-out shadow-sm hover:shadow-md`}
                            style={{
                              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <motion.button 
                              onClick={() => handleRemoveAtalho(atalho.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="absolute top-1.5 right-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                            <div className={`flex items-center justify-center p-2.5 rounded-full ${atalho.cor} shadow-sm mb-2`}>
                              {atalho.icone}
                            </div>
                            <span className="text-sm font-medium mt-1 text-center text-white drop-shadow-sm line-clamp-1">
                              {atalho.nome}
                            </span>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    
                    {/* Empty slots */}
                    {Array.from({ length: maxAtalhos - selectedAtalhos.length }).map((_, index) => (
                      <motion.div 
                        key={`empty-${index}`}
                        whileHover={{ scale: 1.02, borderColor: isLightMode ? '#FF8C40' : '#FF6B00', borderWidth: '2px' }}
                        className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 ${
                          isLightMode ? 'border-gray-200 bg-gray-50/50' : 'border-gray-600/50 bg-gray-800/20'
                        }`}
                      >
                        <div className={`flex items-center justify-center p-2.5 rounded-full ${
                          isLightMode ? 'bg-gray-100' : 'bg-gray-700/50'
                        } mb-2`}>
                          <Plus className={`w-5 h-5 ${isLightMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-xs mt-1 text-center ${
                          isLightMode ? 'text-gray-400' : 'text-gray-400'
                        }`}>
                          Vazio
                        </span>
                      </motion.div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            <AnimatePresence>
              {selectedAtalhos.length >= maxAtalhos && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-amber-500 flex items-center gap-1.5 mt-3 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Limite de {maxAtalhos} atalhos atingido. Remova um para adicionar outro.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <Separator className="opacity-50" />
          
          {/* Search and filter controls */}
          <div className="flex gap-3 items-center px-1 mt-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar atalhos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 h-10 border ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 focus:bg-white' 
                    : 'bg-gray-800/30 border-gray-700/50 focus:bg-gray-800/50'
                } rounded-lg`}
              />
            </div>
            
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={`h-10 rounded-lg border px-3 ${
                isLightMode 
                  ? 'bg-gray-50 border-gray-200 text-gray-700' 
                  : 'bg-gray-800/30 border-gray-700/50 text-gray-200'
              }`}
            >
              {categorias.map(cat => (
                <option key={cat} value={cat === "Todos" ? "" : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          {/* Available shortcuts section */}
          <div className="flex-1 overflow-y-auto px-1 pb-2 custom-scrollbar">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-md font-semibold flex items-center gap-2 ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                <Filter className="h-4 w-4 opacity-70" />
                Atalhos Disponíveis
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredDisponiveis.length} itens
              </span>
            </div>
            
            <div className="space-y-2 pr-1">
              <AnimatePresence>
                {filteredDisponiveis.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-lg text-center ${
                      isLightMode ? 'bg-gray-50 text-gray-500' : 'bg-gray-800/20 text-gray-400'
                    }`}
                  >
                    Nenhum atalho encontrado para "{searchTerm}"
                  </motion.div>
                ) : (
                  filteredDisponiveis.map((atalho) => (
                    <motion.div 
                      key={atalho.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isLightMode 
                          ? 'bg-white hover:bg-gray-50 border border-gray-100' 
                          : 'bg-gray-800/20 hover:bg-gray-800/40 border border-gray-700/30'
                      } transition-all duration-200 shadow-sm hover:shadow-md`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${atalho.bgColor} shadow-sm`}>
                          <div className={atalho.cor}>
                            {atalho.icone}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                            {atalho.nome}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getCategoriaFromCor(atalho.cor)}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isAtalhoSelected(atalho.id) ? "secondary" : "outline"}
                        className={`shadow-sm transition-all duration-200 ${
                          isAtalhoSelected(atalho.id) 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 hover:dark:bg-green-800/50 font-medium'
                            : 'hover:scale-105'
                        } ${selectedAtalhos.length >= maxAtalhos && !isAtalhoSelected(atalho.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isAtalhoSelected(atalho.id) && selectedAtalhos.length < maxAtalhos && handleAddAtalho(atalho)}
                        disabled={selectedAtalhos.length >= maxAtalhos && !isAtalhoSelected(atalho.id)}
                      >
                        {isAtalhoSelected(atalho.id) ? (
                          <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="flex items-center"
                          >
                            <Check className="h-4 w-4 mr-1" /> Adicionado
                          </motion.div>
                        ) : (
                          <motion.div className="flex items-center">
                            <Plus className="h-4 w-4 mr-1" /> Adicionar
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <DialogFooter className="pt-5 mt-2 gap-3 border-t border-gray-100 dark:border-gray-700/30 relative z-10">
          <Button
            variant="outline"
            onClick={handleCancel}
            className={`rounded-lg transition-all duration-200 hover:scale-105 ${isLightMode ? 'text-gray-600 border-gray-200' : 'text-gray-300 border-gray-700'}`}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-md hover:shadow-lg rounded-lg transition-all duration-200 hover:scale-105"
          >
            Salvar Alterações <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
