import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import AulaResultadoContent, { AulaResultadoContentRef } from './components/AulaResultadoContent';
import { Template } from './components/TemplateDropdown';
import { GeneratedLessonData } from '@/services/lessonGeneratorService';
import { aulasStorageService } from '@/services/aulasStorageService';
import { aulasIndexedDBService } from '@/services/aulasIndexedDBService';

interface ConstrucaoAulaPanelProps {
  isOpen: boolean;
  onClose: (foiPublicada?: boolean) => void;
  onSave?: () => void;
  aulaName?: string;
  selectedTemplate?: Template | null;
  turmaImage?: string | null;
  turmaName?: string | null;
  generatedData?: GeneratedLessonData | null;
  aulaIdParaCarregar?: string;
}

const PANEL_PADDING_HORIZONTAL = 13;
const PANEL_BORDER_RADIUS = 24;
const PANEL_HEADER_PADDING = 16;
const PANEL_HEADER_BORDER_RADIUS = 24;

const ConstrucaoAulaPanel: React.FC<ConstrucaoAulaPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  aulaName = 'Minha Nova Aula',
  selectedTemplate = null,
  turmaImage = null,
  turmaName = null,
  generatedData = null,
  aulaIdParaCarregar = undefined
}) => {
  const contentRef = useRef<AulaResultadoContentRef>(null);
  const [carregando, setCarregando] = useState(!!aulaIdParaCarregar);
  const [aulaCarregada, setAulaCarregada] = useState<any>(null);

  // EFEITO: Carrega aula se aulaIdParaCarregar foi passada
  useEffect(() => {
    if (!aulaIdParaCarregar) {
      setCarregando(false);
      return;
    }

    const carregarAula = async () => {
      try {
        console.log('[CONSTRUCAO_AULA] 🔄 Carregando aula:', aulaIdParaCarregar);
        setCarregando(true);

        // 1. Tenta localStorage
        let aulas = aulasStorageService.listarAulas();
        let aula = aulas.find((a: any) => a.id === aulaIdParaCarregar);

        // 2. Se não encontrou, tenta IndexedDB
        if (!aula) {
          console.log('[CONSTRUCAO_AULA] 💾 Não encontrou em localStorage, tentando IndexedDB...');
          let aulasIndexedDB = await aulasIndexedDBService.listarAulasIndexedDB();
          aula = aulasIndexedDB.find((a: any) => a.id === aulaIdParaCarregar);
        }

        if (!aula) {
          console.error('[CONSTRUCAO_AULA] ❌ Aula não encontrada!');
          alert('Aula não encontrada');
          setCarregando(false);
          onClose?.();
          return;
        }

        console.log('[CONSTRUCAO_AULA] ✅ Aula carregada:', aula.titulo);
        setAulaCarregada(aula);
        setCarregando(false);

      } catch (error) {
        console.error('[CONSTRUCAO_AULA_ERROR]', error);
        alert('Erro ao carregar aula');
        setCarregando(false);
        onClose?.();
      }
    };

    carregarAula();
  }, [aulaIdParaCarregar, onClose]);

  const handleSaveAndClose = useCallback(async () => {
    console.log('💾 [CLOSE_BUTTON] Clicado, verificando se foi publicada...');
    
    // Verificar se aula foi publicada
    const foiPublicada = contentRef.current?.isPublished?.() ?? false;
    console.log('[CLOSE_BUTTON] Aula foi publicada?', foiPublicada);
    
    if (foiPublicada) {
      console.log('[CLOSE_BUTTON] ✅ Aula FOI publicada, iniciando sincronização robusta...');
      
      // DUPLA VALIDAÇÃO: Dispara evento 2x com timing para garantir recebimento
      window.dispatchEvent(new Event('aulasPublicadas'));
      console.log('[CLOSE_BUTTON] 📤 Evento #1 disparado');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.dispatchEvent(new Event('aulasPublicadas'));
      console.log('[CLOSE_BUTTON] 📤 Evento #2 disparado (confirma)');
      
      onClose(foiPublicada);
    } else {
      console.log('[CLOSE_BUTTON] ⚠️ Aula NÃO foi publicada, salvando como rascunho...');
      
      if (contentRef.current) {
        const aulaData = contentRef.current.getAulaData();
        console.log('💾 [SAVE_AULA] Dados obtidos:', aulaData);
        
        if (aulaData && aulaData.titulo && aulaData.titulo.trim() !== '') {
          try {
            aulasStorageService.salvarAula({
              titulo: aulaData.titulo,
              objetivo: aulaData.objetivo || '',
              templateId: selectedTemplate?.id || 'unknown',
              templateName: selectedTemplate?.name || 'Template',
              turmaName: turmaName,
              turmaImage: turmaImage,
              duracao: aulaData.duracao || '60 min',
              status: 'rascunho',
              secoes: aulaData.secoes || {},
              sectionOrder: aulaData.sectionOrder || []
            });
            
            console.log('💾 [SAVE_AULA] ✅ Aula salva com sucesso!');
            onSave?.();
          } catch (error) {
            console.error('💾 [SAVE_AULA] ❌ Erro ao salvar aula:', error);
          }
        } else {
          console.log('💾 [SAVE_AULA] ⚠️ Aula sem título - não salvando');
        }
      }
      
      onClose(foiPublicada);
    }
  }, [selectedTemplate, turmaName, turmaImage, onClose, onSave]);

  // Se carregando aula, mostra loader
  if (carregando && aulaIdParaCarregar) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/50"
          >
            <div className="bg-[#1A2B3C] p-8 rounded-lg flex flex-col items-center gap-4 border border-[#FF6B00]/30">
              <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
              <p className="text-white font-semibold">Carregando aula...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ 
            type: 'spring',
            damping: 30,
            stiffness: 300,
            mass: 0.8
          }}
          className="absolute inset-0 z-40 flex flex-col"
          style={{ 
            background: '#030C2A',
            borderRadius: `${PANEL_BORDER_RADIUS}px`,
            border: '1px solid rgba(255, 107, 0, 0.2)',
            margin: `0 ${PANEL_PADDING_HORIZONTAL}px`,
            maxWidth: `calc(100% - ${PANEL_PADDING_HORIZONTAL * 2}px)`
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSaveAndClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all z-50"
            title="Salvar e fechar"
          >
            <X className="w-5 h-5" />
          </motion.button>
          
          <div className="flex-1 overflow-auto p-6">
            <AulaResultadoContent
              ref={contentRef}
              aulaName={aulaCarregada?.titulo || aulaName}
              selectedTemplate={selectedTemplate}
              turmaImage={turmaImage}
              turmaName={turmaName}
              createdAt={new Date()}
              generatedData={aulaCarregada ? { titulo: aulaCarregada.titulo, objetivo: aulaCarregada.objetivo, secoes: aulaCarregada.secoes || {} } : generatedData}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConstrucaoAulaPanel;
