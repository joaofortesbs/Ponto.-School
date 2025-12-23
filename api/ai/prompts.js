/**
 * ====================================================================
 * PONTO. SCHOOL - PROMPTS DE IA PARA GERAÇÃO DE AULAS
 * ====================================================================
 * 
 * Este arquivo contém todos os prompts utilizados pela IA para gerar
 * conteúdo personalizado de aulas. Cada prompt é projetado para
 * produzir respostas estruturadas em JSON.
 * 
 * ARQUITETURA:
 * - SYSTEM_PROMPTS: Instruções de sistema para a IA
 * - USER_PROMPTS: Templates de prompts do usuário
 * - SECTION_PROMPTS: Prompts específicos para cada tipo de seção
 * 
 * VERSÃO: 1.0.0
 * ÚLTIMA ATUALIZAÇÃO: 2025-12-23
 * ====================================================================
 */

/**
 * ====================================================================
 * DESCRIÇÕES DAS SEÇÕES
 * ====================================================================
 * Define o propósito de cada seção para que a IA gere conteúdo adequado
 */
export const SECTION_DESCRIPTIONS = {
  'objective': {
    name: 'Objetivo da Aula',
    purpose: 'Definir claramente o que os alunos devem aprender ou alcançar ao final da aula',
    guidelines: 'Use verbos de ação como: compreender, analisar, aplicar, criar, avaliar. Seja específico e mensurável.'
  },
  'contextualizacao': {
    name: 'Contextualização',
    purpose: 'Conectar o conteúdo com a realidade e experiências prévias dos alunos',
    guidelines: 'Faça perguntas provocativas, use exemplos do cotidiano, relacione com notícias ou situações reais.'
  },
  'exploracao': {
    name: 'Exploração',
    purpose: 'Permitir que os alunos investiguem e descubram conceitos por conta própria',
    guidelines: 'Proponha atividades de investigação, experimentos simples, pesquisas guiadas ou análise de casos.'
  },
  'apresentacao': {
    name: 'Apresentação',
    purpose: 'Expor o conteúdo principal de forma clara e organizada',
    guidelines: 'Estruture em tópicos, use exemplos, inclua definições importantes e destaque conceitos-chave.'
  },
  'pratica-guiada': {
    name: 'Prática Guiada',
    purpose: 'Orientar os alunos na aplicação do conteúdo com suporte do professor',
    guidelines: 'Descreva exercícios passo a passo, inclua dicas de orientação e pontos de atenção para o professor.'
  },
  'pratica-independente': {
    name: 'Prática Independente',
    purpose: 'Permitir que os alunos apliquem o conhecimento de forma autônoma',
    guidelines: 'Proponha atividades individuais ou em duplas, exercícios de fixação, problemas para resolver.'
  },
  'fechamento': {
    name: 'Fechamento',
    purpose: 'Sintetizar o aprendizado e verificar a compreensão dos alunos',
    guidelines: 'Inclua resumo dos pontos principais, perguntas de verificação, conexão com próximas aulas.'
  },
  'demonstracao': {
    name: 'Demonstração',
    purpose: 'Mostrar na prática como aplicar conceitos ou realizar procedimentos',
    guidelines: 'Descreva passo a passo, inclua materiais necessários, antecipe possíveis dúvidas.'
  },
  'avaliacao': {
    name: 'Avaliação',
    purpose: 'Verificar o aprendizado dos alunos de forma formativa ou somativa',
    guidelines: 'Proponha critérios claros, sugira instrumentos de avaliação, inclua rubricas se apropriado.'
  },
  'engajamento': {
    name: 'Engajamento',
    purpose: 'Motivar e capturar a atenção dos alunos para o tema da aula',
    guidelines: 'Use dinâmicas, gamificação, desafios, curiosidades ou elementos surpresa.'
  },
  'colaboracao': {
    name: 'Colaboração',
    purpose: 'Promover trabalho em equipe e interação entre os alunos',
    guidelines: 'Proponha atividades em grupo, debates, projetos colaborativos, troca de experiências.'
  },
  'reflexao': {
    name: 'Reflexão',
    purpose: 'Estimular o pensamento crítico e a metacognição',
    guidelines: 'Faça perguntas reflexivas, proponha autoavaliação, conecte com valores e emoções.'
  },
  'desenvolvimento': {
    name: 'Desenvolvimento',
    purpose: 'Aprofundar o conteúdo com atividades progressivas',
    guidelines: 'Estruture em etapas crescentes de complexidade, inclua exercícios variados.'
  },
  'aplicacao': {
    name: 'Aplicação',
    purpose: 'Conectar teoria com prática profissional ou situações reais',
    guidelines: 'Use casos de mercado, simulações, projetos práticos, conexão com carreiras.'
  },
  'materiais': {
    name: 'Materiais Complementares',
    purpose: 'Listar recursos adicionais para enriquecer o aprendizado',
    guidelines: 'Inclua vídeos, artigos, sites, livros, aplicativos relevantes ao tema.'
  },
  'observacoes': {
    name: 'Observações do Professor',
    purpose: 'Registrar notas importantes para a execução da aula',
    guidelines: 'Inclua dicas de adaptação, possíveis dificuldades, sugestões de diferenciação.'
  },
  'bncc': {
    name: 'Critérios BNCC',
    purpose: 'Alinhar a aula com as competências e habilidades da Base Nacional Comum Curricular',
    guidelines: 'Liste códigos de habilidades relevantes (ex: EF06MA01), competências gerais aplicadas.'
  }
};

/**
 * ====================================================================
 * PROMPT DO SISTEMA
 * ====================================================================
 * Instrução base que define o comportamento da IA
 */
export const SYSTEM_PROMPT = `Você é um especialista em pedagogia e criação de planos de aula no Brasil.
Você conhece profundamente:
- A Base Nacional Comum Curricular (BNCC)
- Metodologias ativas de ensino
- Diferentes níveis de ensino (fundamental, médio, técnico)
- Competências socioemocionais
- Avaliação formativa e somativa

REGRAS OBRIGATÓRIAS:
1. SEMPRE responda em JSON válido
2. NUNCA inclua markdown, código ou texto fora do JSON
3. Gere conteúdo em português brasileiro
4. Seja didático e específico
5. Adapte a linguagem ao nível de ensino indicado
6. Use a BNCC como referência quando aplicável

Seu objetivo é criar aulas completas, engajadoras e alinhadas com as melhores práticas pedagógicas.`;

/**
 * ====================================================================
 * GERADOR DE PROMPT PARA GERAÇÃO COMPLETA DE AULA
 * ====================================================================
 * Função que monta o prompt completo para gerar todos os campos da aula
 */
export function buildLessonGenerationPrompt(params) {
  const {
    templateId,
    templateName,
    assunto,
    contexto,
    sectionOrder,
    sectionDetails
  } = params;

  const sectionsToGenerate = sectionOrder
    .map(sectionId => {
      const details = sectionDetails[sectionId] || SECTION_DESCRIPTIONS[sectionId];
      return {
        id: sectionId,
        name: details?.name || sectionId,
        purpose: details?.purpose || 'Conteúdo da seção',
        guidelines: details?.guidelines || 'Gere conteúdo relevante'
      };
    });

  const prompt = `
Crie uma aula completa baseada nos seguintes parâmetros:

TEMPLATE SELECIONADO: ${templateName} (${templateId})
ASSUNTO DA AULA: ${assunto}
CONTEXTO/INFORMAÇÕES ADICIONAIS: ${contexto || 'Nenhum contexto adicional fornecido'}

SEÇÕES A GERAR (na ordem):
${sectionsToGenerate.map((section, index) => `
${index + 1}. ${section.name} (ID: ${section.id})
   Propósito: ${section.purpose}
   Diretrizes: ${section.guidelines}
`).join('')}

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "titulo": "Título criativo e descritivo da aula",
  "objetivo": "Objetivo claro e mensurável usando verbos de ação",
  "duracao_estimada": "Duração estimada em minutos (ex: 50)",
  "nivel_ensino": "Nível de ensino sugerido (ex: 6º ano do Fundamental)",
  "secoes": {
${sectionsToGenerate.map(section => `    "${section.id}": "Conteúdo completo e detalhado para ${section.name}"`).join(',\n')}
  },
  "tags": ["tag1", "tag2", "tag3"],
  "competencias_bncc": ["código1", "código2"]
}

IMPORTANTE: O campo "objetivo" DEVE estar também em "secoes" com a chave "objective"!

IMPORTANTE:
- Gere conteúdo substancial para cada seção (mínimo 3-4 parágrafos)
- Use formatação clara com tópicos quando apropriado
- Seja específico ao assunto fornecido
- Inclua exemplos práticos sempre que possível
`;

  return prompt;
}

/**
 * ====================================================================
 * PROMPT PARA REGENERAR UMA SEÇÃO ESPECÍFICA
 * ====================================================================
 */
export function buildSectionRegenerationPrompt(params) {
  const {
    sectionId,
    sectionName,
    assunto,
    contexto,
    currentContent,
    instruction
  } = params;

  const sectionInfo = SECTION_DESCRIPTIONS[sectionId] || {};

  return `
Regenere o conteúdo da seguinte seção de uma aula:

SEÇÃO: ${sectionName} (${sectionId})
PROPÓSITO DA SEÇÃO: ${sectionInfo.purpose || 'Conteúdo educacional'}
DIRETRIZES: ${sectionInfo.guidelines || 'Gere conteúdo relevante'}

ASSUNTO DA AULA: ${assunto}
CONTEXTO: ${contexto || 'Nenhum contexto adicional'}

CONTEÚDO ATUAL (para referência):
${currentContent || 'Nenhum conteúdo anterior'}

INSTRUÇÃO ESPECIAL DO USUÁRIO:
${instruction || 'Melhore e expanda o conteúdo'}

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "secao_id": "${sectionId}",
  "conteudo": "Novo conteúdo completo e melhorado para a seção"
}

Gere conteúdo substancial e detalhado.
`;
}

/**
 * ====================================================================
 * PROMPT PARA GERAR APENAS O TÍTULO
 * ====================================================================
 */
export function buildTitleGenerationPrompt(assunto, contexto) {
  return `
Crie 3 opções de títulos criativos e descritivos para uma aula sobre:

ASSUNTO: ${assunto}
CONTEXTO: ${contexto || 'Aula regular'}

FORMATO DE RESPOSTA (JSON):
{
  "titulos": [
    "Título opção 1 - criativo e engajador",
    "Título opção 2 - mais formal e descritivo",
    "Título opção 3 - curto e direto"
  ]
}

Os títulos devem ser em português brasileiro e apropriados para ambiente escolar.
`;
}

export default {
  SYSTEM_PROMPT,
  SECTION_DESCRIPTIONS,
  buildLessonGenerationPrompt,
  buildSectionRegenerationPrompt,
  buildTitleGenerationPrompt
};
