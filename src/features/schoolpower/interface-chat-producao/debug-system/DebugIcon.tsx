/**
 * DEBUG ICON - Ícone de debug para cards de capability
 * 
 * Exibe ícone clicável que abre o modal de debug
 * Muda de cor se houver erros/warnings
 */

import React, { useState } from 'react';
import { Bug, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { DebugModal } from './DebugModal';
import type { AIDebugEntry } from './types';

interface DebugIconProps {
  capabilityId: string;
  capabilityName: string;
  entries: AIDebugEntry[];
  className?: string;
}

export function DebugIcon({ 
  capabilityId, 
  capabilityName, 
  entries,
  className = ''
}: DebugIconProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const errorCount = entries.filter(e => e.entry_type === 'error').length;
  const warningCount = entries.filter(e => e.entry_type === 'warning').length;
  const hasIssues = errorCount > 0 || warningCount > 0;

  const iconColor = errorCount > 0 
    ? 'text-red-400 hover:text-red-300' 
    : warningCount > 0 
      ? 'text-orange-400 hover:text-orange-300'
      : 'text-gray-400 hover:text-gray-300';

  const bgColor = errorCount > 0
    ? 'hover:bg-red-500/10'
    : warningCount > 0
      ? 'hover:bg-orange-500/10'
      : 'hover:bg-white/10';

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={`relative p-1.5 rounded-lg transition-colors ${bgColor} ${className}`}
        title={`Ver debug (${entries.length} eventos)`}
      >
        <Bug className={`w-4 h-4 ${iconColor}`} />
        
        {entries.length > 0 && (
          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
            errorCount > 0 
              ? 'bg-red-500 text-white' 
              : warningCount > 0 
                ? 'bg-orange-500 text-white'
                : 'bg-purple-500 text-white'
          }`}>
            {entries.length > 9 ? '9+' : entries.length}
          </span>
        )}

        {hasIssues && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-0.5 -left-0.5"
          >
            <AlertTriangle className={`w-3 h-3 ${errorCount > 0 ? 'text-red-400' : 'text-orange-400'}`} />
          </motion.span>
        )}
      </motion.button>

      <DebugModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        capabilityId={capabilityId}
        capabilityName={capabilityName}
        entries={entries}
      />
    </>
  );
}

export default DebugIcon;
