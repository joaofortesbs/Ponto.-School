
export const flashCardsFieldMapping = {
  'Título': 'title',
  'Descrição': 'description', 
  'Tema': 'theme',
  'Tópicos': 'topicos',
  'Número de flashcards': 'numberOfFlashcards',
  'Contexto': 'context'
};

export const flashCardsProcessor = (activityData: any) => {
  return {
    title: activityData.titulo || activityData.title || activityData['Título'] || '',
    description: activityData.descricao || activityData.description || activityData['Descrição'] || '',
    theme: activityData.tema || activityData.theme || activityData['Tema'] || '',
    topicos: activityData.topicos || activityData.topics || activityData['Tópicos'] || '',
    numberOfFlashcards: activityData.numeroFlashcards || activityData.numberOfFlashcards || activityData['Número de flashcards'] || '10',
    context: activityData.contexto || activityData.context || activityData['Contexto'] || ''
  };
};

export const prepareFlashCardsDataForModal = (activity: any) => {
  const customFields = activity.customFields || {};
  
  return {
    title: activity.personalizedTitle || activity.title || customFields['Título'] || '',
    description: activity.personalizedDescription || activity.description || customFields['Descrição'] || '',
    theme: customFields['Tema'] || customFields['tema'] || activity.theme || '',
    topicos: customFields['Tópicos'] || customFields['topicos'] || '',
    numberOfFlashcards: customFields['Número de flashcards'] || customFields['numberOfFlashcards'] || '10',
    context: customFields['Contexto'] || customFields['context'] || ''
  };
};
