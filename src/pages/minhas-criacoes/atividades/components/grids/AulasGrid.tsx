import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, MoreVertical, Eye, Edit2, Trash2, Share2, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { aulasStorageService, AulaSalva } from '@/services/aulasStorageService';
import { aulasIndexedDBService } from '@/services/aulasIndexedDBService';
import { onAulaPublished } from '@/services/publicationWatcher';

interface AulasGridProps {
  searchTerm: string;
  onCreateAula?: () => void;
  onCountChange?: (count: number) => void;
  onOpenAula?: (aulaId: string) => void;
}

const CARDS_PER_ROW = 5;
const INITIAL_ROWS = 2;

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const AulasGrid: React.FC<AulasGridProps> = ({ searchTerm, onCreateAula, onCountChange, onOpenAula }) => {
  const hasAnimatedRef = useRef(false);
  const [aulas, setAulas] = useState<AulaSalva[]>([]);
  const [filteredAulas, setFilteredAulas] = useState<AulaSalva[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [aulaAberta, setAulaAberta] = useState<string | null>(null);

  // FUNÇÃO: Carregar com retry automático
  const carregarAulasComRetry = useCallback(async (tentativa = 1, maxTentativas = 3) => {
    try {
      setLoading(true);
      console.log(`[AULAS_GRID_LOAD] 🔄 Tentativa ${tentativa}/${maxTentativas}`);

      // Tenta localStorage
      let aulasCarregadas = aulasStorageService.listarAulas();
      console.log('[AULAS_GRID] 📦 localStorage retornou:', aulasCarregadas.length, 'aulas');
      
      // Se vazio, tenta IndexedDB
      if (!aulasCarregadas || aulasCarregadas.length === 0) {
        console.log('[AULAS_GRID] 💾 localStorage vazio, tentando IndexedDB...');
        aulasCarregadas = await aulasIndexedDBService.listarAulasIndexedDB();
        console.log('[AULAS_GRID] 📦 IndexedDB retornou:', aulasCarregadas.length, 'aulas');
      }
      
      // Se AINDA vazio e temos mais tentativas, aguarda e tenta novamente
      if ((!aulasCarregadas || aulasCarregadas.length === 0) && tentativa < maxTentativas) {
        console.log(`[AULAS_GRID] ⏳ Vazio na tentativa ${tentativa}, aguardando 500ms...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return carregarAulasComRetry(tentativa + 1, maxTentativas);
      }
      
      setAulas(aulasCarregadas || []);
      onCountChange?.(aulasCarregadas?.length || 0);
      console.log('[AULAS_GRID_FINAL] ✅ Aulas renderizadas:', aulasCarregadas?.length);
      setLoading(false);
      
    } catch (error) {
      console.error('[AULAS_GRID_ERROR]', error);
      setAulas([]);
      onCountChange?.(0);
      setLoading(false);
    }
  }, [onCountChange]);

  // Debounce helper
  const debounce = (fn: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(fn, delay);
    };
  };

  const carregarAulasDebounced = useCallback(
    debounce(() => {
      console.log('[AULAS_GRID_DEBOUNCE] 🚀 Carregando (debounced)');
      carregarAulasComRetry();
    }, 300),
    [carregarAulasComRetry]
  );

  // MOUNT: Carrega aulas
  useEffect(() => {
    carregarAulasComRetry();
  }, [carregarAulasComRetry]);

  // LISTENER #1: Event listener para publicações na mesma aba
  useEffect(() => {
    const handleAulasPublicadas = () => {
      console.log('[AULAS_GRID_LISTENER_1] 📡 Evento "aulasPublicadas" recebido!');
      carregarAulasDebounced();
    };

    window.addEventListener('aulasPublicadas', handleAulasPublicadas);
    return () => window.removeEventListener('aulasPublicadas', handleAulasPublicadas);
  }, [carregarAulasDebounced]);

  // LISTENER #2: Listener de armazenamento para mudanças de aba/janela
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ponto_school_aulas_salvas') {
        console.log('[AULAS_GRID_LISTENER_2] 💾 localStorage mudou!');
        carregarAulasDebounced();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [carregarAulasDebounced]);

  // LISTENER #3: Watcher global de publicações
  useEffect(() => {
    const unsubscribe = onAulaPublished(() => {
      console.log('[AULAS_GRID_LISTENER_3] 🎯 Watcher global: aula foi publicada!');
      carregarAulasDebounced();
    });

    return unsubscribe;
  }, [carregarAulasDebounced]);

  // LISTENER #4: Visibilidade - quando usuário volta para aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[AULAS_GRID_LISTENER_4] 👁️ Aba ficou visível, recarregando');
        carregarAulasDebounced();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [carregarAulasDebounced]);

  useEffect(() => {
    if (!loading && aulas.length > 0 && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      setShouldAnimate(true);
      
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [loading, aulas.length]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAulas(aulas);
    } else {
      const filtered = aulas.filter(a => 
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.objetivo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAulas(filtered);
    }
    setVisibleRows(INITIAL_ROWS);
  }, [searchTerm, aulas]);

  const visibleAulas = useMemo(() => {
    const maxVisible = visibleRows * CARDS_PER_ROW;
    return filteredAulas.slice(0, maxVisible);
  }, [filteredAulas, visibleRows]);

  const hasMoreToShow = filteredAulas.length > visibleRows * CARDS_PER_ROW;

  const handleShowMore = () => {
    setVisibleRows(prev => prev + 2);
  };

  const handleViewAula = (aula: AulaSalva) => {
    console.log('👁️ Visualizando aula:', aula.titulo);
    setActiveMenu(null);
  };

  const handleEditAula = (aula: AulaSalva) => {
    console.log('✏️ [GRID] Abrindo aula para edição:', aula.id, aula.titulo);
    setActiveMenu(null);
    onOpenAula?.(aula.id);
  };

  const handleDeleteAula = (aula: AulaSalva) => {
    if (!confirm(`Tem certeza que deseja excluir a aula "${aula.titulo}"?`)) {
      return;
    }

    try {
      aulasStorageService.excluirAula(aula.id);
      carregarAulasComRetry();
    } catch (err) {
      alert('Erro ao excluir aula. Tente novamente.');
    }
    setActiveMenu(null);
  };

  const handleShareAula = (aula: AulaSalva) => {
    console.log('📤 Compartilhando aula:', aula.titulo);
    setActiveMenu(null);
  };

  const CreateAulaCard = ({ index }: { index: number }) => (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={shouldAnimate ? { duration: 0.3, delay: index * 0.1 } : { duration: 0 }}
      onClick={() => onCreateAula?.()}
      className="flex flex-col items-center justify-center border-2 border-dashed border-[#FF6B00]/40 rounded-2xl hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
      style={{ width: 208, height: 260, flexShrink: 0, pointerEvents: shouldAnimate ? 'none' : 'auto' }}
    >
      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#FF6B00]/40 flex items-center justify-center mb-3 group-hover:border-[#FF6B00] group-hover:bg-[#FF6B00]/10 transition-all duration-300">
        <Sparkles className="w-6 h-6 text-[#FF6B00]/60 group-hover:text-[#FF6B00]" />
      </div>
      <p className="text-[#FF6B00]/60 text-sm font-medium group-hover:text-[#FF6B00]">Criar Aula</p>
    </motion.div>
  );

  const AulaCard = ({ aula, index }: { aula: AulaSalva; index: number }) => {
    const isHovered = hoveredCard === aula.id;
    const isMenuOpen = activeMenu === aula.id;
    const showMenu = isHovered || isMenuOpen;
    
    return (
      <motion.div
        initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={shouldAnimate ? { duration: 0.3, delay: (index + 1) * 0.1 } : { duration: 0 }}
        onMouseEnter={() => !shouldAnimate && setHoveredCard(aula.id)}
        onMouseLeave={() => {
          if (!isMenuOpen && !shouldAnimate) {
            setHoveredCard(null);
          }
        }}
        className={`bg-[#1A2B3C] rounded-2xl overflow-hidden transition-all duration-300 relative cursor-pointer hover:scale-[1.02] ${
          isHovered ? 'border border-[#FF6B00]/50 shadow-lg shadow-[#FF6B00]/10' : 'border border-[#FF6B00]/15'
        }`}
        style={{ width: 208, height: 260, flexShrink: 0, pointerEvents: shouldAnimate ? 'none' : 'auto' }}
      >
        <div 
          className={`absolute top-3 right-3 z-10 transition-all duration-200 ${
            showMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(isMenuOpen ? null : aula.id);
            }}
            className="w-8 h-8 rounded-full bg-[#0D1B2A]/90 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#0D1B2A] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-10 w-36 bg-[#0D1B2A] border border-[#FF6B00]/30 rounded-xl shadow-xl overflow-hidden z-20"
            >
              <button 
                onClick={() => handleViewAula(aula)}
                className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm"
              >
                <Eye className="w-4 h-4" /> Visualizar
              </button>
              <button 
                onClick={() => handleEditAula(aula)}
                className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm"
              >
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button 
                onClick={() => handleShareAula(aula)}
                className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-[#FF6B00]/10 text-sm"
              >
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
              <button 
                onClick={() => handleDeleteAula(aula)}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 text-sm"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            </motion.div>
          )}
        </div>

        <div 
          onClick={() => handleViewAula(aula)}
          className="h-[160px] bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 flex items-center justify-center"
        >
          <BookOpen className="w-14 h-14 text-[#FF6B00]/40" />
        </div>
        
        <div className="p-3">
          <h3 className="text-white font-medium text-sm truncate mb-1">{aula.titulo}</h3>
          <p className="text-white/50 text-xs mb-2 truncate">{aula.templateName}</p>
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Clock className="w-3 h-3" />
            <span>{formatDate(aula.criadoEm)}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const LoadingState = () => (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mb-4" />
      <p className="text-white/60 text-sm">Carregando aulas...</p>
    </div>
  );

  const EmptyTemplateCard = ({ index }: { index: number }) => (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={shouldAnimate ? { duration: 0.3, delay: index * 0.1 } : { duration: 0 }}
      className="flex flex-col items-center justify-center border border-dashed border-[#FF6B00]/20 rounded-2xl hover:border-[#FF6B00]/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
      style={{ width: 208, height: 260, flexShrink: 0 }}
    >
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#FF6B00]/30 flex items-center justify-center mb-3 group-hover:border-[#FF6B00]/50 transition-colors">
        <Plus className="w-6 h-6 text-[#FF6B00]/40 group-hover:text-[#FF6B00]/60" />
      </div>
      <p className="text-white/30 text-sm group-hover:text-white/50">Vazio</p>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fill,208px)] gap-6 justify-start w-full">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <CreateAulaCard index={0} />
            {visibleAulas.map((aula, index) => (
              <AulaCard key={aula.id} aula={aula} index={index} />
            ))}
          </>
        )}
      </div>

      {!loading && hasMoreToShow && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex justify-center mt-6"
        >
          <button
            onClick={handleShowMore}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1A2B3C] border border-[#FF6B00]/30 text-[#FF6B00] rounded-full hover:bg-[#FF6B00]/10 hover:border-[#FF6B00] transition-all font-medium text-sm"
          >
            <span>Visualizar mais</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <div className="mt-8">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] font-medium text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Templates de Aulas</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </motion.div>

        <div className="grid grid-cols-[repeat(auto-fill,208px)] gap-6 justify-start w-full">
          {[0, 1, 2, 3].map((index) => (
            <EmptyTemplateCard key={`template-${index}`} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AulasGrid;
