
import React from "react";
import GradeCardsTopoPainel from "./GradeCardsTopoPainel";
import CardsPrincipaisFuncionalidadesPainel from "./Cards-Principais-Funcionalidades-Painel";

export default function DashboardInterface() {
  return (
    <div className="w-full space-y-6">
      {/* Grade de Cards do Topo do Painel */}
      <GradeCardsTopoPainel />
      
      {/* Grade de Cards Principais de Funcionalidades do Painel */}
      <CardsPrincipaisFuncionalidadesPainel />
    </div>
  );
}
