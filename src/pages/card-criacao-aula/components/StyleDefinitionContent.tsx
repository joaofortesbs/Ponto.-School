import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Upload, Link, Zap, Sparkles } from 'lucide-react';

const StyleDefinitionContent: React.FC = () => {
  const [assunto, setAssunto] = useState('');
  const [contexto, setContexto] = useState('');
  const [isSourcesDropdownOpen, setIsSourcesDropdownOpen] = useState(false);
  const [isIntegrationsDropdownOpen, setIsIntegrationsDropdownOpen] = useState(false);
  const sourcesDropdownRef = useRef<HTMLDivElement>(null);
  const integrationsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourcesDropdownRef.current && !sourcesDropdownRef.current.contains(event.target as Node)) {
        setIsSourcesDropdownOpen(false);
      }
      if (integrationsDropdownRef.current && !integrationsDropdownRef.current.contains(event.target as Node)) {
        setIsIntegrationsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSourcesOptionClick = (option: string) => {
    console.log(`Selecionado (Fontes e Recursos): ${option}`);
    setIsSourcesDropdownOpen(false);
  };

  const handleIntegrationsOptionClick = (option: string) => {
    console.log(`Selecionado (Integrações): ${option}`);
    setIsIntegrationsDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Campo Assunto */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-white/80">
          Assunto
        </label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Digite o assunto da aula..."
          className="w-full px-4 py-2 rounded-lg text-white bg-white/5 border border-white/10 focus:border-[#FF6B00] focus:outline-none focus:bg-white/10 transition-all"
        />
      </motion.div>

      {/* Campo Contexto */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-white/80">
          Contexto
        </label>
        <textarea
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
          placeholder="Descreva o contexto e detalhes da aula..."
          className="w-full px-4 py-3 rounded-lg text-white bg-white/5 border border-white/10 focus:border-[#FF6B00] focus:outline-none focus:bg-white/10 transition-all resize-none"
          rows={5}
        />
      </motion.div>

      {/* Cards de Ações: Fontes e Recursos + Integrações + Botão Gerar Aula */}
      <div className="flex gap-3 justify-between items-end">
        <div className="flex gap-3">
          {/* Card Fontes e Recursos com Dropdown */}
          <motion.div
            ref={sourcesDropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="relative w-fit"
          >
          {/* Dropdown Menu */}
          <AnimatePresence>
            {isSourcesDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 mb-2 rounded-xl overflow-hidden shadow-lg"
                style={{
                  background: '#0a1434',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  zIndex: 9999,
                  width: '220px'
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-2 flex flex-col gap-1">
                  {/* Adicionar arquivos */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => handleSourcesOptionClick('Adicionar arquivos')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <Upload className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-sm font-medium">Adicionar arquivos</span>
                  </motion.button>

                  {/* Adicionar links */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => handleSourcesOptionClick('Adicionar links')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <Link className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-sm font-medium">Adicionar links</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Button - Fontes e Recursos */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSourcesDropdownOpen(!isSourcesDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            style={{
              background: isSourcesDropdownOpen
                ? 'rgba(255, 107, 0, 0.15)'
                : 'rgba(255, 107, 0, 0.08)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Paperclip className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-sm font-medium text-white">Fontes e Recursos</span>
          </motion.button>
        </motion.div>

        {/* Card Integrações com Dropdown */}
        <motion.div
          ref={integrationsDropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="relative w-fit"
        >
          {/* Dropdown Menu */}
          <AnimatePresence>
            {isIntegrationsDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 mb-2 rounded-xl overflow-hidden shadow-lg"
                style={{
                  background: '#0a1434',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  zIndex: 9999,
                  width: '220px'
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-2 flex flex-col gap-1">
                  {/* Notion */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => handleIntegrationsOptionClick('Notion')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FF6B00]" />
                    <span className="text-sm font-medium">Notion</span>
                  </motion.button>

                  {/* Google Drive */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => handleIntegrationsOptionClick('Google Drive')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FF6B00]" />
                    <span className="text-sm font-medium">Google Drive</span>
                  </motion.button>

                  {/* Gmail */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => handleIntegrationsOptionClick('Gmail')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FF6B00]" />
                    <span className="text-sm font-medium">Gmail</span>
                  </motion.button>

                  {/* Outlook */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => handleIntegrationsOptionClick('Outlook')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FF6B00]" />
                    <span className="text-sm font-medium">Outlook</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Button - Integrações */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsIntegrationsDropdownOpen(!isIntegrationsDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            style={{
              background: isIntegrationsDropdownOpen
                ? 'rgba(255, 107, 0, 0.15)'
                : 'rgba(255, 107, 0, 0.08)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Zap className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-sm font-medium text-white">Integrações</span>
          </motion.button>
        </motion.div>
        </div>

        {/* Botão Gerar Aula */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-2 rounded-xl font-medium text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
            boxShadow: '0 4px 15px rgba(255, 107, 0, 0.3)'
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">Gerar aula</span>
        </motion.button>
      </div>
    </div>
  );
};

export default StyleDefinitionContent;
