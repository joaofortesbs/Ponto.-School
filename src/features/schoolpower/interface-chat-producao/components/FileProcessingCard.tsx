import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Loader2, Paperclip } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto my-2"
    >
      <div className="relative rounded-xl border border-white/10 bg-[#1a1a2e]/80 backdrop-blur-sm overflow-hidden">
        {debugEntries && debugEntries.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <DebugIcon
              capabilityId="ler_arquivos"
              capabilityName="Leitura de Arquivos"
              entries={debugEntries}
            />
          </div>
        )}

        <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <span className="relative flex h-2 w-2">
            {status === 'processing' && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </>
            )}
            {status === 'complete' && (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            )}
            {status === 'error' && (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            )}
          </span>
          {status === 'processing' ? 'Processando anexos...' : status === 'complete' ? 'Anexos processados' : 'Erro nos anexos'}
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 bg-[#0d0d1a]/60 rounded-lg p-3 border border-white/5">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              {status === 'processing' ? (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              ) : status === 'complete' ? (
                <Paperclip className="w-5 h-5 text-cyan-400" />
              ) : (
                <FileText className="w-5 h-5 text-red-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90">
                {status === 'processing'
                  ? `Lendo ${totalFiles} arquivo${totalFiles > 1 ? 's' : ''} anexado${totalFiles > 1 ? 's' : ''}`
                  : `${processed} arquivo${processed > 1 ? 's' : ''} anexado${processed > 1 ? 's' : ''} lido${processed > 1 ? 's' : ''} com sucesso`}
              </p>

              {status === 'processing' && (
                <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                    initial={{ width: '5%' }}
                    animate={{ width: status === 'processing' ? '80%' : `${progress}%` }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                </div>
              )}

              {status === 'complete' && (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400/80">
                    {processed} arquivo{processed > 1 ? 's' : ''} lido{processed > 1 ? 's' : ''} com sucesso.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
