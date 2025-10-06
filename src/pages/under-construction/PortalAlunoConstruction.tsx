
import React from 'react';
import { BookOpen } from 'lucide-react';
import AlunoUnderConstruction from './AlunoUnderConstruction';

const PortalAlunoConstruction = () => {
  return (
    <AlunoUnderConstruction
      title="Portal de Materiais"
      description="O Portal de Materiais para alunos está sendo desenvolvido. Em breve você terá acesso a todos os materiais didáticos compartilhados pelos seus professores."
      icon={BookOpen}
    />
  );
};

export default PortalAlunoConstruction;
