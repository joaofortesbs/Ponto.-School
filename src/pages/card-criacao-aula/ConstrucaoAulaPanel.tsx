import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, CheckCircle } from 'lucide-react';
import AulaResultadoContent, { AulaResultadoContentRef } from './components/AulaResultadoContent';
import { Template } from './components/TemplateDropdown';
import { GeneratedLessonData } from '@/services/lessonGeneratorService';
import { aulasStorageService } from '@/services/aulasStorageService';
import { aulasIndexedDBService } from '@/services/aulasIndexedDBService';
import { aulaLoadingDebugger } from '@/services/aulaLoadingDebugger';
import { sanitizeLoadedAula, ensureString } from '@/utils/contentSanitizer';

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
      aulaLoadingDebugger.log('SKIP', 'aulaIdParaCarregar é nulo');
      setCarregando(false);
      return;
    }

    const carregarAula = async () => {
      try {
        aulaLoadingDebugger.log('START', { aulaIdParaCarregar });
        aulaLoadingDebugger.log('LOADING_TRUE', null);
        setCarregando(true);

        // 1. Tenta localStorage
        let aulas = aulasStorageService.listarAulas();
        aulaLoadingDebugger.log('STORAGE_READ', { 
          totalAulasNoStorage: aulas.length,
          aulaIds: aulas.map((a: any) => a.id)
        });
        
        let aula = aulas.find((a: any) => a.id === aulaIdParaCarregar);

        // 2. Se não encontrou, tenta IndexedDB
        if (!aula) {
          aulaLoadingDebugger.log('NOT_IN_STORAGE', { aulaId: aulaIdParaCarregar });
          let aulasIndexedDB = await aulasIndexedDBService.listarAulasIndexedDB();
          aulaLoadingDebugger.log('INDEXEDDB_READ', { 
            totalAulasNoIndexedDB: aulasIndexedDB.length 
          });
          aula = aulasIndexedDB.find((a: any) => a.id === aulaIdParaCarregar);
        }

        if (!aula) {
          aulaLoadingDebugger.log('NOT_FOUND_ANYWHERE', { aulaId: aulaIdParaCarregar });
          console.error('[CONSTRUCAO_AULA] ❌ Aula não encontrada!');
          alert('Aula não encontrada');
          setCarregando(false);
          onClose?.();
          return;
        }

        aulaLoadingDebugger.log('FOUND', {
          titulo: aula.titulo,
          templateId: aula.templateId,
          sectionOrderLength: aula.sectionOrder?.length || 0,
          secoesLength: Object.keys(aula.secoes || {}).length
        });

        // 🔴 SANITIZAR ANTES DE USAR
        const aulaSanitizada = sanitizeLoadedAula(aula);
        aulaLoadingDebugger.log('AULA_SANITIZADA', {
          titulo: aulaSanitizada.titulo,
          objetivo: aulaSanitizada.objetivo?.substring(0, 50),
          sectionOrderLength: aulaSanitizada.sectionOrder.length
        });

        console.log('[CONSTRUCAO_AULA] ✅ Aula carregada e sanitizada:', aulaSanitizada.titulo);
        setAulaCarregada(aulaSanitizada);
        setCarregando(false);
        aulaLoadingDebugger.log('LOADING_FALSE', null);
        aulaLoadingDebugger.log('COMPLETE', 'Aula carregada com sucesso no estado');

      } catch (error) {
        aulaLoadingDebugger.log('ERROR', {
          message: (error as any).message,
          stack: (error as any).stack
        });
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

  // Verificação pós-carregamento
  useEffect(() => {
    if (carregando || !aulaIdParaCarregar || !aulaCarregada) return;

    const verificarCarregamento = () => {
      console.log('[VERIFY_LOAD] Verificando se tudo foi carregado...');
      
      const checklist = {
        titulo: !!aulaCarregada.titulo && aulaCarregada.titulo.length > 0,
        sectionOrder: Array.isArray(aulaCarregada.sectionOrder) && aulaCarregada.sectionOrder.length > 0,
        secoes: Object.keys(aulaCarregada.secoes || {}).length > 0,
      };

      console.log('[VERIFY_LOAD] Checklist:', checklist);
      aulaLoadingDebugger.log('VERIFICATION_CHECK', checklist);

      const todasAsCondicoes = Object.values(checklist).every(v => v);
      
      if (todasAsCondicoes) {
        console.log('[VERIFY_LOAD] ✅ TUDO CARREGOU CORRETAMENTE!');
        aulaLoadingDebugger.log('VERIFICATION_SUCCESS', checklist);
      } else {
        console.warn('[VERIFY_LOAD] ⚠️ ALGO FALTOU:', checklist);
        aulaLoadingDebugger.log('VERIFICATION_FAILED', checklist);
      }
    };

    setTimeout(verificarCarregamento, 100);
  }, [aulaCarregada, carregando, aulaIdParaCarregar]);

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

          {/* BADGE DE STATUS - Verde quando carregada */}
          {!carregando && aulaIdParaCarregar && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-400 font-medium">EDITANDO</span>
            </motion.div>
          )}
          
          <div className="flex-1 overflow-auto p-6">
            <AulaResultadoContent
              ref={contentRef}
              aulaName={aulaCarregada?.titulo || aulaName}
              selectedTemplate={selectedTemplate}
              turmaImage={turmaImage}
              turmaName={turmaName}
              createdAt={new Date()}
              generatedData={aulaCarregada ? (() => {
                // 🔴 TRANSFORMAÇÃO: Converte secoes salvas para formato generatedData
                const secoesTransformadas: Record<string, string> = {};
                if (aulaCarregada.secoes && typeof aulaCarregada.secoes === 'object') {
                  Object.entries(aulaCarregada.secoes).forEach(([key, value]: [string, any]) => {
                    secoesTransformadas[key] = String(value?.text || value || '');
                  });
                }
                
                console.log('[LOAD_TRANSFORM] Transformando secoes para generatedData');
                console.log('[LOAD_TRANSFORM] secoes originais:', Object.keys(aulaCarregada.secoes || {}));
                console.log('[LOAD_TRANSFORM] secoesTransformadas:', Object.keys(secoesTransformadas));
                
                return {
                  titulo: aulaCarregada.titulo,
                  objetivo: aulaCarregada.objetivo,
                  secoes: secoesTransformadas
                };
              })() : generatedData}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConstrucaoAulaPanel;
