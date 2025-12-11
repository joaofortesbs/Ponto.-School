import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Hourglass, Pencil, Sparkles, BookOpen, GripHorizontal, X, Camera, Check, Star, Plus } from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: number | null;
  onAddEvent: (title: string, day: number, selectedIcon: string, selectedLabels: string[], labelData: { [key: string]: { name: string; color: string } }) => void;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

// Constantes milimétricas do modal
const MODAL_WIDTH = 360; // px
const MODAL_BORDER_RADIUS = 16; // px
const MODAL_PADDING = 16; // px
const MODAL_HEADER_HEIGHT = 48; // px

// Ícones disponíveis para seleção
const AVAILABLE_ICONS = [
  { id: 'pencil', icon: Pencil, label: 'Lápis' },
  { id: 'camera', icon: Camera, label: 'Câmera' },
  { id: 'check', icon: Check, label: 'Check' },
  { id: 'star', icon: Star, label: 'Estrela' },
];

// Cores disponíveis para etiquetas
const LABEL_COLORS = [
  '#FF6B00', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4'
];

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  selectedDay,
  onAddEvent
}) => {
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Estados para seletor de ícone
  const [selectedIcon, setSelectedIcon] = useState('pencil');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const iconDropdownRef = useRef<HTMLDivElement>(null);
  
  // Estados para etiquetas
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const labelDropdownRef = useRef<HTMLDivElement>(null);

  // Reset quando modal abre
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSelectedIcon('pencil');
      setSelectedLabels([]);
      setIsIconDropdownOpen(false);
      setIsLabelDropdownOpen(false);
      setIsCreatingLabel(false);
      setPosition({ x: 150, y: 80 });
    }
  }, [isOpen]);

  // Obter referência do container pai
  useEffect(() => {
    if (isOpen && modalRef.current) {
      containerRef.current = modalRef.current.closest('.calendar-container') as HTMLDivElement;
    }
  }, [isOpen]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(event.target as Node)) {
        setIsIconDropdownOpen(false);
      }
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(event.target as Node)) {
        setIsLabelDropdownOpen(false);
        setIsCreatingLabel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Melhor sistema de arraste - segue o cursor exatamente
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPosition({ x: position.x, y: position.y });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      e.preventDefault();
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxX = containerRect.width - MODAL_WIDTH - 20;
      const maxY = containerRect.height - 350;
      
      const newX = Math.max(20, Math.min(initialPosition.x + deltaX, maxX));
      const newY = Math.max(20, Math.min(initialPosition.y + deltaY, maxY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, dragStart, initialPosition]);

  const handleAddClick = () => {
    if (title.trim() && selectedDay) {
      const labelData: { [key: string]: { name: string; color: string } } = {};
      labels.forEach(label => {
        labelData[label.id] = { name: label.name, color: label.color };
      });
      onAddEvent(title, selectedDay, selectedIcon, selectedLabels, labelData);
      onClose();
    }
  };

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      const newLabel: Label = {
        id: `label-${Date.now()}`,
        name: newLabelName.trim(),
        color: newLabelColor
      };
      setLabels([...labels, newLabel]);
      setNewLabelName('');
      setIsCreatingLabel(false);
    }
  };

  const toggleLabelSelection = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const SelectedIconComponent = AVAILABLE_ICONS.find(i => i.id === selectedIcon)?.icon || Pencil;

  if (!isOpen) return null;

  return (
    <motion.div
      ref={modalRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="absolute z-[100]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${MODAL_WIDTH}px`,
        background: '#0a1434',
        borderRadius: `${MODAL_BORDER_RADIUS}px`,
        border: '1px solid rgba(255, 107, 0, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 107, 0, 0.1)',
        pointerEvents: 'auto'
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header arrastável */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-4 border-b border-[#FF6B00]/20"
        style={{
          height: `${MODAL_HEADER_HEIGHT}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'rgba(255, 107, 0, 0.05)',
          borderRadius: `${MODAL_BORDER_RADIUS}px ${MODAL_BORDER_RADIUS}px 0 0`
        }}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-white/40" />
          <span className="text-white/60 text-sm font-medium">
            Dia {selectedDay}
          </span>
        </div>
        
        {/* Ícones do header: Etiquetas, X */}
        <div className="flex items-center gap-2">
          {/* Botão de Etiquetas */}
          <div ref={labelDropdownRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
              onMouseDown={(e) => e.stopPropagation()}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isLabelDropdownOpen || selectedLabels.length > 0 
                  ? 'text-[#FF6B00] bg-[#FF6B00]/20' 
                  : 'text-white/60 hover:text-[#FF6B00] hover:bg-white/10'
              }`}
            >
              <Tag className="w-4 h-4" />
            </motion.button>
            
            {/* Dropdown de Etiquetas */}
            <AnimatePresence>
              {isLabelDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-56 rounded-xl overflow-hidden shadow-lg"
                  style={{
                    background: '#0a1434',
                    border: '1px solid rgba(255, 107, 0, 0.3)',
                    zIndex: 9999
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="p-2">
                    <p className="text-white/60 text-xs font-medium px-2 py-1 mb-1">Etiquetas</p>
                    
                    {labels.length === 0 && !isCreatingLabel && (
                      <p className="text-white/40 text-sm px-2 py-2">Nenhuma etiqueta criada</p>
                    )}
                    
                    {labels.map((label) => (
                      <motion.button
                        key={label.id}
                        whileHover={{ x: 4 }}
                        onClick={() => toggleLabelSelection(label.id)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-all"
                      >
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: label.color }}
                        >
                          {selectedLabels.includes(label.id) && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="text-white text-sm">{label.name}</span>
                      </motion.button>
                    ))}
                    
                    {isCreatingLabel ? (
                      <div className="p-2 border-t border-[#FF6B00]/20 mt-2">
                        <input
                          type="text"
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          placeholder="Nome da etiqueta..."
                          className="w-full px-3 py-2 rounded-lg text-white text-sm placeholder-white/40 outline-none mb-2"
                          style={{ background: 'rgba(255, 107, 0, 0.08)', border: '1px solid rgba(255, 107, 0, 0.2)' }}
                          autoFocus
                        />
                        <div className="flex gap-1 mb-2">
                          {LABEL_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewLabelColor(color)}
                              className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                              style={{ background: color, border: newLabelColor === color ? '2px solid white' : 'none' }}
                            >
                              {newLabelColor === color && <Check className="w-3 h-3 text-white" />}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsCreatingLabel(false)}
                            className="flex-1 px-3 py-1.5 rounded-lg text-white/60 text-sm hover:bg-white/5 transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleCreateLabel}
                            disabled={!newLabelName.trim()}
                            className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)' }}
                          >
                            Criar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => setIsCreatingLabel(true)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-all border-t border-[#FF6B00]/20 mt-2"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                          <Plus className="w-2.5 h-2.5 text-[#FF6B00]" />
                        </div>
                        <span className="text-[#FF6B00] text-sm font-medium">Criar etiqueta</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Conteúdo do modal */}
      <div style={{ padding: `${MODAL_PADDING}px` }}>
        {/* Campo de título com seletor de ícone */}
        <div className="flex gap-2">
          {/* Seletor de ícone */}
          <div ref={iconDropdownRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: isIconDropdownOpen ? 'rgba(255, 107, 0, 0.2)' : 'rgba(255, 107, 0, 0.08)',
                border: '1px solid rgba(255, 107, 0, 0.3)'
              }}
            >
              <SelectedIconComponent className="w-5 h-5 text-[#FF6B00]" />
            </motion.button>
            
            {/* Dropdown de ícones */}
            <AnimatePresence>
              {isIconDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 rounded-xl overflow-hidden shadow-lg"
                  style={{
                    background: '#0a1434',
                    border: '1px solid rgba(255, 107, 0, 0.3)',
                    zIndex: 9999
                  }}
                >
                  <div className="p-2 flex flex-col gap-1">
                    {AVAILABLE_ICONS.map((iconItem) => {
                      const IconComp = iconItem.icon;
                      return (
                        <motion.button
                          key={iconItem.id}
                          whileHover={{ scale: 1.05, x: 4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedIcon(iconItem.id);
                            setIsIconDropdownOpen(false);
                          }}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            selectedIcon === iconItem.id 
                              ? 'bg-[#FF6B00]/20 text-[#FF6B00]' 
                              : 'text-white/60 hover:text-[#FF6B00] hover:bg-white/5'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Campo de título */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do compromisso..."
            className="flex-1 px-4 py-3 rounded-xl text-white text-sm font-medium placeholder-white/40 outline-none transition-all"
            style={{
              background: 'rgba(255, 107, 0, 0.08)',
              border: '1px solid rgba(255, 107, 0, 0.2)'
            }}
            autoFocus
          />
        </div>

        {/* Etiquetas selecionadas */}
        {selectedLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedLabels.map((labelId) => {
              const label = labels.find(l => l.id === labelId);
              if (!label) return null;
              return (
                <span
                  key={labelId}
                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ background: label.color }}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Cards de ação: Atividades e Aulas */}
        <div className="flex gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold transition-all rounded-full"
            style={{
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)'
            }}
          >
            <Plus className="w-4 h-4 text-[#FF6B00]" />
            <span>Atividades</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold transition-all rounded-full"
            style={{
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)'
            }}
          >
            <Plus className="w-4 h-4 text-[#FF6B00]" />
            <span>Aulas</span>
          </motion.button>
        </div>

        {/* Botão Adicionar */}
        <div className="flex justify-end mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddClick}
            disabled={!title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: title.trim() 
                ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                : 'rgba(255, 107, 0, 0.2)',
              boxShadow: title.trim() 
                ? '0 4px 15px rgba(255, 107, 0, 0.3)'
                : 'none'
            }}
          >
            <span>Adicionar</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddEventModal;
