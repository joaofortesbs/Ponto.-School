

import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ VITE_GEMINI_API_KEY não encontrada');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      this.isInitialized = true;
      
      console.log('✅ GeminiClient inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar GeminiClient:', error);
      this.isInitialized = false;
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.isInitialized || !this.model) {
      console.warn('⚠️ GeminiClient não inicializado, retornando fallback');
      return this.getFallbackResponse(prompt);
    }

    try {
      console.log('🤖 Enviando prompt para Gemini:', prompt.substring(0, 100) + '...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Resposta recebida do Gemini');
      return text;
    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo com Gemini:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  // Método generate para compatibilidade
  async generate(prompt: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const content = await this.generateContent(prompt);
      
      // Tentar parsear como JSON primeiro
      try {
        const parsedContent = JSON.parse(content);
        return { success: true, data: parsedContent };
      } catch {
        // Se não for JSON válido, retornar como texto
        return { success: true, data: { content } };
      }
    } catch (error) {
      console.error('❌ Erro no método generate:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  private getFallbackResponse(prompt: string): string {
    console.log('🔄 Usando resposta de fallback');
    
    if (prompt.includes('sequência didática') || prompt.includes('sequencia didatica')) {
      return JSON.stringify({
        tituloTemaAssunto: "Sequência Didática - Tópico Educacional",
        disciplina: "Matéria Específica",
        anoSerie: "Série/Ano",
        publicoAlvo: "Estudantes do ensino fundamental/médio",
        objetivosAprendizagem: "Desenvolver conhecimentos específicos do tema proposto",
        quantidadeAulas: "4",
        quantidadeDiagnosticos: "1",
        quantidadeAvaliacoes: "2",
        cronograma: "Distribuição das atividades ao longo do período",
        aulas: [
          {
            numero: 1,
            titulo: "Introdução ao Tema",
            descricao: "Apresentação dos conceitos básicos e levantamento de conhecimentos prévios",
            objetivos: ["Compreender conceitos fundamentais", "Identificar conhecimentos prévios"],
            metodologia: "Aula expositiva dialogada com atividades interativas",
            recursos: ["Quadro", "Material audiovisual", "Textos introdutórios"],
            duracao: "50 minutos",
            atividades: [
              "Discussão inicial sobre o tema",
              "Apresentação de conceitos básicos",
              "Atividade de sondagem"
            ]
          },
          {
            numero: 2,
            titulo: "Desenvolvimento Teórico",
            descricao: "Aprofundamento dos conceitos com exemplos práticos",
            objetivos: ["Aprofundar conhecimentos teóricos", "Aplicar conceitos em exemplos"],
            metodologia: "Aula teórico-prática com exercícios",
            recursos: ["Livro didático", "Exercícios práticos", "Material complementar"],
            duracao: "50 minutos",
            atividades: [
              "Exposição teórica",
              "Resolução de exercícios",
              "Discussão de exemplos"
            ]
          },
          {
            numero: 3,
            titulo: "Atividades Práticas",
            descricao: "Aplicação prática dos conceitos através de exercícios e atividades",
            objetivos: ["Aplicar conhecimentos práticos", "Desenvolver habilidades específicas"],
            metodologia: "Atividades práticas em grupo e individual",
            recursos: ["Material manipulativo", "Fichas de atividades", "Computador/tablet"],
            duracao: "50 minutos",
            atividades: [
              "Atividades práticas",
              "Trabalho em grupo",
              "Aplicação de conceitos"
            ]
          },
          {
            numero: 4,
            titulo: "Avaliação e Síntese",
            descricao: "Avaliação do aprendizado e síntese dos conteúdos estudados",
            objetivos: ["Avaliar aprendizado", "Sintetizar conhecimentos"],
            metodologia: "Avaliação formativa e síntese",
            recursos: ["Instrumentos de avaliação", "Material de síntese"],
            duracao: "50 minutos",
            atividades: [
              "Avaliação dos conhecimentos",
              "Síntese dos conteúdos",
              "Feedback e orientações"
            ]
          }
        ],
        diagnosticos: [
          {
            numero: 1,
            titulo: "Diagnóstico Inicial",
            descricao: "Avaliação dos conhecimentos prévios dos estudantes",
            tipo: "Diagnóstica",
            instrumentos: ["Questionário", "Discussão em grupo"],
            duracao: "20 minutos"
          }
        ],
        avaliacoes: [
          {
            numero: 1,
            titulo: "Avaliação Formativa",
            descricao: "Avaliação contínua durante o processo",
            tipo: "Formativa",
            instrumentos: ["Observação", "Atividades práticas"],
            peso: "40%"
          },
          {
            numero: 2,
            titulo: "Avaliação Somativa",
            descricao: "Avaliação final dos conhecimentos adquiridos",
            tipo: "Somativa",
            instrumentos: ["Prova", "Trabalho final"],
            peso: "60%"
          }
        ]
      });
    }

    return JSON.stringify({
      titulo: "Atividade Educacional",
      descricao: "Atividade personalizada baseada no contexto fornecido",
      objetivos: ["Desenvolver conhecimentos específicos", "Aplicar conceitos práticos"],
      metodologia: "Metodologia adaptada ao contexto educacional",
      recursos: ["Material didático", "Recursos tecnológicos"],
      avaliacao: "Avaliação formativa e somativa"
    });
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// Criar instância singleton
const geminiClient = new GeminiClient();

// Exportar instância singleton
export { geminiClient };

// Exportar classe para casos que precisem de múltiplas instâncias
export { GeminiClient };

// Export default da instância
export default geminiClient;

