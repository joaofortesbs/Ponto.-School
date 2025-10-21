
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
    console.log('📋 [TeseRedacaoGenerator] Validação de campos:');
    console.log('  ✓ Tema da Redação:', data.temaRedacao);
    console.log('  ✓ Nível de Dificuldade:', data.nivelDificuldade);
    console.log('  ✓ Objetivo:', data.objetivo);
    console.log('  ✓ Competências ENEM:', data.competenciasENEM);
    console.log('  ✓ Contexto Adicional:', data.contextoAdicional || '(não fornecido)');
    console.log('=====================================');

    const prompt = `
Você é um especialista em redação do ENEM com profundo conhecimento das competências II e III.

INSTRUÇÕES CRÍTICAS:
1. Você DEVE gerar EXATAMENTE 3 TESES DIFERENTES E COMPLETAS
2. Cada tese deve ter NO MÍNIMO 150 caracteres
3. Cada tese deve abordar o tema de forma ÚNICA e DISTINTA
4. As teses devem ser realistas e aplicáveis ao ENEM
5. Retorne APENAS JSON válido, sem markdown ou texto adicional

DADOS DA ATIVIDADE:
- Tema da Redação: ${data.temaRedacao}
- Nível de Dificuldade: ${data.nivelDificuldade}
- Objetivo: ${data.objetivo}
- Competências ENEM: ${data.competenciasENEM}
${data.contextoAdicional ? `- Contexto Adicional: ${data.contextoAdicional}` : ''}

GERE O SEGUINTE CONTEÚDO COMPLETO (RETORNE APENAS UM JSON VÁLIDO):
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
                            t.id && t.tese && t.tese.length >= 100 && t.pontosFortres?.length > 0
                          );

      if (!tesesValidas) {
        console.warn('=====================================');
        console.warn('⚠️  [TeseRedacaoGenerator] TESES INVÁLIDAS OU INCOMPLETAS!');
        console.warn('=====================================');
        console.warn('🔧 [TeseRedacaoGenerator] Gerando teses personalizadas baseadas no tema...');
        console.warn('📝 Tema:', data.temaRedacao);
        console.warn('📝 Nível:', data.nivelDificuldade);
        console.warn('📝 Contexto:', data.contextoAdicional || 'Não fornecido');
        
        // Teses personalizadas baseadas nos dados fornecidos
        content.etapa2_battleTeses = {
          instrucoes: 'Analise as três teses sobre o tema e escolha a mais adequada aos critérios do ENEM',
          tesesParaComparar: [
            {
              id: 'A',
              tese: `No contexto contemporâneo, ${data.temaRedacao.toLowerCase()} representa um desafio multifacetado que demanda ações coordenadas entre poder público, iniciativa privada e sociedade civil, visando garantir o pleno exercício da cidadania e o desenvolvimento sustentável do país.`,
              pontosFortres: ['Posicionamento claro', 'Abordagem multidimensional', 'Propõe integração de setores']
            },
            {
              id: 'B',
              tese: `A questão de ${data.temaRedacao.toLowerCase()} no Brasil evidencia profundas desigualdades históricas e estruturais, exigindo não apenas políticas públicas efetivas, mas também uma mudança cultural e educacional que promova conscientização e responsabilidade coletiva.`,
              pontosFortres: ['Análise crítica histórica', 'Contextualização social', 'Proposta educacional']
            },
            {
              id: 'C',
              tese: `Para enfrentar os desafios relacionados a ${data.temaRedacao.toLowerCase()}, torna-se imprescindível a implementação de estratégias integradas que aliem investimentos em infraestrutura, capacitação profissional e desenvolvimento de tecnologias inovadoras, promovendo assim transformações significativas e duradouras.`,
              pontosFortres: ['Propositiva e prática', 'Foco em soluções concretas', 'Visão de longo prazo']
            }
          ]
        };
        
        console.warn('✅ [TeseRedacaoGenerator] Teses personalizadas geradas com sucesso');
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
