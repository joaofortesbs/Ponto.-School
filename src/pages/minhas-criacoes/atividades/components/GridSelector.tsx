import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, BookOpen, FolderOpen } from 'lucide-react';
import type { GridType } from '../interface';

interface GridSelectorProps {
  activeGrid: GridType;
  onGridChange: (grid: GridType) => void;
  counts?: {
    atividades?: number;
    aulas?: number;
    colecoes?: number;
  };
}

interface GridOption {
  id: GridType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const gridOptions: GridOption[] = [
  { id: 'atividades', label: 'Atividades', icon: FileText },
  { id: 'aulas', label: 'Aulas', icon: BookOpen },
  { id: 'colecoes', label: 'Coleções', icon: FolderOpen }
];

const GridSelector: React.FC<GridSelectorProps> = ({
  activeGrid,
  onGridChange,
  counts = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = gridOptions.find(opt => opt.id === activeGrid) || gridOptions[0];
  const IconComponent = activeOption.icon;
  const activeCount = counts[activeGrid];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (gridId: GridType) => {
    onGridChange(gridId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full 
          border-2 border-[#FF6B00] bg-transparent
          text-[#FF6B00] font-medium text-sm
          hover:bg-[#FF6B00]/10 transition-all
          ${isOpen ? 'bg-[#FF6B00]/10' : ''}
        `}
      >
        <IconComponent className="w-4 h-4" />
        <span>{activeOption.label}</span>
        {activeCount !== undefined && activeCount > 0 && (
          <span className="px-2 py-0.5 bg-[#FF6B00] text-white text-xs font-bold rounded-full min-w-[20px] text-center">
            {activeCount}
          </span>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-48 bg-[#1A2B3C] border border-[#FF6B00]/30 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {gridOptions.map((option, index) => {
              const OptionIcon = option.icon;
              const isActive = option.id === activeGrid;
              const optionCount = counts[option.id];
              
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(option.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3
                    text-left transition-colors
                    ${isActive 
                      ? 'bg-[#FF6B00]/20 text-[#FF6B00]' 
                      : 'text-white/80 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]'
                    }
                  `}
                >
                  <OptionIcon className="w-4 h-4" />
                  <span className="font-medium text-sm">{option.label}</span>
                  {optionCount !== undefined && optionCount > 0 && (
                    <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center ${
                      isActive 
                        ? 'bg-[#FF6B00] text-white' 
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {optionCount}
                    </span>
                  )}
                  {isActive && !optionCount && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-[#FF6B00]"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GridSelector;
