
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração da API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBHjmJRJF8K2m8B_Kf3X8F9NjPq0lXvY2s';

// Inicialização do cliente
const genAI = new GoogleGenerativeAI(API_KEY);

// Interface para configuração de geração
interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

// Interface para resposta estruturada
interface StructuredResponse {
  success: boolean;
  data: any;
  error?: string;
  metadata?: {
    tokensUsed: number;
    processingTime: number;
    model: string;
  };
}

// Classe principal do cliente Gemini
export class GeminiClient {
  private model: any;
  private defaultConfig: GenerationConfig;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.defaultConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
      stopSequences: []
    };
  }

  // Método principal para geração de conteúdo
  async generate(prompt: string, config?: GenerationConfig): Promise<string> {
    try {
      const startTime = Date.now();
      
      const generationConfig = { ...this.defaultConfig, ...config };
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
      });

      const response = await result.response;
      const text = response.text();

      console.log(`✅ Gemini gerou conteúdo em ${Date.now() - startTime}ms`);
      
      return text;
    } catch (error) {
      console.error('❌ Erro na geração Gemini:', error);
      throw new Error(`Falha na geração: ${error.message}`);
    }
  }

  // Método especializado para sequência didática
  async generateSequenciaDidatica(dados: any): Promise<any> {
    const prompt = this.buildSequenciaDidaticaPrompt(dados);
    
    try {
      const response = await this.generate(prompt, {
        temperature: 0.8,
        maxOutputTokens: 6144
      });

      return this.parseSequenciaDidaticaResponse(response);
    } catch (error) {
      console.error('❌ Erro ao gerar sequência didática:', error);
      return this.getFallbackSequenciaDidatica(dados);
    }
  }

  // Constrói prompt específico para sequência didática
  private buildSequenciaDidaticaPrompt(dados: any): string {
    return `
# GERADOR DE SEQUÊNCIA DIDÁTICA AVANÇADO

## DADOS DE ENTRADA:
- **Disciplina**: ${dados.disciplina || 'Não especificado'}
- **Tema**: ${dados.tema || 'Não especificado'}  
- **Público-alvo**: ${dados.publicoAlvo || 'Não especificado'}
- **Duração**: ${dados.duracao || 'Não especificado'}
- **Objetivo**: ${dados.objetivo || 'Não especificado'}

## INSTRUÇÕES CRÍTICAS:
1. **FORMATO DE RESPOSTA**: Retorne APENAS um JSON válido, sem texto adicional
2. **ESTRUTURA OBRIGATÓRIA**: Siga exatamente o formato especificado abaixo
3. **CONTEÚDO RICO**: Cada seção deve ter conteúdo detalhado e pedagógico
4. **ATIVIDADES PRÁTICAS**: Inclua pelo menos 3 atividades diferentes por aula

## FORMATO DE RESPOSTA (JSON):
\`\`\`json
{
  "sequenciaDidatica": {
    "titulo": "Título da Sequência Didática",
    "disciplina": "${dados.disciplina}",
    "tema": "${dados.tema}",
    "publicoAlvo": "${dados.publicoAlvo}",
    "duracao": "${dados.duracao}",
    "objetivos": {
      "geral": "Objetivo geral da sequência",
      "especificos": [
        "Objetivo específico 1",
        "Objetivo específico 2",
        "Objetivo específico 3"
      ]
    },
    "aulas": [
      {
        "numero": 1,
        "titulo": "Título da Aula 1",
        "duracao": "50 minutos",
        "objetivos": ["Objetivo da aula 1"],
        "metodologia": "Descrição da metodologia",
        "desenvolvimento": {
          "inicio": "Atividade de início (10 min)",
          "desenvolvimento": "Desenvolvimento principal (30 min)",
          "fechamento": "Atividade de fechamento (10 min)"
        },
        "atividades": [
          {
            "nome": "Nome da atividade",
            "tipo": "individual/grupo/discussao",
            "duracao": "15 minutos",
            "descricao": "Descrição detalhada",
            "materiais": ["Material 1", "Material 2"]
          }
        ],
        "avaliacao": {
          "tipo": "formativa/somativa",
          "instrumentos": ["Instrumento 1", "Instrumento 2"],
          "criterios": ["Critério 1", "Critério 2"]
        }
      }
    ],
    "recursos": {
      "materiais": ["Material 1", "Material 2"],
      "tecnologicos": ["Recurso tech 1", "Recurso tech 2"],
      "espaciais": ["Sala de aula", "Laboratório"]
    },
    "avaliacaoGeral": {
      "criterios": ["Critério 1", "Critério 2"],
      "instrumentos": ["Instrumento 1", "Instrumento 2"],
      "rubricas": ["Rubrica 1", "Rubrica 2"]
    }
  }
}
\`\`\`

GERE UMA SEQUÊNCIA DIDÁTICA COMPLETA E DETALHADA SEGUINDO EXATAMENTE O FORMATO JSON ACIMA.
`;
  }

  // Processa resposta da sequência didática
  private parseSequenciaDidaticaResponse(response: string): any {
    try {
      // Remove markdown e extrai JSON
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }

      // Fallback: tenta parsear resposta direta
      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Erro ao parsear resposta:', error);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }
  }

  // Fallback para sequência didática
  private getFallbackSequenciaDidatica(dados: any): any {
    return {
      sequenciaDidatica: {
        titulo: `Sequência Didática: ${dados.tema || 'Tema Educacional'}`,
        disciplina: dados.disciplina || 'Interdisciplinar',
        tema: dados.tema || 'Conteúdo Educacional',
        publicoAlvo: dados.publicoAlvo || 'Estudantes',
        duracao: dados.duracao || '4 aulas de 50 minutos',
        objetivos: {
          geral: `Desenvolver compreensão sobre ${dados.tema || 'o tema proposto'}`,
          especificos: [
            'Compreender conceitos fundamentais',
            'Aplicar conhecimentos em situações práticas',
            'Desenvolver pensamento crítico'
          ]
        },
        aulas: [
          {
            numero: 1,
            titulo: 'Introdução ao Tema',
            duracao: '50 minutos',
            objetivos: ['Apresentar conceitos básicos'],
            metodologia: 'Aula expositiva dialogada',
            desenvolvimento: {
              inicio: 'Atividade diagnóstica (10 min)',
              desenvolvimento: 'Apresentação do conteúdo (30 min)',
              fechamento: 'Síntese e questionamentos (10 min)'
            },
            atividades: [
              {
                nome: 'Brainstorming inicial',
                tipo: 'grupo',
                duracao: '15 minutos',
                descricao: 'Levantamento de conhecimentos prévios',
                materiais: ['Quadro', 'Marcadores']
              }
            ],
            avaliacao: {
              tipo: 'formativa',
              instrumentos: ['Observação', 'Participação'],
              criterios: ['Engajamento', 'Contribuições relevantes']
            }
          }
        ],
        recursos: {
          materiais: ['Quadro branco', 'Projetor', 'Material impresso'],
          tecnologicos: ['Computador', 'Internet'],
          espaciais: ['Sala de aula']
        },
        avaliacaoGeral: {
          criterios: ['Compreensão conceitual', 'Aplicação prática'],
          instrumentos: ['Prova', 'Projeto'],
          rubricas: ['Excelente', 'Bom', 'Satisfatório', 'Insuficiente']
        }
      }
    };
  }

  // Método para geração estruturada com retry
  async generateWithRetry(prompt: string, maxRetries: number = 3): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} de geração`);
        return await this.generate(prompt);
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt < maxRetries) {
          // Aguarda progressivamente mais tempo entre tentativas
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    throw lastError || new Error('Falha após múltiplas tentativas');
  }

  // Método para validar conectividade
  async testConnection(): Promise<boolean> {
    try {
      await this.generate('Teste de conectividade. Responda apenas: OK');
      return true;
    } catch (error) {
      console.error('❌ Falha na conexão com Gemini:', error);
      return false;
    }
  }
}

// Instância singleton
const geminiClient = new GeminiClient();

// Exports
export default geminiClient;
export { geminiClient };

// Função helper para compatibilidade
export const generateContent = async (prompt: string): Promise<string> => {
  return await geminiClient.generate(prompt);
};

// Função específica para sequência didática
export const generateSequenciaDidatica = async (dados: any): Promise<any> => {
  return await geminiClient.generateSequenciaDidatica(dados);
};
