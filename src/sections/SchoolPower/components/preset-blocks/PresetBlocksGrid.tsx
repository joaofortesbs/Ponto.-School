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
    prompt: "Jota, assuma o controle da minha semana letiva. Preciso que você planeje aulas para a turma [Nome da Turma] sobre os temas [Tópicos da Semana]. Considere que tenho [Quantidade] aulas disponíveis. Use uma abordagem focada em [Estilo: Engajamento/Revisão/Conteúdo Denso]. Ao finalizar, organize tudo no meu calendário e prepare o Dossiê Ponto. Flow completo.",
    iconType: "save-week",
  },
  {
    id: "transforme-arquivos",
    title: "Transforme arquivos em atividades",
    description: "Envie todas as suas atividades e arquivos antigos e engessados e transforme eles em atividades interativas já prontas para os seus alunos!",
    prompt: "Analise os arquivos anexados e extraia a essência pedagógica deles. Quero que você transforme esse conteúdo em [Tipo de Atividade: Quiz/Flashcards/Desafio] para alunos de [Nível Escolar]. Adicione um toque de [Vibe: Humor/Curiosidade/Competição] e gere o Roadmap de Aplicação para eu usar amanhã.",
    iconType: "transform-files",
  },
];

function StackedIcon({ type }: { type: PresetBlock["iconType"] }) {
  if (type === "save-week") {
    return (
      <div className="relative w-11 h-11 flex-shrink-0">
        <div className="absolute bottom-0 left-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.25)" }}>
          <ClipboardList className="w-4 h-4 text-orange-400" />
        </div>
        <div className="absolute top-0 right-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
          style={{ background: "rgba(249, 115, 22, 0.25)", border: "1px solid rgba(249, 115, 22, 0.35)" }}>
          <CalendarDays className="w-4 h-4 text-orange-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-11 h-11 flex-shrink-0">
      <div className="absolute bottom-0 left-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.25)" }}>
        <FolderOpen className="w-4 h-4 text-orange-400" />
      </div>
      <div className="absolute top-0 right-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
        style={{ background: "rgba(249, 115, 22, 0.25)", border: "1px solid rgba(249, 115, 22, 0.35)" }}>
        <FileText className="w-4 h-4 text-orange-300" />
      </div>
    </div>
  );
}

interface PresetBlocksGridProps {
  onBlockClick: (prompt: string) => void;
}

export const PresetBlocksGrid: React.FC<PresetBlocksGridProps> = ({ onBlockClick }) => {
  return (
    <div className="w-full max-w-[620px] mx-auto mt-3 px-3 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESET_BLOCKS.map((block, index) => (
          <motion.button
            key={block.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.35, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBlockClick(block.prompt)}
            className="group relative text-left rounded-xl p-4 cursor-pointer transition-all duration-200 overflow-hidden"
            style={{
              background: "rgba(15, 20, 40, 0.65)",
              border: "1px solid rgba(249, 115, 22, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)",
                border: "1px solid rgba(249, 115, 22, 0.3)",
                borderRadius: "inherit",
              }}
            />

            <div className="relative z-10 flex items-start gap-3">
              <StackedIcon type={block.iconType} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="text-sm font-semibold text-white/90 leading-tight truncate">
                    {block.title}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 -translate-x-1 group-hover:translate-x-0" 
                    style={{ transition: "all 0.2s ease" }} />
                </div>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                  {block.description}
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
