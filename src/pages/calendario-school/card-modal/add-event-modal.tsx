import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, Hourglass, Pencil, Sparkles, BookOpen, GripHorizontal, X } from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: number | null;
  onAddEvent: (title: string, day: number) => void;
}

// Constantes milimétricas do modal
const MODAL_WIDTH = 320; // px
const MODAL_BORDER_RADIUS = 16; // px
const MODAL_PADDING = 16; // px
const MODAL_HEADER_HEIGHT = 48; // px

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  selectedDay,
  onAddEvent
}) => {
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset position and title when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      // Centralizar modal na tela
      setPosition({ x: 150, y: 80 });
    }
  }, [isOpen]);

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newX = e.clientX - containerRect.left - dragOffset.x;
        const newY = e.clientY - containerRect.top - dragOffset.y;
        
        // Limitar movimento dentro do container
        const maxX = containerRect.width - MODAL_WIDTH - 20;
        const maxY = containerRect.height - 300;
        
        setPosition({
          x: Math.max(20, Math.min(newX, maxX)),
          y: Math.max(20, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Obter referência do container pai
  useEffect(() => {
    if (isOpen && modalRef.current) {
      containerRef.current = modalRef.current.closest('.calendar-container') as HTMLDivElement;
    }
  }, [isOpen]);

  const handleAddClick = () => {
    if (title.trim() && selectedDay) {
      onAddEvent(title, selectedDay);
      onClose();
    }
  };

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
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 107, 0, 0.1)'
      }}
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
        
        {/* Ícones do header: Lápis, Ampulheta, Bandeira */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-[#FF6B00] hover:bg-white/10 transition-all"
          >
            <Pencil className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-[#FF6B00] hover:bg-white/10 transition-all"
          >
            <Hourglass className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-[#FF6B00] hover:bg-white/10 transition-all"
          >
            <Flag className="w-4 h-4" />
          </motion.button>
          
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
        {/* Campo de título */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do compromisso..."
          className="w-full px-4 py-3 rounded-xl text-white text-sm font-medium placeholder-white/40 outline-none transition-all"
          style={{
            background: 'rgba(255, 107, 0, 0.08)',
            border: '1px solid rgba(255, 107, 0, 0.2)'
          }}
          autoFocus
        />

        {/* Cards de ação: Gerar atividade e Gerar aula */}
        <div className="flex gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold transition-all"
            style={{
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '0px'
            }}
          >
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>Gerar atividade</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-white text-sm font-semibold transition-all"
            style={{
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '0px'
            }}
          >
            <BookOpen className="w-4 h-4 text-[#FF6B00]" />
            <span>Gerar aula</span>
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
