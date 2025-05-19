import React, { useEffect } from "react";
import TempoEstudo from "./TempoEstudo";
import TarefasPendentes from "./TarefasPendentes";
import ProgressoDisciplina from "./ProgressoDisciplina";
import RecomendacoesEpictusIA from "./RecomendacoesEpictusIA";

interface ManagementGridProps {
  onViewAllTasks?: () => void;
  onAddTask?: () => void;
  onViewStudyTime?: () => void;
  onSetGoals?: () => void;
}

const ManagementGrid: React.FC<ManagementGridProps> = ({
  onViewAllTasks,
  onAddTask,
  onViewStudyTime,
  onSetGoals
}) => {
  // Garantir que o evento de task-added está sendo propagado corretamente
  useEffect(() => {
    const handleTaskAdded = (event: any) => {
      console.log("ManagementGrid: Evento de tarefa adicionada capturado:", event.detail);
      
      // Propagar o evento para os componentes filhos diretamente
      if (event.detail) {
        setTimeout(() => {
          // Propagar para TarefasPendentes especificamente
          const tarefasComponent = document.querySelector('[data-tasks-container="true"]');
          if (tarefasComponent) {
            tarefasComponent.dispatchEvent(new CustomEvent('task-added', {
              detail: event.detail,
              bubbles: true
            }));
          }
        }, 100); // Pequeno delay para garantir que o componente esteja renderizado
      }
    };

    window.addEventListener('task-added', handleTaskAdded);

    return () => {
      window.removeEventListener('task-added', handleTaskAdded);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="h-[480px] management-card-container">
        <TempoEstudo />
      </div>
      <div className="h-[480px] management-card-container">
        <TarefasPendentes />
      </div>
      <div className="h-[480px] management-card-container">
        <ProgressoDisciplina />
      </div>
      <div className="h-[480px] management-card-container">
        <RecomendacoesEpictusIA />
      </div>
    </div>
  );
};

export default ManagementGrid;