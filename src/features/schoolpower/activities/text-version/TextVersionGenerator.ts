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
  console.log('🔍 [TextVersionGenerator] Parseando resposta da IA...');
  console.log('📝 [TextVersionGenerator] Resposta bruta (primeiros 500 chars):', rawResponse?.substring(0, 500));
  
  try {
    // Limpar a resposta de markdown code blocks
    let cleanedResponse = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```javascript\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Tentar encontrar JSON na resposta
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
    if (cleanedResponse.length > 100) {
      console.log('⚠️ [TextVersionGenerator] JSON não encontrado, usando resposta como texto puro');
      return {
        titulo: 'Plano de Aula',
        sections: [],
        textContent: cleanedResponse
      };
    }
    
    console.warn('⚠️ [TextVersionGenerator] Resposta muito curta ou inválida');
  } catch (error) {
    console.error('❌ [TextVersionGenerator] Erro ao parsear resposta:', error);
    console.error('❌ [TextVersionGenerator] Resposta que causou erro:', rawResponse?.substring(0, 1000));
  }
  return null;
}

function generateFallbackContent(input: TextVersionInput): TextVersionOutput {
  console.log('⚠️ [TextVersionGenerator] Gerando conteúdo de fallback para:', input.activityType);
  
  const config = getActivityInfo(input.activityType);
  const displayName = config?.name || input.activityType;
  
  // Gerar conteúdo mais completo baseado nos dados do formulário
  const tema = input.context.tema || input.context.theme || 'Tema não especificado';
  const disciplina = input.context.disciplina || input.context.subject || 'Disciplina não especificada';
  const serie = input.context.serie || input.context.schoolYear || 'Série não especificada';
  const objetivos = input.context.objetivos || input.context.objectives || 'Desenvolver competências relacionadas ao tema';
  const duracao = input.context.duracao || '50 minutos';
  const materiais = input.context.materiais || 'Quadro branco, projetor, materiais didáticos';
  
  const fallbackSections: TextSection[] = [
    {
      title: '🎯 Objetivos de Aprendizagem',
      content: `- ${objetivos}\n- Compreender os conceitos fundamentais relacionados ao tema\n- Aplicar o conhecimento adquirido em situações práticas`,
      icon: 'target'
    },
    {
      title: '📚 Informações da Aula',
      content: `**Tema:** ${tema}\n**Disciplina:** ${disciplina}\n**Série/Ano:** ${serie}\n**Duração:** ${duracao}`,
      icon: 'info'
    },
    {
      title: '📖 Metodologia',
      content: `Esta aula utiliza uma abordagem ativa de ensino, incentivando a participação dos alunos através de:\n- Exposição dialogada do conteúdo\n- Atividades práticas e exercícios\n- Discussão em grupo`,
      icon: 'book'
    },
    {
      title: '🔄 Desenvolvimento da Aula',
      content: `**Momento 1 - Introdução (10 min):**\nApresentação do tema e levantamento de conhecimentos prévios.\n\n**Momento 2 - Desenvolvimento (30 min):**\nExposição do conteúdo com exemplos práticos e atividades interativas.\n\n**Momento 3 - Conclusão (10 min):**\nSíntese do conteúdo e esclarecimento de dúvidas.`,
      icon: 'activity'
    },
    {
      title: '✅ Avaliação',
      content: `A avaliação será contínua, observando:\n- Participação nas atividades\n- Compreensão dos conceitos apresentados\n- Capacidade de aplicação do conhecimento`,
      icon: 'check'
    },
    {
      title: '📋 Recursos e Materiais',
      content: materiais,
      icon: 'clipboard'
    }
  ];

  const fallbackText = `# ${displayName}: ${tema}\n\n` + 
    `**Disciplina:** ${disciplina} | **Série:** ${serie} | **Duração:** ${duracao}\n\n` +
    '---\n\n' +
    fallbackSections
      .map(s => `## ${s.title}\n\n${s.content}`)
      .join('\n\n');

  console.log('📄 [TextVersionGenerator] Fallback gerado com', fallbackSections.length, 'seções');

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

    const parsed = parseAIResponse(response.data);
    
    if (!parsed) {
      console.warn('⚠️ [TextVersionGenerator] Não foi possível parsear resposta, usando fallback');
      return generateFallbackContent(input);
    }

    console.log('✅ ========== TextVersionGenerator: CONTEÚDO GERADO COM SUCESSO ==========');
    console.log('✅ [TextVersionGenerator] Título:', parsed.titulo);
    console.log('✅ [TextVersionGenerator] Seções:', parsed.sections.length);
    console.log('✅ [TextVersionGenerator] TextContent (primeiros 200 chars):', parsed.textContent.substring(0, 200));
    
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
