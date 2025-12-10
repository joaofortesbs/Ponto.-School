import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AtividadesHeader from './components/AtividadesHeader';
import GridSelector from './components/GridSelector';
import AtividadesGrid from './components/grids/AtividadesGrid';
import AulasGrid from './components/grids/AulasGrid';
import ColecoesGrid from './components/grids/ColecoesGrid';
import CalendarioSchoolPanel from '@/pages/calendario-school/card-modal/interface';

export type GridType = 'atividades' | 'aulas' | 'colecoes';

const AtividadesInterface: React.FC = () => {
  const [activeGrid, setActiveGrid] = useState<GridType>('atividades');
  const [searchTerm, setSearchTerm] = useState('');
  const [counts, setCounts] = useState<{ atividades?: number; aulas?: number; colecoes?: number }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleAtividadesCountChange = (count: number) => {
    setCounts(prev => ({ ...prev, atividades: count }));
  };

  const handleOpenCalendar = () => {
    console.log('📅 Abrindo Calendário School (slide-up)');
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    console.log('📅 Fechando Calendário School');
    setIsCalendarOpen(false);
  };

  const renderGrid = () => {
    switch (activeGrid) {
      case 'atividades':
        return <AtividadesGrid searchTerm={searchTerm} onCountChange={handleAtividadesCountChange} />;
      case 'aulas':
        return <AulasGrid searchTerm={searchTerm} />;
      case 'colecoes':
        return <ColecoesGrid searchTerm={searchTerm} />;
      default:
        return <AtividadesGrid searchTerm={searchTerm} onCountChange={handleAtividadesCountChange} />;
    }
  };

  return (
    <div 
      className="atividades-root relative flex flex-col w-full h-full overflow-hidden"
      style={{ 
        backgroundColor: 'transparent'
      }}
    >
      <style>{`
        .atividades-root,
        .atividades-scroll-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .atividades-root::-webkit-scrollbar,
        .atividades-scroll-container::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
      
      <div className="atividades-scroll-container flex-1 overflow-y-auto py-6 px-0 space-y-6">
        <div className="px-6">
          <AtividadesHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCalendarClick={handleOpenCalendar}
          />
        </div>
        
        <div className="flex items-center justify-between px-6">
          <GridSelector 
            activeGrid={activeGrid}
            onGridChange={setActiveGrid}
            counts={counts}
          />
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full border-2 border-[#FF6B00] flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
            >
              <i className="fas fa-users text-sm"></i>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full border-2 border-[#FF6B00] flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
            >
              <i className="fas fa-filter text-sm"></i>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full border-2 border-[#FF6B00] flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
            >
              <i className="fas fa-arrow-up-right-from-square text-sm"></i>
            </motion.button>
          </div>
        </div>
        
        <div key={activeGrid} className="px-6">
          {renderGrid()}
        </div>
      </div>

      <CalendarioSchoolPanel 
        isOpen={isCalendarOpen}
        onClose={handleCloseCalendar}
      />
    </div>
  );
};

export default AtividadesInterface;
