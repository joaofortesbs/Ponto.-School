
import React, { useState, useEffect } from "react";
import { X, Plus, Check, ArrowRight, Move, Search, Filter, Sparkles, AlertCircle } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const maxAtalhos = 6;

  // Reset selected shortcuts when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAtalhos([...atalhos]);
      setShowTip(true);
      // Auto-hide tip after 5 seconds
      const timer = setTimeout(() => setShowTip(false), 5000);
      return () => clearTimeout(timer);
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
      // Animate the addition with a subtle effect
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
    setIsDragging(false);
    if (!result.destination) return;
    
    const items = Array.from(selectedAtalhos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedAtalhos(items);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const isAtalhoSelected = (id: number) => {
    return selectedAtalhos.some((a) => a.id === id);
  };

  // Filter available shortcuts based on search term and category
  const filteredDisponiveis = disponiveis.filter((atalho) => {
    const matchesSearch = atalho.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !categoria || getCategoriaFromCor(atalho.cor) === categoria;
    return matchesSearch && matchesCategoria;
  });

  // Helper to determine a category from color
  const getCategoriaFromCor = (cor: string): string => {
    if (cor.includes("blue")) return "Aprendizado";
    if (cor.includes("orange") || cor.includes("amber")) return "Agenda";
    if (cor.includes("green")) return "Organização";
    if (cor.includes("purple")) return "IA";
    if (cor.includes("yellow")) return "Social";
    if (cor.includes("red")) return "Urgente";
    if (cor.includes("cyan") || cor.includes("indigo")) return "Ferramentas";
    if (cor.includes("pink")) return "Criativo";
    return "Outros";
  };

  // Get all categories from available shortcuts
  const categorias = ["Todos", ...new Set(disponiveis.map(a => getCategoriaFromCor(a.cor)))];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-[650px] h-[80vh] rounded-xl overflow-hidden flex flex-col ${
        isLightMode 
          ? 'bg-white border border-gray-100 shadow-xl' 
          : 'bg-gradient-to-b from-[#001e3a] to-[#00162b] border border-white/10 shadow-2xl'
      }`}>
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isLightMode ? 'bg-orange-50' : 'bg-[#FF6B00]/10'
              }`}>
                <Sparkles className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <DialogTitle className={`text-xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Personalizar Atalhos
                </DialogTitle>
                <p className={`text-sm mt-1 ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  Organize seus atalhos favoritos para acesso rápido
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className={`rounded-full transition-all hover:scale-110 ${
                isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
              }`}
            >
              <X className={`h-4 w-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </Button>
          </div>
        </DialogHeader>
        
        <AnimatePresence>
          {showTip && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mx-6 my-2 px-4 py-3 rounded-lg flex items-start gap-3 ${
                isLightMode ? 'bg-blue-50 text-blue-700' : 'bg-blue-900/30 text-blue-300'
              }`}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Dica:</p>
                <p>Arraste e solte os atalhos para reordená-los. Você pode adicionar até 6 atalhos.</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto -mr-2 -mt-1 h-6 w-6 rounded-full" 
                onClick={() => setShowTip(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4 px-6">
          {/* Current shortcuts section with premium design */}
          <div className={`p-4 rounded-xl ${
            isLightMode 
              ? 'bg-gradient-to-r from-gray-50 to-orange-50/30 border border-orange-100/50' 
              : 'bg-gradient-to-r from-gray-800/30 to-[#FF6B00]/5 border border-[#FF6B00]/10'
          }`}>
            <h3 className={`text-md font-medium mb-3 ${isLightMode ? 'text-gray-700' : 'text-gray-200'} flex items-center`}>
              <Move className="h-4 w-4 mr-2 opacity-70" /> Meus Atalhos 
              <Badge className={`ml-2 text-xs ${
                isLightMode 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-[#FF6B00]/20 text-[#FF6B00]'
              }`}>
                {selectedAtalhos.length}/{maxAtalhos}
              </Badge>
            </h3>
            
            <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
              <Droppable droppableId="atalhos" direction="horizontal">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-3 gap-3"
                  >
                    {selectedAtalhos.map((atalho, index) => (
                      <Draggable key={atalho.id} draggableId={atalho.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ scale: 1 }}
                            animate={{ 
                              scale: snapshot.isDragging ? 1.05 : 1,
                              boxShadow: snapshot.isDragging ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)" : "none"
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`relative p-3 rounded-xl ${atalho.bgColor} flex flex-col items-center justify-center cursor-move group`}
                          >
                            <motion.button 
                              onClick={() => handleRemoveAtalho(atalho.id)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                            <div className={`flex items-center justify-center p-2.5 rounded-full ${atalho.cor}`}>
                              {atalho.icone}
                            </div>
                            <span className="text-xs font-medium mt-2 text-center text-white">
                              {atalho.nome}
                            </span>
                            {/* Dragging visual indicator */}
                            {snapshot.isDragging && (
                              <div className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center">
                                <Move className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {/* Empty slots with premium design */}
                    {Array.from({ length: maxAtalhos - selectedAtalhos.length }).map((_, index) => (
                      <motion.div 
                        key={`empty-${index}`}
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: isDragging ? 0.5 : 0.7 }}
                        className={`p-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                          isLightMode 
                            ? 'border-orange-200/50 bg-orange-50/30' 
                            : 'border-[#FF6B00]/20 bg-[#FF6B00]/5'
                        }`}
                      >
                        <div className={`flex items-center justify-center p-2.5 rounded-full ${
                          isLightMode ? 'bg-orange-100/50' : 'bg-[#FF6B00]/10'
                        }`}>
                          <Plus className={`w-5 h-5 ${isLightMode ? 'text-orange-400' : 'text-[#FF6B00]/70'}`} />
                        </div>
                        <span className={`text-xs mt-2 text-center ${
                          isLightMode ? 'text-orange-500/70' : 'text-[#FF6B00]/50'
                        }`}>
                          Espaço Disponível
                        </span>
                      </motion.div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {selectedAtalhos.length >= maxAtalhos && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-amber-500 mt-3 flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Limite de {maxAtalhos} atalhos atingido. Remova um para adicionar outro.
              </motion.p>
            )}
          </div>
          
          <Separator className={isLightMode ? 'bg-gray-200' : 'bg-gray-700/50'} />
          
          {/* Search and filter section */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar atalhos..."
                className={`pl-9 ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 focus-visible:ring-orange-200' 
                    : 'bg-gray-800/30 border-gray-700 focus-visible:ring-[#FF6B00]/30'
                }`}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categorias.map((cat) => (
                <Badge
                  key={cat}
                  className={`cursor-pointer transition-all ${
                    (categoria === cat || (cat === "Todos" && !categoria)) 
                      ? (isLightMode 
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' 
                          : 'bg-[#FF6B00]/20 text-[#FF6B00] hover:bg-[#FF6B00]/30') 
                      : (isLightMode 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700')
                  }`}
                  onClick={() => setCategoria(cat === "Todos" ? null : cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Available shortcuts section with improved design */}
          <div className="flex-1 overflow-y-auto pr-2 rounded-lg">
            <h3 className={`text-md font-medium mb-3 ${isLightMode ? 'text-gray-700' : 'text-gray-200'} flex items-center`}>
              <Filter className="h-4 w-4 mr-2 opacity-70" /> Atalhos Disponíveis
            </h3>
            
            <div className="space-y-1.5">
              {filteredDisponiveis.length === 0 ? (
                <div className={`p-6 rounded-lg flex flex-col items-center justify-center ${
                  isLightMode ? 'bg-gray-50' : 'bg-gray-800/20'
                }`}>
                  <Search className={`h-8 w-8 mb-2 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Nenhum atalho encontrado para "{searchTerm}"
                  </p>
                </div>
              ) : (
                filteredDisponiveis.map((atalho) => (
                  <motion.div 
                    key={atalho.id}
                    initial={{ opacity: 0.9, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01, x: 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isLightMode 
                        ? 'hover:bg-orange-50/50 border border-transparent hover:border-orange-100/50' 
                        : 'hover:bg-[#FF6B00]/5 border border-transparent hover:border-[#FF6B00]/10'
                    } transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${atalho.bgColor}`}>
                        <div className={atalho.cor}>
                          {atalho.icone}
                        </div>
                      </div>
                      <div>
                        <span className={`font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                          {atalho.nome}
                        </span>
                        <Badge className={`text-[10px] ml-2 ${
                          isLightMode 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {getCategoriaFromCor(atalho.cor)}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={isAtalhoSelected(atalho.id) ? "secondary" : "outline"}
                      className={`${
                        isAtalhoSelected(atalho.id) 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 hover:dark:bg-green-800/50'
                          : ''
                      } ${selectedAtalhos.length >= maxAtalhos && !isAtalhoSelected(atalho.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isAtalhoSelected(atalho.id) && selectedAtalhos.length < maxAtalhos && handleAddAtalho(atalho)}
                      disabled={selectedAtalhos.length >= maxAtalhos && !isAtalhoSelected(atalho.id)}
                    >
                      {isAtalhoSelected(atalho.id) ? (
                        <><Check className="h-4 w-4 mr-1" /> Adicionado</>
                      ) : (
                        <><Plus className="h-4 w-4 mr-1" /> Adicionar</>
                      )}
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className={`${
              isLightMode 
                ? 'text-gray-600 hover:bg-gray-100 border-gray-200' 
                : 'text-gray-300 hover:bg-gray-800 border-gray-700'
            }`}
          >
            Cancelar
          </Button>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="default"
              onClick={handleSave}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF7B10] hover:to-[#FF9C50] shadow-md hover:shadow-lg transition-all"
            >
              Salvar Alterações <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
