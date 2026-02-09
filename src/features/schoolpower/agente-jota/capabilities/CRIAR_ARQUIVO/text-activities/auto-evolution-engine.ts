import type { AutoEvolvedTemplate } from './text-activity-types';
import { TextActivityRegistry } from './text-activity-registry';

function generateEvolvedId(nome: string): string {
  const slug = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `auto_${slug}_${Date.now().toString(36)}`;
}

function extractKeywords(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const stopWords = new Set([
    'crie', 'cria', 'criar', 'uma', 'um', 'de', 'do', 'da', 'para', 'sobre',
    'com', 'que', 'os', 'as', 'no', 'na', 'nos', 'nas', 'por', 'em', 'ao',
    'aos', 'seu', 'sua', 'meu', 'minha', 'esse', 'essa', 'este', 'esta',
    'isso', 'isto', 'aqui', 'ali', 'fazer', 'faz', 'gere', 'gerar', 'monte',
    'elabore', 'prepare', 'produza', 'faça', 'faca', 'quero', 'preciso',
    'me', 'mim', 'te', 'se', 'lhe', 'nos', 'vos', 'mais', 'muito', 'bem',
    'também', 'também', 'ainda', 'já', 'sempre', 'nunca', 'agora', 'depois',
    'antes', 'entre', 'quando', 'como', 'onde', 'qual', 'quais', 'todos',
    'todas', 'cada', 'outro', 'outra', 'mesmo', 'mesma',
  ]);

  const words = lower
    .replace(/[^\w\sáéíóúâêîôûãõç]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const keywords: string[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    if (!seen.has(word)) {
      keywords.push(word);
      seen.add(word);
    }
  }

  const bigramSource = lower.replace(/[^\w\sáéíóúâêîôûãõç]/g, '').split(/\s+/);
  for (let i = 0; i < bigramSource.length - 1; i++) {
    const bigram = `${bigramSource[i]} ${bigramSource[i + 1]}`;
    if (bigram.length > 5 && !stopWords.has(bigramSource[i]) && !stopWords.has(bigramSource[i + 1])) {
      keywords.push(bigram);
    }
  }

  return keywords.slice(0, 10);
}

function inferActivityName(prompt: string): string {
  const lower = prompt.toLowerCase();
  const patterns = [
    { regex: /(?:crie|cria|gere|faça|monte|elabore|prepare)\s+(?:uma?\s+)?(.{5,40}?)(?:\s+(?:sobre|para|de|do|da|com))/i, group: 1 },
    { regex: /(?:crie|cria|gere|faça|monte|elabore|prepare)\s+(?:uma?\s+)?(.{5,40})/i, group: 1 },
  ];

  for (const { regex, group } of patterns) {
    const match = lower.match(regex);
    if (match && match[group]) {
      let name = match[group].trim();
      name = name.charAt(0).toUpperCase() + name.slice(1);
      return name;
    }
  }

  return 'Atividade Personalizada';
}

function inferSections(prompt: string): string[] {
  const lower = prompt.toLowerCase();

  if (lower.includes('debate') || lower.includes('discussão')) {
    return ['Tema', 'Regras', 'Argumentos A Favor', 'Argumentos Contra', 'Mediação', 'Avaliação'];
  }
  if (lower.includes('projeto') || lower.includes('pesquisa')) {
    return ['Objetivo', 'Etapas', 'Recursos', 'Cronograma', 'Avaliação'];
  }
  if (lower.includes('jogo') || lower.includes('game') || lower.includes('brincadeira')) {
    return ['Regras do Jogo', 'Materiais', 'Como Jogar', 'Variações', 'Avaliação do Aprendizado'];
  }
  if (lower.includes('experimento') || lower.includes('laboratório') || lower.includes('experiência')) {
    return ['Objetivo', 'Materiais', 'Procedimento', 'Observações', 'Conclusão', 'Questões'];
  }

  return ['Introdução', 'Desenvolvimento', 'Atividade Prática', 'Avaliação', 'Orientações ao Professor'];
}

function pickIcon(prompt: string): string {
  const lower = prompt.toLowerCase();
  const iconMap: [string, string][] = [
    ['jogo', '🎮'], ['game', '🎮'], ['brincadeira', '🎲'],
    ['música', '🎵'], ['musica', '🎵'], ['arte', '🎨'], ['desenho', '🎨'],
    ['experimento', '🔬'], ['laboratório', '🔬'], ['ciência', '🧪'],
    ['teatro', '🎭'], ['drama', '🎭'], ['role', '🎭'],
    ['debate', '🎙️'], ['discussão', '💬'],
    ['maquete', '🏗️'], ['construção', '🏗️'],
    ['pesquisa', '🔍'], ['investigação', '🔍'],
    ['vídeo', '🎬'], ['filme', '🎬'],
    ['poesia', '📜'], ['poema', '📜'],
    ['entrevista', '🎤'],
    ['matemática', '🔢'], ['cálculo', '🔢'],
    ['história', '🏛️'], ['geografia', '🌍'],
    ['esporte', '⚽'], ['educação física', '🏃'],
  ];

  for (const [keyword, icon] of iconMap) {
    if (lower.includes(keyword)) return icon;
  }
  return '📝';
}

function pickColor(index: number): string {
  const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4', '#84CC16'];
  return colors[index % colors.length];
}

export const AutoEvolutionEngine = {
  async evolve(userPrompt: string, sessionContext?: string): Promise<AutoEvolvedTemplate | null> {
    console.log(`[AutoEvolution] 🧬 Iniciando auto-evolução para: "${userPrompt.substring(0, 60)}..."`);

    const nome = inferActivityName(userPrompt);
    const keywords = extractKeywords(userPrompt);
    const secoesEsperadas = inferSections(userPrompt);
    const icone = pickIcon(userPrompt);
    const cor = pickColor(Date.now() % 8);
    const id = generateEvolvedId(nome);

    const promptTemplate = `Você é o Jota, assistente pedagógico do Ponto School. O professor pediu uma atividade que não existe em nosso catálogo padrão. Crie esta atividade de forma profissional e completa.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

INSTRUÇÕES ESPECIAIS:
- Esta é uma atividade PERSONALIZADA gerada sob demanda
- Crie a melhor estrutura possível para este tipo de atividade
- Use headers markdown ## para cada seção
- Comece com um título principal usando # (apenas um)
- Cada seção deve ter conteúdo substancial (2-5 parágrafos ou listas detalhadas)
- Inclua instruções claras para o professor e para o aluno
- Adicione critérios de avaliação quando aplicável
- Seja criativo na estrutura — adapte ao tipo de atividade pedido

SEÇÕES SUGERIDAS (adapte conforme necessário):
${secoesEsperadas.map(s => `## ${s}`).join('\n')}

REGRAS:
- Escreva em português brasileiro fluente e profissional
- Conteúdo pronto para uso imediato
- Inclua exemplos práticos quando relevante
- NÃO retorne JSON, apenas texto com headers markdown`;

    const template: AutoEvolvedTemplate = {
      id,
      nome,
      descricao: `Atividade personalizada gerada automaticamente: ${nome}`,
      icone,
      cor,
      keywords,
      promptTemplate,
      secoesEsperadas,
      criadoEm: Date.now(),
      usosCount: 1,
      origemPrompt: userPrompt.substring(0, 200),
    };

    TextActivityRegistry.registerEvolved(template);

    console.log(`[AutoEvolution] ✅ Template auto-gerado: "${nome}" com ${secoesEsperadas.length} seções e ${keywords.length} keywords`);
    return template;
  },

  getStats() {
    const evolved = TextActivityRegistry.getAllEvolved();
    return {
      total: evolved.length,
      maisUsados: evolved.sort((a, b) => b.usosCount - a.usosCount).slice(0, 5),
      ultimosCriados: evolved.sort((a, b) => b.criadoEm - a.criadoEm).slice(0, 5),
    };
  },
};
