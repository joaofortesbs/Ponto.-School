
export const quadroInterativoFieldMapping = {
  // Mapeamento de campos do formulário para a estrutura esperada
  titulo: 'quadroInterativoTitulo',
  descricao: 'quadroInterativoDescricao',
  materia: 'quadroInterativoMateria',
  tema: 'quadroInterativoTema',
  anoEscolar: 'quadroInterativoAnoEscolar',
  numeroQuestoes: 'quadroInterativoNumeroQuestoes',
  nivelDificuldade: 'quadroInterativoNivelDificuldade',
  modalidadeQuestao: 'quadroInterativoModalidadeQuestao',
  campoEspecifico: 'quadroInterativoCampoEspecifico'
};

export const defaultQuadroInterativoData = {
  quadroInterativoTitulo: 'Quadro Interativo: Relevo e Formação de Montanhas',
  quadroInterativoDescricao: 'Apresentação interativa sobre os diferentes tipos de relevo e os processos de formação de montanhas, utilizando recursos visuais e atividades práticas.',
  quadroInterativoMateria: 'Geografia',
  quadroInterativoTema: 'Relevo e Formação de Montanhas',
  quadroInterativoAnoEscolar: '6º ano',
  quadroInterativoNumeroQuestoes: 10,
  quadroInterativoNivelDificuldade: 'Médio',
  quadroInterativoModalidadeQuestao: 'Múltipla escolha',
  quadroInterativoCampoEspecifico: 'Geologia e Tectônica de Placas'
};

export function mapFormDataToQuadroInterativo(formData: any) {
  return {
    titulo: formData.quadroInterativoTitulo || defaultQuadroInterativoData.quadroInterativoTitulo,
    descricao: formData.quadroInterativoDescricao || defaultQuadroInterativoData.quadroInterativoDescricao,
    materia: formData.quadroInterativoMateria || defaultQuadroInterativoData.quadroInterativoMateria,
    tema: formData.quadroInterativoTema || defaultQuadroInterativoData.quadroInterativoTema,
    anoEscolar: formData.quadroInterativoAnoEscolar || defaultQuadroInterativoData.quadroInterativoAnoEscolar,
    numeroQuestoes: formData.quadroInterativoNumeroQuestoes || defaultQuadroInterativoData.quadroInterativoNumeroQuestoes,
    nivelDificuldade: formData.quadroInterativoNivelDificuldade || defaultQuadroInterativoData.quadroInterativoNivelDificuldade,
    modalidadeQuestao: formData.quadroInterativoModalidadeQuestao || defaultQuadroInterativoData.quadroInterativoModalidadeQuestao,
    campoEspecifico: formData.quadroInterativoCampoEspecifico || defaultQuadroInterativoData.quadroInterativoCampoEspecifico
  };
}

export function validateQuadroInterativoData(data: any): boolean {
  const requiredFields = ['titulo', 'materia', 'tema'];
  return requiredFields.every(field => data[field] && data[field].trim() !== '');
}
