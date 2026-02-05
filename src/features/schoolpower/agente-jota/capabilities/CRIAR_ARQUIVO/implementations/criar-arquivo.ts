import { getContextManager } from '../../../context/context-manager';
import type { ArtifactData, ArtifactSection, ArtifactActivity, ArtifactStats, TimelineItem } from '../types';

interface CriarArquivoParams {
  session_id: string;
  tipo?: 'dossie' | 'resumo' | 'roadmap' | 'relatorio' | 'generico';
}

export async function criarArquivo(params: CriarArquivoParams): Promise<ArtifactData> {
  const { session_id, tipo = 'dossie' } = params;
  const artifactId = `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

  console.log(`📄 [CRIAR_ARQUIVO] Iniciando geração de artefato tipo "${tipo}" para sessão ${session_id}`);

  const contextManager = getContextManager(session_id);
  const contexto = contextManager.obterContexto();

  if (!contexto) {
    console.warn(`⚠️ [CRIAR_ARQUIVO] Contexto não encontrado para sessão ${session_id}`);
    return buildFallbackArtifact(artifactId, session_id, tipo);
  }

  const startTime = Date.now();
  const fullContext = contextManager.gerarContextoParaChamada('final');

  const atividades: ArtifactActivity[] = contexto.resumoProgressivo.atividadesCriadas.map((actStr, idx) => {
    const parts = actStr.split(': ');
    const tipoAtividade = parts[0] || 'generico';
    const titulo = parts[1] || actStr;
    return {
      id: `act-${idx}`,
      titulo,
      tipo: tipoAtividade,
      status: 'salva_bd' as const,
    };
  });

  try {
    const { executeWithCascadeFallback } = await import('../../../../services/controle-APIs-gerais-school-power');

    const prompt = buildArtifactPrompt(tipo, fullContext, contexto.objetivoGeral || '', atividades);
    const result = await executeWithCascadeFallback(prompt);

    const processingTime = formatDuration(startTime);
    const stats = buildStats(atividades, contexto.resumoProgressivo.etapasCompletas, processingTime);

    if (result.success && result.data) {
      const sections = parseArtifactResponse(result.data, tipo, atividades);

      const artifact: ArtifactData = {
        id: artifactId,
        sessionId: session_id,
        titulo: extractTitle(contexto.objetivoGeral, atividades),
        subtitulo: contexto.inputOriginal.texto.substring(0, 100),
        tipo,
        materia: extractMateria(atividades),
        tema_central: extractTema(contexto),
        sections,
        atividades,
        estatisticas: stats,
        status: 'ready',
        createdAt: Date.now(),
        completedAt: Date.now(),
      };

      console.log(`✅ [CRIAR_ARQUIVO] Artefato gerado com sucesso: ${artifact.titulo}`);
      return artifact;
    }

    return buildFallbackArtifact(artifactId, session_id, tipo, atividades, stats, contexto.objetivoGeral);
  } catch (error) {
    console.error('[CRIAR_ARQUIVO] Erro ao gerar artefato:', error);
    const processingTime = formatDuration(startTime);
    const stats = buildStats(atividades, contexto.resumoProgressivo.etapasCompletas, processingTime);
    return buildFallbackArtifact(artifactId, session_id, tipo, atividades, stats, contexto.objetivoGeral);
  }
}

function buildArtifactPrompt(
  tipo: string,
  fullContext: string,
  objetivo: string,
  atividades: ArtifactActivity[]
): string {
  const activitiesDescription = atividades.map((a, i) =>
    `${i + 1}. ${a.titulo} (${formatActivityType(a.tipo)})`
  ).join('\n');

  return `
Você é um especialista em pedagogia. Gere um dossiê de sessão completo em JSON para o professor.

CONTEXTO DA SESSÃO:
- Objetivo: ${objetivo}
- Atividades criadas: ${atividades.length}
${activitiesDescription ? `\nATIVIDADES:\n${activitiesDescription}` : ''}

CONTEXTO COMPLETO DA EXECUÇÃO:
${fullContext}

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

function parseArtifactResponse(
  response: string,
  tipo: string,
  atividades: ArtifactActivity[]
): ArtifactSection[] {
  try {
    let jsonStr = response;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);
    return buildSectionsFromParsed(parsed, atividades);
  } catch (parseError) {
    console.warn('[CRIAR_ARQUIVO] Erro ao parsear JSON, usando fallback:', parseError);
    return buildFallbackSections(atividades);
  }
}

function buildSectionsFromParsed(parsed: any, atividades: ArtifactActivity[]): ArtifactSection[] {
  const sections: ArtifactSection[] = [];

  if (parsed.resumo_executivo) {
    sections.push({
      id: 'resumo',
      titulo: 'Resumo Executivo',
      tipo: 'texto',
      conteudo: parsed.resumo_executivo,
      icone: 'FileText',
      copiavel: true,
    });
  }

  if (parsed.roadmap_aplicacao && Array.isArray(parsed.roadmap_aplicacao)) {
    const timeline: TimelineItem[] = parsed.roadmap_aplicacao.map((item: any, idx: number) => ({
      ordem: item.ordem || idx + 1,
      tempo: item.tempo || `${idx * 10}-${(idx + 1) * 10} min`,
      titulo: item.titulo || `Etapa ${idx + 1}`,
      descricao: item.descricao || '',
      dicas: item.dicas || [],
    }));
    sections.push({
      id: 'roadmap',
      titulo: 'Roteiro de Aplicação',
      tipo: 'timeline',
      conteudo: timeline,
      icone: 'MapPin',
    });
  }

  if (parsed.ganchos_atencao && Array.isArray(parsed.ganchos_atencao)) {
    sections.push({
      id: 'ganchos',
      titulo: 'Ganchos de Atenção',
      tipo: 'lista',
      conteudo: parsed.ganchos_atencao,
      icone: 'Target',
      copiavel: true,
    });
  }

  if (parsed.pilula_pais) {
    sections.push({
      id: 'pais',
      titulo: 'Mensagem para Pais',
      tipo: 'texto',
      conteudo: parsed.pilula_pais,
      icone: 'MessageCircle',
      copiavel: true,
    });
  }

  if (parsed.resumo_coordenacao || parsed.estrategia_pedagogica) {
    const coordContent: Record<string, string> = {};
    if (parsed.resumo_coordenacao) coordContent.resumo = parsed.resumo_coordenacao;
    if (parsed.estrategia_pedagogica) coordContent.estrategia = parsed.estrategia_pedagogica;
    sections.push({
      id: 'coordenacao',
      titulo: 'Coordenação',
      tipo: 'texto',
      conteudo: parsed.resumo_coordenacao || '',
      icone: 'Briefcase',
      copiavel: true,
    });
    if (parsed.estrategia_pedagogica) {
      sections.push({
        id: 'estrategia',
        titulo: 'Estratégia Pedagógica',
        tipo: 'texto',
        conteudo: parsed.estrategia_pedagogica,
        icone: 'BookOpen',
        copiavel: true,
      });
    }
  }

  return sections;
}

function buildFallbackSections(atividades: ArtifactActivity[]): ArtifactSection[] {
  const actNames = atividades.map(a => `"${a.titulo}"`).join(', ');
  const resumo = atividades.length > 0
    ? `Nesta sessão, foram criadas ${atividades.length} atividade(s): ${actNames}. Todo o material está pronto para ser aplicado em sala de aula.`
    : 'Sessão de planejamento concluída. O material está pronto para uso.';

  const sections: ArtifactSection[] = [
    {
      id: 'resumo',
      titulo: 'Resumo Executivo',
      tipo: 'texto',
      conteudo: resumo,
      icone: 'FileText',
      copiavel: true,
    },
    {
      id: 'roadmap',
      titulo: 'Roteiro de Aplicação',
      tipo: 'timeline',
      conteudo: buildFallbackTimeline(atividades),
      icone: 'MapPin',
    },
    {
      id: 'ganchos',
      titulo: 'Ganchos de Atenção',
      tipo: 'lista',
      conteudo: [
        'Comece com uma pergunta que conecte o tema ao dia a dia dos alunos',
        'Use um exemplo prático ou história curta para contextualizar',
        'Proponha um desafio rápido de 2 minutos para ativar a curiosidade',
      ],
      icone: 'Target',
      copiavel: true,
    },
    {
      id: 'pais',
      titulo: 'Mensagem para Pais',
      tipo: 'texto',
      conteudo: buildFallbackPilulaPais(atividades),
      icone: 'MessageCircle',
      copiavel: true,
    },
    {
      id: 'coordenacao',
      titulo: 'Coordenação',
      tipo: 'texto',
      conteudo: buildFallbackResumoCoordenacao(atividades),
      icone: 'Briefcase',
      copiavel: true,
    },
  ];

  return sections;
}

function buildFallbackTimeline(atividades: ArtifactActivity[]): TimelineItem[] {
  if (atividades.length === 0) {
    return [{
      ordem: 1,
      tempo: '0-50 min',
      titulo: 'Aplicação do conteúdo',
      descricao: 'Aplique o material conforme planejado.',
      dicas: ['Adapte ao ritmo da turma'],
    }];
  }

  const items: TimelineItem[] = [
    {
      ordem: 1,
      tempo: '0-5 min',
      titulo: 'Acolhimento e Contextualização',
      descricao: 'Receba os alunos e introduza o tema do dia de forma envolvente.',
      dicas: ['Use uma pergunta provocativa', 'Conecte com o cotidiano dos alunos'],
    },
  ];

  let minuteOffset = 5;
  atividades.forEach((activity, idx) => {
    const duration = getActivityDuration(activity.tipo);
    items.push({
      ordem: idx + 2,
      tempo: `${minuteOffset}-${minuteOffset + duration} min`,
      titulo: activity.titulo,
      descricao: `Aplicar a atividade "${activity.titulo}" (${formatActivityType(activity.tipo)}).`,
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

function buildFallbackPilulaPais(atividades: ArtifactActivity[]): string {
  const actNames = atividades.map(a => a.titulo).join(', ');
  return `Olá, pais e responsáveis! 📚\n\nHoje em sala trabalhamos com atividades especiais: ${actNames || 'conteúdo pedagógico planejado'}.\n\nO objetivo é fortalecer o aprendizado de forma dinâmica e envolvente. Em casa, vocês podem conversar sobre o que foi aprendido — isso faz toda a diferença! 💪\n\nQualquer dúvida, estou à disposição. 😊`;
}

function buildFallbackResumoCoordenacao(atividades: ArtifactActivity[]): string {
  const actList = atividades.map(a => `- ${a.titulo} (${formatActivityType(a.tipo)})`).join('\n');
  return `Planejamento de aula realizado com auxílio de IA pedagógica.\n\nAtividades planejadas:\n${actList || '- Conteúdo em desenvolvimento'}\n\nAs atividades foram construídas seguindo diretrizes pedagógicas e estão disponíveis na plataforma para revisão.`;
}

function buildFallbackArtifact(
  artifactId: string,
  sessionId: string,
  tipo: ArtifactData['tipo'],
  atividades: ArtifactActivity[] = [],
  stats?: ArtifactStats,
  objetivo?: string
): ArtifactData {
  return {
    id: artifactId,
    sessionId,
    titulo: extractTitle(objetivo, atividades),
    tipo,
    sections: buildFallbackSections(atividades),
    atividades,
    estatisticas: stats || {
      total_atividades: atividades.length,
      tipos_atividades: {},
      tempo_estimado_aula: '~20 minutos',
      capabilities_executadas: 0,
      tempo_processamento: '0s',
    },
    status: 'ready',
    createdAt: Date.now(),
    completedAt: Date.now(),
  };
}

function buildStats(
  atividades: ArtifactActivity[],
  etapasCompletas: number,
  processingTime: string
): ArtifactStats {
  const tiposCount: Record<string, number> = {};
  atividades.forEach(a => {
    tiposCount[a.tipo] = (tiposCount[a.tipo] || 0) + 1;
  });

  return {
    total_atividades: atividades.length,
    tipos_atividades: tiposCount,
    tempo_estimado_aula: estimateClassTime(atividades),
    capabilities_executadas: etapasCompletas,
    tempo_processamento: processingTime,
  };
}

function extractTitle(objetivo?: string, atividades?: ArtifactActivity[]): string {
  if (atividades && atividades.length === 1) {
    return atividades[0].titulo;
  }
  if (objetivo) {
    const clean = objetivo.replace(/^(criar|gerar|fazer|preparar|planejar)\s+/i, '');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return 'Sessão de Planejamento';
}

function extractMateria(atividades: ArtifactActivity[]): string | undefined {
  for (const a of atividades) {
    if (a.materia) return a.materia;
  }
  return undefined;
}

function extractTema(contexto: any): string | undefined {
  return contexto?.inputOriginal?.texto?.substring(0, 60);
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

function estimateClassTime(atividades: ArtifactActivity[]): string {
  let totalMinutes = 0;
  atividades.forEach(a => {
    totalMinutes += getActivityDuration(a.tipo);
  });
  if (totalMinutes <= 0) return '~20 minutos';
  if (totalMinutes <= 60) return `~${totalMinutes} minutos`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `~${hours}h ${mins}min` : `~${hours}h`;
}

function formatDuration(startTime: number): string {
  const diff = Date.now() - startTime;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}min ${seconds}s`;
}
