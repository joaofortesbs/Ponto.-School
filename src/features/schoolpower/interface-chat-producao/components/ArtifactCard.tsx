import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Hash, ChevronRight, Sparkles } from 'lucide-react';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { ARTIFACT_TYPE_CONFIGS } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';

interface ArtifactCardProps {
  artifact: ArtifactData;
  onOpen?: (artifact: ArtifactData) => void;
}

export function ArtifactCard({ artifact, onOpen }: ArtifactCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = ARTIFACT_TYPE_CONFIGS[artifact.metadata.tipo];
  const stats = artifact.metadata.estatisticas;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-[520px] mx-auto mt-3"
    >
      <motion.button
        onClick={() => onOpen?.(artifact)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full text-left rounded-2xl overflow-hidden transition-all duration-300 group"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${isHovered ? config.cor + '60' : 'rgba(148, 163, 184, 0.15)'}`,
          boxShadow: isHovered 
            ? `0 8px 32px ${config.cor}15, 0 2px 8px rgba(0,0,0,0.3)` 
            : '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        <div 
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${config.cor}, ${config.cor}80, transparent)` }}
        />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ 
                background: `${config.cor}20`,
                border: `1px solid ${config.cor}30`,
              }}
            >
              {config.icone}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span 
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ 
                    background: `${config.cor}20`,
                    color: config.cor,
                  }}
                >
                  Artefato
                </span>
                <Sparkles className="w-3 h-3 text-amber-400/60" />
              </div>
              
              <h3 className="text-sm font-semibold text-slate-100 truncate">
                {config.nome}
              </h3>
              
              {artifact.metadata.subtitulo && (
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {artifact.metadata.subtitulo}
                </p>
              )}
            </div>

            <motion.div
              animate={{ x: isHovered ? 4 : 0, opacity: isHovered ? 1 : 0.5 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 mt-1"
            >
              <ChevronRight 
                className="w-5 h-5"
                style={{ color: config.cor }}
              />
            </motion.div>
          </div>

          <p className="text-xs text-slate-300/80 mt-3 line-clamp-2 leading-relaxed">
            {artifact.resumoPreview}
          </p>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Hash className="w-3 h-3" />
              <span>{stats?.secoes || artifact.secoes.length} seções</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <FileText className="w-3 h-3" />
              <span>{stats?.palavras || '—'} palavras</span>
            </div>
            {stats?.tempoGeracao && stats.tempoGeracao > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{formatTime(stats.tempoGeracao)}</span>
              </div>
            )}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

export default ArtifactCard;
