
import { trilhasActivitiesIds } from '../data/trilhasActivitiesConfig';

/**
 * Verifica se uma atividade está registrada no sistema
 * Combina verificações de atividades das trilhas e outras atividades válidas
 */
export function isActivityRegistered(activityId: string): boolean {
  // Verifica se está nas atividades das trilhas
  if (trilhasActivitiesIds.includes(activityId)) {
    return true;
  }

  // Lista de atividades válidas adicionais do sistema
  const validActivities = [
    'resumo-inteligente',
    'lista-exercicios',
    'prova-interativa',
    'mapa-mental',
    'plano-aula',
    'slides-didaticos',
    'jogos-educativos',
    'atividades-matematica',
    'atividades-ortografia-alfabeto',
    'experimento-cientifico',
    'projeto',
    'sequencia-didatica',
    'fichamento-obra-literaria',
    'texto-apoio',
    'tabela-apoio',
    'proposta-redacao',
    'revisao-guiada',
    'simulado',
    'desenvolvimento-caligrafia',
    'historias-sociais',
    'dinamicas-sala-aula',
    'reescritor-texto',
    'redacao',
    'gerador-tracejados',
    'tarefa-adaptada',
    'atividade-adaptada',
    'instrucoes-claras',
    'musica-engajar',
    'maquete',
    'imagem-para-colorir',
    'lista-vocabulario',
    'desenho-simetrico',
    'charadas',
    'palavras-cruzadas',
    'caca-palavras',
    'ideias-confraternizacoes',
    'questoes-video',
    'atividades-contos-infantis',
    'ideias-brincadeiras-infantis',
    'consulta-video',
    'ideias-datas-comemorativas',
    'jogos-educacionais-interativos',
    'apresentacao-slides',
    'questoes-site',
    'questoes-pdf',
    'resumo-texto',
    'questoes-texto'
  ];

  return validActivities.includes(activityId);
}

/**
 * Obtém informações básicas sobre uma atividade registrada
 */
export function getActivityInfo(activityId: string): { 
  id: string; 
  isRegistered: boolean; 
  isTrilhasEligible: boolean;
} {
  return {
    id: activityId,
    isRegistered: isActivityRegistered(activityId),
    isTrilhasEligible: trilhasActivitiesIds.includes(activityId)
  };
}

/**
 * Lista todas as atividades registradas no sistema
 */
export function getAllRegisteredActivities(): string[] {
  const validActivities = [
    'resumo-inteligente',
    'lista-exercicios',
    'prova-interativa',
    'mapa-mental',
    'plano-aula',
    'slides-didaticos',
    'jogos-educativos',
    'atividades-matematica',
    'atividades-ortografia-alfabeto',
    'experimento-cientifico',
    'projeto',
    'sequencia-didatica',
    'fichamento-obra-literaria',
    'texto-apoio',
    'tabela-apoio',
    'proposta-redacao',
    'revisao-guiada',
    'simulado',
    'desenvolvimento-caligrafia',
    'historias-sociais',
    'dinamicas-sala-aula',
    'reescritor-texto',
    'redacao',
    'gerador-tracejados',
    'tarefa-adaptada',
    'atividade-adaptada',
    'instrucoes-claras',
    'musica-engajar',
    'maquete',
    'imagem-para-colorir',
    'lista-vocabulario',
    'desenho-simetrico',
    'charadas',
    'palavras-cruzadas',
    'caca-palavras',
    'ideias-confraternizacoes',
    'questoes-video',
    'atividades-contos-infantis',
    'ideias-brincadeiras-infantis',
    'consulta-video',
    'ideias-datas-comemorativas',
    'jogos-educacionais-interativos',
    'apresentacao-slides',
    'questoes-site',
    'questoes-pdf',
    'resumo-texto',
    'questoes-texto'
  ];

  // Combina atividades das trilhas com outras atividades válidas
  const allActivities = [...new Set([...trilhasActivitiesIds, ...validActivities])];
  return allActivities.sort();
}
