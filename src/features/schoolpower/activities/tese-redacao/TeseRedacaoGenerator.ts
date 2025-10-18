
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
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateTeseRedacaoContent(data: TeseRedacaoData): Promise<any> {
    console.log('🎯 [TeseRedacaoGenerator] Gerando conteúdo com dados:', data);

    const prompt = `
Você é um especialista em redação do ENEM. Gere conteúdo estruturado para treino de teses de redação.

DADOS DA ATIVIDADE:
- Tema da Redação: ${data.temaRedacao}
- Nível de Dificuldade: ${data.nivelDificuldade}
- Objetivo: ${data.objetivo}
- Competências ENEM: ${data.competenciasENEM}
${data.contextoAdicional ? `- Contexto Adicional: ${data.contextoAdicional}` : ''}

GERE O SEGUINTE CONTEÚDO (RETORNE APENAS UM JSON VÁLIDO):
{
  "title": "${data.title}",
  "temaRedacao": "${data.temaRedacao}",
  "nivelDificuldade": "${data.nivelDificuldade}",
  "objetivo": "${data.objetivo}",
  "competenciasENEM": "${data.competenciasENEM}",
  "contextoAdicional": "${data.contextoAdicional || ''}",
  "tesesSugeridas": [
    {
      "id": 1,
      "tese": "Tese completa e bem fundamentada",
      "argumentos": ["Argumento 1", "Argumento 2", "Argumento 3"],
      "explicacao": "Explicação detalhada da tese",
      "pontosFortres": ["Ponto forte 1", "Ponto forte 2"],
      "pontosMelhorar": ["Sugestão de melhoria 1"]
    }
  ],
  "dicasGerais": ["Dica 1", "Dica 2", "Dica 3"],
  "criteriosAvaliacao": {
    "competenciaII": "Critérios para Competência II",
    "competenciaIII": "Critérios para Competência III"
  }
}

IMPORTANTE:
- Retorne APENAS o JSON, sem texto adicional
- Gere pelo menos 3 teses sugeridas diferentes
- Cada tese deve ser completa e bem argumentada
- Adapte ao nível de dificuldade: ${data.nivelDificuldade}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('📥 [TeseRedacaoGenerator] Resposta bruta da API:', text);

      // Extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta da API não contém JSON válido');
      }

      const content = JSON.parse(jsonMatch[0]);

      // Garantir estrutura mínima
      if (!content.tesesSugeridas || content.tesesSugeridas.length === 0) {
        content.tesesSugeridas = this.generateFallbackTeses(data);
      }

      console.log('✅ [TeseRedacaoGenerator] Conteúdo gerado com sucesso:', content);
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
      tesesSugeridas: this.generateFallbackTeses(data),
      dicasGerais: [
        'Sempre leia atentamente o tema proposto',
        'Desenvolva uma tese clara e objetiva',
        'Use argumentos consistentes e bem fundamentados',
        'Mantenha a coerência textual',
        'Revise sua redação antes de finalizar'
      ],
      criteriosAvaliacao: {
        competenciaII: 'Compreensão do tema e não fuga à proposta',
        competenciaIII: 'Seleção, relação, organização e interpretação de argumentos'
      },
      isFallback: true,
      generatedAt: new Date().toISOString()
    };
  }
}
