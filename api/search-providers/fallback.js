export function buildEducationalFallback(query) {
  const q = encodeURIComponent(query);
  return [
    {
      title: `Habilidades BNCC — ${query}`,
      url: 'https://basenacionalcomum.mec.gov.br/abase/',
      snippet: `Consulte habilidades e competências da BNCC relacionadas a "${query}". A BNCC define os aprendizados essenciais para a educação básica brasileira.`,
      score: 0.88,
      domain_tier: 'official',
      source_label: 'BNCC Oficial',
      source_type: 'official',
      provider: 'educational_fallback',
    },
    {
      title: `Planos de Aula — Nova Escola: ${query}`,
      url: `https://novaescola.org.br/busca#_q=${q}&_page=1`,
      snippet: `Planos de aula, sequências didáticas e materiais pedagógicos sobre "${query}" elaborados por especialistas e alinhados com a BNCC. Recursos gratuitos para professores brasileiros.`,
      score: 0.85,
      domain_tier: 'alta',
      source_label: 'Nova Escola',
      source_type: 'educational',
      provider: 'educational_fallback',
    },
    {
      title: `Portal do Professor MEC — Recursos: ${query}`,
      url: `https://portaldoprofessor.mec.gov.br/busca.html?q=${q}`,
      snippet: `Recursos pedagógicos e aulas digitais do MEC sobre "${query}". Sugestões de atividades, planos de aula e objetos de aprendizagem gratuitos.`,
      score: 0.82,
      domain_tier: 'official',
      source_label: 'Portal do Professor MEC',
      source_type: 'official',
      provider: 'educational_fallback',
    },
    {
      title: `Materiais Didáticos EducaCAPES — ${query}`,
      url: `https://educapes.capes.gov.br/search?lang=pt_BR&fq=type%3A%22Recurso+Educacional+Aberto%22&q=${q}`,
      snippet: `Recursos Educacionais Abertos sobre "${query}" disponíveis no EducaCAPES. Materiais produzidos por universidades brasileiras, disponíveis gratuitamente.`,
      score: 0.75,
      domain_tier: 'official',
      source_label: 'EducaCAPES',
      source_type: 'official',
      provider: 'educational_fallback',
    },
  ];
}
