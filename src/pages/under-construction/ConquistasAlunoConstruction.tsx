
import React from 'react';
import { Trophy } from 'lucide-react';
import AlunoUnderConstruction from './AlunoUnderConstruction';

const ConquistasAlunoConstruction = () => {
  return (
    <AlunoUnderConstruction
      title="Conquistas"
      description="O sistema de Conquistas para alunos está sendo desenvolvido. Em breve você poderá acompanhar suas conquistas, badges e progresso acadêmico."
      icon={Trophy}
    />
  );
};

export default ConquistasAlunoConstruction;
