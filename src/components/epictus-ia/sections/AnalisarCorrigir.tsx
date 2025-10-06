import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  SectionHeader, 
  ProgressCard,
  CorretorRedacaoCard,
  RevisorTextosCard,
  DetectorPlagioCard,
  AnaliseDesempenhoCard,
  ChecklistPreparacaoCard
} from "./components/analisar-corrigir";

export default function AnalisarCorrigir() {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CorretorRedacaoCard />
        <RevisorTextosCard />
        <DetectorPlagioCard />
        <AnaliseDesempenhoCard />
        <ChecklistPreparacaoCard />
      </div>

      <div className="mt-6 flex-1">
        <ProgressCard />
      </div>
    </div>
  );
}