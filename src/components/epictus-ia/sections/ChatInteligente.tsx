import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  ChatCard,
  EpictusTurboCard,
  EpictusIACard,
  TutorInteligenteCard,
  BrainstormCard
} from "./components/chat-inteligente";
import { useTurboMode } from "../context/TurboModeContext";

export default function ChatInteligente() {
  const { theme } = useTheme();
  const { isTurboMode, toggleTurboMode } = useTurboMode();

  return (
    <div className="h-full flex flex-col">
      {/* Header da seção */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#29335C] dark:text-white mb-2">Chat Inteligente</h2>
        <p className="text-[#64748B] dark:text-white/60">
          Converse com diferentes assistentes de IA para diversos objetivos
        </p>
      </div>

      {/* Grid de cartões */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <EpictusTurboCard onUseTurbo={toggleTurboMode} />
        <EpictusIACard />
        <TutorInteligenteCard />
        <BrainstormCard />
      </div>
    </div>
  );
}