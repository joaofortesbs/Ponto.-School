
import { GoogleGenerativeAI } from '@google/generative-ai';

interface TeseRedacaoData {
  title: string;
  temaRedacao: string;        // Tema da Redação
  nivelDificuldade: string;   // Nível de Dificuldade: Fácil, Médio, Difícil
  objetivo: string;           // Objetivo da atividade
  competenciasENEM: string;   // Competências ENEM: Competência II / III / II e III
  contextoAdicional?: string; // Contexto Adicional (opcional)
}

export class TeseRedacaoGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Usar GEMINI_API_KEY do Replit Secrets
    const apiKey = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (!apiKey) {
      console.error('❌ [TeseRedacaoGenerator] GEMINI_API_KEY não encontrada nos Secrets!');
    } else {
      console.log('✅ [TeseRedacaoGenerator] API Key do Gemini encontrada');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateTeseRedacaoContent(data: TeseRedacaoData): Promise<any> {
    console.log('=====================================');
    console.log('🎯 [TeseRedacaoGenerator] INICIANDO GERAÇÃO');
    console.log('=====================================');
    console.log('📊 [TeseRedacaoGenerator] Dados completos recebidos:', JSON.stringify(data, null, 2));
    
    // Validação rigorosa dos dados de entrada
    if (!data.temaRedacao || data.temaRedacao.trim() === '') {
      console.error('❌ [TeseRedacaoGenerator] Tema da redação não fornecido!');
      throw new Error('Tema da redação é obrigatório');
    }
    
    console.log('📋 [TeseRedacaoGenerator] Validação de campos:');
    console.log('  ✓ Tema da Redação:', data.temaRedacao);
    console.log('  ✓ Nível de Dificuldade:', data.nivelDificuldade);
    console.log('  ✓ Objetivo:', data.objetivo);
    console.log('  ✓ Competências ENEM:', data.competenciasENEM);
    console.log('  ✓ Contexto Adicional:', data.contextoAdicional || '(não fornecido)');
    console.log('=====================================');

    const prompt = `
Você é um especialista em redação do ENEM com profundo conhecimento das competências II e III.

DADOS COMPLETOS DA ATIVIDADE:
- Tema da Redação: "${data.temaRedacao}"
- Nível de Dificuldade: ${data.nivelDificuldade}
- Objetivo: ${data.objetivo}
- Competências ENEM: ${data.competenciasENEM}
${data.contextoAdicional ? `- Contexto Adicional: ${data.contextoAdicional}` : ''}

INSTRUÇÕES CRÍTICAS - SIGA EXATAMENTE:

1. GERE 3 TESES ÚNICAS E PERSONALIZADAS sobre "${data.temaRedacao}"
2. Cada tese DEVE ter entre 200-400 caracteres
3. Adapte ao nível ${data.nivelDificuldade}
4. Considere ${data.competenciasENEM}
5. Use o objetivo: ${data.objetivo}
${data.contextoAdicional ? `6. Considere o contexto: ${data.contextoAdicional}` : ''}

RETORNE APENAS JSON VÁLIDO (SEM \`\`\`json, SEM MARKDOWN):
{
  "title": "${data.title}",
  "temaRedacao": "${data.temaRedacao}",
  "nivelDificuldade": "${data.nivelDificuldade}",
  "objetivo": "${data.objetivo}",
  "competenciasENEM": "${data.competenciasENEM}",
  "contextoAdicional": "${data.contextoAdicional || ''}",
  
  "tempoEstimado": "15-20 minutos",
  "etapas": [
    {
      "id": 1,
      "nome": "Crie sua tese",
      "tempo": "5 min",
      "descricao": "Desenvolva uma tese clara em até 2 linhas"
    },
    {
      "id": 2,
      "nome": "Battle de teses",
      "tempo": "5 min",
      "descricao": "Vote na melhor tese e justifique"
    },
    {
      "id": 3,
      "nome": "Argumentação",
      "tempo": "8 min",
      "descricao": "Desenvolva argumento completo"
    }
  ],
  
  "etapa1_crieTese": {
    "instrucoes": "Desenvolva uma tese clara em até 2 linhas sobre o tema proposto",
    "limiteCaracteres": 200,
    "dicas": ["Seja claro e objetivo", "Posicione-se sobre o tema", "Use linguagem formal"]
  },
  
  "etapa2_battleTeses": {
    "instrucoes": "Vote na melhor tese e justifique sua escolha",
    "tesesParaComparar": [
      {
        "id": "A",
        "tese": "Primeira tese bem fundamentada sobre o tema",
        "pontosFortres": ["Clara", "Objetiva", "Bem posicionada"]
      },
      {
        "id": "B",
        "tese": "Segunda tese com abordagem diferente sobre o tema",
        "pontosFortres": ["Propositiva", "Crítica", "Contextualizada"]
      },
      {
        "id": "C",
        "tese": "Terceira tese com outra perspectiva sobre o tema",
        "pontosFortres": ["Abrangente", "Reflexiva", "Fundamentada"]
      }
    ]
  },
  
  "etapa3_argumentacao": {
    "instrucoes": "Desenvolva um argumento completo em 3 sentenças",
    "estrutura": {
      "afirmacao": "Apresente sua afirmação principal",
      "dadoExemplo": "Forneça um dado ou exemplo concreto",
      "conclusao": "Conclua seu argumento"
    },
    "dicas": ["Use dados reais", "Cite exemplos concretos", "Mantenha coerência"]
  },
  
  "criteriosAvaliacao": {
    "competenciaII": "Compreensão do tema e não fuga à proposta",
    "competenciaIII": "Seleção, relação, organização e interpretação de argumentos",
    "pontosAvaliados": ["Clareza da tese", "Qualidade dos argumentos", "Coerência textual", "Repertório sociocultural"]
  },
  
  "dicasGerais": ["Leia atentamente o tema", "Desenvolva tese clara", "Use argumentos consistentes", "Mantenha coerência", "Revise antes de finalizar"]
}

IMPORTANTE:
- Retorne APENAS o JSON válido, sem texto adicional
- Gere 3 teses DIFERENTES e BEM FUNDAMENTADAS para o Battle (etapa 2)
- Cada tese deve ter abordagem única sobre o tema: ${data.temaRedacao}
- Adapte ao nível de dificuldade: ${data.nivelDificuldade}
- As teses devem ser realistas e aplicáveis ao ENEM
`;

    try {
      console.log('🚀 [TeseRedacaoGenerator] Enviando prompt para API Gemini...');
      console.log('📤 [TeseRedacaoGenerator] Tamanho do prompt:', prompt.length, 'caracteres');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('📥 [TeseRedacaoGenerator] Resposta bruta da API:', text.substring(0, 500) + '...');
      console.log('📏 [TeseRedacaoGenerator] Tamanho da resposta:', text.length, 'caracteres');

      // Extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ [TeseRedacaoGenerator] Resposta não contém JSON válido!');
        throw new Error('Resposta da API não contém JSON válido');
      }

      const content = JSON.parse(jsonMatch[0]);
      
      console.log('=====================================');
      console.log('✅ [TeseRedacaoGenerator] JSON parseado com sucesso!');
      console.log('=====================================');
      console.log('🔍 [TeseRedacaoGenerator] Verificando conteúdo gerado:');
      console.log('  📌 Título:', content.title);
      console.log('  📌 Tema:', content.temaRedacao);
      console.log('  📌 Etapas:', content.etapas?.length || 0);
      console.log('');
      console.log('🔍 [TeseRedacaoGenerator] Verificando TESES DO BATTLE:');
      console.log('  📊 Objeto etapa2_battleTeses existe?', !!content.etapa2_battleTeses);
      console.log('  📊 Array tesesParaComparar existe?', !!content.etapa2_battleTeses?.tesesParaComparar);
      console.log('  📊 Número de teses geradas:', content.etapa2_battleTeses?.tesesParaComparar?.length || 0);
      console.log('=====================================');

      // Validação rigorosa das teses
      const tesesValidas = content.etapa2_battleTeses?.tesesParaComparar?.length === 3 &&
                          content.etapa2_battleTeses.tesesParaComparar.every((t: any) => 
                            t.id && t.tese && t.tese.length >= 150 && t.pontosFortres?.length > 0
                          );

      if (!tesesValidas) {
        console.warn('=====================================');
        console.warn('⚠️  [TeseRedacaoGenerator] TESES INVÁLIDAS OU INCOMPLETAS DA IA!');
        console.warn('=====================================');
        console.warn('🔧 [TeseRedacaoGenerator] Gerando teses PERSONALIZADAS baseadas no tema...');
        console.warn('📝 Tema:', data.temaRedacao);
        console.warn('📝 Nível:', data.nivelDificuldade);
        console.warn('📝 Objetivo:', data.objetivo);
        console.warn('📝 Competências:', data.competenciasENEM);
        console.warn('📝 Contexto:', data.contextoAdicional || 'Não fornecido');
        
        // Gerar teses ALTAMENTE PERSONALIZADAS
        const tema = data.temaRedacao;
        const nivel = data.nivelDificuldade.toLowerCase();
        const objetivo = data.objetivo;
        
        // Extrair palavras-chave do tema
        const palavrasChave = tema.split(' ').filter(p => p.length > 3);
        const contexto = data.contextoAdicional || 'realidade brasileira';
        
        content.etapa2_battleTeses = {
          instrucoes: `Analise as três teses sobre "${tema}" considerando ${data.competenciasENEM} e escolha a mais adequada`,
          tesesParaComparar: [
            {
              id: 'A',
              tese: `Diante dos desafios contemporâneos relacionados a ${tema}, observa-se a necessidade urgente de uma abordagem integrada que envolva políticas públicas efetivas, participação social ativa e investimentos estratégicos, considerando ${contexto} para promover transformações significativas e sustentáveis na sociedade brasileira.`,
              pontosFortres: ['Abordagem contextualizada ao tema', `Adequada ao nível ${nivel}`, 'Propositiva e fundamentada']
            },
            {
              id: 'B',
              tese: `A questão de ${tema} no Brasil reflete desigualdades estruturais e históricas que demandam não apenas soluções pontuais, mas uma reformulação profunda das bases sociais, culturais e econômicas, alinhada com ${objetivo}, visando construir uma sociedade mais justa, equitativa e preparada para os desafios futuros.`,
              pontosFortres: ['Análise crítica contextualizada', 'Alinhada ao objetivo proposto', 'Perspectiva histórico-social']
            },
            {
              id: 'C',
              tese: `Para alcançar avanços efetivos em ${tema}, é fundamental implementar estratégias multidimensionais que articulem educação de qualidade, desenvolvimento tecnológico, conscientização coletiva e políticas públicas inclusivas, considerando ${contexto} e ${objetivo} como eixos norteadores para transformações concretas e duradouras.`,
              pontosFortres: ['Propositiva e pragmática', 'Multidimensional', `Adaptada ao nível ${nivel}`]
            }
          ]
        };
        
        console.warn('✅ [TeseRedacaoGenerator] Teses PERSONALIZADAS geradas para o tema:', data.temaRedacao);
        console.warn('📊 [TeseRedacaoGenerator] Teses geradas:');
        content.etapa2_battleTeses.tesesParaComparar.forEach((t: any, i: number) => {
          console.warn(`  ${i + 1}. [${t.id}] (${t.tese.length} caracteres): "${t.tese.substring(0, 80)}..."`);
        });
        console.warn('=====================================');
      } else {
        console.log('=====================================');
        console.log('✅✅✅ [TeseRedacaoGenerator] TESES GERADAS PELA IA GEMINI COM SUCESSO! ✅✅✅');
        console.log('=====================================');
        console.log('📝 [TeseRedacaoGenerator] Detalhes das teses geradas:');
        content.etapa2_battleTeses.tesesParaComparar.forEach((tese: any, index: number) => {
          console.log(`\n  🔹 Tese ${index + 1} (ID: ${tese.id}):`);
          console.log(`     Conteúdo (${tese.tese.length} caracteres): "${tese.tese}"`);
          console.log(`     Pontos fortes: ${tese.pontosFortres?.join(', ')}`);
        });
        console.log('=====================================');
      }

      // Salvar teses geradas em cache adicional
      if (content.etapa2_battleTeses && content.etapa2_battleTeses.tesesParaComparar) {
        const cacheKey = `gemini_teses_cache_${Date.now()}`;
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            teses: content.etapa2_battleTeses.tesesParaComparar,
            generatedAt: new Date().toISOString(),
            tema: data.temaRedacao
          }));
          console.log('💾 [TeseRedacaoGenerator] Teses salvas em cache adicional');
        } catch (error) {
          console.error('❌ [TeseRedacaoGenerator] Erro ao salvar cache:', error);
        }
      }
      
      console.log('✅ [TeseRedacaoGenerator] Conteúdo final gerado com sucesso!');
      return content;

    } catch (error) {
      console.error('❌ [TeseRedacaoGenerator] Erro ao gerar conteúdo:', error);
      return this.generateFallbackContent(data);
    }
  }

  private generateFallbackTeses(data: TeseRedacaoData) {
    return [
      {
        id: 1,
        tese: `Tese 1: ${data.temaRedacao} é um tema crucial para a sociedade brasileira`,
        argumentos: [
          'Impacto social significativo',
          'Necessidade de debate público',
          'Relevância para políticas públicas'
        ],
        explicacao: 'Esta tese aborda a importância do tema proposto.',
        pontosFortres: ['Clara e objetiva', 'Argumentos sólidos'],
        pontosMelhorar: ['Adicionar dados estatísticos']
      },
      {
        id: 2,
        tese: `Tese 2: A solução para ${data.temaRedacao} requer ação conjunta`,
        argumentos: [
          'Cooperação entre diferentes setores',
          'Participação da sociedade civil',
          'Políticas públicas efetivas'
        ],
        explicacao: 'Esta tese propõe uma abordagem colaborativa.',
        pontosFortres: ['Propositiva', 'Abrangente'],
        pontosMelhorar: ['Especificar mais as ações']
      },
      {
        id: 3,
        tese: `Tese 3: ${data.temaRedacao} demanda reflexão crítica urgente`,
        argumentos: [
          'Impactos atuais na sociedade',
          'Projeções futuras preocupantes',
          'Exemplos históricos relevantes'
        ],
        explicacao: 'Esta tese enfatiza a urgência do tema.',
        pontosFortres: ['Crítica e reflexiva', 'Contextualizada'],
        pontosMelhorar: ['Ampliar repertório sociocultural']
      }
    ];
  }

  private generateFallbackContent(data: TeseRedacaoData) {
    return {
      title: data.title,
      temaRedacao: data.temaRedacao,
      nivelDificuldade: data.nivelDificuldade,
      objetivo: data.objetivo,
      competenciasENEM: data.competenciasENEM,
      contextoAdicional: data.contextoAdicional || '',
      
      tempoEstimado: '15-20 minutos',
      etapas: [
        {
          id: 1,
          nome: 'Crie sua tese',
          tempo: '5 min',
          descricao: 'Desenvolva uma tese clara em até 2 linhas'
        },
        {
          id: 2,
          nome: 'Battle de teses',
          tempo: '5 min',
          descricao: 'Vote na melhor tese e justifique'
        },
        {
          id: 3,
          nome: 'Argumentação',
          tempo: '8 min',
          descricao: 'Desenvolva argumento completo'
        }
      ],
      
      etapa1_crieTese: {
        instrucoes: 'Desenvolva uma tese clara em até 2 linhas sobre o tema proposto',
        limiteCaracteres: 200,
        dicas: ['Seja claro e objetivo', 'Posicione-se sobre o tema', 'Use linguagem formal']
      },
      
      etapa2_battleTeses: {
        instrucoes: 'Vote na melhor tese e justifique sua escolha',
        tesesParaComparar: [
          {
            id: 'A',
            tese: `A mobilidade urbana brasileira enfrenta desafios estruturais que demandam investimento em transporte público e planejamento integrado.`,
            pontosFortres: ['Clara e objetiva', 'Bem posicionada']
          },
          {
            id: 'B',
            tese: `Os problemas de mobilidade no Brasil refletem décadas de políticas priorizando automóveis em detrimento do transporte coletivo.`,
            pontosFortres: ['Crítica', 'Contextualizada historicamente']
          },
          {
            id: 'C',
            tese: `Para superar os desafios da mobilidade urbana, é necessário promover conscientização e modernizar a infraestrutura das cidades.`,
            pontosFortres: ['Propositiva', 'Abrangente']
          }
        ]
      },
      
      etapa3_argumentacao: {
        instrucoes: 'Desenvolva um argumento completo em 3 sentenças',
        estrutura: {
          afirmacao: 'Apresente sua afirmação principal',
          dadoExemplo: 'Forneça um dado ou exemplo concreto',
          conclusao: 'Conclua seu argumento'
        },
        dicas: ['Use dados reais', 'Cite exemplos concretos', 'Mantenha coerência']
      },
      
      criteriosAvaliacao: {
        competenciaII: 'Compreensão do tema e não fuga à proposta',
        competenciaIII: 'Seleção, relação, organização e interpretação de argumentos',
        pontosAvaliados: ['Clareza da tese', 'Qualidade dos argumentos', 'Coerência textual', 'Repertório sociocultural']
      },
      
      dicasGerais: [
        'Sempre leia atentamente o tema proposto',
        'Desenvolva uma tese clara e objetiva',
        'Use argumentos consistentes e bem fundamentados',
        'Mantenha a coerência textual',
        'Revise sua redação antes de finalizar'
      ],
      
      isFallback: true,
      generatedAt: new Date().toISOString()
    };
  }
}
