import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DebugIcon } from '../debug-system/DebugIcon';
import type { AIDebugEntry } from '../debug-system/types';

interface FileProcessingCardProps {
  fileNames: string[];
  status: 'processing' | 'complete' | 'error';
  processedCount?: number;
  debugEntries?: AIDebugEntry[];
}

export function FileProcessingCard({ fileNames, status, processedCount, debugEntries = [] }: FileProcessingCardProps) {
  const totalFiles = fileNames.length;
  const processed = processedCount ?? (status === 'complete' ? totalFiles : 0);

  const label = status === 'processing'
    ? `Lendo ${totalFiles} arquivo${totalFiles !== 1 ? 's' : ''} anexado${totalFiles !== 1 ? 's' : ''}...`
    : status === 'complete'
      ? `${processed} arquivo${processed !== 1 ? 's' : ''} lido${processed !== 1 ? 's' : ''} com sucesso`
      : `Erro ao ler ${totalFiles} arquivo${totalFiles !== 1 ? 's' : ''}`;

  const hasDebug = debugEntries.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-white/10 bg-[#0d0d1a]/70 backdrop-blur-sm px-4 py-3 max-w-sm"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex-shrink-0">
          {status === 'processing' && (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          )}
          {status === 'complete' && (
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          )}
          {status === 'error' && (
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
        </div>

        <span
          className="flex-1 min-w-0 truncate"
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '13px',
            fontStyle: 'italic',
            color: status === 'error'
              ? 'rgba(248, 113, 113, 0.9)'
              : status === 'complete'
                ? 'rgba(52, 211, 153, 0.85)'
                : 'rgba(255, 255, 255, 0.6)',
          }}
        >
          {label}
        </span>

        <div className={`flex-shrink-0 transition-opacity duration-300 ${hasDebug ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <DebugIcon
            capabilityId="ler_arquivos"
            capabilityName="Leitura de Arquivos"
            entries={debugEntries}
          />
        </div>
      </div>

      {status === 'processing' && (
        <div className="mt-2.5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
            initial={{ width: '4%' }}
            animate={{ width: '82%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
        </div>
      )}
    </motion.div>
  );
}
