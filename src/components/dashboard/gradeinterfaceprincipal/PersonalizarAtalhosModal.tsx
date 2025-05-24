
import React, { useState, useEffect } from "react";
import { X, Plus, Check, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  const maxAtalhos = 6;

  // Reset selected shortcuts when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAtalhos([...atalhos]);
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
      <DialogContent className={`sm:max-w-[500px] h-[80vh] overflow-hidden flex flex-col ${isLightMode ? 'bg-white' : 'bg-[#001e3a]'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
            Personalizar Atalhos Rápidos
          </DialogTitle>
          <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
            Escolha até {maxAtalhos} atalhos para seu acesso rápido.
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Current shortcuts section */}
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-gray-800/30'}`}>
            <h3 className={`text-md font-medium mb-3 ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
              Meus Atalhos Atuais
            </h3>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="atalhos" direction="horizontal">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-3 gap-2"
                  >
                    {selectedAtalhos.map((atalho, index) => (
                      <Draggable key={atalho.id} draggableId={atalho.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative p-3 rounded-lg ${atalho.bgColor} flex flex-col items-center justify-center cursor-move group`}
                          >
                            <button 
                              onClick={() => handleRemoveAtalho(atalho.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className={`flex items-center justify-center p-2 rounded-full ${atalho.cor}`}>
                              {atalho.icone}
                            </div>
                            <span className="text-xs mt-1 text-center text-white">
                              {atalho.nome}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: maxAtalhos - selectedAtalhos.length }).map((_, index) => (
                      <div 
                        key={`empty-${index}`} 
                        className={`p-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center ${
                          isLightMode ? 'border-gray-300' : 'border-gray-600'
                        }`}
                      >
                        <div className={`flex items-center justify-center p-2 rounded-full ${
                          isLightMode ? 'bg-gray-200' : 'bg-gray-700'
                        }`}>
                          <Plus className={`w-5 h-5 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-xs mt-1 text-center ${
                          isLightMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          Vazio
                        </span>
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {selectedAtalhos.length >= maxAtalhos && (
              <p className="text-sm text-amber-500 mt-2">
                Limite de {maxAtalhos} atalhos atingido. Remova um para adicionar outro.
              </p>
            )}
          </div>
          
          <Separator />
          
          {/* Available shortcuts section */}
          <div className="flex-1 overflow-y-auto px-1">
            <h3 className={`text-md font-medium mb-3 ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
              Adicionar Atalhos
            </h3>
            
            <div className="space-y-2 pr-2">
              {disponiveis.map((atalho) => (
                <div 
                  key={atalho.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800/50'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${atalho.bgColor}`}>
                      <div className={atalho.cor}>
                        {atalho.icone}
                      </div>
                    </div>
                    <span className={isLightMode ? 'text-gray-700' : 'text-gray-200'}>
                      {atalho.nome}
                    </span>
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
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="pt-4 gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className={isLightMode ? 'text-gray-600' : 'text-gray-300'}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white"
          >
            Salvar Alterações <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
