import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, MoreVertical, Eye, Edit2, Trash2, Share2 } from 'lucide-react';

interface AulasGridProps {
  searchTerm: string;
}

interface Aula {
  id: string;
  titulo: string;
  disciplina: string;
  duracao: string;
  criadoEm: string;
  status: 'rascunho' | 'publicada' | 'arquivada';
}

const mockAulas: Aula[] = [];

const AulasGrid: React.FC<AulasGridProps> = ({ searchTerm }) => {
  const [aulas, setAulas] = useState<Aula[]>(mockAulas);
  const [filteredAulas, setFilteredAulas] = useState<Aula[]>(mockAulas);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAulas(aulas);
    } else {
      const filtered = aulas.filter(a => 
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAulas(filtered);
    }
  }, [searchTerm, aulas]);

  const EmptyCard = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="aspect-[3/4] bg-[#1A2B3C]/50 border-2 border-[#FF6B00]/20 rounded-2xl flex items-center justify-center hover:border-[#FF6B00]/40 transition-colors cursor-pointer group"
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#FF6B00]/30 flex items-center justify-center mx-auto mb-3 group-hover:border-[#FF6B00]/50 transition-colors">
          <Plus className="w-6 h-6 text-[#FF6B00]/40 group-hover:text-[#FF6B00]/60" />
        </div>
        <p className="text-white/30 text-sm group-hover:text-white/50">Criar Aula</p>
      </div>
    </motion.div>
  );

  const AulaCard = ({ aula, index }: { aula: Aula; index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="aspect-[3/4] bg-[#1A2B3C] border-2 border-[#FF6B00]/30 rounded-2xl overflow-hidden hover:border-[#FF6B00] transition-all group relative"
    >
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setActiveMenu(activeMenu === aula.id ? null : aula.id)}
          className="w-8 h-8 rounded-full bg-[#0D1B2A]/80 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {activeMenu === aula.id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 top-10 w-36 bg-[#0D1B2A] border border-[#FF6B00]/30 rounded-xl shadow-xl overflow-hidden"
          >
            <button className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm">
              <Eye className="w-4 h-4" /> Visualizar
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm">
              <Edit2 className="w-4 h-4" /> Editar
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm">
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 text-sm">
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </motion.div>
        )}
      </div>

      <div className="h-2/3 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 flex items-center justify-center">
        <BookOpen className="w-16 h-16 text-[#FF6B00]/40" />
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-medium text-sm truncate mb-1">{aula.titulo}</h3>
        <p className="text-white/50 text-xs mb-2">{aula.disciplina}</p>
        <div className="flex items-center justify-between text-white/40 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{aula.duracao}</span>
          </div>
          <span>{aula.criadoEm}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredAulas.length > 0 ? (
          filteredAulas.map((aula, index) => (
            <AulaCard key={aula.id} aula={aula} index={index} />
          ))
        ) : (
          <EmptyCard key={0} index={0} />
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] font-medium text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Templates de Aulas</span>
            <motion.div
              animate={{ rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <i className="fas fa-chevron-down text-xs ml-1"></i>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[0, 1, 2, 3].map((index) => (
            <EmptyCard key={`template-${index}`} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AulasGrid;
