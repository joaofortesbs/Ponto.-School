import React from "react";
import TempoEstudo from "./TempoEstudo";
import TarefasPendentes from "./TarefasPendentes";
import ProgressoDisciplina from "./ProgressoDisciplina";
import RecomendacoesEpictusIA from "./RecomendacoesEpictusIA";

const ManagementGrid: React.FC = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <TempoEstudo />
        <TarefasPendentes />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ProgressoDisciplina />
        <RecomendacoesEpictusIA />
      </div>
    </div>
  );
};

export default ManagementGrid;