import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Upload, Link } from 'lucide-react';

const StyleDefinitionContent: React.FC = () => {
  const [assunto, setAssunto] = useState('');
  const [contexto, setContexto] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    console.log(`Selecionado: ${option}`);
    setIsDropdownOpen(false);
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

      {/* Card Fontes e Recursos com Dropdown */}
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="relative w-fit"
      >
        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
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
                  onClick={() => handleOptionClick('Adicionar arquivos')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                >
                  <Upload className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-sm font-medium">Adicionar arquivos</span>
                </motion.button>

                {/* Adicionar links */}
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => handleOptionClick('Adicionar links')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
                >
                  <Link className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-sm font-medium">Adicionar links</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Button - Reduzida em largura */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
          style={{
            background: isDropdownOpen
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
    </div>
  );
};

export default StyleDefinitionContent;
