import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap, Clock } from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

interface CalendarViewSelectorProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({
  activeView,
  onViewChange
}) => {
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
    }
  ];

  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{
        background: 'rgba(255, 107, 0, 0.1)',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 107, 0, 0.2)'
      }}
    >
      {views.map((view) => (
        <motion.button
          key={view.mode}
          onClick={() => onViewChange(view.mode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            activeView === view.mode
              ? 'text-white shadow-lg'
              : 'text-white/60 hover:text-white/80'
          }`}
          style={{
            background:
              activeView === view.mode
                ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                : 'transparent',
            boxShadow:
              activeView === view.mode
                ? '0 4px 12px rgba(255, 107, 0, 0.3)'
                : 'none'
          }}
        >
          {view.icon}
          <span>{view.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default CalendarViewSelector;
