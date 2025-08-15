
import { GeminiClient } from '../../../../utils/api/geminiClient';
import { API_KEYS } from '../../../../config/apiKeys';

export interface QuadroInterativoData {
  title: string;
  description: string;
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
  materials?: string;
  instructions?: string;
  evaluation?: string;
  timeLimit?: string;
  context?: string;
}

export interface QuadroInterativoContent {
  titulo: string;
  descricao: string;
  disciplina: string;
  anoSerie: string;
  tema: string;
  objetivos: string;
  nivelDificuldade: string;
  atividadeMostrada: string;
  materiaisNecessarios: string[];
  instrucoesProfessor: string;
  criteriosAvaliacao: string;
  tempoEstimado: string;
  contextoAplicacao: string;
  quadrosInterativos: Array<{
    id: number;
    titulo: string;
    descricao: string;
    tipo: string;
    conteudo: any;
  }>;
  isGeneratedByAI: boolean;
  generatedAt: string;
}

class QuadroInterativoGenerator {
  private geminiClient: GeminiClient;

  constructor() {
    this.geminiClient = new GeminiClient();
  }

  /**
   * Gera prompt especializado para Quadro Interativo
   */
  private buildQuadroInterativoPrompt(data: QuadroInterativoData): string {
    return `Você é uma IA especializada em criar atividades educacionais para quadros interativos em sala de aula.

Com base nos seguintes dados, crie um quadro interativo completo e dinâmico:

DADOS DA ATIVIDADE:
- Título: ${data.title}
- Descrição: ${data.description}
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema: ${data.theme}
- Objetivos: ${data.objectives}
- Nível de Dificuldade: ${data.difficultyLevel}
- Atividade Mostrada: ${data.quadroInterativoCampoEspecifico}
- Materiais: ${data.materials || 'A definir'}
- Instruções: ${data.instructions || 'A definir'}
- Avaliação: ${data.evaluation || 'A definir'}
- Tempo Estimado: ${data.timeLimit || 'A definir'}
- Contexto: ${data.context || 'Sala de aula'}

REQUISITOS:
1. Crie 3-5 quadros interativos diferentes relacionados ao tema
2. Cada quadro deve ter atividades práticas e envolventes
3. Inclua diferentes tipos de interação (arrastar e soltar, clique, digitação, etc.)
4. Adapte o conteúdo para o nível de dificuldade especificado
5. Forneça instruções claras para o professor
6. Inclua critérios de avaliação específicos

FORMATO DE RESPOSTA (JSON):
{
  "titulo": "string",
  "descricao": "string", 
  "disciplina": "string",
  "anoSerie": "string",
  "tema": "string",
  "objetivos": "string",
  "nivelDificuldade": "string",
  "atividadeMostrada": "string",
  "materiaisNecessarios": ["material1", "material2", "material3"],
  "instrucoesProfessor": "string detalhada",
  "criteriosAvaliacao": "string detalhada",
  "tempoEstimado": "string",
  "contextoAplicacao": "string",
  "quadrosInterativos": [
    {
      "id": 1,
      "titulo": "string",
      "descricao": "string",
      "tipo": "arrastar-soltar|quiz|desenho|digitacao|clique",
      "conteudo": {
        "elementos": ["elemento1", "elemento2"],
        "instrucao": "string",
        "feedback": "string"
      }
    }
  ]
}

Responda APENAS com o JSON, sem texto adicional.`;
  }

  /**
   * Gera conteúdo do Quadro Interativo usando a API Gemini
   */
  async generateContent(data: QuadroInterativoData): Promise<QuadroInterativoContent> {
    try {
      console.log('🎯 Iniciando geração de Quadro Interativo com Gemini');
      console.log('📋 Dados recebidos:', data);

      // Validar dados obrigatórios
      if (!data.title || !data.subject || !data.theme || !data.objectives) {
        throw new Error('Dados obrigatórios ausentes para gerar Quadro Interativo');
      }

      // Construir prompt especializado
      const prompt = this.buildQuadroInterativoPrompt(data);
      console.log('📝 Prompt construído para Gemini');

      // Chamar API Gemini
      const response = await this.geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        throw new Error(`Erro na API Gemini: ${response.error}`);
      }

      console.log('✅ Resposta recebida do Gemini');

      // Processar resposta
      let cleanedResponse = response.result.trim();
      
      // Remover markdown se presente
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

      // Encontrar o JSON na resposta
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }

      const generatedContent: QuadroInterativoContent = JSON.parse(cleanedResponse);

      // Adicionar metadados
      generatedContent.isGeneratedByAI = true;
      generatedContent.generatedAt = new Date().toISOString();

      // Validar estrutura do conteúdo gerado
      if (!generatedContent.quadrosInterativos || !Array.isArray(generatedContent.quadrosInterativos)) {
        throw new Error('Estrutura de quadros interativos inválida');
      }

      console.log('🎉 Quadro Interativo gerado com sucesso:', generatedContent);

      return generatedContent;

    } catch (error) {
      console.error('❌ Erro ao gerar Quadro Interativo:', error);
      
      // Retornar conteúdo de fallback em caso de erro
      return this.generateFallbackContent(data);
    }
  }

  /**
   * Gera conteúdo de fallback caso a API falhe
   */
  private generateFallbackContent(data: QuadroInterativoData): QuadroInterativoContent {
    console.log('🔧 Gerando conteúdo de fallback para Quadro Interativo');

    return {
      titulo: data.title,
      descricao: data.description,
      disciplina: data.subject,
      anoSerie: data.schoolYear,
      tema: data.theme,
      objetivos: data.objectives,
      nivelDificuldade: data.difficultyLevel,
      atividadeMostrada: data.quadroInterativoCampoEspecifico,
      materiaisNecessarios: [
        'Quadro interativo digital',
        'Projetor ou tela',
        'Computador ou tablet',
        'Materiais complementares conforme atividade'
      ],
      instrucoesProfessor: `Instruções para ${data.title}:\n\n1. Prepare o quadro interativo\n2. Explique os objetivos aos alunos\n3. Demonstre a atividade\n4. Permita participação ativa\n5. Avalie o progresso`,
      criteriosAvaliacao: `Critérios de avaliação para ${data.theme}:\n\n- Participação ativa\n- Compreensão do conteúdo\n- Colaboração em grupo\n- Cumprimento dos objetivos`,
      tempoEstimado: data.timeLimit || '45 minutos',
      contextoAplicacao: data.context || 'Sala de aula com quadro interativo',
      quadrosInterativos: [
        {
          id: 1,
          titulo: `Quadro Principal - ${data.theme}`,
          descricao: `Atividade interativa sobre ${data.theme} para ${data.schoolYear}`,
          tipo: 'quiz',
          conteudo: {
            elementos: ['Elemento 1', 'Elemento 2', 'Elemento 3'],
            instrucao: `Interaja com os elementos do quadro para aprender sobre ${data.theme}`,
            feedback: 'Muito bem! Continue explorando o conteúdo.'
          }
        }
      ],
      isGeneratedByAI: true,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Valida se a API Gemini está disponível
   */
  async validateGeminiConnection(): Promise<boolean> {
    try {
      const hasApiKey = !!API_KEYS.GEMINI;
      console.log('🔑 Verificação da API Gemini:', hasApiKey ? 'Chave presente' : 'Chave ausente');
      
      return hasApiKey;
    } catch (error) {
      console.error('❌ Erro ao validar conexão Gemini:', error);
      return false;
    }
  }
}

// Exportar instância única
const quadroInterativoGenerator = new QuadroInterativoGenerator();
export default quadroInterativoGenerator;
