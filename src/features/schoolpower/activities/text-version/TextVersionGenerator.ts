/**
 * TextVersionGenerator.ts
 * 
 * Gerador de conteúdo em formato texto para atividades que estão 
 * em desenvolvimento (versão texto). Produz texto formatado ao 
 * invés de dados estruturados para interfaces interativas.
 * 
 * Atividades suportadas:
 * - plano-aula
 * - sequencia-didatica
 * - tese-redacao
 */

import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { isTextVersionActivity, getActivityInfo } from '../../config/activityVersionConfig';
import { safeSetJSON, cleanupPlanoAulaData } from '../../services/localStorage-manager';
import { TextActivityRegistry } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/text-activities/text-activity-registry';

export interface TextVersionInput {
  activityType: string;
  activityId: string;
  context: {
    tema?: string;
    disciplina?: string;
    serie?: string;
    objetivos?: string;
    metodologia?: string;
    duracao?: string;
    description?: string;
    [key: string]: any;
  };
  conversationContext?: string;
  userObjective?: string;
}

export interface TextVersionOutput {
  success: boolean;
  activityId: string;
  activityType: string;
  textContent: string;
  sections: TextSection[];
  rawData?: any;
  error?: string;
  generatedAt: string;
}

export interface TextSection {
  title: string;
  content: string;
  icon?: string;
}

const RICH_FORMATTING_INSTRUCTIONS = `
FERRAMENTAS DE FORMATAÇÃO RICA (USE TODAS quando apropriado):

1. **TABELAS MARKDOWN** — Use para comparações, cronogramas, rubrica de avaliação, dados organizados:
   | Coluna 1 | Coluna 2 | Coluna 3 |
   |----------|----------|----------|
   | dado 1   | dado 2   | dado 3   |

2. **CALLOUTS/DESTAQUES** — Use para dicas, avisos, pontos importantes:
   > 💡 Dica importante para o professor ou aluno
   > ⚠️ Atenção: ponto que merece cuidado
   > ✅ Ponto positivo ou conclusão
   > 📌 Informação importante para fixar
   > 🎯 Objetivo ou meta a ser atingida
   > 📝 Nota ou observação relevante

3. **CHECKLISTS** — Use para listas de verificação, etapas a cumprir, materiais:
   - [ ] Item pendente
   - [x] Item já concluído

4. **LISTAS** — Use listas ordenadas e não-ordenadas:
   - Item com marcador
   1. Item numerado

5. **BLOCOS DE CITAÇÃO** — Use para citações, referências, falas:
   > "Citação relevante ou referência bibliográfica"

6. **SEPARADORES** — Use para dividir seções visualmente:
   ---

7. **FORMATAÇÃO INLINE** — Use dentro do texto:
   **negrito** para termos-chave
   *itálico* para ênfase
   ~~tachado~~ para correções
   \`código\` para termos técnicos
   ==destaque== para marcar informações essenciais

8. **CABEÇALHOS HIERÁRQUICOS** — Use para organizar o documento:
   # Título principal
   ## Seção
   ### Subseção
   #### Tópico

REGRA: Combine MÚLTIPLAS ferramentas em cada seção para criar conteúdo visualmente rico e estruturado. Não use apenas parágrafos simples.
`;

const PROMPTS_BY_ACTIVITY_TYPE: Record<string, (input: TextVersionInput) => string> = {
  'plano-aula': (input) => {
    const tema = input.context.tema || input.context.theme || input.userObjective || 'Não especificado';
    const disciplina = input.context.disciplina || input.context.subject || 'Não especificada';
    const serie = input.context.serie || input.context.schoolYear || 'Não especificado';
    const objetivos = input.context.objetivos || input.context.objectives || '';
    const metodologia = input.context.metodologia || input.context.tipoAula || 'Expositiva dialogada';
    const duracao = input.context.duracao || input.context.tempoLimite || '50 minutos';
    const materiais = input.context.materiais || input.context.recursos || '';
    
    return `Você é um professor especialista e pedagogo experiente. Sua tarefa é criar um PLANO DE AULA COMPLETO, DETALHADO e PROFISSIONAL.

INFORMAÇÕES DA AULA:
- Tema Central: ${tema}
- Disciplina: ${disciplina}
- Série/Ano: ${serie}
- Duração Total: ${duracao}
- Metodologia: ${metodologia}
${objetivos ? `- Objetivos Específicos: ${objetivos}` : ''}
${materiais ? `- Materiais Sugeridos: ${materiais}` : ''}
${input.userObjective ? `- Solicitação do Professor: ${input.userObjective}` : ''}

INSTRUÇÕES IMPORTANTES:
Crie um plano de aula COMPLETO e DETALHADO seguindo EXATAMENTE esta estrutura profissional:

1. TÍTULO: "Plano de Aula: [Tema] ([Série])"
2. DURAÇÃO: Tempo total da aula
3. OBJETIVO GERAL: Um parágrafo claro e completo
4. OBJETIVOS ESPECÍFICOS: Lista com 4-6 objetivos usando verbos de ação (Compreender, Aplicar, Analisar, Desenvolver, etc.)
5. METODOLOGIA: Tipo de abordagem pedagógica
6. RECURSOS E MATERIAIS: Lista detalhada de todos os materiais necessários

7. PLANO DE AULA DETALHADO:
   Divida a aula em momentos cronológicos com tempo específico para cada:
   
   - 1. Introdução (X minutos): Descrição detalhada de como iniciar, perguntas motivadoras, conexão com conhecimento prévio
   - 2. Desenvolvimento (Y minutos): Múltiplas seções numeradas com explicações, exemplos práticos, fórmulas, analogias, atividades
   - 3. Atividade Prática (Z minutos): Descrição da atividade em grupo ou individual
   - 4. Discussão e Conclusão (W minutos): Como encerrar, síntese, esclarecimento de dúvidas

8. AVALIAÇÃO: Critérios de avaliação contínua e sugestão de exercício
9. OBSERVAÇÕES: Dicas para o professor, adaptações possíveis, sugestões extras

REGRAS OBRIGATÓRIAS:
- Escreva TUDO em português brasileiro formal e profissional
- Seja EXTREMAMENTE detalhado - cada seção deve ter múltiplos parágrafos
- Inclua EXEMPLOS CONCRETOS e práticos relacionados ao tema "${tema}"
- Distribua o tempo de forma realista entre os momentos da aula
- Inclua perguntas motivadoras e analogias que o professor pode usar
- Alinhe com a BNCC quando aplicável
- O conteúdo deve ser COMPLETO para o professor usar diretamente em sala
- NÃO use abreviações ou resumos - escreva o conteúdo COMPLETO

${RICH_FORMATTING_INSTRUCTIONS}
EXEMPLOS DE USO NO PLANO DE AULA:
- Use TABELAS para cronograma da aula, rubrica de avaliação, distribuição de tempo
- Use CALLOUTS (> 💡) para dicas ao professor, (> ⚠️) para pontos de atenção
- Use CHECKLISTS para materiais necessários e preparação prévia
- Use **negrito** para termos-chave e conceitos importantes

FORMATO DE RESPOSTA (TEXTO PURO):
Escreva o plano de aula COMPLETO em formato de texto, seguindo esta estrutura:

# Plano de Aula: ${tema} (${serie})
Duração: ${duracao}

## Objetivo Geral
[Parágrafo completo descrevendo o objetivo principal]

## Objetivos Específicos
• [Objetivo 1 com verbo de ação]
• [Objetivo 2 com verbo de ação]
• [Objetivo 3 com verbo de ação]
• [Objetivo 4 com verbo de ação]

## Metodologia
[Descrição da abordagem pedagógica]

## Recursos e Materiais
• [Material 1]
• [Material 2]
• [Lista completa de materiais necessários]

## Plano de Aula Detalhado

### 1. Introdução (X minutos)
[Descrição detalhada do momento inicial - perguntas, contextualização, exemplos]

### 2. Desenvolvimento (Y minutos)
[Conteúdo principal MUITO detalhado com:
- Explicações completas
- Exemplos práticos sobre ${tema}
- Fórmulas quando aplicável
- Analogias para facilitar compreensão
- Atividades interativas]

### 3. Atividade Prática (Z minutos)
[Descrição completa da atividade - instruções, materiais, como conduzir]

### 4. Discussão e Conclusão (W minutos)
[Como encerrar a aula - síntese, perguntas, esclarecimento de dúvidas]

## Avaliação
[Critérios de avaliação contínua e sugestão de exercício]

## Observações
[Dicas para o professor, adaptações possíveis, sugestões extras]

---
IMPORTANTE: Escreva TODO o conteúdo de forma COMPLETA e DETALHADA. NÃO use placeholders como "[...]" - escreva o texto real.`;
  },

  'sequencia-didatica': (input) => `
Você é um especialista em sequências didáticas e planejamento pedagógico.

Crie uma sequência didática completa com as seguintes informações:

**Contexto:**
- Tema: ${input.context.tema || input.context.theme || 'Não especificado'}
- Disciplina: ${input.context.disciplina || input.context.subject || 'Não especificada'}
- Série/Ano: ${input.context.serie || input.context.schoolYear || 'Não especificado'}
- Objetivos: ${input.context.objetivos || input.context.objectives || 'Não especificados'}
- Número de Aulas: ${input.context.numeroAulas || '4 aulas'}

${input.conversationContext ? `**Contexto da conversa:**\n${input.conversationContext}` : ''}
${input.userObjective ? `**Objetivo do usuário:**\n${input.userObjective}` : ''}

${RICH_FORMATTING_INSTRUCTIONS}
EXEMPLOS DE USO NA SEQUÊNCIA DIDÁTICA:
- Use TABELAS para cronograma das aulas, competências por aula, distribuição de conteúdo
- Use CALLOUTS (> 💡) para sugestões pedagógicas, (> 📌) para pontos-chave
- Use CHECKLISTS para objetivos de cada aula e materiais necessários
- Use SEPARADORES (---) entre as aulas

**FORMATO DE RESPOSTA (OBRIGATÓRIO):**
Responda APENAS com um JSON no seguinte formato:

{
  "titulo": "Título da Sequência Didática",
  "sections": [
    {
      "title": "🎯 Objetivos Gerais",
      "content": "Objetivos gerais da sequência...",
      "icon": "target"
    },
    {
      "title": "📅 Aula 1 - [Título]",
      "content": "Detalhamento da primeira aula...",
      "icon": "calendar"
    },
    {
      "title": "📅 Aula 2 - [Título]",
      "content": "Detalhamento da segunda aula...",
      "icon": "calendar"
    },
    {
      "title": "📅 Aula 3 - [Título]",
      "content": "Detalhamento da terceira aula...",
      "icon": "calendar"
    },
    {
      "title": "📅 Aula 4 - [Título]",
      "content": "Detalhamento da quarta aula...",
      "icon": "calendar"
    },
    {
      "title": "✅ Avaliação Contínua",
      "content": "Critérios de avaliação ao longo da sequência...",
      "icon": "check"
    }
  ],
  "textContent": "Versão completa em texto corrido formatado..."
}
`,

  'tese-redacao': (input) => `
Você é um especialista em produção textual e técnicas de argumentação.

Crie um apoio para tese de redação com as seguintes informações:

**Contexto:**
- Tema: ${input.context.tema || input.context.theme || 'Não especificado'}
- Tipo: ${input.context.tipoRedacao || 'Dissertativo-argumentativo'}
- Nível: ${input.context.serie || input.context.schoolYear || 'Ensino Médio'}
- Objetivos: ${input.context.objetivos || 'Desenvolver argumentação sólida'}

${input.conversationContext ? `**Contexto da conversa:**\n${input.conversationContext}` : ''}
${input.userObjective ? `**Objetivo do usuário:**\n${input.userObjective}` : ''}

${RICH_FORMATTING_INSTRUCTIONS}
EXEMPLOS DE USO NA TESE DE REDAÇÃO:
- Use TABELAS para comparar argumentos a favor/contra, repertórios socioculturais
- Use CALLOUTS (> 💡) para dicas de escrita, (> 📌) para palavras-conectivo úteis
- Use **negrito** para termos-chave e conceitos centrais da argumentação
- Use CITAÇÕES (>) para referências bibliográficas e repertório sociocultural

**FORMATO DE RESPOSTA (OBRIGATÓRIO):**
Responda APENAS com um JSON no seguinte formato:

{
  "titulo": "Apoio para Tese: [Tema]",
  "sections": [
    {
      "title": "📝 Análise do Tema",
      "content": "Análise detalhada do tema proposto...",
      "icon": "edit"
    },
    {
      "title": "💡 Tese Principal",
      "content": "Proposta de tese e posicionamento...",
      "icon": "lightbulb"
    },
    {
      "title": "📚 Argumentos",
      "content": "Argumentos principais com repertório sociocultural...",
      "icon": "book"
    },
    {
      "title": "🔄 Estrutura Sugerida",
      "content": "Estrutura recomendada para a redação...",
      "icon": "layout"
    },
    {
      "title": "✍️ Proposta de Intervenção",
      "content": "Sugestões de proposta de intervenção...",
      "icon": "pen"
    }
  ],
  "textContent": "Versão completa em texto corrido formatado..."
}
`,

  'atividade-textual': (input) => {
    const tema = input.context.tema || input.context.theme || input.userObjective || 'Não especificado';
    const disciplina = input.context.disciplina || input.context.subject || 'Não especificada';
    const serie = input.context.serie || input.context.schoolYear || 'Não especificado';
    const objetivos = input.context.objetivos || input.context.objectives || '';
    const titulo = input.context.titulo || input.context.title || '';
    const templateId = input.context.text_activity_template_id || '';

    const template = templateId ? TextActivityRegistry.getByType(templateId) : null;
    const templatePrompt = template?.promptTemplate || '';
    const templateSections = template?.secoesEsperadas || [];
    const templateName = template?.nome || titulo || 'Atividade Pedagógica';

    return `Você é um professor especialista e pedagogo experiente. Sua tarefa é criar uma atividade pedagógica completa, detalhada e profissional.

TIPO DE ATIVIDADE: ${templateName}
${templatePrompt ? `\nINSTRUÇÕES ESPECÍFICAS DO TEMPLATE:\n${templatePrompt}\n` : ''}
INFORMAÇÕES:
- Tema: ${tema}
- Disciplina: ${disciplina}
- Série/Ano: ${serie}
${objetivos ? `- Objetivos: ${objetivos}` : ''}

${input.conversationContext ? `CONTEXTO DA CONVERSA:\n${input.conversationContext}` : ''}
${input.userObjective ? `OBJETIVO DO USUÁRIO:\n${input.userObjective}` : ''}

REGRAS OBRIGATÓRIAS:
1. Crie conteúdo COMPLETO e PRONTO PARA USO - não apenas estrutura
2. Inclua questões, textos, instruções detalhadas quando aplicável
3. Adapte a linguagem para ${serie}
4. Inclua gabarito/respostas esperadas quando aplicável

${RICH_FORMATTING_INSTRUCTIONS}
EXEMPLOS DE USO NA ATIVIDADE:
- Use TABELAS para quadros comparativos, rubricas, exercícios de associação
- Use CALLOUTS (> 💡) para dicas aos alunos, (> ⚠️) para atenção, (> 📌) para regras
- Use CHECKLISTS para critérios de avaliação e etapas da atividade
- Use **negrito** para enunciados e conceitos-chave
- Use SEPARADORES (---) entre questões ou seções da atividade

**FORMATO DE RESPOSTA (OBRIGATÓRIO):**
Responda APENAS com um JSON no seguinte formato:

{
  "titulo": "${templateName}: ${tema}",
  "sections": [
${templateSections.length > 0 
  ? templateSections.map((s, i) => `    {"title": "${s}", "content": "Conteúdo completo e detalhado...", "icon": "file"}`).join(',\n')
  : `    {"title": "📋 Orientações ao Professor", "content": "Instruções detalhadas...", "icon": "file"},
    {"title": "📝 Atividade", "content": "Conteúdo completo da atividade...", "icon": "edit"},
    {"title": "✅ Gabarito / Respostas Esperadas", "content": "Respostas e critérios...", "icon": "check"}`
}
  ],
  "textContent": "Versão completa em texto corrido formatado com toda a atividade..."
}
`;
  }
};

// ============================================================================
// EXTRAÇÃO DE CONTEXTO - Detectar disciplina/série de textos livres
// ============================================================================

interface ExtractedContext {
  disciplina: string | null;
  serie: string | null;
  tema: string | null;
}

/**
 * Extrai disciplina, série e tema de textos livres (userObjective, conversationContext)
 */
function extractContextFromText(text: string): ExtractedContext {
  if (!text) return { disciplina: null, serie: null, tema: null };
  
  const lowerText = text.toLowerCase();
  
  // Detectar disciplina
  let disciplina: string | null = null;
  const disciplinaPatterns: { pattern: RegExp; name: string }[] = [
    { pattern: /matem[aá]tica/i, name: 'Matemática' },
    { pattern: /portugu[eê]s/i, name: 'Português' },
    { pattern: /l[ií]ngua portuguesa/i, name: 'Língua Portuguesa' },
    { pattern: /ci[eê]ncias/i, name: 'Ciências' },
    { pattern: /hist[oó]ria/i, name: 'História' },
    { pattern: /geografia/i, name: 'Geografia' },
    { pattern: /f[ií]sica/i, name: 'Física' },
    { pattern: /qu[ií]mica/i, name: 'Química' },
    { pattern: /biologia/i, name: 'Biologia' },
    { pattern: /ingl[eê]s/i, name: 'Inglês' },
    { pattern: /espanhol/i, name: 'Espanhol' },
    { pattern: /educa[çc][aã]o f[ií]sica/i, name: 'Educação Física' },
    { pattern: /artes/i, name: 'Artes' },
    { pattern: /filosofia/i, name: 'Filosofia' },
    { pattern: /sociologia/i, name: 'Sociologia' },
    { pattern: /literatura/i, name: 'Literatura' },
    { pattern: /reda[çc][aã]o/i, name: 'Redação' },
    { pattern: /gram[aá]tica/i, name: 'Gramática' },
  ];
  
  for (const { pattern, name } of disciplinaPatterns) {
    if (pattern.test(text)) {
      disciplina = name;
      break;
    }
  }
  
  // Detectar série/ano
  let serie: string | null = null;
  const seriePatterns = [
    { pattern: /(\d+)[ºª°]\s*ano(?:\s+(?:do\s+)?(?:ensino\s+)?(?:fundamental|médio))?/i, extract: (m: RegExpMatchArray) => `${m[1]}º ano` },
    { pattern: /ensino\s+m[eé]dio/i, extract: () => 'Ensino Médio' },
    { pattern: /ensino\s+fundamental(?:\s+(?:I|II|1|2))?/i, extract: (m: RegExpMatchArray) => 'Ensino Fundamental' },
    { pattern: /educa[çc][aã]o\s+infantil/i, extract: () => 'Educação Infantil' },
    { pattern: /pr[eé]-escola/i, extract: () => 'Pré-escola' },
    { pattern: /primeiro\s+ano/i, extract: () => '1º ano' },
    { pattern: /segundo\s+ano/i, extract: () => '2º ano' },
    { pattern: /terceiro\s+ano/i, extract: () => '3º ano' },
    { pattern: /quarto\s+ano/i, extract: () => '4º ano' },
    { pattern: /quinto\s+ano/i, extract: () => '5º ano' },
    { pattern: /sexto\s+ano/i, extract: () => '6º ano' },
    { pattern: /s[eé]timo\s+ano/i, extract: () => '7º ano' },
    { pattern: /oitavo\s+ano/i, extract: () => '8º ano' },
    { pattern: /nono\s+ano/i, extract: () => '9º ano' },
  ];
  
  for (const { pattern, extract } of seriePatterns) {
    const match = text.match(pattern);
    if (match) {
      serie = extract(match);
      break;
    }
  }
  
  // Tentar extrair tema do texto (padrões comuns)
  let tema: string | null = null;
  const temaPatterns = [
    /sobre\s+["']?([^"'\n,]+?)["']?(?:\s+para|\s+de|\s+em|\s+do|\s*,|\s*$)/i,
    /tema[:\s]+["']?([^"'\n,]+)["']?/i,
    /assunto[:\s]+["']?([^"'\n,]+)["']?/i,
    /conte[úu]do[:\s]+["']?([^"'\n,]+)["']?/i,
  ];
  
  for (const pattern of temaPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 3 && match[1].length < 200) {
      tema = match[1].trim();
      break;
    }
  }
  
  return { disciplina, serie, tema };
}

/**
 * Mescla contexto extraído com contexto existente (prioriza valores existentes)
 */
function enrichContextWithExtraction(
  context: TextVersionInput['context'],
  userObjective?: string,
  conversationContext?: string
): TextVersionInput['context'] {
  const enrichedContext = { ...context };
  
  // Extrair de userObjective primeiro
  const fromObjective = extractContextFromText(userObjective || '');
  
  // Depois de conversationContext
  const fromConversation = extractContextFromText(conversationContext || '');
  
  // Preencher disciplina se não existir
  if (!enrichedContext.disciplina && !enrichedContext.subject) {
    const extracted = fromObjective.disciplina || fromConversation.disciplina;
    if (extracted) {
      enrichedContext.disciplina = extracted;
      enrichedContext.subject = extracted;
      console.log('📋 [TextVersionGenerator] Disciplina extraída:', extracted);
    }
  }
  
  // Preencher série se não existir
  if (!enrichedContext.serie && !enrichedContext.schoolYear) {
    const extracted = fromObjective.serie || fromConversation.serie;
    if (extracted) {
      enrichedContext.serie = extracted;
      enrichedContext.schoolYear = extracted;
      console.log('📋 [TextVersionGenerator] Série extraída:', extracted);
    }
  }
  
  // Preencher tema se não existir
  if (!enrichedContext.tema && !enrichedContext.theme) {
    const extracted = fromObjective.tema || fromConversation.tema;
    if (extracted) {
      enrichedContext.tema = extracted;
      enrichedContext.theme = extracted;
      console.log('📋 [TextVersionGenerator] Tema extraído:', extracted);
    }
  }
  
  return enrichedContext;
}

function getDefaultPrompt(input: TextVersionInput): string {
  return `
Você é um assistente educacional especializado.

Crie conteúdo educacional para a atividade "${input.activityType}" com as seguintes informações:

**Contexto:**
${Object.entries(input.context)
  .filter(([_, v]) => v)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

${input.conversationContext ? `**Contexto da conversa:**\n${input.conversationContext}` : ''}
${input.userObjective ? `**Objetivo do usuário:**\n${input.userObjective}` : ''}

**FORMATO DE RESPOSTA (OBRIGATÓRIO):**
Responda APENAS com um JSON no seguinte formato:

{
  "titulo": "Título da Atividade",
  "sections": [
    {
      "title": "Seção 1",
      "content": "Conteúdo detalhado...",
      "icon": "file"
    }
  ],
  "textContent": "Versão completa em texto corrido formatado..."
}
`;
}

function parseAIResponse(rawResponse: string, activityType?: string): { 
  titulo: string; 
  sections: TextSection[]; 
  textContent: string 
} | null {
  console.log('🔍 [TextVersionGenerator] Parseando resposta da IA...');
  console.log('📝 [TextVersionGenerator] Resposta bruta (primeiros 500 chars):', rawResponse?.substring(0, 500));
  console.log('📝 [TextVersionGenerator] Tipo de atividade:', activityType);
  console.log('📝 [TextVersionGenerator] Tamanho total da resposta:', rawResponse?.length || 0, 'chars');
  
  try {
    // Limpar a resposta de markdown code blocks
    let cleanedResponse = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```javascript\s*/gi, '')
      .replace(/```markdown\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // PARA PLANO-AULA: Priorizar texto puro (Markdown) em vez de JSON
    // Se a resposta começa com # ou ## (Markdown heading), é texto puro
    const isMarkdownResponse = cleanedResponse.startsWith('#') || 
                               cleanedResponse.startsWith('Plano de Aula') ||
                               cleanedResponse.includes('## Objetivo Geral') ||
                               cleanedResponse.includes('### 1. Introdução');
    
    if (isMarkdownResponse && activityType === 'plano-aula') {
      console.log('✅ [TextVersionGenerator] Resposta Markdown detectada para plano-aula');
      
      // Extrair título da primeira linha (# Plano de Aula: ...)
      const lines = cleanedResponse.split('\n');
      const firstLine = lines[0].replace(/^#+\s*/, '').trim();
      const titulo = firstLine.length > 10 ? firstLine : 'Plano de Aula';
      
      console.log('📄 [TextVersionGenerator] Título extraído:', titulo);
      console.log('📄 [TextVersionGenerator] Conteúdo completo:', cleanedResponse.length, 'chars');
      
      return {
        titulo: titulo,
        sections: [],
        textContent: cleanedResponse
      };
    }
    
    // Tentar encontrar JSON na resposta (para outros tipos de atividade)
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ [TextVersionGenerator] JSON encontrado na resposta');
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Verificar se é um fallback de atividades padrão (incompatível)
      // Detectar pelo formato de array de atividades que vem do local fallback
      if (Array.isArray(parsed) || parsed.activities || parsed.defaultActivities) {
        console.warn('⚠️ [TextVersionGenerator] JSON detectado como fallback de atividades padrão, ignorando');
        return null;
      }
      
      // Verificar se tem campos válidos para versão texto
      const hasValidFields = parsed.titulo || parsed.title || parsed.sections || 
                             parsed.textContent || parsed.text_content || 
                             parsed.conteudo || parsed.planoAula || parsed.content;
      
      if (!hasValidFields) {
        console.warn('⚠️ [TextVersionGenerator] JSON não tem campos válidos para versão texto');
        return null;
      }
      
      // Verificar se tem os campos esperados
      const result = {
        titulo: parsed.titulo || parsed.title || 'Conteúdo Gerado',
        sections: parsed.sections || [],
        textContent: parsed.textContent || parsed.text_content || parsed.conteudo || parsed.content || ''
      };
      
      // Se não tiver textContent mas tiver sections, gerar textContent a partir das sections
      if (!result.textContent && result.sections.length > 0) {
        result.textContent = result.sections
          .map((s: TextSection) => `${s.title}\n\n${s.content}`)
          .join('\n\n---\n\n');
        console.log('📄 [TextVersionGenerator] textContent gerado a partir das sections');
      }
      
      // Se ainda não tiver conteúdo significativo, retornar null
      if (!result.textContent && result.sections.length === 0) {
        console.warn('⚠️ [TextVersionGenerator] JSON parseado mas sem conteúdo útil');
        return null;
      }
      
      console.log('✅ [TextVersionGenerator] Parse bem-sucedido:', {
        titulo: result.titulo,
        sectionsCount: result.sections.length,
        textContentLength: result.textContent.length
      });
      
      return result;
    }
    
    // Se não encontrar JSON, tentar usar a resposta como texto puro
    // Aceitar qualquer resposta com mais de 50 caracteres como texto válido
    if (cleanedResponse.length > 50) {
      console.log('✅ [TextVersionGenerator] JSON não encontrado, usando resposta como texto puro');
      console.log('📄 [TextVersionGenerator] Tamanho do texto puro:', cleanedResponse.length, 'caracteres');
      
      // Tentar extrair título do início do texto
      const firstLine = cleanedResponse.split('\n')[0].trim();
      const titulo = firstLine.length > 10 && firstLine.length < 200 
        ? firstLine.replace(/^#+\s*/, '').replace(/^\*+/, '').trim()
        : 'Plano de Aula';
      
      return {
        titulo: titulo,
        sections: [],
        textContent: cleanedResponse
      };
    }
    
    console.warn('⚠️ [TextVersionGenerator] Resposta muito curta ou inválida:', cleanedResponse.length, 'chars');
  } catch (error) {
    console.error('❌ [TextVersionGenerator] Erro ao parsear resposta:', error);
    console.error('❌ [TextVersionGenerator] Resposta que causou erro:', rawResponse?.substring(0, 1000));
  }
  return null;
}

function generateFallbackContent(input: TextVersionInput): TextVersionOutput {
  console.log('⚠️ [TextVersionGenerator] Gerando conteúdo de fallback DETALHADO para:', input.activityType);
  
  const config = getActivityInfo(input.activityType);
  const displayName = config?.name || 'Plano de Aula';
  
  // PRIORIZAR userObjective para o tema - garantir personalização
  const tema = input.userObjective || input.context.tema || input.context.theme || 'Conteúdo educacional';
  
  // USAR CONTEXTO ENRIQUECIDO (já foi processado pelo enrichContextWithExtraction)
  const disciplina = input.context.disciplina || input.context.subject || 'Interdisciplinar';
  const serie = input.context.serie || input.context.schoolYear || 'Ensino Fundamental/Médio';
  const objetivos = input.context.objetivos || input.context.objectives || `Desenvolver competências e habilidades relacionadas a ${tema}`;
  const duracao = input.context.duracao || input.context.tempoLimite || '50 minutos';
  const metodologia = input.context.metodologia || input.context.tipoAula || 'Expositiva dialogada';
  const materiais = input.context.materiais || input.context.recursos || '';
  
  console.log('📋 [TextVersionGenerator] Fallback usando:', { tema, disciplina, serie, duracao });
  
  // Gerar plano de aula COMPLETO e DETALHADO
  const fallbackTextContent = `# Plano de Aula: ${tema} (${serie})

**Disciplina:** ${disciplina} | **Série/Ano:** ${serie} | **Duração:** ${duracao}

---

## Objetivo Geral

Proporcionar aos alunos uma compreensão abrangente e aprofundada sobre ${tema}, desenvolvendo habilidades de análise crítica, interpretação e aplicação prática dos conceitos fundamentais. A aula visa promover a construção ativa do conhecimento, incentivando a participação engajada dos estudantes e conectando o conteúdo teórico com situações reais do cotidiano, alinhando-se às competências previstas na Base Nacional Comum Curricular (BNCC).

## Objetivos Específicos

• Compreender os conceitos fundamentais e definições relacionados a ${tema}
• Identificar as principais características e elementos que compõem o tema estudado
• Analisar diferentes perspectivas e abordagens sobre ${tema}
• Relacionar o conteúdo estudado com situações práticas do dia a dia dos alunos
• Aplicar os conhecimentos adquiridos na resolução de problemas e atividades práticas
• Desenvolver habilidades de trabalho colaborativo e comunicação efetiva
• Construir argumentos fundamentados para discussões sobre o tema
• Avaliar criticamente informações relacionadas a ${tema}

## Metodologia

**Abordagem pedagógica:** ${metodologia}

A aula será conduzida utilizando estratégias ativas de ensino-aprendizagem, promovendo:

• **Exposição dialogada:** Apresentação dos conceitos com constante interação e questionamentos para verificar compreensão
• **Aprendizagem colaborativa:** Atividades em duplas ou pequenos grupos para discussão e construção coletiva do conhecimento
• **Problematização:** Uso de situações-problema contextualizadas para aplicação prática dos conceitos
• **Recursos visuais:** Apresentações, imagens, vídeos e materiais de apoio para facilitar a compreensão
• **Avaliação formativa:** Verificação contínua da aprendizagem ao longo de toda a aula

## Recursos e Materiais

• Quadro branco ou lousa com marcadores/giz colorido
• Projetor multimídia e computador (quando disponível)
• Apresentação de slides sobre ${tema}
• Material impresso com roteiro de atividades e exercícios
• Folhas de papel sulfite para anotações e produções
• Lápis, canetas coloridas e borracha
${materiais ? `• ${materiais}` : '• Materiais didáticos específicos relacionados ao tema'}
• Livro didático de ${disciplina}
• Recursos digitais (vídeos, animações, simulações)

## Plano de Aula Detalhado

### 1. Introdução e Contextualização (10 minutos)

**Momento de acolhimento (2 min):**
Inicie a aula cumprimentando os alunos e criando um ambiente receptivo para a aprendizagem. Verifique se todos estão acomodados e prontos para iniciar.

**Ativação de conhecimentos prévios (5 min):**
Faça perguntas motivadoras para despertar o interesse e verificar o que os alunos já sabem:
• "O que vocês já sabem sobre ${tema}?"
• "Onde vocês já viram ou ouviram falar sobre esse assunto no dia a dia?"
• "Por que vocês acham que é importante estudar ${tema}?"
• "Quem pode dar um exemplo relacionado ao tema?"

Registre as respostas dos alunos no quadro, criando um mapa conceitual inicial. Isso valoriza as experiências prévias e ajuda a identificar o ponto de partida.

**Apresentação dos objetivos (3 min):**
Explique claramente o que será estudado na aula:
• O que vamos aprender hoje
• Por que esse conteúdo é importante
• Como vamos trabalhar durante a aula
• O que esperamos alcançar ao final

### 2. Desenvolvimento do Conteúdo (25 minutos)

**Exposição dialogada - Parte 1: Conceitos básicos (10 min):**

Apresente os fundamentos de ${tema}:

• **Definição clara:** Explique o que é ${tema} de forma acessível, usando linguagem adequada à faixa etária
• **Contexto histórico:** Apresente brevemente como o conhecimento sobre esse tema evoluiu ao longo do tempo
• **Importância atual:** Destaque a relevância do tema na sociedade contemporânea

Durante a exposição:
- Faça pausas para perguntas de verificação
- Use exemplos concretos e próximos da realidade dos alunos
- Utilize recursos visuais para ilustrar conceitos abstratos
- Incentive a participação com questionamentos

**Exposição dialogada - Parte 2: Aprofundamento (10 min):**

Explore os aspectos mais específicos:

• **Características principais:** Detalhe os elementos que compõem ${tema}
• **Relações e conexões:** Mostre como o tema se relaciona com outros conteúdos já estudados
• **Aplicações práticas:** Apresente como o conhecimento sobre ${tema} é usado no cotidiano
• **Casos concretos:** Traga exemplos reais que ilustrem os conceitos apresentados

**Atividade interativa em grupos (5 min):**

Divida a turma em pequenos grupos (3-4 alunos) e proponha:
• Cada grupo recebe uma pergunta ou situação relacionada a ${tema}
• Os grupos discutem e registram suas conclusões em uma folha
• Ao final, um representante de cada grupo compartilha brevemente as ideias principais

### 3. Atividade Prática de Fixação (10 minutos)

**Distribuição e orientações (2 min):**
Entregue a folha de atividades explicando claramente as instruções e o tempo disponível.

**Resolução individual/em duplas (6 min):**

Exercícios práticos sobre ${tema}:
• Questões objetivas para verificar compreensão dos conceitos básicos
• Questões discursivas para desenvolvimento de argumentação
• Situações-problema para aplicação dos conhecimentos
• Atividade de análise ou interpretação relacionada ao tema

Durante a atividade:
- Circule pela sala auxiliando os alunos com dificuldades
- Observe as principais dúvidas para esclarecimento posterior
- Incentive a colaboração respeitosa entre colegas
- Valorize diferentes estratégias de resolução

**Correção participativa (2 min):**
Corrija as principais questões com participação da turma, esclarecendo dúvidas comuns.

### 4. Síntese e Encerramento (5 minutos)

**Recapitulação do conteúdo (2 min):**
Faça uma síntese destacando:
• Os conceitos mais importantes sobre ${tema}
• As principais conexões estabelecidas durante a aula
• As aplicações práticas discutidas

**Verificação final de aprendizagem (1 min):**
Pergunte aos alunos:
• "O que vocês aprenderam de mais importante hoje?"
• "Ficou alguma dúvida sobre ${tema}?"

**Encerramento e conexão com próximas aulas (2 min):**
• Responda dúvidas finais
• Apresente brevemente o que será estudado na próxima aula
• Indique possíveis materiais para estudo complementar (se aplicável)
• Parabenize a participação da turma

## Avaliação

A avaliação será **contínua e formativa**, considerando múltiplos aspectos do processo de aprendizagem:

**Critérios de avaliação:**

• **Participação (25%):** Engajamento nas discussões, contribuições relevantes, respostas às perguntas motivadoras
• **Compreensão conceitual (30%):** Demonstração de entendimento dos conceitos fundamentais sobre ${tema}
• **Aplicação prática (25%):** Capacidade de utilizar o conhecimento em situações-problema e exercícios
• **Trabalho colaborativo (20%):** Contribuição nas atividades em grupo, respeito às ideias dos colegas

**Instrumentos de avaliação:**
• Observação direta durante as atividades
• Análise das respostas nos exercícios escritos
• Participação nas discussões coletivas
• Produções individuais e em grupo

**Indicadores de sucesso:**
O aluno alcançou os objetivos quando consegue:
• Explicar com suas palavras os principais conceitos sobre ${tema}
• Identificar exemplos práticos relacionados ao conteúdo
• Resolver situações-problema aplicando o conhecimento adquirido

## Observações e Dicas para o Professor

**Adaptações sugeridas:**

• **Para turmas com mais tempo disponível:**
  - Inclua uma atividade de pesquisa ou produção mais elaborada
  - Proponha debates sobre aplicações do tema na atualidade
  - Adicione momento para apresentação de trabalhos pelos alunos

• **Para turmas com menos tempo:**
  - Foque nos conceitos essenciais e exemplos mais significativos
  - Reduza o número de exercícios, priorizando os mais importantes
  - A discussão em grupos pode ser feita em duplas para agilizar

• **Para alunos com dificuldades de aprendizagem:**
  - Ofereça materiais de apoio com linguagem simplificada
  - Proponha atividades diferenciadas com mais suporte visual
  - Permita trabalho em pares para apoio mútuo

**Considerações pedagógicas:**

• Mantenha um ambiente acolhedor que incentive perguntas
• Utilize exemplos atuais e relevantes para o contexto dos alunos
• Tenha flexibilidade para ajustar o planejamento conforme as necessidades da turma
• Prepare um plano alternativo caso os recursos tecnológicos não funcionem
• Valorize todas as contribuições dos alunos, criando um ambiente seguro para participação

**Conexões interdisciplinares:**
Considere fazer conexões com outras disciplinas para enriquecer a aprendizagem e mostrar a aplicabilidade do conhecimento em diferentes contextos.

**Para a próxima aula:**
• Retome os principais conceitos como forma de revisão
• Conecte o novo conteúdo com o que foi estudado nesta aula
• Observe as dificuldades apresentadas para planejar reforços necessários

---
*Plano de aula completo - Adapte conforme as necessidades específicas da sua turma e contexto escolar.*`;

  // Criar seções estruturadas a partir do texto completo
  const fallbackSections: TextSection[] = [
    {
      title: '🎯 Objetivo Geral',
      content: `Proporcionar aos alunos uma compreensão abrangente e aprofundada sobre ${tema}, desenvolvendo habilidades de análise crítica, interpretação e aplicação prática dos conceitos fundamentais.`,
      icon: 'target'
    },
    {
      title: '📋 Objetivos Específicos',
      content: `• Compreender os conceitos fundamentais relacionados a ${tema}\n• Identificar as principais características do tema\n• Analisar diferentes perspectivas e abordagens\n• Relacionar o conteúdo com situações práticas do cotidiano\n• Aplicar conhecimentos na resolução de problemas\n• Desenvolver habilidades de trabalho colaborativo\n• Construir argumentos fundamentados\n• Avaliar criticamente informações sobre o tema`,
      icon: 'list'
    },
    {
      title: '📖 Metodologia',
      content: `**Abordagem:** ${metodologia}\n\n• Exposição dialogada com interação constante\n• Aprendizagem colaborativa em grupos\n• Problematização com situações contextualizadas\n• Uso de recursos visuais e multimídia\n• Avaliação formativa contínua`,
      icon: 'book'
    },
    {
      title: '📚 Recursos e Materiais',
      content: `• Quadro branco e marcadores coloridos\n• Projetor multimídia e computador\n• Apresentação de slides sobre ${tema}\n• Material impresso com atividades\n• Folhas para anotações\n• Livro didático de ${disciplina}\n${materiais ? `• ${materiais}` : '• Materiais específicos do tema'}`,
      icon: 'package'
    },
    {
      title: '🕐 1. Introdução (10 min)',
      content: `**Acolhimento:** Cumprimente os alunos e crie ambiente receptivo.\n\n**Ativação de conhecimentos prévios:**\n• "O que vocês já sabem sobre ${tema}?"\n• "Onde viram esse assunto no dia a dia?"\n• Registre respostas no quadro.\n\n**Apresentação dos objetivos:** Explique o que será estudado e sua importância.`,
      icon: 'play'
    },
    {
      title: '📖 2. Desenvolvimento (25 min)',
      content: `**Conceitos básicos (10 min):**\n• Definição clara de ${tema}\n• Contexto histórico e evolução\n• Importância atual do tema\n\n**Aprofundamento (10 min):**\n• Características principais\n• Relações com outros conteúdos\n• Aplicações práticas e exemplos reais\n\n**Atividade em grupos (5 min):**\n• Grupos de 3-4 alunos discutem situações propostas\n• Registro de conclusões e compartilhamento`,
      icon: 'book-open'
    },
    {
      title: '✍️ 3. Atividade Prática (10 min)',
      content: `**Exercícios sobre ${tema}:**\n• Questões objetivas de compreensão\n• Questões discursivas de argumentação\n• Situações-problema para aplicação\n\n**Durante a atividade:**\n• Circule auxiliando dúvidas\n• Observe dificuldades comuns\n• Incentive colaboração respeitosa\n\n**Correção participativa:** Esclareça dúvidas coletivamente.`,
      icon: 'edit'
    },
    {
      title: '🔄 4. Síntese e Conclusão (5 min)',
      content: `**Recapitulação:**\n• Destaque conceitos mais importantes\n• Reforce conexões estabelecidas\n• Relembre aplicações práticas\n\n**Verificação:** "O que vocês aprenderam de mais importante hoje?"\n\n**Encerramento:** Responda dúvidas finais e apresente próximo conteúdo.`,
      icon: 'check-circle'
    },
    {
      title: '✅ Avaliação',
      content: `**Avaliação contínua e formativa:**\n\n• Participação nas discussões (25%)\n• Compreensão conceitual (30%)\n• Aplicação em exercícios (25%)\n• Trabalho colaborativo (20%)\n\n**Instrumentos:** Observação direta, análise de exercícios, participação.`,
      icon: 'check'
    },
    {
      title: '💡 Observações para o Professor',
      content: `**Adaptações sugeridas:**\n• Para mais tempo: inclua pesquisa ou debates\n• Para menos tempo: foque nos conceitos essenciais\n• Para alunos com dificuldades: materiais simplificados\n\n**Dicas:**\n• Mantenha ambiente acolhedor\n• Use exemplos atuais e relevantes\n• Tenha plano alternativo para recursos\n• Valorize todas as contribuições`,
      icon: 'lightbulb'
    }
  ];

  console.log('📄 [TextVersionGenerator] Fallback DETALHADO gerado com', fallbackSections.length, 'seções e', fallbackTextContent.length, 'caracteres');

  return {
    success: true,
    activityId: input.activityId,
    activityType: input.activityType,
    textContent: fallbackTextContent,
    sections: fallbackSections,
    generatedAt: new Date().toISOString()
  };
}

export async function generateTextVersionContent(
  input: TextVersionInput
): Promise<TextVersionOutput> {
  console.log('📝 ========== TextVersionGenerator: INICIANDO GERAÇÃO ==========');
  console.log('📝 [TextVersionGenerator] Tipo de atividade:', input.activityType);
  console.log('📝 [TextVersionGenerator] ID da atividade:', input.activityId);
  console.log('📝 [TextVersionGenerator] Contexto recebido:', JSON.stringify(input.context, null, 2));
  
  if (!isTextVersionActivity(input.activityType)) {
    console.warn('⚠️ [TextVersionGenerator] Tipo de atividade não é versão texto:', input.activityType);
    return {
      success: false,
      activityId: input.activityId,
      activityType: input.activityType,
      textContent: '',
      sections: [],
      error: `Tipo de atividade "${input.activityType}" não é versão texto`,
      generatedAt: new Date().toISOString()
    };
  }

  try {
    // ENRIQUECIMENTO DE CONTEXTO: Extrair disciplina, série, tema de textos livres
    console.log('🔍 [TextVersionGenerator] Enriquecendo contexto com extração...');
    input.context = enrichContextWithExtraction(
      input.context, 
      input.userObjective, 
      input.conversationContext
    );
    console.log('📋 [TextVersionGenerator] Contexto enriquecido:', JSON.stringify(input.context, null, 2));
    
    const tema = input.context.tema || input.context.theme || input.userObjective || '';
    if (!input.context.tema && input.userObjective) {
      input.context.tema = input.userObjective;
      input.context.theme = input.userObjective;
      console.log('📋 [TextVersionGenerator] Tema preenchido a partir do userObjective:', input.userObjective);
    }
    
    const promptFn = PROMPTS_BY_ACTIVITY_TYPE[input.activityType] || getDefaultPrompt;
    const fullPrompt = promptFn(input);

    console.log('🤖 [TextVersionGenerator] Chamando API com fallback em cascata...');
    console.log('📋 [TextVersionGenerator] Prompt (primeiros 300 chars):', fullPrompt.substring(0, 300));
    console.log('📋 [TextVersionGenerator] Tema/UserObjective:', tema || 'Não especificado');
    console.log('📋 [TextVersionGenerator] Tipo de atividade:', input.activityType);
    
    const shouldBypassCache = input.activityType === 'plano-aula';
    
    const response = await executeWithCascadeFallback(fullPrompt, {
      bypassCache: shouldBypassCache
    });

    console.log('📨 [TextVersionGenerator] Resposta da API:', {
      success: response.success,
      modelUsed: response.modelUsed,
      providerUsed: response.providerUsed,
      dataLength: response.data?.length || 0,
      attemptsMade: response.attemptsMade
    });

    if (!response.success || !response.data) {
      console.warn('⚠️ [TextVersionGenerator] Resposta da API falhou, usando fallback');
      console.warn('⚠️ [TextVersionGenerator] Erros:', response.errors);
      return generateFallbackContent(input);
    }

    let parsed = parseAIResponse(response.data, input.activityType);
    
    if (!parsed || !parsed.textContent || parsed.textContent.length < 50 || parsed.sections.length === 0) {
      console.warn('⚠️ [TextVersionGenerator] Resposta insuficiente, tentando retry com formato reforçado...');
      
      const retryPrompt = `${fullPrompt}\n\n---\nIMPORTANTE: Sua resposta DEVE conter:\n1. Pelo menos 3 seções com headers ## (ex: ## Título da Seção)\n2. Conteúdo substancial em cada seção (mínimo 100 palavras por seção)\n3. Formatação markdown rica (tabelas, listas, negrito)\n4. NÃO retorne JSON - apenas texto markdown formatado.\n\nResposta anterior foi insuficiente. Por favor, gere conteúdo completo e detalhado.`;
      
      try {
        const retryResponse = await executeWithCascadeFallback(retryPrompt, { bypassCache: true });
        if (retryResponse.success && retryResponse.data) {
          const retryParsed = parseAIResponse(retryResponse.data, input.activityType);
          if (retryParsed && retryParsed.textContent && retryParsed.textContent.length >= 50) {
            console.log('✅ [TextVersionGenerator] Retry bem-sucedido!');
            parsed = retryParsed;
          }
        }
      } catch (retryErr) {
        console.warn('⚠️ [TextVersionGenerator] Retry falhou:', retryErr);
      }
    }
    
    if (!parsed || !parsed.textContent || parsed.textContent.length < 20) {
      console.warn('⚠️ [TextVersionGenerator] Parsing falhou após retry, usando fallback');
      return generateFallbackContent(input);
    }

    console.log('✅ ========== TextVersionGenerator: CONTEÚDO GERADO COM SUCESSO ==========');
    console.log('✅ [TextVersionGenerator] Título:', parsed.titulo);
    console.log('✅ [TextVersionGenerator] Seções:', parsed.sections.length);
    console.log('✅ [TextVersionGenerator] TextContent (primeiros 500 chars):', parsed.textContent.substring(0, 500));
    console.log('✅ [TextVersionGenerator] TextContent total:', parsed.textContent.length, 'chars');
    
    return {
      success: true,
      activityId: input.activityId,
      activityType: input.activityType,
      textContent: parsed.textContent,
      sections: parsed.sections,
      rawData: parsed,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ [TextVersionGenerator] Erro na geração:', error);
    return generateFallbackContent(input);
  }
}

export function formatTextContentForDisplay(output: TextVersionOutput): string {
  if (output.textContent) {
    return output.textContent;
  }

  if (output.sections && output.sections.length > 0) {
    return output.sections
      .map(section => `${section.title}\n\n${section.content}`)
      .join('\n\n---\n\n');
  }

  return 'Conteúdo não disponível.';
}

export function storeTextVersionContent(
  activityId: string, 
  activityType: string, 
  content: TextVersionOutput
): void {
  const storageKey = `text_content_${activityType}_${activityId}`;
  
  console.log('💾 [TextVersionGenerator] Salvando conteúdo:', storageKey);
  
  // Limpar dados antigos de plano-aula antes de salvar novos
  // Usa o gerenciador centralizado de localStorage
  if (activityType === 'plano-aula' || activityType === 'sequencia-didatica' || activityType === 'tese-redacao') {
    cleanupPlanoAulaData();
  }
  
  // Preparar dados otimizados para armazenamento
  let optimizedContent = {
    success: content.success,
    activityId: content.activityId,
    activityType: content.activityType,
    titulo: content.titulo,
    textContent: content.textContent,
    sections: content.sections,
    generatedAt: content.generatedAt,
    storedAt: new Date().toISOString()
  };
  
  // Verificar tamanho e truncar se necessário (500KB limite)
  const jsonString = JSON.stringify(optimizedContent);
  if (jsonString.length > 500000) {
    console.warn('⚠️ [TextVersionGenerator] Conteúdo muito grande, truncando...');
    optimizedContent = {
      success: content.success,
      activityId: content.activityId,
      activityType: content.activityType,
      titulo: content.titulo,
      textContent: content.textContent.substring(0, 50000),
      sections: [],
      generatedAt: content.generatedAt,
      storedAt: new Date().toISOString()
    };
  }
  
  // Usar safeSetJSON do localStorage-manager (com tratamento de quota)
  const saved = safeSetJSON(storageKey, optimizedContent);
  
  if (saved) {
    console.log('✅ [TextVersionGenerator] Conteúdo salvo:', storageKey);
    console.log('📊 [TextVersionGenerator] Tamanho:', (JSON.stringify(optimizedContent).length / 1024).toFixed(2), 'KB');
  } else {
    console.error('❌ [TextVersionGenerator] Falha ao salvar conteúdo após tentativas');
  }
}

export function retrieveTextVersionContent(
  activityId: string, 
  activityType: string
): TextVersionOutput | null {
  const storageKey = `text_content_${activityType}_${activityId}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('❌ TextVersionGenerator: Erro ao recuperar de localStorage:', error);
  }
  
  return null;
}
