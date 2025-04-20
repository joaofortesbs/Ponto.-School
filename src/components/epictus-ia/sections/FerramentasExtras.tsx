
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  SectionHeader, 
  CalculadoraFormulasCard,
  ExtratorTextoCard,
  GeradorIdeiasCard,
  TradutorAvancadoCard,
  Visualizador3DCard,
  ConversorUnidadesCard
} from "./components/ferramentas-extras";

const FerramentasExtras: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="py-6">
      <SectionHeader 
        title="Ferramentas Extras" 
        description="Recursos especializados para potencializar sua produtividade nos estudos"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <CalculadoraFormulasCard />
        <ExtratorTextoCard />
        <GeradorIdeiasCard />
        <TradutorAvancadoCard />
        <Visualizador3DCard />
        <ConversorUnidadesCard />
      </div>
    </div>
  );
};

export default FerramentasExtras;
