import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import AtividadesHeader from './components/AtividadesHeader';
import GridSelector from './components/GridSelector';
import AtividadesGrid from './components/grids/AtividadesGrid';
import AulasGrid from './components/grids/AulasGrid';
import ColecoesGrid from './components/grids/ColecoesGrid';
import CalendarioSchoolPanel from '@/pages/calendario-school/card-modal/interface';
import CriacaoAulaPanel from '@/pages/card-criacao-aula/interface';
import ConstrucaoAulaPanel from '@/pages/card-criacao-aula/ConstrucaoAulaPanel';
import { Template } from '@/pages/card-criacao-aula/components/TemplateDropdown';
import { GeneratedLessonData } from '@/services/lessonGeneratorService';

export type GridType = 'atividades' | 'aulas' | 'colecoes';

const AtividadesInterface: React.FC = () => {
  const [activeGrid, setActiveGrid] = useState<GridType>('atividades');
  const [searchTerm, setSearchTerm] = useState('');
  const [counts, setCounts] = useState<{ atividades?: number; aulas?: number; colecoes?: number }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPersonalizacaoModalOpen, setIsPersonalizacaoModalOpen] = useState(false);
  const [isConstrucaoAulaOpen, setIsConstrucaoAulaOpen] = useState(false);
  const [selectedAulaTemplate, setSelectedAulaTemplate] = useState<Template | null>(null);
  const [generatedLessonData, setGeneratedLessonData] = useState<GeneratedLessonData | null>(null);
  const [aulaIdParaCarregar, setAulaIdParaCarregar] = useState<string | undefined>(undefined);
  
  // 🔴 NOVO: Session ID para forçar remount dos componentes quando criar nova aula
  const [aulaSessionId, setAulaSessionId] = useState<string>(() => `session_${Date.now()}`);
  
  // 🔴 NOVO: Função de reset completo para nova aula
  const resetAulaState = useCallback(() => {
    console.log('[RESET_AULA_STATE] 🧹 Limpando TODOS os estados para nova aula...');
    setSelectedAulaTemplate(null);
    setGeneratedLessonData(null);
    setAulaIdParaCarregar(undefined);
    // Gera nova session ID para forçar remount dos componentes filhos
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setAulaSessionId(newSessionId);
    console.log('[RESET_AULA_STATE] ✅ Estado limpo. Nova sessão:', newSessionId);
  }, []);

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

  const handleOpenPersonalizacaoModal = () => {
    console.log('📚 [OPEN_PERSONALIZACAO] Abrindo Modal de Personalização de Aula');
    // 🔴 CRÍTICO: Resetar TODOS os estados antes de abrir o modal
    resetAulaState();
    setIsPersonalizacaoModalOpen(true);
    console.log('📚 [OPEN_PERSONALIZACAO] ✅ Modal aberto com estados limpos');
  };

  const handleClosePersonalizacaoModal = () => {
    console.log('📚 Fechando Modal de Personalização de Aula');
    setIsPersonalizacaoModalOpen(false);
  };

  const handleGerarAula = (template: Template | null, generatedData?: GeneratedLessonData) => {
    console.log('🎯 [ATIVIDADES] ========================================');
    console.log('🎯 [ATIVIDADES] RECEBENDO DADOS DA GERAÇÃO DE AULA');
    console.log('🎯 [ATIVIDADES] Template:', template?.name || 'Nenhum');
    console.log('🎯 [ATIVIDADES] Dados gerados recebidos:', generatedData ? 'SIM' : 'NÃO');
    if (generatedData) {
      console.log('🎯 [ATIVIDADES] Título gerado:', generatedData.titulo);
      console.log('🎯 [ATIVIDADES] Objetivo gerado:', generatedData.objetivo?.substring(0, 100) + '...');
      console.log('🎯 [ATIVIDADES] Seções geradas:', Object.keys(generatedData.secoes || {}));
      console.log('🎯 [ATIVIDADES] Atividades por seção recebidas:', generatedData.activitiesPerSection ? Object.keys(generatedData.activitiesPerSection) : 'Nenhuma');
      if (generatedData.activitiesPerSection) {
        console.log('🎯 [ATIVIDADES] Detalhes ativitiesPerSection:', JSON.stringify(generatedData.activitiesPerSection, null, 2));
      }
    }
    console.log('🎯 [ATIVIDADES] ========================================');
    
    setSelectedAulaTemplate(template);
    setGeneratedLessonData(generatedData || null);
    setIsPersonalizacaoModalOpen(false);
    setIsConstrucaoAulaOpen(true);
  };

  const handleCloseConstrucaoAula = (foiPublicada?: boolean) => {
    console.log('📚 Fechando Card de Construção de Aula, foiPublicada:', foiPublicada);
    setIsConstrucaoAulaOpen(false);
    
    // Se aula foi publicada, disparar evento para recarregar grade
    if (foiPublicada) {
      console.log('[PAI] 🔄 Disparando evento de atualização de grade');
      window.dispatchEvent(new Event('aulasPublicadas'));
    }
  };

  const renderGrid = () => {
    switch (activeGrid) {
      case 'atividades':
        return <AtividadesGrid searchTerm={searchTerm} onCountChange={handleAtividadesCountChange} />;
      case 'aulas':
        return <AulasGrid searchTerm={searchTerm} onCreateAula={handleOpenPersonalizacaoModal} onOpenAula={(aulaId) => {
          console.log('[INTERFACE] 📖 Abrindo aula para edição:', aulaId);
          setAulaIdParaCarregar(aulaId);
          setIsConstrucaoAulaOpen(true);
        }} />;
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

      <CriacaoAulaPanel 
        key={`criacao-${aulaSessionId}`}
        isOpen={isPersonalizacaoModalOpen}
        onClose={handleClosePersonalizacaoModal}
        onGerarAula={handleGerarAula}
      />

      <ConstrucaoAulaPanel 
        key={`construcao-${aulaSessionId}-${aulaIdParaCarregar || 'new'}`}
        isOpen={isConstrucaoAulaOpen}
        onClose={(foiPublicada) => {
          handleCloseConstrucaoAula(foiPublicada);
          setAulaIdParaCarregar(undefined);
        }}
        aulaName={generatedLessonData?.titulo || "Minha Nova Aula"}
        selectedTemplate={selectedAulaTemplate}
        generatedData={generatedLessonData}
        aulaIdParaCarregar={aulaIdParaCarregar}
      />
    </div>
  );
};

export default AtividadesInterface;
