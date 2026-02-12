"use client";
import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, FileText, ClipboardList, FolderOpen, Sparkles, ArrowRight } from "lucide-react";

export interface PresetBlock {
  id: string;
  title: string;
  description: string;
  prompt: string;
  iconType: "save-week" | "transform-files";
}

const PRESET_BLOCKS: PresetBlock[] = [
  {
    id: "salve-semana",
    title: "Salve minha semana de aulas",
    description: "Crie todas as suas aulas da semana com todas as atividades prontas e de maneira automatizada! E já envie elas para os seus alunos agora mesmo!",
    prompt: "Jota, assuma o controle da minha semana letiva. Preciso que você planeje aulas para a turma [Nome da Turma] sobre os temas [Tópicos da Semana]. Considere que tenho [Quantidade] aulas disponíveis. Use uma abordagem focada em [Seu estilo]. Ao finalizar, organize tudo no meu calendário e prepare o Dossiê Ponto. Flow completo.",
    iconType: "save-week",
  },
  {
    id: "transforme-arquivos",
    title: "Transforme arquivos em atividades",
    description: "Envie todas as suas atividades e arquivos antigos e engessados e transforme eles em atividades interativas já prontas para os seus alunos!",
    prompt: "Analise os arquivos anexados e extraia a essência pedagógica deles. Quero que você transforme esse conteúdo em [Tipo de atividade] para alunos de [Nível Escolar]. Adicione um toque de [Vibe: Humor/Curiosidade/Competição] e gere o Roadmap de Aplicação para eu usar amanhã.",
    iconType: "transform-files",
  },
];

const GRID_CONFIG = {
  maxWidth: 720,
  gap: 12,
  cardBorderRadius: 16,
  cardPaddingX: 16,
  cardPaddingY: 14,
  iconSize: 44,
  iconBoxSize: 34,
  iconInnerSize: 18,
} as const;

function StackedIcon({ type }: { type: PresetBlock["iconType"] }) {
  const boxSize = `${GRID_CONFIG.iconBoxSize}px`;
  const innerSize = `${GRID_CONFIG.iconInnerSize}px`;

  if (type === "save-week") {
    return (
      <div className="relative flex-shrink-0" style={{ width: `${GRID_CONFIG.iconSize}px`, height: `${GRID_CONFIG.iconSize}px` }}>
        <div className="absolute bottom-0 left-0 rounded-lg flex items-center justify-center"
          style={{ width: boxSize, height: boxSize, background: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.25)" }}>
          <ClipboardList style={{ width: innerSize, height: innerSize }} className="text-orange-400" />
        </div>
        <div className="absolute top-0 right-0 rounded-lg flex items-center justify-center shadow-lg"
          style={{ width: boxSize, height: boxSize, background: "rgba(249, 115, 22, 0.25)", border: "1px solid rgba(249, 115, 22, 0.35)" }}>
          <CalendarDays style={{ width: innerSize, height: innerSize }} className="text-orange-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0" style={{ width: `${GRID_CONFIG.iconSize}px`, height: `${GRID_CONFIG.iconSize}px` }}>
      <div className="absolute bottom-0 left-0 rounded-lg flex items-center justify-center"
        style={{ width: boxSize, height: boxSize, background: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.25)" }}>
        <FolderOpen style={{ width: innerSize, height: innerSize }} className="text-orange-400" />
      </div>
      <div className="absolute top-0 right-0 rounded-lg flex items-center justify-center shadow-lg"
        style={{ width: boxSize, height: boxSize, background: "rgba(249, 115, 22, 0.25)", border: "1px solid rgba(249, 115, 22, 0.35)" }}>
        <FileText style={{ width: innerSize, height: innerSize }} className="text-orange-300" />
      </div>
    </div>
  );
}

interface PresetBlocksGridProps {
  onBlockClick: (prompt: string) => void;
}

export const PresetBlocksGrid: React.FC<PresetBlocksGridProps> = ({ onBlockClick }) => {
  return (
    <div
      className="mx-auto"
      style={{
        width: "100%",
        maxWidth: `${GRID_CONFIG.maxWidth}px`,
      }}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2"
        style={{ gap: `${GRID_CONFIG.gap}px` }}
      >
        {PRESET_BLOCKS.map((block, index) => (
          <motion.button
            key={block.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.35, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBlockClick(block.prompt)}
            className="group relative text-left cursor-pointer transition-all duration-200 overflow-hidden"
            style={{
              background: "rgba(15, 20, 40, 0.65)",
              border: "1px solid rgba(249, 115, 22, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: `${GRID_CONFIG.cardBorderRadius}px`,
              paddingLeft: `${GRID_CONFIG.cardPaddingX}px`,
              paddingRight: `${GRID_CONFIG.cardPaddingX}px`,
              paddingTop: `${GRID_CONFIG.cardPaddingY}px`,
              paddingBottom: `${GRID_CONFIG.cardPaddingY}px`,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)",
                border: "1px solid rgba(249, 115, 22, 0.3)",
                borderRadius: `${GRID_CONFIG.cardBorderRadius}px`,
              }}
            />

            <div className="relative z-10 flex items-center gap-3">
              <StackedIcon type={block.iconType} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className="text-sm font-semibold text-white/90 leading-tight truncate">
                    {block.title}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 -translate-x-1 group-hover:translate-x-0" 
                    style={{ transition: "all 0.2s ease" }} />
                </div>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                  {block.description}
                </p>
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ borderRadius: `0 0 ${GRID_CONFIG.cardBorderRadius}px ${GRID_CONFIG.cardBorderRadius}px` }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
