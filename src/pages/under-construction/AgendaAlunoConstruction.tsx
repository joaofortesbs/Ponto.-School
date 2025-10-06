
import React from 'react';
import { Calendar } from 'lucide-react';
import AlunoUnderConstruction from './AlunoUnderConstruction';

const AgendaAlunoConstruction = () => {
  return (
    <AlunoUnderConstruction
      title="Agenda"
      description="A Agenda para alunos está sendo desenvolvida. Em breve você poderá organizar suas tarefas, eventos e compromissos escolares."
      icon={Calendar}
    />
  );
};

export default AgendaAlunoConstruction;
