import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, Clock, Grid3x3, ChevronDown } from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month' | 'year';

interface CalendarViewSelectorProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({
  activeView,
  onViewChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const views: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'day',
      label: 'Dia',
      icon: <Clock className="w-4 h-4" />
    },
    {
      mode: 'week',
      label: 'Semana',
      icon: <Zap className="w-4 h-4" />
    },
    {
      mode: 'month',
      label: 'Mês',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      mode: 'year',
      label: 'Ano',
      icon: <Grid3x3 className="w-4 h-4" />
    }
  ];

  const currentView = views.find(v => v.mode === activeView) || views[2]; // Default to 'Mês'

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectView = (mode: ViewMode) => {
    onViewChange(mode);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Botão Principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: 'rgba(255, 107, 0, 0.1)',
          border: '1px solid rgba(255, 107, 0, 0.3)',
          minWidth: '120px',
          justifyContent: 'space-between'
        }}
      >
        <div className="flex items-center gap-2">
          {currentView.icon}
          <span>{currentView.label}</span>
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
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
              zIndex: 9999
            }}
          >
            {views.map((view) => (
              <motion.button
                key={view.mode}
                onClick={() => handleSelectView(view.mode)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${
                  activeView === view.mode
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
                style={{
                  background:
                    activeView === view.mode
                      ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.3) 0%, rgba(255, 133, 51, 0.2) 100%)'
                      : 'transparent',
                  borderLeft:
                    activeView === view.mode
                      ? '3px solid #FF6B00'
                      : '3px solid transparent'
                }}
              >
                {view.icon}
                <span>{view.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarViewSelector;
