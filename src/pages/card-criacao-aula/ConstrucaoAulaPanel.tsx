import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import AulaResultadoContent, { AulaResultadoContentRef } from './components/AulaResultadoContent';
import { Template } from './components/TemplateDropdown';
import { GeneratedLessonData } from '@/services/lessonGeneratorService';
import { aulasStorageService } from '@/services/aulasStorageService';

interface ConstrucaoAulaPanelProps {
  isOpen: boolean;
  onClose: (foiPublicada?: boolean) => void;
  onSave?: () => void;
  aulaName?: string;
  selectedTemplate?: Template | null;
  turmaImage?: string | null;
  turmaName?: string | null;
  generatedData?: GeneratedLessonData | null;
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
  generatedData = null
}) => {
  const contentRef = useRef<AulaResultadoContentRef>(null);

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
              aulaName={aulaName}
              selectedTemplate={selectedTemplate}
              turmaImage={turmaImage}
              turmaName={turmaName}
              createdAt={new Date()}
              generatedData={generatedData}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConstrucaoAulaPanel;
