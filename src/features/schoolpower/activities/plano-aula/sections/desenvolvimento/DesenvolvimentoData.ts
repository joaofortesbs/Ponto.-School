
export interface EtapaDesenvolvimento {
  id: string;
  titulo: string;
  descricao: string;
  tipoInteracao: string;
  tempoEstimado: string;
  recursosUsados: string[];
  ordem: number;
  expandida: boolean;
}

export interface DesenvolvimentoData {
  etapas: EtapaDesenvolvimento[];
  tempoTotalEstimado: string;
  observacoesGerais: string;
  sugestoesIA: string[];
}

// Dados padrão/fallback
export const desenvolvimentoDataPadrao: DesenvolvimentoData = {
  etapas: [
    {
      id: "etapa_1",
      titulo: "1. Introdução e Contextualização",
      descricao: "Apresente o contexto histórico da Europa no século XVIII...",
      tipoInteracao: "Apresentação + debate",
      tempoEstimado: "15 minutos",
      recursosUsados: ["Slides", "Lousa"],
      ordem: 1,
      expandida: false
    },
    {
      id: "etapa_2", 
      titulo: "2. Desenvolvimento do Tema Principal",
      descricao: "Explorar os conceitos fundamentais através de exemplos práticos...",
      tipoInteracao: "Atividade prática",
      tempoEstimado: "20 minutos",
      recursosUsados: ["Material impresso", "Caderno"],
      ordem: 2,
      expandida: false
    },
    {
      id: "etapa_3",
      titulo: "3. Consolidação e Aplicação",
      descricao: "Exercícios de fixação e aplicação dos conceitos aprendidos...",
      tipoInteracao: "Exercícios em grupo",
      tempoEstimado: "10 minutos", 
      recursosUsados: ["Lista de exercícios", "Trabalho em grupo"],
      ordem: 3,
      expandida: false
    }
  ],
  tempoTotalEstimado: "45 minutos",
  observacoesGerais: "Manter ritmo dinâmico e interativo durante toda a aula",
  sugestoesIA: [
    "Considere incluir mais momentos de interação",
    "Varie os tipos de atividades para manter o engajamento"
  ]
};

// Service para API do Gemini
export class DesenvolvimentoGeminiService {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  
  static async gerarEtapasDesenvolvimento(contextoPlano: any): Promise<DesenvolvimentoData> {
    try {
      console.log('🤖 Gerando etapas de desenvolvimento via Gemini...');
      
      const prompt = this.construirPrompt(contextoPlano);
      const response = await this.chamarGeminiAPI(prompt);
      const etapasGeradas = this.processarResposta(response);
      
      console.log('✅ Etapas de desenvolvimento geradas com sucesso:', etapasGeradas);
      return etapasGeradas;
      
    } catch (error) {
      console.error('❌ Erro ao gerar etapas de desenvolvimento:', error);
      return this.aplicarContextoAosDadosPadrao(contextoPlano);
    }
  }

  private static construirPrompt(contextoPlano: any): string {
    return `
Você é um especialista em pedagogia e planejamento de aulas. Com base no contexto do plano de aula fornecido, crie etapas detalhadas para a seção de DESENVOLVIMENTO da aula.

CONTEXTO DO PLANO DE AULA:
- Disciplina: ${contextoPlano.disciplina || 'Não especificado'}
- Tema: ${contextoPlano.tema || 'Não especificado'}
- Série/Ano: ${contextoPlano.anoEscolaridade || contextoPlano.serie || 'Não especificado'}
- Objetivos: ${JSON.stringify(contextoPlano.objetivos || [])}
- Tempo Total: ${contextoPlano.tempoLimite || contextoPlano.tempo || '50 minutos'}
- Recursos Disponíveis: ${JSON.stringify(contextoPlano.materiais || [])}

INSTRUÇÕES:
1. Crie entre 3 a 6 etapas para o desenvolvimento da aula
2. Cada etapa deve ser progressiva e pedagógica
3. Distribua o tempo de forma equilibrada
4. Varie os tipos de interação (apresentação, prática, discussão, etc.)
5. Use recursos disponíveis de forma inteligente

FORMATO DE RESPOSTA (JSON):
{
  "etapas": [
    {
      "id": "etapa_1",
      "titulo": "1. Nome da Primeira Etapa",
      "descricao": "Descrição detalhada do que será feito nesta etapa, incluindo metodologia e estratégias...",
      "tipoInteracao": "Tipo de interação (ex: Apresentação dialogada, Atividade prática, Trabalho em grupo, etc.)",
      "tempoEstimado": "X minutos",
      "recursosUsados": ["Recurso 1", "Recurso 2"],
      "ordem": 1,
      "expandida": false
    }
  ],
  "tempoTotalEstimado": "X minutos",
  "observacoesGerais": "Observações importantes sobre o desenvolvimento da aula",
  "sugestoesIA": ["Sugestão 1", "Sugestão 2", "Sugestão 3"]
}

RESPONDA APENAS COM O JSON, SEM TEXTO ADICIONAL.
`;
  }

  private static async chamarGeminiAPI(prompt: string): Promise<string> {
    const { API_KEYS } = await import('@/config/apiKeys');
    
    if (!API_KEYS.GEMINI) {
      throw new Error('Chave da API Gemini não configurada');
    }

    const response = await fetch(`${this.GEMINI_API_URL}?key=${API_KEYS.GEMINI}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static processarResposta(responseText: string): DesenvolvimentoData {
    try {
      // Limpar resposta da IA
      let cleanedText = responseText.trim();
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      cleanedText = cleanedText.trim();

      const parsedData = JSON.parse(cleanedText);
      
      // Validar estrutura
      if (!parsedData.etapas || !Array.isArray(parsedData.etapas)) {
        throw new Error('Estrutura de resposta inválida');
      }

      // Garantir IDs únicos e ordem sequencial
      parsedData.etapas.forEach((etapa: any, index: number) => {
        etapa.id = etapa.id || `etapa_${index + 1}`;
        etapa.ordem = index + 1;
        etapa.expandida = false;
      });

      return parsedData as DesenvolvimentoData;
      
    } catch (error) {
      console.error('Erro ao processar resposta da IA:', error);
      throw new Error('Erro ao processar resposta da IA');
    }
  }

  private static aplicarContextoAosDadosPadrao(contextoPlano: any): DesenvolvimentoData {
    const dadosPadrao = { ...desenvolvimentoDataPadrao };
    
    // Personalizar com dados do contexto
    if (contextoPlano.disciplina) {
      dadosPadrao.etapas[0].descricao = `Apresentar os conceitos fundamentais de ${contextoPlano.disciplina} relacionados ao tema ${contextoPlano.tema || 'proposto'}...`;
    }
    
    if (contextoPlano.tempoLimite || contextoPlano.tempo) {
      dadosPadrao.tempoTotalEstimado = contextoPlano.tempoLimite || contextoPlano.tempo;
    }

    return dadosPadrao;
  }

  static salvarEtapasDesenvolvimento(planoId: string, dados: DesenvolvimentoData): void {
    try {
      const key = `plano_desenvolvimento_${planoId}`;
      localStorage.setItem(key, JSON.stringify(dados));
      console.log('💾 Etapas de desenvolvimento salvas:', key);
    } catch (error) {
      console.error('❌ Erro ao salvar etapas de desenvolvimento:', error);
    }
  }

  static carregarEtapasDesenvolvimento(planoId: string): DesenvolvimentoData | null {
    try {
      const key = `plano_desenvolvimento_${planoId}`;
      const dados = localStorage.getItem(key);
      
      if (dados) {
        const parsedData = JSON.parse(dados);
        console.log('📂 Etapas de desenvolvimento carregadas:', key);
        return parsedData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar etapas de desenvolvimento:', error);
      return null;
    }
  }
}
