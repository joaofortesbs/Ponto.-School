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

const PROMPTS_BY_ACTIVITY_TYPE: Record<string, (input: TextVersionInput) => string> = {
  'plano-aula': (input) => `
Você é um especialista em pedagogia e criação de planos de aula.

Crie um plano de aula completo e detalhado com as seguintes informações:

**Contexto:**
- Tema: ${input.context.tema || input.context.theme || 'Não especificado'}
- Disciplina: ${input.context.disciplina || input.context.subject || 'Não especificada'}
- Série/Ano: ${input.context.serie || input.context.schoolYear || 'Não especificado'}
- Objetivos: ${input.context.objetivos || input.context.objectives || 'Não especificados'}
- Metodologia: ${input.context.metodologia || input.context.tipoAula || 'Metodologia ativa'}
- Duração: ${input.context.duracao || input.context.tempoLimite || '50 minutos'}

${input.conversationContext ? `**Contexto da conversa:**\n${input.conversationContext}` : ''}
${input.userObjective ? `**Objetivo do usuário:**\n${input.userObjective}` : ''}

**FORMATO DE RESPOSTA (OBRIGATÓRIO):**
Responda APENAS com um JSON no seguinte formato:

{
  "titulo": "Título do Plano de Aula",
  "sections": [
    {
      "title": "🎯 Objetivos de Aprendizagem",
      "content": "Texto detalhado dos objetivos...",
      "icon": "target"
    },
    {
      "title": "📚 Metodologia",
      "content": "Descrição detalhada da metodologia...",
      "icon": "book"
    },
    {
      "title": "🔄 Desenvolvimento da Aula",
      "content": "Passo a passo detalhado com momentos, atividades e tempos...",
      "icon": "activity"
    },
    {
      "title": "✅ Avaliação",
      "content": "Critérios e instrumentos de avaliação...",
      "icon": "check"
    },
    {
      "title": "📋 Recursos e Materiais",
      "content": "Lista de recursos necessários...",
      "icon": "clipboard"
    }
  ],
  "textContent": "Versão completa em texto corrido formatado para impressão..."
}

IMPORTANTE:
1. O campo "textContent" deve ter todo o conteúdo formatado como texto corrido
2. Use formatação com marcadores (-, *) e quebras de linha
3. Seja detalhado e prático
4. Inclua exemplos concretos quando possível
5. Mantenha alinhamento com a BNCC quando aplicável
`,

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
`
};

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

function parseAIResponse(rawResponse: string): { 
  titulo: string; 
  sections: TextSection[]; 
  textContent: string 
} | null {
  try {
    const cleanedResponse = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        titulo: parsed.titulo || 'Conteúdo Gerado',
        sections: parsed.sections || [],
        textContent: parsed.textContent || ''
      };
    }
  } catch (error) {
    console.error('❌ TextVersionGenerator: Erro ao parsear resposta:', error);
  }
  return null;
}

function generateFallbackContent(input: TextVersionInput): TextVersionOutput {
  const config = getActivityInfo(input.activityType);
  const displayName = config?.name || input.activityType;
  
  const fallbackSections: TextSection[] = [
    {
      title: '🎯 Objetivos',
      content: input.context.objetivos || input.context.objectives || 'Objetivos a serem definidos.',
      icon: 'target'
    },
    {
      title: '📚 Tema',
      content: input.context.tema || input.context.theme || 'Tema a ser definido.',
      icon: 'book'
    },
    {
      title: '📝 Descrição',
      content: input.context.description || 'Descrição da atividade a ser elaborada.',
      icon: 'edit'
    }
  ];

  const fallbackText = fallbackSections
    .map(s => `${s.title}\n${s.content}`)
    .join('\n\n');

  return {
    success: true,
    activityId: input.activityId,
    activityType: input.activityType,
    textContent: fallbackText,
    sections: fallbackSections,
    generatedAt: new Date().toISOString()
  };
}

export async function generateTextVersionContent(
  input: TextVersionInput
): Promise<TextVersionOutput> {
  console.log('📝 TextVersionGenerator: Iniciando geração para', input.activityType);
  
  if (!isTextVersionActivity(input.activityType)) {
    console.warn('⚠️ TextVersionGenerator: Tipo de atividade não é versão texto:', input.activityType);
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
    const promptFn = PROMPTS_BY_ACTIVITY_TYPE[input.activityType] || getDefaultPrompt;
    const fullPrompt = promptFn(input);

    console.log('🤖 TextVersionGenerator: Chamando API com fallback em cascata...');
    
    const response = await executeWithCascadeFallback(fullPrompt);

    if (!response.success || !response.data) {
      console.warn('⚠️ TextVersionGenerator: Resposta da API falhou, usando fallback');
      return generateFallbackContent(input);
    }

    const parsed = parseAIResponse(response.data);
    
    if (!parsed) {
      console.warn('⚠️ TextVersionGenerator: Não foi possível parsear resposta, usando fallback');
      return generateFallbackContent(input);
    }

    console.log('✅ TextVersionGenerator: Conteúdo gerado com sucesso');
    
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
    console.error('❌ TextVersionGenerator: Erro na geração:', error);
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
  
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      ...content,
      storedAt: new Date().toISOString()
    }));
    console.log('💾 TextVersionGenerator: Conteúdo salvo em localStorage:', storageKey);
  } catch (error) {
    console.error('❌ TextVersionGenerator: Erro ao salvar em localStorage:', error);
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
