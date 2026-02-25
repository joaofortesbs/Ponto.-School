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

export function FileProcessingCard({ fileNames, status, processedCount, debugEntries }: FileProcessingCardProps) {
  const totalFiles = fileNames.length;
  const processed = processedCount ?? (status === 'complete' ? totalFiles : 0);
  const progress = totalFiles > 0 ? (processed / totalFiles) * 100 : 0;

  const label = status === 'processing'
    ? `Lendo ${totalFiles} arquivo${totalFiles !== 1 ? 's' : ''} anexado${totalFiles !== 1 ? 's' : ''}...`
    : status === 'complete'
      ? `${processed} arquivo${processed !== 1 ? 's' : ''} lido${processed !== 1 ? 's' : ''} com sucesso`
      : `Erro ao ler ${totalFiles} arquivo${totalFiles !== 1 ? 's' : ''}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2 relative"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {status === 'processing' && (
          <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
        )}
        {status === 'complete' && (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        )}
        {status === 'error' && (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        )}

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '14px',
              fontStyle: 'italic',
              color: status === 'error'
                ? 'rgba(248, 113, 113, 0.85)'
                : 'rgba(255, 255, 255, 0.55)',
            }}
          >
            {label}
          </span>

          {status === 'processing' && (
            <div className="w-48 bg-white/5 rounded-full h-0.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                initial={{ width: '5%' }}
                animate={{ width: '80%' }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />
            </div>
          )}
        </div>
      </div>

      {debugEntries && debugEntries.length > 0 && (
        <div className="flex-shrink-0 ml-1">
          <DebugIcon
            capabilityId="ler_arquivos"
            capabilityName="Leitura de Arquivos"
            entries={debugEntries}
          />
        </div>
      )}
    </motion.div>
  );
}
