import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { ARTIFACT_TYPE_CONFIGS } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';

interface ArtifactCardProps {
  artifact: ArtifactData;
  onOpen?: (artifact: ArtifactData) => void;
}

export function ArtifactCard({ artifact, onOpen }: ArtifactCardProps) {
  const config = ARTIFACT_TYPE_CONFIGS[artifact.metadata.tipo];
  const subtitle = artifact.metadata.subtitulo
    || `${artifact.secoes.length} seções`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-2"
    >
      <button
        onClick={() => onOpen?.(artifact)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors duration-200 hover:bg-slate-800/50 group"
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <div className="flex-shrink-0">
          <FileText
            className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {config.nome}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {subtitle}
          </p>
        </div>
      </button>
    </motion.div>
  );
}

export default ArtifactCard;
