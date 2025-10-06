
import React from 'react';
import { Wallet } from 'lucide-react';
import AlunoUnderConstruction from './AlunoUnderConstruction';

const CarteiraAlunoConstruction = () => {
  return (
    <AlunoUnderConstruction
      title="Carteira"
      description="A Carteira para alunos está sendo desenvolvida. Em breve você poderá gerenciar seus School Points e recompensas educacionais."
      icon={Wallet}
    />
  );
};

export default CarteiraAlunoConstruction;
