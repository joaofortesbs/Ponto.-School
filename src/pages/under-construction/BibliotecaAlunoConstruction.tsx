
import React from 'react';
import { Book } from 'lucide-react';
import AlunoUnderConstruction from './AlunoUnderConstruction';

const BibliotecaAlunoConstruction = () => {
  return (
    <AlunoUnderConstruction
      title="Biblioteca"
      description="A Biblioteca para alunos está sendo desenvolvida. Em breve você terá acesso a uma vasta coleção de livros, artigos e recursos educacionais."
      icon={Book}
    />
  );
};

export default BibliotecaAlunoConstruction;
