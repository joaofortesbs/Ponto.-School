import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AtividadesHeader from './components/AtividadesHeader';
import GridSelector from './components/GridSelector';
import AtividadesGrid from './components/grids/AtividadesGrid';
import AulasGrid from './components/grids/AulasGrid';
import ColecoesGrid from './components/grids/ColecoesGrid';

export type GridType = 'atividades' | 'aulas' | 'colecoes';

const AtividadesInterface: React.FC = () => {
  const [activeGrid, setActiveGrid] = useState<GridType>('atividades');
  const [searchTerm, setSearchTerm] = useState('');

  const renderGrid = () => {
    const gridProps = { searchTerm };
    
    switch (activeGrid) {
      case 'atividades':
        return <AtividadesGrid {...gridProps} />;
      case 'aulas':
        return <AulasGrid {...gridProps} />;
      case 'colecoes':
        return <ColecoesGrid {...gridProps} />;
      default:
        return <AtividadesGrid {...gridProps} />;
    }
  };

  return (
    <div 
      className="w-full h-full overflow-auto"
      style={{ 
        backgroundColor: 'transparent',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <style>{`
        .atividades-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="atividades-container w-full h-full p-6 space-y-6">
        <AtividadesHeader 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="flex items-center justify-between">
          <GridSelector 
            activeGrid={activeGrid}
            onGridChange={setActiveGrid}
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
        
        <motion.div
          key={activeGrid}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderGrid()}
        </motion.div>
      </div>
    </div>
  );
};

export default AtividadesInterface;
