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

  // Filter available shortcuts based on search term and category
  const filteredDisponiveis = disponiveis.filter((atalho) => {
    const matchesSearch = atalho.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !categoria || getCategoriaFromCor(atalho.cor) === categoria;
    return matchesSearch && matchesCategoria;
  });

  // Get all categories from available shortcuts
  const categorias = ["Todos", ...new Set(disponiveis.map(a => getCategoriaFromCor(a.cor)))];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-[680px] h-[82vh] rounded-2xl overflow-hidden flex flex-col ${
        isLightMode 
          ? 'bg-gradient-to-br from-white to-orange-50/30 border border-orange-100/40 shadow-[0_10px_40px_-5px_rgba(255,107,0,0.15)]' 
          : 'bg-gradient-to-br from-[#001e3a] to-[#00162b] border border-[#FF6B00]/15 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.4)]'
      }`}>
        {/* Elementos decorativos de fundo */}
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-60" style={{ animationDuration: '12s' }}></div>

        <DialogHeader className="px-7 pt-7 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                isLightMode 
                  ? 'bg-gradient-to-br from-orange-100 to-orange-50 shadow-md border border-orange-100/50' 
                  : 'bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/10 border border-[#FF6B00]/20 shadow-lg'
              }`}>
                <Sparkles className="h-6 w-6 text-[#FF6B00]" />
              </div>
              <div>
                <DialogTitle className={`text-xl font-bold tracking-tight ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Personalizar Atalhos
                </DialogTitle>
                <p className={`text-sm mt-1.5 ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  Organize seus atalhos favoritos para acesso rápido
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className={`rounded-full p-2 transition-all ${
                  isLightMode 
                    ? 'hover:bg-orange-100/50 text-gray-500 hover:text-gray-700' 
                    : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </DialogHeader>

        <AnimatePresence>
          {showTip && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
              className={`mx-7 my-3 px-5 py-3.5 rounded-xl flex items-start gap-3.5 shadow-sm ${
                isLightMode ? 'bg-gradient-to-r from-blue-50 to-blue-50/70 border border-blue-200/40 text-blue-700' : 'bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-700/20 text-blue-300'
              }`}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div className="text-sm">
                <p className="font-semibold">Dica:</p>
                <p>Arraste e solte os atalhos para reordená-los. Você pode adicionar até 6 atalhos.</p>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto -mr-2 -mt-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100" 
                  onClick={() => setShowTip(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden flex flex-col gap-5 px-7 py-3 relative z-10">
          {/* Current shortcuts section with premium design */}
          <div className={`p-5 rounded-2xl backdrop-blur-sm ${
            isLightMode 
              ? 'bg-gradient-to-r from-white/90 to-orange-50/80 border border-orange-100/60 shadow-lg' 
              : 'bg-gradient-to-r from-gray-800/50 to-[#FF6B00]/5 border border-[#FF6B00]/20 shadow-xl'
          }`}>
            <h3 className={`text-md font-semibold mb-4 ${isLightMode ? 'text-gray-800' : 'text-gray-100'} flex items-center`}>
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: isDragging ? 15 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Move className="h-5 w-5 mr-2.5 opacity-80" />
              </motion.div>
              <span>Meus Atalhos</span>
              <Badge className={`ml-2.5 px-2.5 py-0.5 text-xs ${
                isLightMode 
                  ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 shadow-sm border border-orange-200/50' 
                  : 'bg-gradient-to-r from-[#FF6B00]/20 to-[#FF6B00]/30 text-[#FF6B00] border border-[#FF6B00]/30 shadow-inner'
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
                    className="grid grid-cols-3 gap-4 relative"
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
                              scale: snapshot.isDragging ? 1.08 : 1,
                              boxShadow: snapshot.isDragging 
                                ? "0 15px 30px -8px rgba(0, 0, 0, 0.25)" 
                                : "0 4px 12px rgba(0, 0, 0, 0.1)",
                              zIndex: snapshot.isDragging ? 50 : 1
                            }}
                            whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)" }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`relative p-4 rounded-xl ${atalho.bgColor} flex flex-col items-center justify-center cursor-move group`}
                          >
                            {/* Efeito de brilho de borda quando arrastando */}
                            {snapshot.isDragging && (
                              <motion.div 
                                className="absolute inset-0 rounded-xl opacity-70"
                                style={{ 
                                  background: `radial-gradient(circle at center, ${atalho.bgColor.replace('bg-', 'rgba(').replace(')', ', 0.8)')}, transparent 70%)`,
                                  filter: "blur(8px)",
                                  zIndex: -1
                                }}
                                animate={{ opacity: [0.5, 0.7, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              />
                            )}

                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              whileHover={{ scale: 1.2, backgroundColor: '#f43f5e' }}
                              whileTap={{ scale: 0.9 }}
                              animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                            >
                              <X className="w-3 h-3" />
                            </motion.div>

                            <motion.div 
                              whileHover={{ scale: 1.08, y: -2 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              className={`flex items-center justify-center p-3 rounded-full ${atalho.cor} shadow-lg`}
                            >
                              {atalho.icone}
                            </motion.div>

                            <span className="text-xs font-medium mt-3 text-center text-white px-1">
                              {atalho.nome}
                            </span>

                            {/* Dragging visual indicator */}
                            {snapshot.isDragging && (
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Move className="h-7 w-7 text-white drop-shadow-lg" />
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </Draggable>
                    ))}

                    {/* Empty slots with premium design */}
                    {Array.from({ length: maxAtalhos - selectedAtalhos.length }).map((_, index) => (
                      <motion.div 
                        key={`empty-${index}`}
                        initial={{ opacity: 0.6, scale: 0.98 }}
                        animate={{ 
                          opacity: isDragging ? 0.4 : [0.6, 0.7, 0.6], 
                          scale: isDragging ? 0.96 : 1,
                          boxShadow: isDragging ? "none" : "0 2px 8px rgba(0, 0, 0, 0.05)"
                        }}
                        transition={isDragging ? 
                          { duration: 0.2 } : 
                          { repeat: Infinity, duration: 4, ease: "easeInOut" }
                        }
                        className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                          isLightMode 
                            ? 'border-orange-200/60 bg-gradient-to-br from-orange-50/40 to-orange-50/20' 
                            : 'border-[#FF6B00]/30 bg-gradient-to-br from-[#FF6B00]/8 to-[#FF6B00]/3'
                        }`}
                      >
                        <motion.div 
                          whileHover={{ scale: 1.1, y: -2 }}
                          className={`flex items-center justify-center p-3 rounded-full ${
                            isLightMode ? 'bg-gradient-to-br from-orange-100/70 to-orange-100/30' : 'bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/10'
                          } shadow-sm`}
                        >
                          <Plus className={`w-5 h-5 ${isLightMode ? 'text-orange-500' : 'text-[#FF6B00]/80'}`} />
                        </motion.div>
                        <span className={`text-xs mt-3 text-center font-medium ${
                          isLightMode ? 'text-orange-600/80' : 'text-[#FF6B00]/70'
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`mt-4 px-4 py-3 rounded-lg flex items-center gap-2.5 ${
                  isLightMode 
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm' 
                    : 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30'
                }`}
              >
                <AlertCircle className={`h-5 w-5 flex-shrink-0 ${isLightMode ? 'text-amber-500' : 'text-amber-400'}`} strokeWidth={2} />
                <p className={`text-sm font-medium ${isLightMode ? 'text-amber-600' : 'text-amber-300'}`}>
                  Limite de {maxAtalhos} atalhos atingido. Remova um para adicionar outro.
                </p>
              </motion.div>
            )}
          </div>

          <div className="relative py-2">
            <Separator className={isLightMode ? 'bg-gradient-to-r from-gray-200 via-orange-200/50 to-gray-200' : 'bg-gradient-to-r from-gray-700/30 via-[#FF6B00]/20 to-gray-700/30'} />
            <div className="absolute inset-x-0 top-1/2 flex justify-center">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isLightMode 
                  ? 'bg-white text-gray-500 shadow-sm border border-gray-100' 
                  : 'bg-[#001a33] text-gray-400 shadow-md border border-gray-800'
              }`}>
                Biblioteca de Atalhos
              </div>
            </div>
          </div>

          {/* Search and filter section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
            <div className="relative flex-1 group">
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all group-focus-within:text-orange-500 ${
                isLightMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Search className="h-4 w-4" />
              </div>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar atalhos..."
                className={`pl-9 transition-all ${
                  isLightMode 
                    ? 'bg-gray-50/80 border-gray-200 focus-visible:ring-orange-200 focus-visible:border-orange-300' 
                    : 'bg-gray-800/40 border-gray-700 focus-visible:ring-[#FF6B00]/30 focus-visible:border-[#FF6B00]/50'
                } rounded-lg`}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {categorias.map((cat) => (
                <motion.div key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge
                    className={`cursor-pointer transition-all px-2.5 py-1 text-xs font-medium shadow-sm ${
                      (categoria === cat || (cat === "Todos" && !categoria)) 
                        ? (isLightMode 
                            ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 hover:from-orange-200 hover:to-orange-300 border border-orange-200/50' 
                            : 'bg-gradient-to-r from-[#FF6B00]/20 to-[#FF6B00]/30 text-[#FF6B00] hover:from-[#FF6B00]/30 hover:to-[#FF6B00]/40 border border-[#FF6B00]/30') 
                        : (isLightMode 
                            ? 'bg-gradient-to-r from-gray-100 to-gray-200/70 text-gray-600 hover:from-gray-200/70 hover:to-gray-200 border border-gray-200/50' 
                            : 'bg-gradient-to-r from-gray-800/80 to-gray-800/50 text-gray-300 hover:from-gray-700 hover:to-gray-700/70 border border-gray-700/50')
                    }`}
                    onClick={() => setCategoria(cat === "Todos" ? null : cat)}
                  >
                    {cat}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Available shortcuts section with improved design */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className={`text-md font-semibold mb-3 ${isLightMode ? 'text-gray-800' : 'text-gray-100'} flex items-center`}>
              <Filter className="h-5 w-5 mr-2.5 opacity-80" /> 
              <span>Atalhos Disponíveis</span>
              <Badge className={`ml-2.5 ${
                isLightMode ? 'bg-gray-100 text-gray-700 border border-gray-200/50' : 'bg-gray-800 text-gray-300 border border-gray-700/50'
              }`}>
                {filteredDisponiveis.length}
              </Badge>
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 rounded-lg space-y-2 custom-scrollbar">
              {filteredDisponiveis.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-8 rounded-xl flex flex-col items-center justify-center ${
                    isLightMode ? 'bg-gray-50/80 border border-gray-100' : 'bg-gray-800/30 border border-gray-700/40'
                  }`}
                >
                  <div className={`p-3 rounded-full ${
                    isLightMode ? 'bg-gray-100' : 'bg-gray-700/50'
                  } mb-3`}>
                    <Search className={`h-6 w-6 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <p className={`text-sm font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Nenhum atalho encontrado para "{searchTerm}"
                  </p>
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="mt-2 text-xs"
                    >
                      Limpar busca
                    </Button>
                  )}
                </motion.div>
              ) : (
                <AnimatePresence>
                  {filteredDisponiveis.map((atalho, index) => (
                    <motion.div 
                      key={atalho.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30,
                        delay: index * 0.03 // Efeito cascata
                      }}
                      whileHover={{ 
                        scale: 1.02, 
                        x: 3,
                        boxShadow: isLightMode 
                          ? "0 4px 12px rgba(255, 107, 0, 0.08)" 
                          : "0 4px 12px rgba(0, 0, 0, 0.2)" 
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl ${
                        isLightMode 
                          ? 'hover:bg-gradient-to-r from-orange-50/70 to-orange-50/20 border border-transparent hover:border-orange-100/60' 
                          : 'hover:bg-gradient-to-r from-[#FF6B00]/8 to-transparent border border-transparent hover:border-[#FF6B00]/20'
                      } transition-all`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-lg ${atalho.bgColor} shadow-sm`}>
                          <div className={`${atalho.cor}`}>
                            {atalho.icone}
                          </div>
                        </div>
                        <div>
                          <span className={`font-medium ${isLightMode ? 'text-gray-800' : 'text-gray-200'}`}>
                            {atalho.nome}
                          </span>
                          <Badge className={`text-[10px] ml-2 px-1.5 py-0 ${
                            isLightMode 
                              ? 'bg-gray-100 text-gray-600 border border-gray-200/40' 
                              : 'bg-gray-700/80 text-gray-300 border border-gray-600/40'
                          }`}>
                            {getCategoriaFromCor(atalho.cor)}
                          </Badge>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant={isAtalhoSelected(atalho.id) ? "secondary" : "outline"}
                          className={`shadow-sm ${
                            isAtalhoSelected(atalho.id) 
                              ? (isLightMode
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 hover:from-green-200 hover:to-green-300 border border-green-200/50' 
                                : 'bg-gradient-to-r from-green-900/40 to-green-800/30 text-green-400 hover:from-green-800/50 hover:to-green-800/40 border border-green-700/40')
                              : (isLightMode
                                ? 'border-gray-200 hover:bg-gray-100/70 hover:border-gray-300'
                                : 'border-gray-700 hover:bg-gray-800/50 hover:border-gray-600')
                          } ${selectedAtalhos.length >= maxAtalhos && !isAtalhoSelected(atalho.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isAtalhoSelected(atalho.id) && selectedAtalhos.length < maxAtalhos && handleAddAtalho(atalho)}
                          disabled={selectedAtalhos.length >= maxAtalhos && !isAtalhoSelected(atalho.id)}
                        >
                          {isAtalhoSelected(atalho.id) ? (
                            <><Check className="h-4 w-4 mr-1.5" /> Adicionado</>
                          ) : (
                            <><Plus className="h-4 w-4 mr-1.5" /> Adicionar</>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Estilização para scrollbar personalizada */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isLightMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isLightMode ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)'};
          }
        `}</style>

        <DialogFooter className="px-7 py-5 border-t border-gray-100 dark:border-gray-800/50 gap-3 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50/20 to-transparent dark:from-[#FF6B00]/5 dark:to-transparent opacity-70"></div>

          <motion.div 
            whileHover={{ scale: 1.03, x: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outline"
              onClick={handleCancel}
              className={`px-5 relative ${
                isLightMode 
                  ? 'text-gray-700 hover:bg-gray-100/80 border-gray-200 hover:border-gray-300 shadow-sm' 
                  : 'text-gray-300 hover:bg-gray-800/70 border-gray-700/70 hover:border-gray-600 shadow-md'
              }`}
            >
              Cancelar
            </Button>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, x: 1 }}
            whileTap={{ scale: 0.97 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-orange-300/20 dark:from-[#FF6B00]/20 dark:to-orange-500/20 rounded-xl blur-sm"></div>
            <Button
              variant="default"
              onClick={handleSave}
              className="relative px-5 py-6 h-auto bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF7B10] hover:to-[#FF9C50] shadow-lg hover:shadow-xl transition-all border border-orange-500/20"
            >
              <span className="flex items-center">
                <span className="mr-2">Salvar Alterações</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}