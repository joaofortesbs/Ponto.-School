
export { default as FlashCardsPreview } from './FlashCardsPreview';
export { FlashCardsGenerator } from './FlashCardsGenerator';
export type { FlashCardsContent, FlashCardsFormData } from './FlashCardsGenerator';

export const flashCardsFieldMapping = {
  'Título': 'Título',
  'Descrição': 'Descrição', 
  'Tema': 'Tema',
  'Tópicos': 'Tópicos',
  'Número de flashcards': 'Número de flashcards',
  'Contexto': 'Contexto'
};

export const flashCardsProcessor = (activityData: any) => {
  return {
    'Título': activityData.titulo || activityData.title || activityData['Título'] || '',
    'Descrição': activityData.descricao || activityData.description || activityData['Descrição'] || '',
    'Tema': activityData.tema || activityData.theme || activityData['Tema'] || '',
    'Tópicos': activityData.topicos || activityData.topics || activityData['Tópicos'] || '',
    'Número de flashcards': activityData.numeroFlashcards || activityData.numberOfFlashcards || activityData['Número de flashcards'] || '10',
    'Contexto': activityData.contexto || activityData.context || activityData['Contexto'] || ''
  };
};
