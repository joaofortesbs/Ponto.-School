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
        className="relative"
      >
        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 right-0 mb-2 rounded-lg overflow-hidden z-50"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                boxShadow: '0 4px 16px rgba(255, 107, 0, 0.2)'
              }}
            >
              {/* Adicionar arquivos */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255, 107, 0, 0.15)' }}
                onClick={() => handleOptionClick('Adicionar arquivos')}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white transition-colors border-b border-white/5 last:border-b-0"
              >
                <Upload className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-sm font-medium">Adicionar arquivos</span>
              </motion.button>

              {/* Adicionar links */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255, 107, 0, 0.15)' }}
                onClick={() => handleOptionClick('Adicionar links')}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white transition-colors"
              >
                <Link className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-sm font-medium">Adicionar links</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all"
          style={{
            background: isDropdownOpen
              ? 'rgba(255, 107, 0, 0.15)'
              : 'rgba(255, 107, 0, 0.05)',
            border: isDropdownOpen
              ? '2px solid #FF6B00'
              : '2px solid rgba(255, 107, 0, 0.2)',
            cursor: 'pointer'
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
