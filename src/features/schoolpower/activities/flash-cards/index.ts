
export const flashCardsFieldMapping = {
  titulo: 'Título',
  descricao: 'Descrição', 
  tema: 'Tema',
  topicos: 'Tópicos',
  numeroFlashcards: 'Número de flashcards',
  contexto: 'Contexto'
};

export const flashCardsProcessor = (activityData: any) => {
  return {
    titulo: activityData.titulo || activityData.title || '',
    descricao: activityData.descricao || activityData.description || '',
    tema: activityData.tema || activityData.theme || '',
    topicos: activityData.topicos || activityData.topics || '',
    numeroFlashcards: activityData.numeroFlashcards || activityData.numberOfFlashcards || '10',
    contexto: activityData.contexto || activityData.context || ''
  };
};
