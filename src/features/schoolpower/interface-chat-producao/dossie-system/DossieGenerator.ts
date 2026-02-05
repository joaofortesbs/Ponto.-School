import type { DossieData, DossieContent, RoadmapItem } from './types';
import type { SessionSummary } from './DossieStore';

export async function generateDossieContent(summary: SessionSummary): Promise<DossieData> {
  const dossieId = `dossie-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

  try {
    const { executeWithCascadeFallback } = await import('../../services/controle-APIs-gerais-school-power');

    const activitiesDescription = summary.activities.map((a, i) =>
      `${i + 1}. ${a.titulo} (${formatActivityType(a.tipo)})${a.tema ? ` - Tema: ${a.tema}` : ''}${a.materia ? ` - Matéria: ${a.materia}` : ''}`
    ).join('\n');

    const prompt = buildDossiePrompt(summary, activitiesDescription);

    const result = await executeWithCascadeFallback(prompt);

    if (result.success && result.data) {
      const parsed = parseDossieResponse(result.data, summary);
      return {
        id: dossieId,
        sessionId: summary.sessionId,
        titulo: extractMainTitle(summary),
        materia: extractMateria(summary),
        tema_central: extractTemaCentral(summary),
        content: parsed,
        status: 'ready',
        createdAt: Date.now(),
        completedAt: Date.now(),
      };
    }

    return buildFallbackDossie(dossieId, summary);
  } catch (error) {
    console.error('[DossieGenerator] Erro ao gerar dossiê:', error);
    return buildFallbackDossie(dossieId, summary);
  }
}

function buildDossiePrompt(summary: SessionSummary, activitiesDescription: string): string {
  return `
Você é um especialista em pedagogia. Gere um dossiê de sessão completo em JSON para o professor.

CONTEXTO DA SESSÃO:
- Objetivo: ${summary.objective}
- Atividades criadas: ${summary.activities.length}
${activitiesDescription ? `\nATIVIDADES:\n${activitiesDescription}` : ''}
- Tempo de processamento: ${summary.duration}

RESPONDA APENAS em JSON válido com esta estrutura exata (sem markdown, sem \`\`\`):
{
  "resumo_executivo": "Parágrafo resumindo tudo que foi feito nesta sessão, mencionando cada atividade criada e seu propósito pedagógico.",
  "roadmap_aplicacao": [
    {
      "ordem": 1,
      "tempo": "0-5 min",
      "titulo": "Título da etapa",
      "descricao": "O que fazer neste momento da aula",
      "dicas": ["Dica prática 1", "Dica prática 2"]
    }
  ],
  "ganchos_atencao": [
    "Frase motivacional 1 para engajar alunos",
    "Pergunta provocativa 2",
    "Dinâmica rápida 3"
  ],
  "pilula_pais": "Texto completo para o professor copiar e enviar no WhatsApp dos pais explicando o que será trabalhado em sala, com linguagem acessível e acolhedora. Incluir emojis educativos.",
  "resumo_coordenacao": "Texto formal para o professor apresentar ao coordenador pedagógico, explicando a metodologia, os objetivos de aprendizagem e as atividades planejadas.",
  "estrategia_pedagogica": "Explicação da estratégia pedagógica usada, conectando as atividades entre si e justificando a sequência proposta."
}

REGRAS:
- O roadmap deve ter entre 3 e 6 etapas com tempos realistas
- Os ganchos devem ser 3 a 5 frases criativas e práticas
- A pílula para pais deve ter tom acolhedor e usar emojis moderadamente
- O resumo para coordenação deve ser profissional e objetivo
- Tudo em português brasileiro
`.trim();
}

function parseDossieResponse(response: string, summary: SessionSummary): DossieContent {
  try {
    let jsonStr = response;

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    const roadmap: RoadmapItem[] = (parsed.roadmap_aplicacao || []).map((item: any, idx: number) => ({
      ordem: item.ordem || idx + 1,
      tempo: item.tempo || `${idx * 10}-${(idx + 1) * 10} min`,
      titulo: item.titulo || `Etapa ${idx + 1}`,
      descricao: item.descricao || '',
      atividade_id: item.atividade_id,
      dicas: item.dicas || [],
    }));

    return {
      resumo_executivo: parsed.resumo_executivo || buildFallbackResumo(summary),
      atividades_criadas: summary.activities,
      roadmap_aplicacao: roadmap.length > 0 ? roadmap : buildFallbackRoadmap(summary),
      ganchos_atencao: parsed.ganchos_atencao || buildFallbackGanchos(),
      pilula_pais: parsed.pilula_pais || buildFallbackPilulaPais(summary),
      resumo_coordenacao: parsed.resumo_coordenacao || buildFallbackResumoCoordenacao(summary),
      estrategia_pedagogica: parsed.estrategia_pedagogica || '',
      estatisticas: summary.stats,
    };
  } catch (parseError) {
    console.warn('[DossieGenerator] Erro ao parsear JSON, usando fallback:', parseError);
    return buildFallbackContent(summary);
  }
}

function buildFallbackDossie(dossieId: string, summary: SessionSummary): DossieData {
  return {
    id: dossieId,
    sessionId: summary.sessionId,
    titulo: extractMainTitle(summary),
    materia: extractMateria(summary),
    tema_central: extractTemaCentral(summary),
    content: buildFallbackContent(summary),
    status: 'ready',
    createdAt: Date.now(),
    completedAt: Date.now(),
  };
}

function buildFallbackContent(summary: SessionSummary): DossieContent {
  return {
    resumo_executivo: buildFallbackResumo(summary),
    atividades_criadas: summary.activities,
    roadmap_aplicacao: buildFallbackRoadmap(summary),
    ganchos_atencao: buildFallbackGanchos(),
    pilula_pais: buildFallbackPilulaPais(summary),
    resumo_coordenacao: buildFallbackResumoCoordenacao(summary),
    estrategia_pedagogica: '',
    estatisticas: summary.stats,
  };
}

function buildFallbackResumo(summary: SessionSummary): string {
  const actNames = summary.activities.map(a => `"${a.titulo}"`).join(', ');
  if (summary.activities.length === 0) {
    return `Sessão de planejamento concluída. Objetivo: ${summary.objective}. Tempo de processamento: ${summary.duration}.`;
  }
  return `Nesta sessão, foram criadas ${summary.activities.length} atividade(s): ${actNames}. Objetivo principal: ${summary.objective}. Todo o material está pronto para ser aplicado em sala de aula. Tempo total de processamento: ${summary.duration}.`;
}

function buildFallbackRoadmap(summary: SessionSummary): RoadmapItem[] {
  if (summary.activities.length === 0) {
    return [{
      ordem: 1,
      tempo: '0-50 min',
      titulo: 'Aplicação do conteúdo',
      descricao: 'Aplique o material conforme planejado.',
      dicas: ['Adapte ao ritmo da turma'],
    }];
  }

  const items: RoadmapItem[] = [
    {
      ordem: 1,
      tempo: '0-5 min',
      titulo: 'Acolhimento e Contextualização',
      descricao: 'Receba os alunos e introduza o tema do dia de forma envolvente.',
      dicas: ['Use uma pergunta provocativa', 'Conecte com o cotidiano dos alunos'],
    },
  ];

  let minuteOffset = 5;
  summary.activities.forEach((activity, idx) => {
    const duration = getActivityDuration(activity.tipo);
    items.push({
      ordem: idx + 2,
      tempo: `${minuteOffset}-${minuteOffset + duration} min`,
      titulo: activity.titulo,
      descricao: `Aplicar a atividade "${activity.titulo}" (${formatActivityType(activity.tipo)}).`,
      atividade_id: activity.id,
      dicas: ['Circule pela sala auxiliando', 'Dê tempo para reflexão individual'],
    });
    minuteOffset += duration;
  });

  items.push({
    ordem: items.length + 1,
    tempo: `${minuteOffset}-${minuteOffset + 5} min`,
    titulo: 'Fechamento e Reflexão',
    descricao: 'Encerre com uma síntese coletiva do aprendizado.',
    dicas: ['Peça que compartilhem descobertas', 'Antecipe a próxima aula'],
  });

  return items;
}

function buildFallbackGanchos(): string[] {
  return [
    'Comece com uma pergunta que conecte o tema ao dia a dia dos alunos',
    'Use um exemplo prático ou história curta para contextualizar',
    'Proponha um desafio rápido de 2 minutos para ativar a curiosidade',
  ];
}

function buildFallbackPilulaPais(summary: SessionSummary): string {
  const actNames = summary.activities.map(a => a.titulo).join(', ');
  return `Olá, pais e responsáveis! 📚\n\nHoje em sala trabalhamos com atividades especiais: ${actNames || 'conteúdo pedagógico planejado'}.\n\nO objetivo é fortalecer o aprendizado de forma dinâmica e envolvente. Em casa, vocês podem conversar sobre o que foi aprendido — isso faz toda a diferença! 💪\n\nQualquer dúvida, estou à disposição. 😊`;
}

function buildFallbackResumoCoordenacao(summary: SessionSummary): string {
  const actList = summary.activities.map(a => `- ${a.titulo} (${formatActivityType(a.tipo)})`).join('\n');
  return `Planejamento de aula realizado com auxílio de IA pedagógica.\n\nObjetivo: ${summary.objective}\n\nAtividades planejadas:\n${actList || '- Conteúdo em desenvolvimento'}\n\nAs atividades foram construídas seguindo diretrizes pedagógicas e estão disponíveis na plataforma para revisão.`;
}

function extractMainTitle(summary: SessionSummary): string {
  if (summary.activities.length === 1) {
    return summary.activities[0].titulo;
  }
  if (summary.objective) {
    const clean = summary.objective.replace(/^(criar|gerar|fazer|preparar|planejar)\s+/i, '');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return 'Sessão de Planejamento';
}

function extractMateria(summary: SessionSummary): string | undefined {
  for (const a of summary.activities) {
    if (a.materia) return a.materia;
  }
  return undefined;
}

function extractTemaCentral(summary: SessionSummary): string | undefined {
  for (const a of summary.activities) {
    if (a.tema) return a.tema;
  }
  return undefined;
}

function formatActivityType(tipo: string): string {
  const labels: Record<string, string> = {
    'lista-exercicios': 'Lista de Exercícios',
    'plano-aula': 'Plano de Aula',
    'sequencia-didatica': 'Sequência Didática',
    'quiz-interativo': 'Quiz Interativo',
    'flash-cards': 'Flash Cards',
    'redacao': 'Redação',
    'prova': 'Prova',
    'aula': 'Aula',
  };
  return labels[tipo] || tipo;
}

function getActivityDuration(tipo: string): number {
  const durations: Record<string, number> = {
    'lista-exercicios': 20,
    'quiz-interativo': 15,
    'flash-cards': 10,
    'redacao': 30,
    'plano-aula': 50,
    'sequencia-didatica': 45,
    'prova': 40,
    'aula': 50,
  };
  return durations[tipo] || 20;
}
