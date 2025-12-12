import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StyleDefinitionContent: React.FC = () => {
  const [assunto, setAssunto] = useState('');
  const [contexto, setContexto] = useState('');

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
    </div>
  );
};

export default StyleDefinitionContent;
