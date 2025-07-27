
import { ActivityFieldMap } from './index';

export const activityListaExerciciosFieldMap: ActivityFieldMap = {
  // Campos básicos da atividade
  title: 'input[name="title"], input[id="title"], input[placeholder*="título"], input[placeholder*="nome"]',
  description: 'textarea[name="description"], textarea[id="description"], textarea[placeholder*="descrição"]',
  subject: 'select[name="subject"], select[id="subject"], [data-field="subject"]',
  difficulty: 'select[name="difficulty"], select[id="difficulty"], [data-field="difficulty"]',
  format: 'select[name="format"], select[id="format"], [data-field="format"]',
  duration: 'input[name="duration"], input[id="duration"], input[type="number"][placeholder*="duração"]',
  
  // Campos específicos para Lista de Exercícios (baseados no modal EditActivityModal.tsx)
  objectives: 'textarea[name="objectives"], textarea[id="objectives"], textarea[placeholder*="objetivos"]',
  materials: 'textarea[name="materials"], textarea[id="materials"], textarea[placeholder*="materiais"]',
  instructions: 'textarea[name="instructions"], textarea[id="instructions"], textarea[placeholder*="instruções"]',
  exercises: 'textarea[name="exercises"], textarea[id="exercises"], textarea[placeholder*="exercícios"]',
  questions: 'textarea[name="questions"], textarea[id="questions"], textarea[placeholder*="questões"]',
  answerKey: 'textarea[name="answer_key"], textarea[name="answerKey"], textarea[id="answerKey"], textarea[placeholder*="gabarito"]',
  notes: 'textarea[name="notes"], textarea[id="notes"], textarea[placeholder*="observações"]',
  
  // Campos adicionais identificados no modal
  learningObjectives: 'textarea[name="learningObjectives"], textarea[id="learningObjectives"]',
  evaluationCriteria: 'textarea[name="evaluationCriteria"], textarea[id="evaluationCriteria"]',
  additionalResources: 'textarea[name="additionalResources"], textarea[id="additionalResources"]'
};
