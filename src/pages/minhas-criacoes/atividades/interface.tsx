import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Filter, Mouse } from 'lucide-react';
import AtividadesHeader from './components/AtividadesHeader';
import GridSelector from './components/GridSelector';
import AtividadesGrid from './components/grids/AtividadesGrid';
import AulasGrid from './components/grids/AulasGrid';
import ColecoesGrid from './components/grids/ColecoesGrid';

export type GridType = 'atividades' | 'aulas' | 'colecoes';

const AtividadesInterface: React.FC = () => {
  const [activeGrid, setActiveGrid] = useState<GridType>('atividades');
  const [searchTerm, setSearchTerm] = useState('');
  const [counts, setCounts] = useState<{ atividades?: number; aulas?: number; colecoes?: number }>({});

  const handleAtividadesCountChange = (count: number) => {
    setCounts(prev => ({ ...prev, atividades: count }));
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
          />
        </div>
        
        <div className="flex items-center justify-between px-6">
          <GridSelector 
            activeGrid={activeGrid}
            onGridChange={setActiveGrid}
            counts={counts}
          />
          
          {/* Figma: Icon Circles - 57×57px each, r:28.5px */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-[#FF6B00] flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
              style={{ width: '57px', height: '57px', borderRadius: '28.5px' }}
              title="Visualizar como blocos"
            >
              <LayoutGrid className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-[#FF6B00] flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
              style={{ width: '57px', height: '57px', borderRadius: '28.5px' }}
              title="Filtrar atividades"
            >
              <Filter className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-[#FF6B00] flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
              style={{ width: '57px', height: '57px', borderRadius: '28.5px' }}
              title="Cursor de mouse"
            >
              <Mouse className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <div key={activeGrid} className="px-6">
          {renderGrid()}
        </div>
      </div>
    </div>
  );
};

export default AtividadesInterface;
