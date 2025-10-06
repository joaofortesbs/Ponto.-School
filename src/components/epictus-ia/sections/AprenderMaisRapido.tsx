import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Zap } from "lucide-react";
import { 
  SectionHeader, 
  MethodCard,
  ResumosInteligentesCard,
  MapasMentaisCard,
  SimuladorProvasCard,
  EstudoCompetenciaCard,
  RevisaoGuiadaCard
} from "./components/aprender-mais-rapido";

export default function AprenderMaisRapido() {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ResumosInteligentesCard />
        <MapasMentaisCard />
        <SimuladorProvasCard />
        <EstudoCompetenciaCard />
        <RevisaoGuiadaCard />
      </div>

      <MethodCard />
    </div>
  );
}