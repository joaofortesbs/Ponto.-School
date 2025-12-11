import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users2, ChevronDown, Plus } from 'lucide-react';

interface ClassSelectorProps {
  selectedClass: string;
  onClassChange: (className: string) => void;
  classes: string[];
  onAddClass?: () => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedClass,
  onClassChange,
  classes,
  onAddClass
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectClass = (className: string) => {
    onClassChange(className);
    setIsOpen(false);
  };

  const hasClasses = classes.length > 0;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Botão Principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative flex items-center px-4 py-2 rounded-full text-white text-sm font-semibold transition-all"
        style={{
          background: 'rgba(255, 107, 0, 0.1)',
          border: '1px solid rgba(255, 107, 0, 0.3)',
          paddingLeft: '40px'
        }}
      >
        <div 
          className="absolute left-0 w-9 h-9 rounded-full flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
            zIndex: 10,
            boxShadow: '0 4px 15px rgba(255, 107, 0, 0.3)'
          }}
        >
          <Users2 className="w-4 h-4" />
        </div>
        <span style={{ marginLeft: '12px' }}>{selectedClass}</span>
        <ChevronDown 
          className="w-4 h-4" 
          style={{ 
            marginLeft: '6px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} 
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-full rounded-xl overflow-hidden shadow-lg"
            style={{
              background: '#0a1434',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              zIndex: 9999,
              minWidth: '200px'
            }}
          >
            {hasClasses ? (
              <>
                {/* Opção "Todas" */}
                <motion.button
                  onClick={() => handleSelectClass('Todas')}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${
                    selectedClass === 'Todas'
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                  style={{
                    background:
                      selectedClass === 'Todas'
                        ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.3) 0%, rgba(255, 133, 51, 0.2) 100%)'
                        : 'transparent',
                    borderLeft:
                      selectedClass === 'Todas'
                        ? '3px solid #FF6B00'
                        : '3px solid transparent'
                  }}
                >
                  <Users2 className="w-4 h-4" />
                  <span>Todas</span>
                </motion.button>

                {/* Divisor */}
                <div style={{ height: '1px', background: 'rgba(255, 107, 0, 0.2)' }} />

                {/* Turmas */}
                {classes.map((className) => (
                  <motion.button
                    key={className}
                    onClick={() => handleSelectClass(className)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${
                      selectedClass === className
                        ? 'text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                    style={{
                      background:
                        selectedClass === className
                          ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.3) 0%, rgba(255, 133, 51, 0.2) 100%)'
                          : 'transparent',
                      borderLeft:
                        selectedClass === className
                          ? '3px solid #FF6B00'
                          : '3px solid transparent'
                    }}
                  >
                    <Users2 className="w-4 h-4" />
                    <span>{className}</span>
                  </motion.button>
                ))}

                {/* Adicionar turma */}
                {onAddClass && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255, 107, 0, 0.2)' }} />
                    <motion.button
                      onClick={() => {
                        setIsOpen(false);
                        onAddClass();
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#FF6B00] hover:text-white transition-all"
                      style={{
                        background: 'transparent'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar turma</span>
                    </motion.button>
                  </>
                )}
              </>
            ) : (
              // Se não houver turmas
              <motion.button
                onClick={() => {
                  setIsOpen(false);
                  onAddClass?.();
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#FF6B00] hover:text-white transition-all"
                style={{
                  background: 'transparent'
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar turma</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassSelector;
