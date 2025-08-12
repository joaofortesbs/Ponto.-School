
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

  private getFallbackResponse(prompt: string): string {
    console.log('🔄 Usando resposta de fallback');
    
    if (prompt.includes('sequência didática') || prompt.includes('sequencia didatica')) {
      return JSON.stringify({
        titulo: "Sequência Didática - Tópico Educacional",
        disciplina: "Matéria Específica",
        serie: "Série/Ano",
        duracao: "4-6 aulas",
        objetivos: [
          "Compreender conceitos fundamentais do tema",
          "Desenvolver habilidades práticas relacionadas",
          "Aplicar conhecimentos em situações contextualizadas"
        ],
        atividades: [
          {
            aula: 1,
            titulo: "Introdução ao Tema",
            descricao: "Apresentação dos conceitos básicos e levantamento de conhecimentos prévios",
            recursos: ["Quadro", "Material audiovisual", "Textos introdutórios"],
            duracao: "50 minutos"
          },
          {
            aula: 2,
            titulo: "Desenvolvimento Teórico",
            descricao: "Aprofundamento dos conceitos com exemplos práticos",
            recursos: ["Livro didático", "Exercícios práticos", "Material complementar"],
            duracao: "50 minutos"
          },
          {
            aula: 3,
            titulo: "Atividades Práticas",
            descricao: "Aplicação prática dos conceitos através de exercícios e atividades",
            recursos: ["Material manipulativo", "Fichas de atividades", "Computador/tablet"],
            duracao: "50 minutos"
          },
          {
            aula: 4,
            titulo: "Avaliação e Síntese",
            descricao: "Avaliação do aprendizado e síntese dos conteúdos estudados",
            recursos: ["Instrumentos de avaliação", "Material de síntese"],
            duracao: "50 minutos"
          }
        ],
        avaliacao: {
          criterios: [
            "Participação nas atividades propostas",
            "Compreensão dos conceitos fundamentais",
            "Aplicação prática dos conhecimentos",
            "Qualidade das produções realizadas"
          ],
          instrumentos: [
            "Observação direta",
            "Atividades práticas",
            "Produção textual",
            "Autoavaliação"
          ]
        },
        recursos_necessarios: [
          "Quadro e material de escrita",
          "Material audiovisual (projetor/TV)",
          "Livros didáticos e textos complementares",
          "Material manipulativo específico do tema",
          "Computador/tablet (se necessário)"
        ],
        referencias: [
          "Livro didático adotado pela escola",
          "Material complementar específico do tema",
          "Recursos digitais educacionais"
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

// Exportar instância singleton
export const geminiClient = new GeminiClient();

// Exportar classe para casos que precisem de múltiplas instâncias
export { GeminiClient };

// Export default da instância
export default geminiClient;
