import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, ChevronRight, Loader2, Clock, BookOpen } from 'lucide-react';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { ArtifactViewModal } from './ArtifactViewModal';

interface ArtifactCardProps {
  artifactData: ArtifactData;
}

export function ArtifactCard({ artifactData }: ArtifactCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!artifactData) return null;

  const isReady = artifactData.status === 'ready';
  const isGenerating = artifactData.status === 'generating';
  const totalActivities = artifactData.atividades?.length || 0;
  const sectionLabels = artifactData.sections?.map(s => s.titulo) || [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[520px] mx-auto my-3"
      >
        <div
          onClick={() => isReady && setIsModalOpen(true)}
          className={`
            relative overflow-hidden rounded-2xl border cursor-pointer
            transition-all duration-300 group
            ${isReady
              ? 'border-orange-500/30 bg-gradient-to-br from-[#1a1a2e]/90 via-[#16213e]/90 to-[#0f3460]/90 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10'
              : 'border-white/10 bg-white/5'
            }
            backdrop-blur-xl
          `}
        >
          {isReady && (
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}

          <div className="relative z-10 p-5">
            <div className="flex items-start gap-4">
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                ${isReady
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30'
                  : 'bg-white/10'
                }
              `}>
                {isGenerating ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <FileText className="w-6 h-6 text-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-[15px] truncate">
                    {isGenerating ? 'Gerando Artefato...' : (artifactData.titulo || 'Artefato da Sessão')}
                  </h3>
                  {isReady && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30">
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Ponto. Flow</span>
                    </span>
                  )}
                </div>

                {isGenerating ? (
                  <p className="text-white/50 text-sm">
                    Analisando sua sessão e preparando o material complementar...
                  </p>
                ) : (
                  <div className="flex items-center gap-3 mt-1.5">
                    {totalActivities > 0 && (
                      <div className="flex items-center gap-1 text-white/50">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-xs">{totalActivities} atividade{totalActivities !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {artifactData.estatisticas?.tempo_processamento && (
                      <div className="flex items-center gap-1 text-white/50">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{artifactData.estatisticas.tempo_processamento}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isReady && (
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
              )}
            </div>

            {isReady && artifactData.sections?.[0]?.conteudo && typeof artifactData.sections[0].conteudo === 'string' && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                  {artifactData.sections[0].conteudo}
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex gap-2">
                  {(sectionLabels.length > 0 ? sectionLabels.slice(0, 4) : ['Resumo', 'Roadmap', 'Ganchos', 'Pais']).map((label, i) => (
                    <div
                      key={label}
                      className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 + i * 0.5, delay: i * 0.8, ease: 'easeInOut' }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {(sectionLabels.length > 0 ? sectionLabels.slice(0, 4) : ['Resumo', 'Roadmap', 'Ganchos', 'Pais']).map(label => (
                    <span key={label} className="text-[9px] text-white/30 uppercase tracking-wider">{label.substring(0, 10)}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <ArtifactViewModal
          artifactData={artifactData}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
