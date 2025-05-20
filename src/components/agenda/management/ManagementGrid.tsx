import React from "react";
import TempoEstudo from "./TempoEstudo";
import TarefasPendentes from "./TarefasPendentes";
import ProgressoDisciplina from "./ProgressoDisciplina";
import RecomendacoesEpictusIA from "./RecomendacoesEpictusIA";

const ManagementGrid: React.FC = () => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <TempoEstudo />
      <ProgressoDisciplina />
      <RecomendacoesEpictusIA />
      <TarefasPendentes />
    </div>
  );
};

export default ManagementGrid;