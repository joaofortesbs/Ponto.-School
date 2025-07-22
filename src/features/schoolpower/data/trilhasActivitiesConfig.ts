
export const trilhasActivitiesIds = [
  // === AVALIAÇÕES E TESTES ===
  'ideias-confraternizacoes',
  'questoes-video',
  'atividades-contos-infantis',
  'ideias-brincadeiras-infantis',
  'jogos-educativos',
  'consulta-video',
  'ideias-datas-comemorativas',
  'caca-palavras',
  'lista-exercicios',
  'prova',
  'resumo',
  'atividades-matematica',
  'atividades-ortografia-alfabeto',
  'jogos-educacionais-interativos',
  'desenho-simetrico',
  'proposta-redacao',
  'apresentacao-slides',
  'revisao-guiada',
  'mapa-mental',
  'imagem-para-colorir',
  'lista-vocabulario',
  'texto-apoio',
  'experimento-cientifico',
  'charadas',
  'tabela-apoio',
  'fichamento-obra-literaria',
  'questoes-site',
  'atividade-adaptada',
  'musica-engajar',
  'questoes-pdf',
  'simulado',
  'tarefa-adaptada',
  'resumo-texto',
  'instrucoes-claras',
  'desenvolvimento-caligrafia',
  'maquete',
  'historias-sociais',
  'dinamicas-sala-aula',
  'reescritor-texto',
  'palavras-cruzadas',
  'questoes-texto',
  'redacao',
  'gerador-tracejados',
];

export const isActivityEligibleForTrilhas = (activityId: string): boolean => {
  return trilhasActivitiesIds.includes(activityId);
};

export const getTrilhasBadgeProps = (activityId: string) => {
  if (isActivityEligibleForTrilhas(activityId)) {
    return {
      showBadge: true,
      badgeText: 'Trilhas',
      badgeColor: '#10B981', // Verde
      badgeTextColor: '#FFFFFF'
    };
  }
  return {
    showBadge: false,
    badgeText: '',
    badgeColor: '',
    badgeTextColor: ''
  };
};
